/** Elementor landings that defer WP stylesheets (print→all) after inline hero CSS. */
export const ELEMENTOR_DEFER_WP_CSS_SLUGS = new Set([
  'agencia-e-commerce',
  'agencia-sem',
  'agencia-seo',
  'agencia-diseno-web',
  'agencia-ux-ui',
]);

export function shouldDeferElementorWpCss(slug: string): boolean {
  return ELEMENTOR_DEFER_WP_CSS_SLUGS.has(slug);
}

/** Elementor landings that defer heavy Masterlayer scripts until after window.load. */
export const ELEMENTOR_DEFER_UNTIL_LOAD_SLUGS = new Set([
  'agencia-e-commerce',
  'agencia-sem',
  'agencia-seo',
  'agencia-diseno-web',
  'agencia-ux-ui',
]);

export function shouldDeferElementorScriptsUntilLoad(slug: string): boolean {
  return ELEMENTOR_DEFER_UNTIL_LOAD_SLUGS.has(slug);
}
