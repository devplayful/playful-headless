import { createHash, timingSafeEqual } from 'node:crypto';

type Environment = Readonly<Record<string, string | undefined>>;

export class ProductionCanaryConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProductionCanaryConfigurationError';
  }
}

function productionCanaryRequested(env: Environment): boolean {
  return env.VERCEL_ENV === 'production'
    && env.CONTACT_PIPELINE_PRODUCTION_CANARY_ENABLED === 'true';
}

/**
 * A canary and global rollout are mutually exclusive. Evaluate this before
 * parsing a lead or making a network request so a bad flag combination cannot
 * widen delivery to non-allowlisted contacts.
 */
export function productionCanaryGlobalConflict(
  env: Environment = process.env,
): boolean {
  return productionCanaryRequested(env)
    && env.CONTACT_PIPELINE_ENABLED === 'true';
}

function isSha256(value: string | undefined): value is string {
  return Boolean(value && /^[a-f0-9]{64}$/.test(value));
}

function hashesMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === 32
    && rightBuffer.length === 32
    && timingSafeEqual(leftBuffer, rightBuffer);
}

function requireSetting(env: Environment, key: string, expected: string) {
  if (env[key] !== expected) {
    throw new ProductionCanaryConfigurationError(
      `${key} debe ser ${expected} para el canario de producción.`,
    );
  }
}

/**
 * Returns true only for the explicit, server-side hashed canary contact.
 * Any malformed or incomplete canary configuration falls back to the stable
 * route for every request; it must never widen traffic accidentally.
 */
export function isProductionCanaryLead(
  email: string,
  env: Environment = process.env,
): boolean {
  if (!productionCanaryRequested(env)) return false;

  const configuredHash = env.CONTACT_E2E_CANARY_EMAIL_SHA256?.trim().toLowerCase();
  if (!isSha256(configuredHash)) return false;

  const candidateHash = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  if (!hashesMatch(candidateHash, configuredHash)) return false;

  // Keep the normal, stable delivery path global until this one contact has
  // supplied evidence for the durable contact/CRM path.
  requireSetting(env, 'CONTACT_PIPELINE_ENABLED', 'false');
  requireSetting(env, 'WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED', 'true');
  requireSetting(env, 'HIGHLEVEL_ENABLED', 'true');
  requireSetting(env, 'HIGHLEVEL_TEST_MODE', 'false');
  requireSetting(env, 'HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED', 'true');
  // This is an explicit operational attestation after auditing HighLevel.
  // The application never issues HighLevel email, SMS, or workflow requests.
  requireSetting(env, 'HIGHLEVEL_CANARY_AUTOMATIONS_DISABLED', 'true');
  return true;
}
