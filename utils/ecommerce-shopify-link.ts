/**
 * Slug-scoped Elementor rewriter: one interior href from /agencia-e-commerce
 * to /agencia-shopify. Same lifecycle as rewriteServiceBookingCtas (#58) —
 * body HTML only; header/footer live outside this fragment.
 */

export const AGENCIA_SHOPIFY_HREF = '/agencia-shopify';

export const ECOMMERCE_SHOPIFY_LINK_SLUG = 'agencia-e-commerce';

/** Neutral anchor in the platforms/services block when WP has no Shopify mention. */
export const ECOMMERCE_SHOPIFY_LINK_LABEL = 'servicios Shopify';

export const ECOMMERCE_SERVICES_BLOCK_MARKER =
  'Tú nos cuentas tus objetivos; nosotros nos encargamos del resto, sin rodeos.';

const SHOPIFY_MENTION_RE = /Shopify/gi;

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

export function htmlAlreadyLinksToAgenciaShopify(html: string): boolean {
  const target = normalizeHrefPath(AGENCIA_SHOPIFY_HREF);
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

/** Wrap the first unlinked Shopify mention that is not inside a tag or anchor. */
export function wrapFirstUnlinkedShopifyMention(html: string): string | null {
  SHOPIFY_MENTION_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = SHOPIFY_MENTION_RE.exec(html))) {
    if (isInsideTag(html, match.index) || isInsideAnchor(html, match.index)) {
      continue;
    }
    const mention = match[0];
    return (
      html.slice(0, match.index) +
      `<a href="${AGENCIA_SHOPIFY_HREF}">${mention}</a>` +
      html.slice(match.index + mention.length)
    );
  }
  return null;
}

function insertServicesBlockCta(html: string): string | null {
  if (!html.includes(ECOMMERCE_SERVICES_BLOCK_MARKER)) return null;
  const cta = ` También implementamos <a href="${AGENCIA_SHOPIFY_HREF}">${ECOMMERCE_SHOPIFY_LINK_LABEL}</a>.`;
  return html.replace(ECOMMERCE_SERVICES_BLOCK_MARKER, `${ECOMMERCE_SERVICES_BLOCK_MARKER}${cta}`);
}

/**
 * On /agencia-e-commerce only: one contextual href to /agencia-shopify.
 * Prefer wrapping the first Shopify mention; otherwise a short clause in the
 * services/platforms intro. Idempotent. Other slugs are a no-op.
 */
export function rewriteEcommerceShopifyLink(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_SHOPIFY_LINK_SLUG) return html;
  if (htmlAlreadyLinksToAgenciaShopify(html)) return html;

  const wrapped = wrapFirstUnlinkedShopifyMention(html);
  if (wrapped) return wrapped;

  return insertServicesBlockCta(html) ?? html;
}
