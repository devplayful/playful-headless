/**
 * Local Magnific covers that replace WordPress featured + OG/Twitter
 * for José-approved lote 1 + lote 2 (23 sep 2026). Same override shape as
 * CASOS_DE_EXITO_FEATURED_TAPAS: slug → public/ path.
 *
 * Only featured/OG/Twitter. Body stock images stay on WordPress.
 */
export const BLOG_COVER_OVERRIDES = {
  // lote 1
  'actualizar-tu-e-commerce': '/images/blog/01-actualizar-magnific-mELf0NZhJQ.png',
  'crear-un-e-commerce': '/images/blog/02-crear-magnific-YMaV8MXWeC.png',
  'google-y-su-inteligencia-artificial': '/images/blog/03-google-ia-magnific-IfxaU6ntvE.png',
  'optimizacion-multimedia': '/images/blog/04-multimedia-magnific-jUZSVwWLD0.png',
  'contenido-duplicado': '/images/blog/05-duplicado-magnific-jUZSmGGLD0.png',
  'diseno-web-de-paginas-web': '/images/blog/06-diseno-magnific-O6TNLxdynm.png',
  'que-es-una-agencia-de-sem': '/images/blog/07-sem-magnific-YMaXoMhWeC.png',
  // lote 2
  'como-elegir-el-mejor-framework-para-tu-web': '/images/blog/01-framework-magnific-5j9Sv3wKxe.png',
  'seo-y-sem-que-son-y-en-que-se-diferencian': '/images/blog/02-seo-y-sem-magnific-SyniXs1Ub8.png',
  '7-consejos-seo-para-posicionar-tu-pagina': '/images/blog/03-7-consejos-seo-magnific-3zBMZYMREY.png',
  'pasos-para-aumentar-clientes-en-tu-negocio': '/images/blog/04-aumentar-clientes-magnific-gOz6HTdSXO.png',
  'que-es-data-studio-de-google-y-como-funciona': '/images/blog/06-data-studio-magnific-yiVzbnFPW9.png',
  'conoce-los-tipos-de-marketing': '/images/blog/07-tipos-marketing-magnific-w4WZutE7EI.png',
} as const;

export const BLOG_COVER_SIZE = { width: 2560, height: 1440 } as const;

export type BlogCoverSlug = keyof typeof BLOG_COVER_OVERRIDES;

export function blogCoverForSlug(slug: string | undefined | null): string {
  if (!slug) return '';
  return BLOG_COVER_OVERRIDES[slug as BlogCoverSlug] || '';
}

/** Prefer the local Magnific cover when the slug is in lote 1 or lote 2. */
export function resolveBlogCoverUrl(
  slug: string | undefined | null,
  fallback = '',
): string {
  return blogCoverForSlug(slug) || fallback;
}
