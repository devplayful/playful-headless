/**
 * Local Magnific covers that replace WordPress featured + OG/Twitter
 * for José-approved lote 1 + lote 2 + lote 3 (23 sep 2026) + lote 4
 * (24 sep 2026, José GO vía Diseño). Same override
 * shape as CASOS_DE_EXITO_FEATURED_TAPAS: slug → public/ path.
 *
 * 24 sep 2026 (José GO vía Diseño): N2eMFsC6D9 canónico en
 * `aprende-todo-sobre-el-seo`; `como-hacer-posicionamiento-web-en-buscadores`
 * vuelve a featured WP; `google-ads-grants` / rg39Phdxtc archivado.
 * 3zBMZYMREY permanece solo en `7-consejos-seo-para-posicionar-tu-pagina`.
 *
 * 24 sep 2026 (José GO vía Diseño): N2eryB06D9 (Nano Banana Pro) canónico
 * en `blog-corporativo-aumenta-el-trafico-de-tu-sitio-web`.
 * 24 sep 2026 (José GO vía Diseño): VXQNEs8MMU (Nano Banana Pro) canónico
 * en `rediseno-web`.
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
  // lote 3
  'como-posicionar-tu-negocio-en-google-ads': '/images/blog/02-posicionar-google-ads-magnific-s7A2J1Kl8e.png',
  'publicidad-digital-en-tu-negocio': '/images/blog/03-publicidad-digital-magnific-5j9PO4hKxe.png',
  'desarrollo-ui-ux': '/images/blog/04-desarrollo-ui-ux-magnific-jUZ6ijXLD0.png',
  'aprende-todo-sobre-el-seo': '/images/blog/05-posicionamiento-web-magnific-N2eMFsC6D9.png',
  'como-elegir-tus-palabras-claves': '/images/blog/06-palabras-claves-magnific-1li9dWjr4r.png',
  'ecommerce-mi-negocio-online': '/images/blog/07-ecommerce-negocio-online-magnific-s7AzDuWl8e.png',
  // lote 4 (24 sep 2026, José GO vía Diseño)
  'blog-corporativo-aumenta-el-trafico-de-tu-sitio-web':
    '/images/blog/08-blog-corporativo-magnific-N2eryB06D9.png',
  'rediseno-web': '/images/blog/09-rediseno-web-magnific-VXQNEs8MMU.png',
} as const;

export const BLOG_COVER_SIZE = { width: 2560, height: 1440 } as const;

export type BlogCoverSlug = keyof typeof BLOG_COVER_OVERRIDES;

export function blogCoverForSlug(slug: string | undefined | null): string {
  if (!slug) return '';
  return BLOG_COVER_OVERRIDES[slug as BlogCoverSlug] || '';
}

/** Prefer the local Magnific cover when the slug is in lote 1–4. */
export function resolveBlogCoverUrl(
  slug: string | undefined | null,
  fallback = '',
): string {
  return blogCoverForSlug(slug) || fallback;
}
