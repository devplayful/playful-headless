/**
 * Enlace interior, solo en el HTML de /agencia-e-commerce, hacia
 * /agencia-diseno-web. Envuelve la primera «tienda online» que ya está en el
 * cuerpo. No añade frases.
 */

export const AGENCIA_DISENO_WEB_HREF = '/agencia-diseno-web';

export const ECOMMERCE_DISENO_WEB_LINK_SLUG = 'agencia-e-commerce';

/** Palabras que ya están en el primer subheading del cuerpo. */
export const ECOMMERCE_DISENO_WEB_ANCHOR = 'tienda online';

const ANCHOR_RE = /tienda online/g;

function normalizeHrefPath(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return '';
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const url = absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return trimmed.split(/[?#]/)[0].replace(/\/+$/, '');
  }
}

export function htmlAlreadyLinksToAgenciaDisenoWeb(html: string): boolean {
  const target = normalizeHrefPath(AGENCIA_DISENO_WEB_HREF);
  const re = /<a\b[^>]*\bhref\s*=\s*(["'])([^"']*)\1/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (normalizeHrefPath(match[2]) === target) return true;
  }
  return false;
}

function isInsideTag(html: string, index: number): boolean {
  const lastLt = html.lastIndexOf('<', index);
  const lastGt = html.lastIndexOf('>', index);
  return lastLt > lastGt;
}

function isInsideAnchor(html: string, index: number): boolean {
  const before = html.slice(0, index).toLowerCase();
  return before.lastIndexOf('<a') > before.lastIndexOf('</a>');
}

/**
 * On /agencia-e-commerce only: wrap the first unlinked «tienda online».
 * If that phrase is absent, leave the HTML unchanged. Idempotent.
 */
export function rewriteEcommerceDisenoWebLink(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_DISENO_WEB_LINK_SLUG) return html;
  if (htmlAlreadyLinksToAgenciaDisenoWeb(html)) return html;

  ANCHOR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ANCHOR_RE.exec(html))) {
    if (isInsideTag(html, match.index) || isInsideAnchor(html, match.index)) {
      continue;
    }
    const mention = match[0];
    return (
      html.slice(0, match.index) +
      `<a href="${AGENCIA_DISENO_WEB_HREF}">${mention}</a>` +
      html.slice(match.index + mention.length)
    );
  }
  return html;
}
