/**
 * Slug-scoped Elementor rewriter: one interior href from /agencia-diseno-web
 * to /agencia-ux-ui by wrapping existing copy (GSC brief 20 oct 2026).
 */

import { AGENCIA_UX_UI_HREF } from './broken-internal-hrefs.ts';

export const AGENCIA_DISENO_UX_UI_LINK_SLUG = 'agencia-diseno-web';

/** First visible phrase on the live landing (WP Elementor). */
export const AGENCIA_DISENO_UX_UI_ANCHOR = 'Experiencia de usuario';

function isInsideTag(html: string, index: number): boolean {
  const lastLt = html.lastIndexOf('<', index);
  const lastGt = html.lastIndexOf('>', index);
  return lastLt > lastGt;
}

function isInsideAnchor(html: string, index: number): boolean {
  const before = html.slice(0, index).toLowerCase();
  return before.lastIndexOf('<a') > before.lastIndexOf('</a>');
}

export function htmlAlreadyLinksToAgenciaUxUi(html: string): boolean {
  const re = /<a\b[^>]*\bhref\s*=\s*(["'])([^"']*)\1/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    const path = match[2].split(/[?#]/)[0].replace(/\/+$/, '') || '/';
    if (path === AGENCIA_UX_UI_HREF) return true;
  }
  return false;
}

/**
 * On /agencia-diseno-web only: wrap the first unlinked «Experiencia de usuario».
 * Idempotent. Other slugs are a no-op.
 */
export function rewriteAgenciaDisenoUxUiLink(html: string, slug: string): string {
  if (!html || slug !== AGENCIA_DISENO_UX_UI_LINK_SLUG) return html;
  if (htmlAlreadyLinksToAgenciaUxUi(html)) return html;

  const anchor = AGENCIA_DISENO_UX_UI_ANCHOR;
  const idx = html.indexOf(anchor);
  if (idx === -1) return html;
  if (isInsideTag(html, idx) || isInsideAnchor(html, idx)) return html;

  return (
    html.slice(0, idx) +
    `<a href="${AGENCIA_UX_UI_HREF}">${anchor}</a>` +
    html.slice(idx + anchor.length)
  );
}
