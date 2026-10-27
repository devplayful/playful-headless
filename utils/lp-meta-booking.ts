import { SERVICE_BOOKING_HREF } from './booking-attribution.ts';

export const LP_META_SHOPIFY_PATH = '/lp/agencia-shopify';

export function isLpMetaShopifyPath(pathname: string): boolean {
  const path = (pathname || '').split('?')[0].replace(/\/+$/, '') || '/';
  return path === LP_META_SHOPIFY_PATH;
}

/** Full current query onto /reunion-playful (utm_*, fbclid, gclid, mkt, ang, qa…). */
export function lpMetaBookingHrefFromSearch(search: string): string {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  const incoming = new URLSearchParams(raw);
  const kept = new URLSearchParams();
  incoming.forEach((value, key) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed) kept.set(key, trimmed);
  });
  const query = kept.toString();
  return query ? `${SERVICE_BOOKING_HREF}?${query}` : SERVICE_BOOKING_HREF;
}

export function lpMetaHrefWithSearch(href: string, search: string): string {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  const incoming = new URLSearchParams(raw);
  const kept = new URLSearchParams();
  incoming.forEach((value, key) => {
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (trimmed) kept.set(key, trimmed);
  });
  const query = kept.toString();
  if (!query) return href;
  return href.includes('?') ? `${href}&${query}` : `${href}?${query}`;
}
