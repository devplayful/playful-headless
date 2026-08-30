export type SubmissionState =
  | { state: 'delivery_processing'; owner: string }
  | { state: 'delivered' }
  | { state: 'crm_processing'; owner: string }
  | { state: 'completed'; crmSynced: boolean; dryRun: boolean };

export type BeginResult =
  | { kind: 'acquired' }
  | { kind: 'existing'; record: SubmissionState };

export interface IdempotencyStore {
  begin(key: string, owner: string): Promise<BeginResult>;
  markDelivered(key: string, owner: string): Promise<void>;
  beginCrm(key: string, owner: string): Promise<boolean>;
  markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean): Promise<void>;
  releaseDelivery(key: string, owner: string): Promise<void>;
  releaseCrm(key: string, owner: string): Promise<void>;
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
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  private redisKey(key: string): string {
    return `playful:contact:v1:${key}`;
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
    const result = await this.command<string | null>(['GET', this.redisKey(key)]);
    return result ? JSON.parse(result) as SubmissionState : null;
  }

  async begin(key: string, owner: string): Promise<BeginResult> {
    const result = await this.command<'OK' | null>([
      'SET', this.redisKey(key), this.serialize({ state: 'delivery_processing', owner }),
      'NX', 'EX', this.ttlSeconds,
    ]);
    if (result === 'OK') return { kind: 'acquired' };
    const record = await this.get(key);
    if (!record) return this.begin(key, owner);
    return { kind: 'existing', record };
  }

  private async transition(key: string, owner: string, from: string, next: SubmissionState): Promise<boolean> {
    const script = [
      "local current = redis.call('GET', KEYS[1])",
      "if not current then return 0 end",
      "local value = cjson.decode(current)",
      "if value.state ~= ARGV[1] then return 0 end",
      "if ARGV[2] ~= '' and value.owner ~= ARGV[2] then return 0 end",
      "redis.call('SET', KEYS[1], ARGV[3], 'EX', ARGV[4])",
      'return 1',
    ].join('\n');
    const result = await this.command<number>([
      'EVAL', script, 1, this.redisKey(key), from, owner, this.serialize(next), this.ttlSeconds,
    ]);
    return result === 1;
  }

  async markDelivered(key: string, owner: string): Promise<void> {
    if (!await this.transition(key, owner, 'delivery_processing', { state: 'delivered' })) {
      throw new SubmissionInProgressError();
    }
  }

  async beginCrm(key: string, owner: string): Promise<boolean> {
    return this.transition(key, '', 'delivered', { state: 'crm_processing', owner });
  }

  async markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean): Promise<void> {
    if (!await this.transition(key, owner, 'crm_processing', { state: 'completed', crmSynced, dryRun })) {
      throw new SubmissionInProgressError();
    }
  }

  async releaseDelivery(key: string, owner: string): Promise<void> {
    const script = [
      "local current = redis.call('GET', KEYS[1])",
      "if not current then return 1 end",
      "local value = cjson.decode(current)",
      "if value.state == 'delivery_processing' and value.owner == ARGV[1] then",
      "  return redis.call('DEL', KEYS[1])",
      'end',
      'return 0',
    ].join('\n');
    await this.command<number>(['EVAL', script, 1, this.redisKey(key), owner]);
  }

  async releaseCrm(key: string, owner: string): Promise<void> {
    await this.transition(key, owner, 'crm_processing', { state: 'delivered' });
  }
}

