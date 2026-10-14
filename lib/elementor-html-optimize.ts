import { buildNextImageUrl, isOptimizableWpUpload } from './next-image-url.ts';
import {
  ELEMENTOR_HERO_SRCSET_WIDTHS,
  snapNextImageWidth,
} from './next-image-widths.ts';

/** Service landings whose hero PNG/SVG should be served via `/_next/image`. */
export const ELEMENTOR_LCP_SLUGS = new Set([
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-seo',
  'agencia-e-commerce',
  // agencia-ux-ui: hero /_next/image regressed mobile LCP vs f805e38 in LH batch (a7cbdfc, #265, #268).
]);

/** Desktop slot is 437px CSS; request 750w so srcset only uses allowed optimizer widths. */
export const ELEMENTOR_HERO_LCP_SIZES = '(max-width: 768px) 100vw, 750px';

const CAROUSEL_LOGO_SIZE = { width: 300, height: 200 } as const;

const PROJECT_WEBP_SIZES: Record<string, { width: number; height: number }> = {
  'project-05.webp': { width: 600, height: 600 },
  'project-06.webp': { width: 600, height: 400 },
  'project-07.webp': { width: 600, height: 600 },
  'project-08.webp': { width: 600, height: 400 },
  'project-10.webp': { width: 600, height: 400 },
};

const PIXEL_GIF = { width: 1, height: 1 } as const;

function basenameFromSrc(src: string): string {
  try {
    const path = new URL(src).pathname;
    return path.slice(path.lastIndexOf('/') + 1);
  } catch {
    const clean = src.split('?')[0].split('#')[0];
    return clean.slice(clean.lastIndexOf('/') + 1);
  }
}

function dimensionsForSrc(src: string): { width: number; height: number } | null {
  if (!src) return null;
  if (/pixel\.gif$/i.test(src)) return PIXEL_GIF;
  if (src.includes('/Cliente-Playful-_')) return CAROUSEL_LOGO_SIZE;
  const base = basenameFromSrc(src);
  return PROJECT_WEBP_SIZES[base] ?? null;
}

function readNumericAttr(attrs: string, name: string): number | null {
  const match = attrs.match(new RegExp(`\\b${name}=["']?(\\d+)`, 'i'));
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

function setOrReplaceAttr(attrs: string, name: string, value: string): string {
  const re = new RegExp(`\\s${name}=("[^"]*"|'[^']*'|\\S+)`, 'i');
  if (re.test(attrs)) {
    return attrs.replace(re, ` ${name}="${value}"`);
  }
  return `${attrs} ${name}="${value}"`;
}

function heroImageSrcset(fullSizeSrc: string): string {
  return ELEMENTOR_HERO_SRCSET_WIDTHS
    .map((w) => `${buildNextImageUrl(fullSizeSrc, w)} ${w}w`)
    .join(', ');
}

function isHeroCandidate(attrs: string, src: string): boolean {
  if (!src || src.startsWith('data:')) return false;
  if (/icon|sprite|favicon|pixel\.gif/i.test(src)) return false;
  if (/playful-logov\.svg/i.test(src)) return false;
  return true;
}

/** Next image optimizer 400s on remote SVG and on some RGBA → WebP paths; serve the origin URL. */
function shouldServeHeroViaNextImage(src: string): boolean {
  if (!isOptimizableWpUpload(src)) return false;
  if (/\.svg(\?|#|$)/i.test(src)) return false;
  return true;
}

/**
 * First content hero on SEM / diseño / UX: optimized `/_next/image` URL,
 * intrinsic size, sizes, fetchpriority and matching srcset when present.
 */
/** Critical mobile hero layout for /agencia-e-commerce (injected in document head). */
export const ECOM_MOBILE_HERO_RESERVE_CSS = `@media (max-width:599px){
.playful-wp-page[data-playful-page="85582"] .elementor-element-748229a>.elementor-container{align-items:flex-start!important}
.playful-wp-page[data-playful-page="85582"] .elementor-element-748229a .elementor-column>.elementor-widget-wrap{align-content:flex-start!important;justify-content:flex-start!important}
.playful-wp-page[data-playful-page="85582"] .elementor-element-ab148e4 .elementor-widget-container,
.playful-wp-page[data-playful-page="85582"] .elementor-element-ab148e4 .master-gallery-stack{aspect-ratio:437/417!important;width:100%;max-width:min(100%,100vw)}
.playful-wp-page[data-playful-page="85582"] .elementor-element-ab148e4 img{width:100%;height:auto;aspect-ratio:437/417;object-fit:contain}
}`;

export function optimizeElementorLcpHero(html: string, slug: string): string {
  if (!ELEMENTOR_LCP_SLUGS.has(slug)) return html;
  let done = false;
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
    if (done) return full;
    const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1] || '';
    if (!isHeroCandidate(attrs, src) || !shouldServeHeroViaNextImage(src)) return full;
    done = true;

    const width = readNumericAttr(attrs, 'width') ?? 437;
    const height = readNumericAttr(attrs, 'height') ?? 417;
    const optimizedSrc = buildNextImageUrl(src, snapNextImageWidth(Math.max(width, 750)));

    let next = attrs;
    next = setOrReplaceAttr(next, 'src', optimizedSrc);
    next = setOrReplaceAttr(next, 'width', String(width));
    next = setOrReplaceAttr(next, 'height', String(height));
    next = setOrReplaceAttr(next, 'sizes', ELEMENTOR_HERO_LCP_SIZES);
    next = setOrReplaceAttr(next, 'srcset', heroImageSrcset(src));
    if (!/fetchpriority=/i.test(next)) next += ' fetchpriority="high"';
    if (!/\bdecoding=/i.test(next)) next += ' decoding="async"';

    return `<img${next}>`;
  });
}

export function firstOptimizableHeroSrc(html: string, slug: string): string | null {
  if (!ELEMENTOR_LCP_SLUGS.has(slug)) return null;
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const src = match[1];
    if (!isHeroCandidate(match[0], src)) continue;
    if (/\.svg(\?|#|$)/i.test(src) && isOptimizableWpUpload(src)) {
      return src;
    }
    if (shouldServeHeroViaNextImage(src)) {
      const width = readNumericAttr(match[0], 'width') ?? 437;
      return buildNextImageUrl(src, snapNextImageWidth(Math.max(width, 750)));
    }
  }
  return null;
}

/** Carousel logos, portfolio thumbs and tracking pixels missing width/height. */
export function applyElementorIntrinsicDimensions(html: string): string {
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
    if (/\bwidth=/i.test(attrs) && /\bheight=/i.test(attrs)) return full;
    const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1] || '';
    const dims = dimensionsForSrc(src);
    if (!dims) return full;
    let next = attrs;
    if (!/\bwidth=/i.test(next)) next = setOrReplaceAttr(next, 'width', String(dims.width));
    if (!/\bheight=/i.test(next)) next = setOrReplaceAttr(next, 'height', String(dims.height));
    return `<img${next}>`;
  });
}
