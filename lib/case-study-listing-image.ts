/** Same listing endpoint and featured-media resolver as /casos-de-exito. */
export const CASE_STUDIES_LISTING_EMBED_URL =
  'https://endpoint.playfulagency.com/wp-json/wp/v2/casos-de-exito?_embed';

/** Live tapas that the Casos de Éxito listing already serves (verified 200). */
export const CASOS_DE_EXITO_FEATURED_TAPAS = {
  'jumex-shopify-dtc-ecommerce':
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-JUMEX-US.png',
  'odwalla-shopify-dtc-ecommerce':
    'https://endpoint.playfulagency.com/wp-content/uploads/2025/12/Tapa-Caso-de-exito-Odwalla.png',
  'soytechno-ecommerce-venezuela':
    '/images/casos/soytechno/images/lifestyle-f.jpg',
} as const;

export function resolveCaseStudyListingImage(item: {
  slug?: string;
  featured_media_url?: string;
  _embedded?: { 'wp:featuredmedia'?: Array<{ source_url?: string }> };
} | null | undefined): string {
  if (item?._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
    return item._embedded['wp:featuredmedia'][0].source_url;
  }
  if (typeof item?.featured_media_url === 'string' && item.featured_media_url) {
    return item.featured_media_url;
  }
  if (typeof item?.slug === 'string' && item.slug) {
    return featuredTapaForSlug(item.slug);
  }
  return '';
}

export function featuredTapaForSlug(slug: string): string {
  return CASOS_DE_EXITO_FEATURED_TAPAS[slug as keyof typeof CASOS_DE_EXITO_FEATURED_TAPAS] || '';
}
