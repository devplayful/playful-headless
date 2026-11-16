/**
 * url_video de Jumex y Odwalla.
 *
 * El REST de WP no expone el grupo ACF «Video». Las URLs salen de lo que
 * renderiza hoy producción (`<video>` en /casos-de-exito/[slug]?qa=1,
 * user agent PlayfulQA/1.0, 1 petición/s, 28 oct 2026):
 *   Jumex  → /videos/casos/jumex-ux.mp4  (también .webm)
 *   Odwalla → /videos/casos/odwalla.mp4 (también .webm)
 * Se guarda la URL absoluta https del mp4, que es el source que reproduce
 * el navegador (el campo Payload exige http/https).
 */
export const CASOS_URL_VIDEO = {
  'jumex-shopify-dtc-ecommerce': 'https://playfulagency.com/videos/casos/jumex-ux.mp4',
  'odwalla-shopify-dtc-ecommerce': 'https://playfulagency.com/videos/casos/odwalla.mp4',
} as const;

export const CASOS_URL_VIDEO_WP_IDS = {
  'jumex-shopify-dtc-ecommerce': 86237,
  'odwalla-shopify-dtc-ecommerce': 86235,
} as const;

export const CASOS_URL_VIDEO_TITULOS = {
  'jumex-shopify-dtc-ecommerce': 'Jumex Shopify DTC: canal propio para un catálogo grande',
  'odwalla-shopify-dtc-ecommerce': 'Odwalla Shopify DTC: de sitio informativo a tienda',
} as const;
