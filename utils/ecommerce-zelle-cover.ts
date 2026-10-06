/**
 * Slug-scoped Elementor rewriter: the «Últimas entradas» card for Zelle on
 * /agencia-e-commerce still ships the old WP featured (sistema de gestión).
 * Swap that card's img to the approved JN0rWQjOq4 cover. Same lifecycle as
 * rewriteEcommerceShopifyLink — body HTML only.
 */

export const ECOMMERCE_ZELLE_COVER_SLUG = 'agencia-e-commerce';

export const ZELLE_POST_SLUG = 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';

export const ZELLE_APPROVED_COVER =
  '/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png';

const ZELLE_THUMB_IMG_RE =
  /(<a class="thumb" href="[^"]*zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce"[^>]*>[\s\S]*?<img\b)([^>]*)(>)/gi;

function rewriteImgToApprovedCover(attrs: string): string {
  let next = attrs;
  if (/\ssrc="/i.test(next)) {
    next = next.replace(/\ssrc="[^"]*"/i, ` src="${ZELLE_APPROVED_COVER}"`);
  } else {
    next += ` src="${ZELLE_APPROVED_COVER}"`;
  }
  if (/\ssrcset="/i.test(next)) {
    next = next.replace(/\ssrcset="[^"]*"/i, ` srcset="${ZELLE_APPROVED_COVER} 1200w"`);
  }
  if (/\sdata-src="/i.test(next)) {
    next = next.replace(/\sdata-src="[^"]*"/i, ` data-src="${ZELLE_APPROVED_COVER}"`);
  }
  return next;
}

/**
 * On /agencia-e-commerce only: replace the Zelle carousel card image with
 * JN0rWQjOq4. Idempotent. Other slugs and other cards are a no-op.
 */
export function rewriteEcommerceZelleCover(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_ZELLE_COVER_SLUG) return html;
  ZELLE_THUMB_IMG_RE.lastIndex = 0;
  if (!ZELLE_THUMB_IMG_RE.test(html)) return html;
  ZELLE_THUMB_IMG_RE.lastIndex = 0;
  return html.replace(ZELLE_THUMB_IMG_RE, (_full, start: string, attrs: string, end: string) => {
    return `${start}${rewriteImgToApprovedCover(attrs)}${end}`;
  });
}
