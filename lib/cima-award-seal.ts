export type CimaAwardSealVariant = 'agency' | 'soytechno';

export const CIMA_SEAL_INTRINSIC = { width: 480, height: 600 } as const;

export const CIMA_SEAL_COMPACT_MAX_WIDTH = 200;

export const CIMA_SEAL_ASSETS: Record<
  CimaAwardSealVariant,
  { full: string; compact: string; alt: string }
> = {
  agency: {
    full: '/sellos-cima/d3-escudo-playful-oscuro.svg',
    compact: '/sellos-cima/d3-escudo-playful-oscuro-compacto.svg',
    alt: 'Premios CIMA 2026, ganadores en Plataforma de E-commerce',
  },
  soytechno: {
    full: '/sellos-cima/d3-escudo-soytechno-oscuro.svg',
    compact: '/sellos-cima/d3-escudo-soytechno-oscuro-compacto.svg',
    alt: 'Premios CIMA 2026, SoyTechno ganadores en Plataforma de E-commerce',
  },
};

export function cimaSealSrc(variant: CimaAwardSealVariant, displayWidth: number): string {
  const assets = CIMA_SEAL_ASSETS[variant];
  return displayWidth < CIMA_SEAL_COMPACT_MAX_WIDTH ? assets.compact : assets.full;
}

export function cimaSealDisplayHeight(displayWidth: number): number {
  return Math.round((displayWidth * CIMA_SEAL_INTRINSIC.height) / CIMA_SEAL_INTRINSIC.width);
}

/** HTML picture block for Elementor injection (img + dimensions, no CLS). */
export function buildCimaSealPictureHtml(variant: CimaAwardSealVariant): string {
  const { full, compact, alt } = CIMA_SEAL_ASSETS[variant];
  const desktopWidth = 220;
  const mobileWidth = 160;
  const desktopHeight = cimaSealDisplayHeight(desktopWidth);
  const mobileHeight = cimaSealDisplayHeight(mobileWidth);
  const wrapStyle =
    'display:flex;justify-content:center;margin:0 auto 24px;padding:0 16px;max-width:1200px';
  return (
    `<div class="playful-cima-award-seal" style="${wrapStyle}">` +
    '<picture>' +
    `<source media="(max-width: 767px)" srcset="${compact}" width="${mobileWidth}" height="${mobileHeight}" />` +
    `<img src="${full}" width="${desktopWidth}" height="${desktopHeight}" ` +
    `style="width:min(100%,${desktopWidth}px);height:auto;max-width:${desktopWidth}px" ` +
    `alt="${alt}" decoding="async" loading="lazy" />` +
    '</picture>' +
    '</div>'
  );
}
