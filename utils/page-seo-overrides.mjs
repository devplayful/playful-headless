/**
 * Per-slug <title> / og:title for WP Elementor pages whose Yoast SEO
 * title was cloned from another page. generateMetadata in app/[slug]
 * applies these after fetching Yoast so each public URL keeps a unique title.
 *
 * Title and description overrides are independent. Robots and on-page H1 stay untouched.
 */
export const PAGE_TITLE_OVERRIDES = {
  'agencia-e-commerce':
    'Agencia ecommerce para venta directa | Playful Agency',
  'agencia-seo':
    'Agencia SEO Playful Agency | Mejora tu Posicionamiento',
  'pagos-online-ecommerce':
    'Pagos Online para E-commerce | Haz tu Integración con Playful Agency',
  'pasarela-de-pago-ecommerce':
    'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
};

export function applyPageTitleOverride(slug, yoastTitle, yoastOgTitle) {
  const override = PAGE_TITLE_OVERRIDES[slug];
  if (override) {
    return { title: override, ogTitle: override };
  }
  return {
    title: yoastTitle,
    ogTitle: yoastOgTitle || yoastTitle,
  };
}

export const PAGE_DESCRIPTION_OVERRIDES = {
  'agencia-e-commerce':
    'Para marcas que ya venden directo al consumidor (D2C): ordenamos tu tienda online, el posicionamiento y el diseño para que venda más. Agenda tu llamada.',
};

export function applyPageDescriptionOverride(slug, yoastDescription, yoastOgDescription) {
  const override = Object.hasOwn(PAGE_DESCRIPTION_OVERRIDES, slug)
    ? PAGE_DESCRIPTION_OVERRIDES[slug]
    : undefined;
  return {
    description: override ?? yoastDescription,
    ogDescription: override ?? (yoastOgDescription || yoastDescription),
  };
}

/**
 * Next.js merges root-layout twitter:* into child pages. Non-blog routes
 * that set openGraph but omit twitter inherit the home generic card.
 * Mirror the page OG (override or Yoast OG already resolved) onto twitter.
 */
export function twitterFromOpenGraph(ogTitle, ogDescription, ogImage) {
  return {
    title: ogTitle,
    description: ogDescription,
    ...(ogImage ? { images: Array.isArray(ogImage) ? ogImage : [ogImage] } : {}),
  };
}
