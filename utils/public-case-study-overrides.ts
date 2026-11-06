type CaseStudyRecord = {
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  acf?: Record<string, unknown>;
};

/**
 * Document title/description that was live before PR #27
 * (commit 233ea6e, still present on parent of merge a108e17).
 * Jumex is the exception: preview title and H1 only; its description stays.
 * Body, results and testimonials come from WordPress again.
 */
const PUBLIC_CASE_STUDY_SEO: Record<
  string,
  { title: string; description: string; h1?: string }
> = {
  'jumex-shopify-dtc-ecommerce': {
    title: 'Jumex en Shopify: canal DTC y catálogo grande / Playful',
    h1: 'Jumex en Shopify: cómo construimos el canal DTC para un catálogo grande',
    description:
      'Construimos el canal DTC de Jumex en Shopify. Catálogo grande y pedido propio en jumexus.com, para que la venta no se quede en el marketplace.',
  },
  'odwalla-shopify-dtc-ecommerce': {
    title: 'Odwalla Shopify DTC: de sitio informativo a tienda',
    description:
      'Odwalla tenía web y visitas, no carrito. En Shopify armamos el canal DTC en odwalladrinks.com para que el pedido no se fuera a un tercero.',
  },
  'soytechno-ecommerce-venezuela': {
    title: 'SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela',
    description:
      'Caso tienda online Venezuela: SoyTechno con Cashea en checkout, pagos multimoneda y MRW rastreo. Cómo compra y confía el mercado fuera del chat informal.',
  },
};

export function getPublicCaseStudySeoOverride(slug: string) {
  return PUBLIC_CASE_STUDY_SEO[slug];
}

/** Pass-through: do not replace WordPress case copy. */
export function applyPublicCaseStudyOverrides<T extends CaseStudyRecord>(story: T): T {
  return story;
}
