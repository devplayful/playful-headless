/**
 * Imágenes del cuerpo HTML de posts (import WP → Payload).
 * Conserva y aplica alts SEO fase H5 sin tocar layout ni CSS.
 */

export type ContentImage = { src: string; alt: string | null };

/** Extrae src y alt de cada <img> del HTML renderizado de WP. */
export function contentImages(html: string): ContentImage[] {
  const out: ContentImage[] = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = extractImgTagUrl(tag);
    const altMatch = /\salt=(["'])([\s\S]*?)\1/i.exec(tag);
    const alt = altMatch ? altMatch[2] : null;
    out.push({ src, alt });
  }
  return out;
}

function normalizeSrcFragment(value: string): string {
  try {
    return decodeURIComponent(value).normalize('NFC').toLowerCase();
  } catch {
    return value.normalize('NFC').toLowerCase();
  }
}

/** URL usable para matching (src, data-src o primera candidata de srcset). */
export function extractImgTagUrl(tag: string): string {
  const src = /\ssrc=["']([^"']*)["']/i.exec(tag)?.[1]?.trim();
  if (src) return src;
  const dataSrc = /\sdata-src=["']([^"']*)["']/i.exec(tag)?.[1]?.trim();
  if (dataSrc) return dataSrc;
  const lazySrc = /\sdata-lazy-src=["']([^"']*)["']/i.exec(tag)?.[1]?.trim();
  if (lazySrc) return lazySrc;
  const srcset = /\ssrcset=["']([^"']*)["']/i.exec(tag)?.[1];
  if (srcset) {
    const first = srcset.split(',')[0]?.trim().split(/\s+/)[0];
    if (first) return first;
  }
  return '';
}

export function readAltFromPostHtml(html: string, srcContains: string): string {
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = extractImgTagUrl(tag);
    if (!srcMatchesFragment(src, srcContains)) continue;
    const altMatch = /\salt=(["'])([\s\S]*?)\1/i.exec(tag);
    if (!altMatch) return '';
    return altMatch[2]
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&');
  }
  return '';
}

export function srcMatchesFragment(src: string, fragment: string): boolean {
  const hay = normalizeSrcFragment(src);
  const needle = normalizeSrcFragment(fragment);
  return hay.includes(needle);
}

/** Sustituye o añade alt en etiquetas <img> cuyo src contiene el fragmento. */
export function applyAltToContentHtml(html: string, srcFragment: string, alt: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = extractImgTagUrl(tag);
    if (!srcMatchesFragment(src, srcFragment)) return tag;
    if (/\salt=(["'])/i.test(tag)) {
      return tag.replace(/\salt=(["'])([\s\S]*?)\1/i, ` alt="${escapeHtmlAttr(alt)}"`);
    }
    return tag.replace(/<img\b/i, `<img alt="${escapeHtmlAttr(alt)}"`);
  });
}

function escapeHtmlAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export type ContentAltOverride = {
  wpId: number;
  /** Subcadena del src (nombre de archivo WP). */
  srcContains: string;
  alt: string;
};

export function applyContentAltOverrides(
  wpId: number,
  html: string,
  images: ContentImage[],
  overrides: ContentAltOverride[],
): { html: string; images: ContentImage[] } {
  let nextHtml = html;
  const nextImages = images.map((img) => ({ ...img }));
  for (const rule of overrides) {
    if (rule.wpId !== wpId) continue;
    nextHtml = applyAltToContentHtml(nextHtml, rule.srcContains, rule.alt);
    for (const img of nextImages) {
      if (srcMatchesFragment(img.src, rule.srcContains)) img.alt = rule.alt;
    }
  }
  return { html: nextHtml, images: nextImages };
}
