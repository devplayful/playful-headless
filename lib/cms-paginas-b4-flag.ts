/**
 * Flag H6 bloque 4 (contacto + reunión): copy editorial en Payload; formularios/scripts en código.
 */
export const CMS_PAGINAS_B4_FROM_PAYLOAD_ENV = 'CMS_PAGINAS_B4_FROM_PAYLOAD';

export function isCmsPaginasB4FromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_PAGINAS_B4_FROM_PAYLOAD_ENV] === 'true';
}

export const CMS_PREVIEW_PAGINA_B4_PATH_PREFIX = '/cms-pagina-b4-preview';

export function cmsPreviewPaginaB4Path(slug: string): string {
  return `${CMS_PREVIEW_PAGINA_B4_PATH_PREFIX}/${slug}`;
}

export function isCmsPreviewPaginaB4InternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized.startsWith(`${CMS_PREVIEW_PAGINA_B4_PATH_PREFIX}/`);
}

export function paginasB4PayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}
