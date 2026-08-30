const CUSTOM_FIELD_KEYS = [
  'original_source',
  'original_landing',
  'recent_source',
  'recent_landing',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'form_id',
  'privacy_consent_at',
  'marketing_consent',
] as const;

export type HighLevelCustomFieldKey = (typeof CUSTOM_FIELD_KEYS)[number];
export type HighLevelCustomFieldIds = Record<HighLevelCustomFieldKey, string>;

export interface DisabledHighLevelConfig {
  enabled: false;
}

export interface EnabledHighLevelConfig {
  enabled: true;
  testMode: boolean;
  token: string;
  locationId: string;
  pipelineId: string;
  consultaStageId: string;
  ownerId: string;
  contactTag: string;
  slaHours: number;
  timeoutMs: number;
  idempotencyTtlSeconds: number;
  leaseSeconds: number;
  redisRestUrl: string;
  redisRestToken: string;
  customFieldIds: HighLevelCustomFieldIds;
}

export type HighLevelConfig = DisabledHighLevelConfig | EnabledHighLevelConfig;

export class HighLevelConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HighLevelConfigurationError';
  }
}

type Environment = Readonly<Record<string, string | undefined>>;

function required(env: Environment, key: string): string {
  const value = env[key]?.trim();
  if (!value) throw new HighLevelConfigurationError(`${key} no está configurada.`);
  return value;
}

function integer(env: Environment, key: string, minimum: number, maximum: number): number {
  const raw = required(env, key);
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new HighLevelConfigurationError(`${key} debe ser un entero entre ${minimum} y ${maximum}.`);
  }
  return value;
}

function customFields(env: Environment): HighLevelCustomFieldIds {
  let parsed: unknown;
  try {
    parsed = JSON.parse(required(env, 'HIGHLEVEL_CUSTOM_FIELD_IDS_JSON'));
  } catch (error) {
    if (error instanceof HighLevelConfigurationError) throw error;
    throw new HighLevelConfigurationError('HIGHLEVEL_CUSTOM_FIELD_IDS_JSON no contiene JSON válido.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new HighLevelConfigurationError('HIGHLEVEL_CUSTOM_FIELD_IDS_JSON debe ser un objeto.');
  }

  const record = parsed as Record<string, unknown>;
  const result = {} as HighLevelCustomFieldIds;
  for (const key of CUSTOM_FIELD_KEYS) {
    const value = record[key];
    if (typeof value !== 'string' || !value.trim()) {
      throw new HighLevelConfigurationError(`Falta el ID del campo HighLevel: ${key}.`);
    }
    result[key] = value.trim();
  }
  return result;
}

export function readHighLevelConfig(env: Environment = process.env): HighLevelConfig {
  if (env.HIGHLEVEL_ENABLED !== 'true') return { enabled: false };

  const testMode = env.HIGHLEVEL_TEST_MODE === 'true';
  return {
    enabled: true,
    testMode,
    token: testMode ? (env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN?.trim() || '') : required(env, 'HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN'),
    locationId: required(env, 'HIGHLEVEL_LOCATION_ID'),
    pipelineId: required(env, 'HIGHLEVEL_PIPELINE_ID'),
    consultaStageId: required(env, 'HIGHLEVEL_STAGE_CONSULTA_ID'),
    ownerId: required(env, 'HIGHLEVEL_DEFAULT_OWNER_ID'),
    contactTag: required(env, 'HIGHLEVEL_CONTACT_TAG'),
    slaHours: integer(env, 'HIGHLEVEL_SLA_HOURS', 1, 168),
    timeoutMs: env.HIGHLEVEL_REQUEST_TIMEOUT_MS
      ? integer(env, 'HIGHLEVEL_REQUEST_TIMEOUT_MS', 1000, 30000)
      : 8000,
    idempotencyTtlSeconds: env.HIGHLEVEL_IDEMPOTENCY_TTL_SECONDS
      ? integer(env, 'HIGHLEVEL_IDEMPOTENCY_TTL_SECONDS', 3600, 2592000)
      : 604800,
    leaseSeconds: env.HIGHLEVEL_PROCESSING_LEASE_SECONDS
      ? integer(env, 'HIGHLEVEL_PROCESSING_LEASE_SECONDS', 10, 300)
      : 30,
    redisRestUrl: required(env, 'HIGHLEVEL_IDEMPOTENCY_REDIS_REST_URL'),
    redisRestToken: required(env, 'HIGHLEVEL_IDEMPOTENCY_REDIS_REST_TOKEN'),
    customFieldIds: customFields(env),
  };
}
