export const CMS_PAGINAS_B5_FROM_PAYLOAD_ENV = 'CMS_PAGINAS_B5_FROM_PAYLOAD';

export const CMS_PREVIEW_PAGINA_B5_PATH_PREFIX = '/cms-pagina-b5-preview';

export function cmsPreviewPaginaB5Path(slug: string): string {
  return `${CMS_PREVIEW_PAGINA_B5_PATH_PREFIX}/${slug}`;
}

export function isCmsPreviewPaginaB5InternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized.startsWith(`${CMS_PREVIEW_PAGINA_B5_PATH_PREFIX}/`);
}

export function isCmsPaginasB5FromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_PAGINAS_B5_FROM_PAYLOAD_ENV] === 'true';
}

export function paginasB5PayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}
