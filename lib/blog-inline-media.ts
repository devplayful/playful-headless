import { buildNextImageUrl, isOptimizableWpUpload } from './next-image-url.ts';

const LAZY_SVG_SLUGS = new Set(['5-plataformas-para-email-marketing-efectivo']);

const LAZY_SVG_BASENAMES = new Set([
  'Beneficio-2-05.svg',
  '5-08.svg',
  '6-09.svg',
  'undraw_social_share_algy.svg',
]);

function basenameFromSrc(src: string): string {
  try {
    return new URL(src).pathname.split('/').pop() || '';
  } catch {
    return src.split('/').pop()?.split('?')[0] || '';
  }
}

function setLoadingLazy(attrs: string): string {
  if (/\bloading=/i.test(attrs)) {
    return attrs.replace(/\bloading=(["']?)[^"'\s>]+/i, 'loading="lazy"');
  }
  return `${attrs} loading="lazy"`;
}

function setDecodingAsync(attrs: string): string {
  if (/\bdecoding=/i.test(attrs)) return attrs;
  return `${attrs} decoding="async"`;
}

/**
 * Email-marketing audit: below-the-fold SVG illustrations from endpoint
 * should not compete with the H2 LCP — lazy-load or serve via `/_next/image`.
 */
export function optimizeBlogInlineMedia(html: string, postSlug: string): string {
  if (!html || !LAZY_SVG_SLUGS.has(postSlug)) return html;
  return html.replace(/<img\b([^>]*)>/gi, (full, attrs: string) => {
    const src = /src=["']([^"']+)["']/i.exec(attrs)?.[1] || '';
    if (!src || !isOptimizableWpUpload(src)) return full;
    const base = basenameFromSrc(src);
    if (!LAZY_SVG_BASENAMES.has(base) && !/\.svg(\?|$)/i.test(src)) return full;

    let next = attrs;
    if (/\.svg(\?|$)/i.test(src)) {
      next = next.replace(
        /src=(["'])([^"']+)\1/i,
        (_m, q: string, url: string) => `src=${q}${buildNextImageUrl(url, 640)}${q}`,
      );
    }
    next = setLoadingLazy(setDecodingAsync(next));
    if (/fetchpriority=/i.test(next)) {
      next = next.replace(/\sfetchpriority=(["'])[^"']*\1/i, '');
    }
    return `<img${next}>`;
  });
}
