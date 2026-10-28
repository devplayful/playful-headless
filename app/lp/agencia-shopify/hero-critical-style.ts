/** Route-local first-paint CSS. No opacity/transform. Hero does not wait on webfonts. */
export const HERO_CRITICAL_STYLE = [
  '[data-lp-meta-shopify] h1{font-family:system-ui,-apple-system,"Segoe UI",sans-serif!important;color:#440099;font-weight:600;font-size:36px;line-height:42px;margin:0}',
  '[data-illustration-slot=ads-hero]{position:relative;width:100%}',
  '[data-illustration-slot=ads-hero] img{display:block!important;width:100%!important;height:352px!important;object-fit:cover!important}',
  '[data-lp-meta-shopify] [data-lp-block="1"]{position:relative;overflow:hidden}',
  '[data-lp-meta-shopify] [data-lp-block]:not([data-lp-block="1"]){content-visibility:auto;contain-intrinsic-size:auto 640px}',
].join('');
