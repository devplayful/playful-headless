/**
 * Flag para leer /casos-de-exito (hub) y /casos-de-exito/[slug] desde Payload
 * (Jumex, Odwalla y SoyTechno). Apagado = comportamiento actual:
 * WordPress para Jumex/Odwalla y SoyTechnoCaseStudy hardcodeado.
 */
export const CMS_CASOS_FROM_PAYLOAD_ENV = 'CMS_CASOS_FROM_PAYLOAD';

export function isCmsCasosFromPayload(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return env[CMS_CASOS_FROM_PAYLOAD_ENV] === 'true';
}

/** Opt-in Preview: ?cms=1 (ignorado fuera de VERCEL_ENV=preview). */
export function parseCmsPreviewQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const raw = searchParams?.cms;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

export function shouldRenderCasosFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsCasosFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}

export const PAYLOAD_CASO_SLUGS = [
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
  'soytechno-ecommerce-venezuela',
] as const;

export type PayloadCasoSlug = (typeof PAYLOAD_CASO_SLUGS)[number];

export function isPayloadCasoSlug(slug: string): slug is PayloadCasoSlug {
  return (PAYLOAD_CASO_SLUGS as readonly string[]).includes(slug);
}

/** Internal rewrite target for Preview ?cms=1 (keeps public URL). */
export const CMS_PREVIEW_CASOS_PATH_PREFIX = '/cms-casos-preview';

export const CMS_PREVIEW_CASOS_HUB_SEGMENT = 'hub';

export function cmsPreviewCasosHubPath(): string {
  return `${CMS_PREVIEW_CASOS_PATH_PREFIX}/${CMS_PREVIEW_CASOS_HUB_SEGMENT}`;
}

export function cmsPreviewCasoPath(slug: string): string {
  return `${CMS_PREVIEW_CASOS_PATH_PREFIX}/${slug}`;
}

export function isCmsPreviewCasosInternalPath(pathname: string): boolean {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return normalized.startsWith(`${CMS_PREVIEW_CASOS_PATH_PREFIX}/`);
}

export function casosPayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}

/** Preview ?cms=1 via middleware request header (sin leer searchParams en la página). */
export async function resolveRenderCasosFromPayloadServer(): Promise<boolean> {
  if (shouldRenderCasosFromPayload(false)) return true;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return h.get('x-cms-casos-preview') === '1';
  } catch {
    return false;
  }
}
