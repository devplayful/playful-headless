export const SHOPIFY_CASE_STUDY_SLUGS = [
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
] as const;

export const CASE_STUDY_SHOPIFY_HREF = '/agencia-shopify';

export const CASE_STUDY_SHOPIFY_LABEL = 'Agencia Shopify';

export function isShopifyCaseStudySlug(slug: string): boolean {
  return (SHOPIFY_CASE_STUDY_SLUGS as readonly string[]).includes(slug);
}
