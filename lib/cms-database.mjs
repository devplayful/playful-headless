/**
 * Copia ESM de lib/cms-database.ts para el build (Node sin strip-types).
 * Mantener en sincronía; tests/cms-database.test.mjs compara ambas.
 */

const RUNTIME_KEYS = ['DATABASE_URL', 'POSTGRES_URL', 'DATABASE_URI'];
const MIGRATE_KEYS = [
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  ...RUNTIME_KEYS,
];

function firstNonEmpty(env, keys) {
  for (const key of keys) {
    const value = typeof env[key] === 'string' ? env[key].trim() : '';
    if (value) return value;
  }
  return '';
}

export function hasDatabaseUrl(env = process.env) {
  return Boolean((env.DATABASE_URL || '').trim());
}

export function hasRuntimeDatabase(env = process.env) {
  return Boolean(firstNonEmpty(env, RUNTIME_KEYS));
}

export function getPayloadConnectionString(env = process.env) {
  const migrating = env.PAYLOAD_MIGRATING === 'true';
  return firstNonEmpty(env, migrating ? MIGRATE_KEYS : RUNTIME_KEYS);
}

export function shouldRunPreviewMigrate(env = process.env) {
  return hasDatabaseUrl(env) && env.VERCEL_ENV !== 'production';
}

export function shouldRunPreviewPaginasB4Seed(env = process.env) {
  return hasRuntimeDatabase(env) && env.VERCEL_ENV === 'preview';
}
