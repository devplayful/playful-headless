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
  'soytechno-ecommerce-venezuela': {
    title: 'SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela',
    description:
      'Caso tienda online Venezuela: SoyTechno con Cashea en checkout, pagos multimoneda y MRW rastreo. Cómo compra y confía el mercado fuera del chat informal.',
  },
};

export function getPublicCaseStudySeoOverride(slug: string) {
  return PUBLIC_CASE_STUDY_SEO[slug];
}

/** Visible H1 on case pages (Ale 28 oct 2026); SEO title/meta stay in PUBLIC_CASE_STUDY_SEO. */
const PUBLIC_CASE_STUDY_H1: Record<string, string> = {
  'jumex-shopify-dtc-ecommerce':
    'Jumex en Shopify: cómo construimos el canal DTC para un catálogo grande',
  'odwalla-shopify-dtc-ecommerce':
    'Caso Odwalla: de web informativa sin carrito a tienda DTC en Shopify',
};

export function getPublicCaseStudyH1Override(slug: string): string | undefined {
  return PUBLIC_CASE_STUDY_H1[slug];
}

/** Title/H1 overrides only; body and ACF come from WordPress. */
export function applyPublicCaseStudyOverrides<T extends CaseStudyRecord>(story: T): T {
  const slug = typeof story.slug === 'string' ? story.slug : '';
  const h1 = getPublicCaseStudyH1Override(slug);
  if (!h1 || !story.title) return story;
  return {
    ...story,
    title: {
      ...story.title,
      rendered: h1,
    },
  };
}
