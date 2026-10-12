/** Elementor landings that defer heavy Masterlayer scripts until after window.load. */
export const ELEMENTOR_DEFER_UNTIL_LOAD_SLUGS = new Set([
  'agencia-e-commerce',
  'agencia-sem',
  'agencia-seo',
  'agencia-diseno-web',
]);

export function shouldDeferElementorScriptsUntilLoad(slug: string): boolean {
  return ELEMENTOR_DEFER_UNTIL_LOAD_SLUGS.has(slug);
}
