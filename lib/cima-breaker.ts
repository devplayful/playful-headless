export const CIMA_PREMIOS_URL = 'https://premioscima.com';

export type CimaCelebrationVariant = 'home' | 'ecommerce';

export const CIMA_BREAKER_ALTS = {
  celebrationAgency:
    'Playful Agency, agencia reconocida en los Premios CIMA 2026, categoría Plataforma de E-commerce',
  soytechno:
    'SoyTechno, cliente reconocido en los Premios CIMA 2026, categoría E-commerce',
} as const;

export const CIMA_SHIELD_PATHS = {
  playful: '/sellos-cima/d3-escudo-playful-oscuro.svg',
  soytechno: '/sellos-cima/d3-escudo-soytechno-oscuro.svg',
} as const;

/** Intrinsic shield ratio 4:5 (480×600). */
export const CIMA_SHIELD_INTRINSIC = { width: 480, height: 600 } as const;

export function cimaShieldDisplayHeight(displayWidth: number): number {
  return Math.round((displayWidth * CIMA_SHIELD_INTRINSIC.height) / CIMA_SHIELD_INTRINSIC.width);
}

/** Static HTML block for Elementor pages (no React in injected body). */
export function buildCimaCelebrationBreakerHtml(variant: CimaCelebrationVariant): string {
  const isEcom = variant === 'ecommerce';
  const sectionBg = isEcom ? '#F7F7F7' : '#EBDBFF';
  const innerMax = isEcom ? '1140px' : '1200px';
  const titleSize = isEcom ? '57px' : '60px';
  const alt = CIMA_BREAKER_ALTS.celebrationAgency;
  const shield = CIMA_SHIELD_PATHS.playful;
  const desktopW = 256;
  const desktopH = cimaShieldDisplayHeight(desktopW);
  const mobileW = 192;
  const mobileH = cimaShieldDisplayHeight(mobileW);

  return (
    `<section class="cima-breaker cima-breaker--celebration${isEcom ? ' cima-breaker--ecommerce' : ''}" style="background:${sectionBg};margin:0;padding:0">` +
    `<a class="cima-breaker__link" href="${CIMA_PREMIOS_URL}" target="_blank" rel="noopener" style="display:block;text-decoration:none;color:inherit">` +
    `<div class="cima-breaker__celebration-inner" style="max-width:${innerMax};margin:0 auto;padding:170px 16px 40px;position:relative;box-sizing:border-box">` +
    `<div class="cima-breaker__card" aria-hidden="true" style="position:absolute;left:16px;right:16px;bottom:40px;top:170px;background:#FFEFD1;border-radius:32px;z-index:0"></div>` +
    `<div class="cima-breaker__celebration-grid" style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:24px">` +
    `<div class="cima-breaker__shield" style="flex-shrink:0;margin-top:-120px">` +
    `<picture>` +
    `<source media="(min-width: 768px)" srcset="${shield}" width="${desktopW}" height="${desktopH}" />` +
    `<img src="${shield}" width="${mobileW}" height="${mobileH}" alt="${alt}" loading="lazy" decoding="async" style="width:${mobileW}px;height:auto;max-width:100%" />` +
    `</picture>` +
    `</div>` +
    `<div class="cima-breaker__copy" style="text-align:center;font-family:var(--font-dm-sans),&quot;DM Sans&quot;,sans-serif;color:#4A4453">` +
    `<span style="display:inline-block;font-weight:700;font-size:16px;letter-spacing:1.5px;color:#fff;background:#440099;padding:8px 20px;border-radius:999px;margin-bottom:16px">PREMIOS CIMA 2026</span>` +
    `<h2 class="cima-breaker__title" style="font-family:var(--font-paytone-one),&quot;Paytone One&quot;,sans-serif;font-size:32px;line-height:1.15;color:#440099;margin:0 0 12px;font-weight:400">Reconocidos en los<br/>Premios CIMA 2026</h2>` +
    `<p style="font-size:15px;font-weight:500;margin:0 0 16px">Categoría · Plataforma de E-commerce</p>` +
    `<span style="display:inline-block;font-weight:700;font-size:16px;color:#440099;text-decoration:underline;text-decoration-thickness:2px;background:#FFEFD1;padding:4px 12px;border-radius:8px">premioscima.com →</span>` +
    `</div>` +
    `</div>` +
    `</div>` +
    `</a>` +
    `<style>@media (min-width:768px){.cima-breaker--celebration .cima-breaker__celebration-inner{padding-left:0;padding-right:0}.cima-breaker--celebration .cima-breaker__card{left:0;right:0;border-radius:48px;top:170px}.cima-breaker--celebration .cima-breaker__celebration-grid{flex-direction:row;align-items:center;justify-content:center;gap:48px;text-align:left}.cima-breaker--celebration .cima-breaker__shield{margin-top:-160px;margin-right:0}.cima-breaker--celebration .cima-breaker__shield img{width:${desktopW}px!important}.cima-breaker--celebration .cima-breaker__copy{text-align:left;max-width:520px}.cima-breaker--celebration .cima-breaker__title{font-size:${titleSize}}.cima-breaker--celebration .cima-breaker__copy p{font-size:22px}.cima-breaker--celebration .cima-breaker__copy span:last-child{font-size:20px}.cima-breaker--ecommerce .cima-breaker__celebration-inner{max-width:1140px}}</style>` +
    `</section>`
  );
}
