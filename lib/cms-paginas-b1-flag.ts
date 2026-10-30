/**
 * Flag H6 bloque 1 (legales): páginas código servidas desde Payload.
 * Apagado = JSX congelado actual (main).
 */
export const CMS_PAGINAS_B1_FROM_PAYLOAD_ENV = 'CMS_PAGINAS_B1_FROM_PAYLOAD';

export function isCmsPaginasB1FromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_PAGINAS_B1_FROM_PAYLOAD_ENV] === 'true';
}

export function parseCmsPreviewQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const raw = searchParams?.cms;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

export function shouldRenderPaginasB1FromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsPaginasB1FromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}

export const CMS_PREVIEW_PAGINA_B1_PATH_PREFIX = '/cms-pagina-b1-preview';

export function cmsPreviewPaginaB1Path(slug: string): string {
  return `${CMS_PREVIEW_PAGINA_B1_PATH_PREFIX}/${slug}`;
}

export function isCmsPreviewPaginaB1InternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized.startsWith(`${CMS_PREVIEW_PAGINA_B1_PATH_PREFIX}/`);
}

export function paginasB1PayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}

export async function resolveRenderPaginasB1FromPayloadServer(): Promise<boolean> {
  if (shouldRenderPaginasB1FromPayload(false)) return true;
  if (process.env.VERCEL_ENV !== 'preview') return false;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return Boolean(h.get('x-cms-paginas-b1-preview'));
  } catch {
    return false;
  }
}

export async function resolvePaginasB1PreviewSlugServer(): Promise<string | null> {
  if (process.env.VERCEL_ENV !== 'preview') return null;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return h.get('x-cms-paginas-b1-preview');
  } catch {
    return null;
  }
}
