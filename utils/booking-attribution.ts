import type { ContactAttribution } from '../lib/contact/types.ts';
import { deserializeAttributionCookie } from '../lib/contact/attribution.ts';

/** GHL widget destination. Middleware hops here after filling the query. */
export const BOOKING_WIDGET_ORIGIN = 'https://api.playfulagency.com';
export const BOOKING_WIDGET_PATH = '/widget/bookings/reunion-playful';
export const BOOKING_WIDGET_HREF = `${BOOKING_WIDGET_ORIGIN}${BOOKING_WIDGET_PATH}`;

/** Same-origin hop that can read pa_attr_* before the 302 to the widget. */
export const SERVICE_BOOKING_HREF = '/reunion-playful';

export const BOOKING_QUERY_KEYS = [
  'gclid',
  'gbraid',
  'wbraid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type BookingQueryKey = (typeof BOOKING_QUERY_KEYS)[number];
export type BookingQueryValues = Partial<Record<BookingQueryKey, string>>;

const BOOKING_PATHS = new Set([
  SERVICE_BOOKING_HREF,
  BOOKING_WIDGET_PATH,
]);

const BOOKING_HOSTS = new Set([
  'api.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
]);

const ATTRIBUTION_FIELD_KEYS = [
  'gclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const satisfies readonly BookingQueryKey[];

export function trimBookingValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function firstNonEmptyBookingValue(...values: unknown[]): string {
  for (const value of values) {
    const trimmed = trimBookingValue(value);
    if (trimmed) return trimmed;
  }
  return '';
}

function searchFromInput(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

export function bookingQueryFromSearch(search: string): BookingQueryValues {
  const params = searchFromInput(search);
  const out: BookingQueryValues = {};
  for (const key of BOOKING_QUERY_KEYS) {
    const value = firstNonEmptyBookingValue(params.get(key));
    if (value) out[key] = value;
  }
  return out;
}

export function bookingQueryFromLanding(landing: string | undefined | null): BookingQueryValues {
  if (!landing) return {};
  const raw = landing.trim();
  if (!raw) return {};
  try {
    if (/^https?:\/\//i.test(raw)) {
      return bookingQueryFromSearch(new URL(raw).search);
    }
  } catch {
    // Fall through and parse a relative landing path.
  }
  const q = raw.indexOf('?');
  if (q === -1) return {};
  return bookingQueryFromSearch(raw.slice(q));
}

export function bookingQueryFromAttributionTouch(
  touch: Pick<ContactAttribution, (typeof ATTRIBUTION_FIELD_KEYS)[number] | 'landing'> | null | undefined,
): BookingQueryValues {
  if (!touch) return {};
  const fromFields: BookingQueryValues = {};
  for (const key of ATTRIBUTION_FIELD_KEYS) {
    const value = firstNonEmptyBookingValue(touch[key]);
    if (value) fromFields[key] = value;
  }
  // Cookie JSON does not store gbraid/wbraid; recover them from landing if present.
  return mergeBookingQuery(fromFields, bookingQueryFromLanding(touch.landing));
}

export function mergeBookingQuery(
  preferred: BookingQueryValues,
  fallback: BookingQueryValues,
): BookingQueryValues {
  const out: BookingQueryValues = {};
  for (const key of BOOKING_QUERY_KEYS) {
    const value = firstNonEmptyBookingValue(preferred[key], fallback[key]);
    if (value) out[key] = value;
  }
  return out;
}

export function bookingQueryParamsFromValues(values: BookingQueryValues): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of BOOKING_QUERY_KEYS) {
    const value = firstNonEmptyBookingValue(values[key]);
    if (value) params.set(key, value);
  }
  return params;
}

export function searchFromBookingValues(values: BookingQueryValues): string {
  const query = bookingQueryParamsFromValues(values).toString();
  return query ? `?${query}` : '';
}

export function buildBookingQueryValues(input: {
  search?: string;
  lastCookie?: string | null;
  firstCookie?: string | null;
}): BookingQueryValues {
  const fromUrl = bookingQueryFromSearch(input.search || '');
  const last = deserializeAttributionCookie(input.lastCookie);
  const first = deserializeAttributionCookie(input.firstCookie);
  return mergeBookingQuery(
    fromUrl,
    mergeBookingQuery(
      bookingQueryFromAttributionTouch(last),
      bookingQueryFromAttributionTouch(first),
    ),
  );
}

export function buildBookingWidgetUrl(input: {
  search?: string;
  lastCookie?: string | null;
  firstCookie?: string | null;
}): string {
  const target = new URL(BOOKING_WIDGET_HREF);
  target.search = searchFromBookingValues(buildBookingQueryValues(input)).replace(/^\?/, '');
  return target.toString();
}

export function resolveBookingWidgetRedirect(input: {
  search?: string;
  lastCookie?: string | null;
  firstCookie?: string | null;
}): { location: string; status: 302 } {
  return {
    location: buildBookingWidgetUrl(input),
    status: 302,
  };
}

function parseHref(href: string): URL | null {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('mailto:') || trimmed.startsWith('tel:') || trimmed.startsWith('javascript:')) {
    return null;
  }
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    return absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');
  } catch {
    return null;
  }
}

export function isBookingHref(href: string): boolean {
  const url = parseHref(href);
  if (!url) return false;
  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (!BOOKING_PATHS.has(path)) return false;
  if (href.trim().startsWith('http') || href.trim().startsWith('//')) {
    return BOOKING_HOSTS.has(url.hostname.toLowerCase());
  }
  return true;
}

/** Visible href: same-origin /reunion-playful, only non-empty booking keys. */
export function toServiceBookingHref(href: string): string {
  if (!isBookingHref(href)) return href;
  const url = parseHref(href);
  const query = url ? searchFromBookingValues(bookingQueryFromSearch(url.search)) : '';
  const hash = url?.hash && url.hash !== '#' ? url.hash : '';
  return `${SERVICE_BOOKING_HREF}${query}${hash}`;
}

/** Client propagator: current page query only. No cookies, no invented values. */
export function bookingHrefFromPageSearch(search: string): string {
  return `${SERVICE_BOOKING_HREF}${searchFromBookingValues(bookingQueryFromSearch(search))}`;
}

export { deserializeAttributionCookie };
