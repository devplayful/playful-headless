/**
 * Local Magnific covers that replace WordPress featured + OG/Twitter
 * for José-approved lote 1 (23 sep 2026). Same override shape as
 * CASOS_DE_EXITO_FEATURED_TAPAS: slug → public/ path.
 *
 * Only featured/OG/Twitter. Body stock images stay on WordPress.
 */
export const BLOG_COVER_OVERRIDES = {
  'actualizar-tu-e-commerce': '/images/blog/01-actualizar-magnific-mELf0NZhJQ.png',
  'crear-un-e-commerce': '/images/blog/02-crear-magnific-YMaV8MXWeC.png',
  'google-y-su-inteligencia-artificial': '/images/blog/03-google-ia-magnific-IfxaU6ntvE.png',
  'optimizacion-multimedia': '/images/blog/04-multimedia-magnific-jUZSVwWLD0.png',
  'contenido-duplicado': '/images/blog/05-duplicado-magnific-jUZSmGGLD0.png',
  'diseno-web-de-paginas-web': '/images/blog/06-diseno-magnific-O6TNLxdynm.png',
  'que-es-una-agencia-de-sem': '/images/blog/07-sem-magnific-YMaXoMhWeC.png',
} as const;

export const BLOG_COVER_SIZE = { width: 2560, height: 1440 } as const;

export type BlogCoverSlug = keyof typeof BLOG_COVER_OVERRIDES;

export function blogCoverForSlug(slug: string | undefined | null): string {
  if (!slug) return '';
  return BLOG_COVER_OVERRIDES[slug as BlogCoverSlug] || '';
}

/** Prefer the local Magnific cover when the slug is in lote 1. */
export function resolveBlogCoverUrl(
  slug: string | undefined | null,
  fallback = '',
): string {
  return blogCoverForSlug(slug) || fallback;
}
