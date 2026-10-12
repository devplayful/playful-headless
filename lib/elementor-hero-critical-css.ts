/** Service landings whose LCP is the hero master-heading / widget (batch 5). */
export const ELEMENTOR_HERO_CRITICAL_CSS_SLUGS = new Set([
  'agencia-e-commerce',
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
]);

/**
 * Minimal above-the-fold rules so hero copy paints before Elementor/WP CSS finishes.
 * Kept in sync with ElementorPageHeaderFix.css hero + plain-body tokens.
 */
export const ELEMENTOR_HERO_CRITICAL_CSS = `
body.playful-elementor-plain{background-image:none!important;background-color:#DCF8F5!important;background-attachment:scroll!important;overflow-x:hidden}
@media (max-width:599px){.playful-wp-page{margin-top:-72px}}
.playful-wp-page .elementor-container{display:flex;margin-left:auto;margin-right:auto;position:relative;flex-wrap:wrap}
.playful-wp-page .elementor-column{display:flex;min-height:1px;position:relative}
.playful-wp-page .elementor-widget-wrap{align-content:flex-start;flex-wrap:wrap;position:relative;width:100%}
.playful-wp-page>.playful-wp-elementor>.elementor>.elementor-top-section:first-child,
.playful-wp-page .elementor-top-section:first-child,
.playful-wp-page .elementor-top-section:first-child .elementor-container,
.playful-wp-page .elementor-top-section:first-child .elementor-column,
.playful-wp-page .elementor-top-section:first-child .elementor-widget-wrap{position:relative;overflow:visible!important}
.playful-wp-page .elementor-top-section:first-child .elementor-element-3abcdce.image-width-auto{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:100%!important;pointer-events:none;z-index:0}
.playful-wp-page .elementor-top-section:first-child .elementor-element-5be5fed{position:relative;z-index:1}
.playful-wp-page .elementor-element-3abcdce .elementor-repeater-item-feda40c.master-shape{top:-340px!important;left:-320px!important;width:980px!important;height:980px!important;background-color:#886CFF!important;opacity:.35!important;filter:blur(100px)!important;z-index:0!important}
.playful-wp-page .elementor-top-section:first-child .elementor-heading-title{margin:0;line-height:1.12}
.playful-wp-page .elementor-top-section:first-child .texto-pequeno{margin-top:6px!important;margin-bottom:4px!important;line-height:1.15!important}
.playful-wp-page .elementor-top-section:first-child .master-heading .sub-heading{margin-top:8px;font-family:var(--font-dm-sans),"DM Sans",sans-serif!important}
.playful-wp-page .elementor-top-section:first-child .elementor-widget-mae-headings>.elementor-widget-container{margin-bottom:24px!important}
.playful-wp-page h1,.playful-wp-page h2,.playful-wp-page .elementor-heading-title,.playful-wp-page .master-heading .heading,.playful-wp-page .master-heading .main-heading,.playful-wp-page .texto-pequeno{font-family:var(--font-paytone-one),"Paytone One",var(--font-montserrat),Montserrat,Outfit,sans-serif}
.playful-wp-page p,.playful-wp-page .sub-heading,.playful-wp-page .master-heading .sub-heading{font-family:var(--font-dm-sans),"DM Sans",sans-serif}
.playful-wp-page .elementor-invisible,.playful-wp-page .elementor-widget-mae-headings,.playful-wp-page .master-heading{visibility:visible!important;opacity:1!important}
.playful-wp-page .elementor-section-stretched{width:100%!important;left:0!important;max-width:100%!important}
.playful-wp-page img{max-width:100%;height:auto}
`.replace(/\s+/g, ' ').trim();

export function shouldInlineElementorHeroCriticalCss(slug: string): boolean {
  return ELEMENTOR_HERO_CRITICAL_CSS_SLUGS.has(slug);
}
