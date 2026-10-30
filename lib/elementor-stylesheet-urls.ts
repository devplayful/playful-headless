/** URLs de hojas de estilo Elementor servidas en páginas WP embebidas (paridad prod). */
export const WP_ENDPOINT_ORIGIN = 'https://endpoint.playfulagency.com';

export const ELEMENTOR_CORE_STYLESHEETS = [
  `${WP_ENDPOINT_ORIGIN}/wp-content/uploads/elementor/css/post-8.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/frontend.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-heading.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-image.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-spacer.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-accordion.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/widget-image-carousel.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor-pro/assets/css/widget-form.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/font-awesome/css/brands.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/animations/styles/zoomIn.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/mae-widgets.min.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/core-icons.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/pollock-icons.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/cubeportfolio.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/flickity.css`,
  `${WP_ENDPOINT_ORIGIN}/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/magnific.popup.css`,
];

export function elementorPageStylesheetUrls(pageId: number, stylesheetIds: number[]): string[] {
  const ids = Array.from(new Set([8, pageId, ...stylesheetIds]));
  const pageSheets = ids
    .filter((id) => id !== 8)
    .map((id) => `${WP_ENDPOINT_ORIGIN}/wp-content/uploads/elementor/css/post-${id}.css`);
  return [...ELEMENTOR_CORE_STYLESHEETS, ...pageSheets];
}

export function elementorStylesheetLinkHtml(urls: string[]): string {
  return urls.map((href) => `<link rel="stylesheet" href="${href}">`).join('\n');
}
