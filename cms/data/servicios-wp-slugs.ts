/** Slugs WordPress/Elementor incluidos en H3 (excluye agencia-shopify, que viene del código). */
export const WP_SERVICIO_SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-e-commerce',
  'agencia-ux-ui',
] as const;

export type WpServicioSlug = (typeof WP_SERVICIO_SLUGS)[number];
