const SERVICE_BOOKING_HREF = '/reunion-playful';

export const LP_META_SHOPIFY_PATH = '/lp/agencia-shopify';

/** Hop the global BookingQueryPropagator ignores (`isBookingHref` is path-exact). */
export const LP_META_BOOKING_HOP = `${SERVICE_BOOKING_HREF}/ir`;

export function isLpMetaShopifyPath(pathname: string): boolean {
  const path = (pathname || '').split('?')[0].replace(/\/+$/, '') || '/';
  if (path === LP_META_SHOPIFY_PATH) return true;
  return path.startsWith(`${LP_META_SHOPIFY_PATH}/`);
}

function keptSearch(search: string): string {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  const incoming = new URLSearchParams(raw);
  const kept = new URLSearchParams();
  incoming.forEach((value, key) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed) kept.set(key, trimmed);
  });
  return kept.toString();
}

/** Real destination: /reunion-playful plus the full query. */
export function lpMetaBookingHrefFromSearch(search: string): string {
  const query = keptSearch(search);
  return query ? `${SERVICE_BOOKING_HREF}?${query}` : SERVICE_BOOKING_HREF;
}

/**
 * Visible href on this landing. Contains /reunion-playful (VisitaCalificada)
 * but is not the booking path, so BookingQueryPropagator leaves it alone.
 */
export function lpMetaBookingAnchorHref(search: string): string {
  const query = keptSearch(search);
  return query ? `${LP_META_BOOKING_HOP}?${query}` : LP_META_BOOKING_HOP;
}

export function lpMetaHrefWithSearch(href: string, search: string): string {
  const query = keptSearch(search);
  if (!query) return href;
  return href.includes('?') ? `${href}&${query}` : `${href}?${query}`;
}
