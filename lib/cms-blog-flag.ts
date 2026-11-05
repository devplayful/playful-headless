/**
 * H5 — blog (posts) servidos desde Payload.
 * Apagado = WordPress (producción). Preview: `?cms=1` en rutas `/blog/*`.
 */
export const CMS_BLOG_FROM_PAYLOAD_ENV = 'CMS_BLOG_FROM_PAYLOAD';

export function isCmsBlogFromPayload(env: NodeJS.ProcessEnv = process.env): boolean {
  return env[CMS_BLOG_FROM_PAYLOAD_ENV] === 'true';
}

export function parseCmsPreviewQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): boolean {
  const raw = searchParams?.cms;
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === '1';
}

export function shouldRenderBlogFromPayload(
  cmsQueryOptIn: boolean,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (isCmsBlogFromPayload(env)) return true;
  return cmsQueryOptIn && env.VERCEL_ENV === 'preview';
}

export const CMS_BLOG_PREVIEW_HEADER = 'x-cms-blog-preview';

export async function resolveRenderBlogFromPayloadServer(): Promise<boolean> {
  if (shouldRenderBlogFromPayload(false)) return true;
  if (process.env.VERCEL_ENV !== 'preview') return false;
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    return h.get(CMS_BLOG_PREVIEW_HEADER) === '1';
  } catch {
    return false;
  }
}

export function blogPayloadPreviewAttrs(): Record<string, 'payload'> | Record<string, never> {
  return process.env.VERCEL_ENV === 'preview' ? { 'data-cms-source': 'payload' } : {};
}
