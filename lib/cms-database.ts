/**
 * Resolución de Postgres para Payload.
 *
 * Runtime: DATABASE_URL (Vercel/Neon pooled). Aliases: POSTGRES_URL, DATABASE_URI.
 * Migraciones: DATABASE_URL_UNPOOLED (directo) si existe; si no, el de runtime.
 *
 * Production no tiene estas variables: la cadena queda vacía y el build no
 * debe conectar. No registrar ni devolver las cadenas fuera de Payload.
 */

const RUNTIME_KEYS = ['DATABASE_URL', 'POSTGRES_URL', 'DATABASE_URI'] as const;
const MIGRATE_KEYS = [
  'DATABASE_URL_UNPOOLED',
  'POSTGRES_URL_NON_POOLING',
  ...RUNTIME_KEYS,
] as const;

function firstNonEmpty(
  env: NodeJS.ProcessEnv,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) return value;
  }
  return '';
}

export function hasDatabaseUrl(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean((env.DATABASE_URL || '').trim());
}

export function hasRuntimeDatabase(env: NodeJS.ProcessEnv = process.env): boolean {
  return Boolean(firstNonEmpty(env, RUNTIME_KEYS));
}

export function getPayloadConnectionString(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const migrating = env.PAYLOAD_MIGRATING === 'true';
  return firstNonEmpty(env, migrating ? MIGRATE_KEYS : RUNTIME_KEYS);
}

/** Preview/Development: hay DATABASE_URL y no es Production. */
export function shouldRunPreviewMigrate(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return hasDatabaseUrl(env) && env.VERCEL_ENV !== 'production';
}

/** Seed Home CMS: solo Preview con DATABASE_URL (nunca Production). */
export function shouldRunPreviewHomeSeed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return hasDatabaseUrl(env) && env.VERCEL_ENV === 'preview';
}
