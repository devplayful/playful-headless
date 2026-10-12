import { buildNextImageUrl, isOptimizableWpUpload } from './next-image-url.ts';

/** Service landings whose hero PNG/SVG should be served via `/_next/image`. */
export const ELEMENTOR_LCP_SLUGS = new Set([
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-seo',
  'agencia-e-commerce',
  // agencia-ux-ui: hero /_next/image regressed mobile LCP vs f805e38 in LH batch (a7cbdfc, #265, #268).
]);

export const ELEMENTOR_HERO_LCP_SIZES = '(max-width: 768px) 100vw, 437px';

export const UX_UI_SLUG = 'agencia-ux-ui';

const UX_UI_GALLERY_LCP_RE =
  /<div class="master-fancy-image[^"]*"[\s\S]*?<div class="image-wrap">\s*<img\b([^>]*)>/i;

/** First gallery stack fancy image (mobile LCP). Hero SVG is left on the WP URL. */
export function optimizeUxUiGalleryLcp(html: string, slug: string): string {
  if (slug !== UX_UI_SLUG) return html;
  const match = UX_UI_GALLERY_LCP_RE.exec(html);
  if (!match) return html;
  const full = match[0];
  const attrs = match[1];
  let next = attrs.replace(/\sloading=["']lazy["']/gi, '');
  if (!/fetchpriority=/i.test(next)) next += ' fetchpriority="high"';
  if (!/\bdecoding=/i.test(next)) next += ' decoding="async"';
  if (!/\bsizes=/i.test(next)) next += ` sizes="${ELEMENTOR_HERO_LCP_SIZES}"`;
  const optimizedImg = `<img${next}>`;
  const optimizedBlock = full.replace(/<img\b[^>]*>/i, optimizedImg);
  return html.replace(full, optimizedBlock);
}

export function firstUxUiGalleryLcpSrc(html: string, slug: string): string | null {
  if (slug !== UX_UI_SLUG) return null;
  const match = UX_UI_GALLERY_LCP_RE.exec(html);
  if (!match) return null;
  const src = /\bsrc=["']([^"']+)["']/i.exec(match[1])?.[1];
  return src || null;
}

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

function optimizeSrcset(srcset: string, targetWidth: number): string {
  return srcset
    .split(',')
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) return '';
      const parts = trimmed.split(/\s+/);
      const url = parts[0];
      const descriptor = parts.slice(1).join(' ');
      if (!isOptimizableWpUpload(url)) return trimmed;
      const widthMatch = descriptor.match(/^(\d+)w$/);
      const w = widthMatch ? Number(widthMatch[1]) : targetWidth;
      return `${buildNextImageUrl(url, w)} ${descriptor}`.trim();
    })
    .filter(Boolean)
    .join(', ');
}

function isHeroCandidate(attrs: string, src: string): boolean {
  if (!src || src.startsWith('data:')) return false;
  if (/icon|sprite|favicon|pixel\.gif/i.test(src)) return false;
  if (/playful-logov\.svg/i.test(src)) return false;
  return true;
}

/**
 * First content hero on SEM / diseño / UX: optimized `/_next/image` URL,
 * intrinsic size, sizes, fetchpriority and matching srcset when present.
 */
export function optimizeElementorLcpHero(html: string, slug: string): string {
  if (!ELEMENTOR_LCP_SLUGS.has(slug)) return html;
  let done = false;
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
    if (done) return full;
    const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1] || '';
    if (!isHeroCandidate(attrs, src) || !isOptimizableWpUpload(src)) return full;
    done = true;

    const width = readNumericAttr(attrs, 'width') ?? 437;
    const height = readNumericAttr(attrs, 'height') ?? 417;
    const optimizedSrc = buildNextImageUrl(src, Math.max(width, 828));

    let next = attrs;
    next = setOrReplaceAttr(next, 'src', optimizedSrc);
    next = setOrReplaceAttr(next, 'width', String(width));
    next = setOrReplaceAttr(next, 'height', String(height));
    next = setOrReplaceAttr(next, 'sizes', ELEMENTOR_HERO_LCP_SIZES);
    if (!/fetchpriority=/i.test(next)) next += ' fetchpriority="high"';
    if (!/\bdecoding=/i.test(next)) next += ' decoding="async"';

    const srcsetMatch = /srcset=["']([^"']+)["']/i.exec(attrs);
    if (srcsetMatch) {
      next = setOrReplaceAttr(next, 'srcset', optimizeSrcset(srcsetMatch[1], width));
    }

    return `<img${next}>`;
  });
}

export function firstOptimizableHeroSrc(html: string, slug: string): string | null {
  if (!ELEMENTOR_LCP_SLUGS.has(slug)) return null;
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const src = match[1];
    if (isHeroCandidate(match[0], src) && isOptimizableWpUpload(src)) {
      const width = readNumericAttr(match[0], 'width') ?? 437;
      return buildNextImageUrl(src, Math.max(width, 828));
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
