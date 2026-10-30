/**
 * Flag para servir la Home desde Payload. Apagado = JSX hardcodeado actual (main).
 */
export const CMS_HOME_FROM_PAYLOAD_ENV = 'CMS_HOME_FROM_PAYLOAD';

export function isCmsHomeFromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_HOME_FROM_PAYLOAD_ENV] === 'true';
}

/** Opt-in Preview: ?cms=1 (ignorado fuera de VERCEL_ENV=preview). */
export function parseCmsPreviewQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const raw = searchParams?.cms;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

export function shouldRenderHomeFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsHomeFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}

/** Internal rewrite target for Preview ?cms=1 (misma URL pública `/`). */
export const CMS_PREVIEW_HOME_PATH = '/cms-home-preview';

export function isCmsPreviewHomeInternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized === CMS_PREVIEW_HOME_PATH;
}

export function homePayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}

/** Preview ?cms=1 vía middleware rewrite (sin searchParams en la página). */
export async function resolveRenderHomeFromPayloadServer(): Promise<boolean> {
  if (shouldRenderHomeFromPayload(false)) return true;
  if (process.env.VERCEL_ENV !== 'preview') return false;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return h.get('x-cms-home-preview') === '1';
  } catch {
    return false;
  }
}
