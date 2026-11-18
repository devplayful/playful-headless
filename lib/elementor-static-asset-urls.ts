/** Origen WP legacy — solo scripts de exportación / mirror, no runtime del sitio. */
export const WP_ENDPOINT_EXPORT_ORIGIN = 'https://endpoint.playfulagency.com';

const WP_STATIC = '/wp-static';

/** Scripts Elementor + dependencias cargados en landings WP embebidas (espejo local). */
export const ELEMENTOR_PAGE_SCRIPTS = [
  `${WP_STATIC}/wp-includes/js/jquery/jquery.min.js`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/js/frontend-modules.min.js`,
  `${WP_STATIC}/wp-includes/js/jquery/ui/core.min.js`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/js/frontend.min.js`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/waitforimages.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/gsap.min.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/core.min.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/flickity.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/cubeportfolio.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/parallax-scroll.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/magnific.popup.js`,
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/init.js`,
];

/** @font-face en ElementorPageHeaderFix.css */
export const ELEMENTOR_HEADER_FIX_FONT_URLS = [
  `${WP_STATIC}/wp-content/plugins/masterlayer-addons-for-elementor/assets/fonts/core-icons/core-icons.woff`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.woff2`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.woff`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/lib/eicons/fonts/eicons.ttf`,
  `${WP_STATIC}/wp-content/plugins/elementor/assets/lib/font-awesome/webfonts/fa-solid-900.woff2`,
];

export const ELEMENTOR_STATIC_ASSETS_BASE = `${WP_STATIC}/wp-content/plugins/elementor/assets/`;
export const ELEMENTOR_UPLOADS_BASE = '/wp-media/wp-content/uploads';

export const ELEMENTOR_SERVICE_PAGE_SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-e-commerce',
  'marketing-internacional',
  'agencia-ux-ui',
  'seo-expertos',
  'seo-vigo',
];

/** URLs canónicas endpoint para mirror-wp-static-assets (no servidas al navegador). */
export const ELEMENTOR_PAGE_SCRIPTS_EXPORT = ELEMENTOR_PAGE_SCRIPTS.map((path) => (
  `${WP_ENDPOINT_EXPORT_ORIGIN}${path.replace(/^\/wp-static/, '')}`
));

export const ELEMENTOR_HEADER_FIX_FONT_URLS_EXPORT = ELEMENTOR_HEADER_FIX_FONT_URLS.map((path) => (
  `${WP_ENDPOINT_EXPORT_ORIGIN}${path.replace(/^\/wp-static/, '')}`
));