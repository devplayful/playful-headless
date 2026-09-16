type CaseStudyRecord = {
  slug?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  acf?: Record<string, unknown>;
};

/**
 * Document title/description that was live before PR #27
 * (commit 233ea6e, still present on parent of merge a108e17).
 * Body, results and testimonials come from WordPress again.
 */
const PUBLIC_CASE_STUDY_SEO: Record<string, { title: string; description: string }> = {
  'jumex-shopify-dtc-ecommerce': {
    title: 'Jumex Shopify DTC: canal propio para un catálogo grande',
    description:
      'Construimos el canal DTC de Jumex en Shopify. Catálogo grande y pedido propio en jumexus.com, para que la venta no se quede en el marketplace.',
  },
  'odwalla-shopify-dtc-ecommerce': {
    title: 'Odwalla Shopify DTC: de sitio informativo a tienda',
    description:
      'Odwalla tenía web y visitas, no carrito. En Shopify armamos el canal DTC en odwalladrinks.com para que el pedido no se fuera a un tercero.',
  },
};

export function getPublicCaseStudySeoOverride(slug: string) {
  return PUBLIC_CASE_STUDY_SEO[slug];
}

/** Pass-through: do not replace WordPress case copy. */
export function applyPublicCaseStudyOverrides<T extends CaseStudyRecord>(story: T): T {
  return story;
}
