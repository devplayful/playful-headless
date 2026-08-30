import { createHash } from 'node:crypto';

export interface CrmProgress {
  contactId?: string;
  originalAttributionCompleted?: true;
  tagsCompleted?: true;
  opportunityId?: string;
  opportunityCreated?: boolean;
  taskId?: string;
}

export type SubmissionState =
  | { state: 'delivered'; crm: CrmProgress }
  | { state: 'completed'; crmSynced: boolean; dryRun: boolean; crm: CrmProgress };

export type BeginResult =
  | { kind: 'acquired' }
  | { kind: 'busy' }
  | { kind: 'existing'; record: SubmissionState };

export interface IdempotencyStore {
  begin(key: string, owner: string): Promise<BeginResult>;
  markDelivered(key: string, owner: string): Promise<void>;
  beginCrm(key: string, owner: string): Promise<boolean>;
  saveCrmProgress(key: string, owner: string, progress: CrmProgress): Promise<void>;
  markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean): Promise<void>;
  releaseDelivery(key: string, owner: string): Promise<void>;
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

type FetchLike = typeof fetch;

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
    const response = await this.fetchImpl(this.url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(command),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`El almacén de idempotencia devolvió HTTP ${response.status}.`);
    const payload = await response.json() as { result: T; error?: string };
    if (payload.error) throw new Error('El almacén de idempotencia rechazó la operación.');
    return payload.result;
  }

  private serialize(record: SubmissionState): string {
    return JSON.stringify(record);
  }

  private async get(key: string): Promise<SubmissionState | null> {
    const result = await this.command<string | null>(['GET', this.stateKey(key)]);
    return result ? JSON.parse(result) as SubmissionState : null;
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

  async begin(key: string, owner: string): Promise<BeginResult> {
    const existing = await this.get(key);
    if (existing) return { kind: 'existing', record: existing };

    const resource = `submission:${key}:delivery`;
    if (!await this.acquireLease(resource, owner)) return { kind: 'busy' };

    // The state may have been committed between the first read and lease acquisition.
    const afterLease = await this.get(key);
    if (afterLease) {
      await this.releaseLease(resource, owner);
      return { kind: 'existing', record: afterLease };
    }
    return { kind: 'acquired' };
  }

  async markDelivered(key: string, owner: string): Promise<void> {
    const script = [
      "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
      "redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])",
      "redis.call('DEL', KEYS[1])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:delivery`), this.stateKey(key),
      owner, this.serialize({ state: 'delivered', crm: {} }), this.ttlSeconds,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
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
      "redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3])",
      "redis.call('EXPIRE', KEYS[1], ARGV[4])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 2,
      this.leaseKey(`submission:${key}:crm`), this.stateKey(key),
      owner, this.serialize({ state: 'delivered', crm: progress }),
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
      this.serialize({ state: 'completed', crmSynced, dryRun, crm: current.crm }),
      this.ttlSeconds,
    ]);
    if (result !== 1) throw new SubmissionInProgressError();
  }

  async releaseDelivery(key: string, owner: string): Promise<void> {
    await this.releaseLease(`submission:${key}:delivery`, owner);
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
