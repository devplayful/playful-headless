import {
  IDEMPOTENCY_REQUEST_TIMEOUT_MS,
  LEASE_SAFETY_MARGIN_MS,
  WORDPRESS_DELIVERY_TIMEOUT_MS,
} from './timeouts.ts';

type Environment = Readonly<Record<string, string | undefined>>;

export interface ContactPipelineConfig {
  idempotencyTtlSeconds: number;
  leaseSeconds: number;
  redisRestUrl: string;
  redisRestToken: string;
}

export class ContactPipelineConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContactPipelineConfigurationError';
  }
}

function configured(env: Environment, primary: string, legacy: string): string | undefined {
  return env[primary]?.trim() || env[legacy]?.trim();
}

function required(env: Environment, primary: string, legacy: string): string {
  const value = configured(env, primary, legacy);
  if (!value) throw new ContactPipelineConfigurationError(`${primary} no está configurada.`);
  return value;
}

function integer(
  env: Environment,
  primary: string,
  legacy: string,
  fallback: number,
  minimum: number,
  maximum: number,
): number {
  const raw = configured(env, primary, legacy);
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new ContactPipelineConfigurationError(
      `${primary} debe ser un entero entre ${minimum} y ${maximum}.`,
    );
  }
  return value;
}

export function readContactPipelineConfig(
  env: Environment = process.env,
): ContactPipelineConfig {
  const leaseSeconds = integer(
    env,
    'CONTACT_PROCESSING_LEASE_SECONDS',
    'HIGHLEVEL_PROCESSING_LEASE_SECONDS',
    30,
    10,
    300,
  );
  const deliveryCriticalSectionMs = WORDPRESS_DELIVERY_TIMEOUT_MS
    + IDEMPOTENCY_REQUEST_TIMEOUT_MS
    + LEASE_SAFETY_MARGIN_MS;
  if (leaseSeconds * 1000 < deliveryCriticalSectionMs) {
    throw new ContactPipelineConfigurationError(
      'CONTACT_PROCESSING_LEASE_SECONDS debe cubrir la entrega WordPress, el checkpoint Redis y el margen de seguridad.',
    );
  }

  return {
    idempotencyTtlSeconds: integer(
      env,
      'CONTACT_IDEMPOTENCY_TTL_SECONDS',
      'HIGHLEVEL_IDEMPOTENCY_TTL_SECONDS',
      604800,
      3600,
      2592000,
    ),
    leaseSeconds,
    redisRestUrl: required(
      env,
      'CONTACT_IDEMPOTENCY_REDIS_REST_URL',
      'HIGHLEVEL_IDEMPOTENCY_REDIS_REST_URL',
    ),
    redisRestToken: required(
      env,
      'CONTACT_IDEMPOTENCY_REDIS_REST_TOKEN',
      'HIGHLEVEL_IDEMPOTENCY_REDIS_REST_TOKEN',
    ),
  };
}
