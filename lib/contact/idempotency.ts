import { createHash } from 'node:crypto';
import { IDEMPOTENCY_REQUEST_TIMEOUT_MS } from './timeouts.ts';

export interface CrmProgress {
  contactId?: string;
  originalAttributionCompleted?: true;
  tagsCompleted?: true;
  opportunityId?: string;
  opportunityCreated?: boolean;
  taskId?: string;
}

export type SubmissionState =
  | { state: 'delivery_pending'; fingerprint?: string }
  | { state: 'delivery_uncertain'; fingerprint?: string }
  | { state: 'delivered'; fingerprint?: string; crm: CrmProgress }
  | { state: 'completed'; fingerprint?: string; crmSynced: boolean; dryRun: boolean; crm: CrmProgress };

export type BeginResult =
  | { kind: 'acquired' }
  | { kind: 'busy' }
  | { kind: 'existing'; record: SubmissionState };

export interface IdempotencyStore {
  begin(key: string, owner: string, fingerprint?: string): Promise<BeginResult>;
  beginDeliveryReconciliation(key: string, owner: string): Promise<SubmissionState | null>;
  markDelivered(key: string, owner: string): Promise<void>;
  markDeliveryUncertain(key: string, owner: string): Promise<void>;
  clearPendingDelivery(key: string, owner: string): Promise<void>;
  releaseDelivery(key: string, owner: string): Promise<void>;
  beginCrm(key: string, owner: string): Promise<boolean>;
  saveCrmProgress(key: string, owner: string, progress: CrmProgress): Promise<void>;
  markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean): Promise<void>;
  releaseCrm(key: string, owner: string): Promise<void>;
  acquireResourceLease(resource: string, owner: string): Promise<boolean>;
  releaseResourceLease(resource: string, owner: string): Promise<void>;
}

export class SubmissionInProgressError extends Error {
  constructor() {
    super('Este envío ya está siendo procesado.');
    this.name = 'SubmissionInProgressError';
  }
}

export class IdempotencyStoreUnavailableError extends Error {
  constructor() {
    super('El almacén de idempotencia no está disponible.');
    this.name = 'IdempotencyStoreUnavailableError';
  }
}

export class SubmissionPayloadMismatchError extends Error {
  constructor() {
    super('El contenido no coincide con el intento pendiente. Inicia una solicitud nueva.');
    this.name = 'SubmissionPayloadMismatchError';
  }
}

type FetchLike = typeof fetch;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isCrmProgress(value: unknown): value is CrmProgress {
  if (!isRecord(value)) return false;
  const stringFields = ['contactId', 'opportunityId', 'taskId'] as const;
  const booleanFields = [
    'originalAttributionCompleted',
    'tagsCompleted',
    'opportunityCreated',
  ] as const;
  return stringFields.every((field) => value[field] === undefined || typeof value[field] === 'string')
    && booleanFields.every((field) => value[field] === undefined || value[field] === true);
}

function isSubmissionState(value: unknown): value is SubmissionState {
  if (!isRecord(value)) return false;
  if (value.fingerprint !== undefined
    && (typeof value.fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(value.fingerprint))) {
    return false;
  }
  if (value.state === 'delivery_pending' || value.state === 'delivery_uncertain') return true;
  if (value.state === 'delivered') return isCrmProgress(value.crm);
  return value.state === 'completed'
    && typeof value.crmSynced === 'boolean'
    && typeof value.dryRun === 'boolean'
    && isCrmProgress(value.crm);
}

export class RedisRestIdempotencyStore implements IdempotencyStore {
  constructor(
    private readonly url: string,
    private readonly token: string,
    private readonly ttlSeconds: number,
    private readonly leaseSeconds: number,
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  private stateKey(key: string): string {
    return `playful:contact:v2:state:${key}`;
  }

  private leaseKey(resource: string): string {
    const digest = createHash('sha256').update(resource).digest('hex');
    return `playful:contact:v2:lease:${digest}`;
  }

  private async command<T>(command: Array<string | number>): Promise<T> {
    try {
      const response = await this.fetchImpl(this.url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(command),
        signal: AbortSignal.timeout(IDEMPOTENCY_REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new IdempotencyStoreUnavailableError();
      const payload = await response.json() as unknown;
      if (!isRecord(payload)
        || !Object.prototype.hasOwnProperty.call(payload, 'result')
        || payload.error) {
        throw new IdempotencyStoreUnavailableError();
      }
      return payload.result as T;
    } catch (error) {
      if (error instanceof IdempotencyStoreUnavailableError) throw error;
      throw new IdempotencyStoreUnavailableError();
    }
  }

  private serialize(record: SubmissionState): string {
    return JSON.stringify(record);
  }

  private async get(key: string): Promise<SubmissionState | null> {
    const result = await this.command<string | null>(['GET', this.stateKey(key)]);
    if (!result) return null;
    try {
      const record = JSON.parse(result) as unknown;
      if (!isSubmissionState(record)) throw new IdempotencyStoreUnavailableError();
      return record;
    } catch {
      throw new IdempotencyStoreUnavailableError();
    }
  }

  private validateFingerprint(record: SubmissionState, fingerprint?: string): void {
    if (record.fingerprint && fingerprint && record.fingerprint !== fingerprint) {
      throw new SubmissionPayloadMismatchError();
    }
  }

  private async acquireLease(resource: string, owner: string): Promise<boolean> {
    const result = await this.command<'OK' | null>([
      'SET', this.leaseKey(resource), owner, 'NX', 'EX', this.leaseSeconds,
    ]);
    return result === 'OK';
  }

  private async releaseLease(resource: string, owner: string): Promise<void> {
    const script = [
      "if redis.call('GET', KEYS[1]) == ARGV[1] then",
      "  return redis.call('DEL', KEYS[1])",
      'end',
      'return 0',
    ].join('\n');
    await this.command<number>(['EVAL', script, 1, this.leaseKey(resource), owner]);
  }

  async begin(key: string, owner: string, fingerprint?: string): Promise<BeginResult> {
    const existing = await this.get(key);
    if (existing) {
      this.validateFingerprint(existing, fingerprint);
      return { kind: 'existing', record: existing };
    }

    const resource = `submission:${key}:delivery`;
    if (!await this.acquireLease(resource, owner)) return { kind: 'busy' };

    // The state may have been committed between the first read and lease acquisition.
    const afterLease = await this.get(key);
    if (afterLease) {
      await this.releaseLease(resource, owner);
      this.validateFingerprint(afterLease, fingerprint);
      return { kind: 'existing', record: afterLease };
    }

    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "if redis.call('EXISTS', KEYS[2]) == 1 then return 0 end",
      "redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])",
      'return 1',
    ].join('\n');
    const reserved = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(resource), this.stateKey(key),
      owner, this.serialize({ state: 'delivery_pending', fingerprint }), this.ttlSeconds,
    ]);
    if (reserved !== 1) {
      await this.releaseLease(resource, owner);
      const record = await this.get(key);
      if (record) this.validateFingerprint(record, fingerprint);
      return record ? { kind: 'existing', record } : { kind: 'busy' };
    }
    return { kind: 'acquired' };
  }

  async beginDeliveryReconciliation(key: string, owner: string): Promise<SubmissionState | null> {
    const resource = `submission:${key}:delivery`;
    if (!await this.acquireLease(resource, owner)) throw new SubmissionInProgressError();
    const current = await this.get(key);
    if (!current || (current.state !== 'delivery_pending' && current.state !== 'delivery_uncertain')) {
      await this.releaseLease(resource, owner);
    }
    return current;
  }

  async markDelivered(key: string, owner: string): Promise<void> {
    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "local current = redis.call('GET', KEYS[2])",
      "if not current then return 0 end",
      "local state = cjson.decode(current).state",
      "if state ~= 'delivery_pending' and state ~= 'delivery_uncertain' then return 0 end",
      "local value = cjson.decode(current)",
      "value.state = 'delivered'",
      "value.crm = cjson.decode('{}')",
      "redis.call('SET', KEYS[2], cjson.encode(value), 'EX', ARGV[2])",
      "redis.call('DEL', KEYS[1])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:delivery`), this.stateKey(key),
      owner, this.ttlSeconds,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
  }

  async markDeliveryUncertain(key: string, owner: string): Promise<void> {
    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "local current = redis.call('GET', KEYS[2])",
      "if not current then return 0 end",
      "local state = cjson.decode(current).state",
      "if state ~= 'delivery_pending' and state ~= 'delivery_uncertain' then return 0 end",
      "local value = cjson.decode(current)",
      "value.state = 'delivery_uncertain'",
      "value.crm = nil",
      "redis.call('SET', KEYS[2], cjson.encode(value), 'EX', ARGV[2])",
      "redis.call('DEL', KEYS[1])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:delivery`), this.stateKey(key),
      owner, this.ttlSeconds,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
  }

  async clearPendingDelivery(key: string, owner: string): Promise<void> {
    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "local current = redis.call('GET', KEYS[2])",
      "if not current then return 0 end",
      "local state = cjson.decode(current).state",
      "if state ~= 'delivery_pending' and state ~= 'delivery_uncertain' then return 0 end",
      "redis.call('DEL', KEYS[2])",
      "redis.call('DEL', KEYS[1])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:delivery`), this.stateKey(key), owner,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
  }

  async releaseDelivery(key: string, owner: string): Promise<void> {
    await this.releaseLease(`submission:${key}:delivery`, owner);
  }

  async beginCrm(key: string, owner: string): Promise<boolean> {
    const current = await this.get(key);
    if (!current || current.state !== 'delivered') return false;
    const resource = `submission:${key}:crm`;
    if (!await this.acquireLease(resource, owner)) return false;
    const afterLease = await this.get(key);
    if (!afterLease || afterLease.state !== 'delivered') {
      await this.releaseLease(resource, owner);
      return false;
    }
    return true;
  }

  async saveCrmProgress(key: string, owner: string, progress: CrmProgress): Promise<void> {
    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "local current = redis.call('GET', KEYS[2])",
      "if not current then return 0 end",
      "local value = cjson.decode(current)",
      "if value.state ~= 'delivered' then return 0 end",
      "value.crm = cjson.decode(ARGV[2])",
      "redis.call('SET', KEYS[2], cjson.encode(value), 'EX', ARGV[3])",
      "redis.call('EXPIRE', KEYS[1], ARGV[4])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:crm`), this.stateKey(key),
      owner, JSON.stringify(progress),
      this.ttlSeconds, this.leaseSeconds,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
  }

  async markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean): Promise<void> {
    const current = await this.get(key);
    if (!current || current.state !== 'delivered') throw new SubmissionInProgressError();
    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])",
      "redis.call('DEL', KEYS[1])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:crm`), this.stateKey(key),
      owner,
      this.serialize({
        state: 'completed',
        fingerprint: current.fingerprint,
        crmSynced,
        dryRun,
        crm: current.crm,
      }),
      this.ttlSeconds,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
  }

  async releaseCrm(key: string, owner: string): Promise<void> {
    await this.releaseLease(`submission:${key}:crm`, owner);
  }

  async acquireResourceLease(resource: string, owner: string): Promise<boolean> {
    return this.acquireLease(`resource:${resource}`, owner);
  }

  async releaseResourceLease(resource: string, owner: string): Promise<void> {
    await this.releaseLease(`resource:${resource}`, owner);
  }
}
