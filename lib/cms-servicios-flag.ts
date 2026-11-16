/**
 * Flag para servir las 6 landings de servicio desde Payload
 * (/agencia-* vía [slug] y /agencia-shopify). Apagado = comportamiento actual
 * (WordPress/Elementor o página React de Shopify).
 */
export const CMS_SERVICIOS_FROM_PAYLOAD_ENV = 'CMS_SERVICIOS_FROM_PAYLOAD';

export function isCmsServiciosFromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_SERVICIOS_FROM_PAYLOAD_ENV] === 'true';
}

/** Opt-in Preview: ?cms=1 (ignorado fuera de VERCEL_ENV=preview). */
export function parseCmsPreviewQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const raw = searchParams?.cms;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

export function shouldRenderServiciosFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsServiciosFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}

/** Slugs de servicio gestionados por la colección Servicios (H3). */
export const PAYLOAD_SERVICIO_SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-e-commerce',
  'agencia-ux-ui',
  'agencia-shopify',
] as const;

export type PayloadServicioSlug = (typeof PAYLOAD_SERVICIO_SLUGS)[number];

export function isPayloadServicioSlug(slug: string): slug is PayloadServicioSlug {
  return (PAYLOAD_SERVICIO_SLUGS as readonly string[]).includes(slug);
}

/** Internal rewrite target for Preview ?cms=1 (keeps public URL, avoids searchParams SSG opt-out). */
export const CMS_PREVIEW_SERVICIO_PATH_PREFIX = '/cms-servicio-preview';

export function cmsPreviewServicioPath(slug: string): string {
  return `${CMS_PREVIEW_SERVICIO_PATH_PREFIX}/${slug}`;
}

export function isCmsPreviewServicioInternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized.startsWith(`${CMS_PREVIEW_SERVICIO_PATH_PREFIX}/`);
}
