/**
 * Imágenes del cuerpo HTML de posts (import WP → Payload).
 * Conserva y aplica alts SEO fase H5 sin tocar layout ni CSS.
 */

export type ContentImage = { src: string; alt: string | null };

/** Extrae src y alt de cada <img> del HTML renderizado de WP. */
export function contentImages(html: string): ContentImage[] {
  const out: ContentImage[] = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = /\ssrc=["']([^"']*)["']/i.exec(tag)?.[1] || '';
    const altMatch = /\salt=(["'])(.*?)\1/i.exec(tag);
    const alt = altMatch ? altMatch[2] : null;
    out.push({ src, alt });
  }
  return out;
}

function normalizeSrcFragment(value: string): string {
  try {
    return decodeURIComponent(value).toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

export function srcMatchesFragment(src: string, fragment: string): boolean {
  const hay = normalizeSrcFragment(src);
  const needle = normalizeSrcFragment(fragment);
  return hay.includes(needle);
}

/** Sustituye o añade alt en etiquetas <img> cuyo src contiene el fragmento. */
export function applyAltToContentHtml(html: string, srcFragment: string, alt: string): string {
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    const src = /\ssrc=["']([^"']*)["']/i.exec(tag)?.[1] || '';
    if (!srcMatchesFragment(src, srcFragment)) return tag;
    if (/\salt=(["'])/i.test(tag)) {
      return tag.replace(/\salt=(["'])(.*?)\1/i, ` alt="${escapeHtmlAttr(alt)}"`);
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
