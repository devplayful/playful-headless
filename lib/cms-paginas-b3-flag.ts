/**
 * Flag H6 bloque 3 (nosotros): copy TSX desde Payload; equipo sigue en WordPress.
 */
export const CMS_PAGINAS_B3_FROM_PAYLOAD_ENV = 'CMS_PAGINAS_B3_FROM_PAYLOAD';

export function isCmsPaginasB3FromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_PAGINAS_B3_FROM_PAYLOAD_ENV] === 'true';
}

export function parseCmsPreviewQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const raw = searchParams?.cms;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

export function shouldRenderPaginasB3FromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsPaginasB3FromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}

export const CMS_PREVIEW_PAGINA_B3_PATH_PREFIX = '/cms-pagina-b3-preview';

export function cmsPreviewPaginaB3Path(slug: string): string {
  return `${CMS_PREVIEW_PAGINA_B3_PATH_PREFIX}/${slug}`;
}

export function isCmsPreviewPaginaB3InternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized.startsWith(`${CMS_PREVIEW_PAGINA_B3_PATH_PREFIX}/`);
}

export function paginasB3PayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}
