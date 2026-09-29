/**
 * Per-slug <title> / og:title for WP Elementor pages whose Yoast SEO
 * title was cloned from another page. generateMetadata in app/[slug]
 * applies these after fetching Yoast so each public URL keeps a unique title.
 *
 * Title and description overrides are independent. Robots and on-page H1 stay untouched.
 */
export const PAGE_TITLE_OVERRIDES = {
  'agencia-e-commerce':
    'Tu Agencia e-Commerce para Resultados Reales | Playful Agency',
  'pagos-online-ecommerce':
    'Pagos Online para E-commerce | Haz tu Integración con Playful Agency',
  'pasarela-de-pago-ecommerce':
    'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
  'pasarela-de-pagos-venezuela':
    'Pasarela de Pago funcional para tu E-commerce | Playful Agency',
  'agencia-diseno-web':
    'Agencia de diseño web para tiendas online | Playful Agency',
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
    'Agencia e-Commerce para marcas D2C que ya venden y quieren crecer con margen. Ordenamos e implementamos tu catálogo en Shopify o WooCommerce. Agenda tu llamada diagnóstica.',
  'agencia-diseno-web':
    'Diseño de tienda online orientado a conversión para marcas que ya venden, tiendas físicas que pasan a online o proyectos desde cero. Agenda tu llamada.',
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
