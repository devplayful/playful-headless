import { deserializeAttributionCookie } from '../lib/contact/attribution.ts';
import {
  firstNonEmptyBookingValue,
  mergeIncomingQueryOntoWidget,
  trimBookingValue,
} from './booking-attribution.ts';

/** Session keys the calendar iframe can consume from the parent visit. */
export const BOOKING_IFRAME_ATTR_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

export type BookingIframeAttrKey = (typeof BOOKING_IFRAME_ATTR_KEYS)[number];
export type BookingIframeAttrValues = Partial<Record<BookingIframeAttrKey, string>>;

export const BOOKING_IFRAME_ATTR_STORAGE_KEY = 'playful:booking-iframe-attr:v1';

const ATTR_MAX_LENGTH: Record<BookingIframeAttrKey, number> = {
  utm_source: 160,
  utm_medium: 160,
  utm_campaign: 160,
  utm_content: 160,
  utm_term: 160,
  fbclid: 200,
  gclid: 200,
};

const BOOKING_IFRAME_HOSTS = new Set([
  'api.playfulagency.com',
  'leadconnectorhq.com',
  'msgsndr.com',
  'gohighlevel.com',
]);

const BOOKING_MESSAGE_HOSTS = new Set([
  'api.playfulagency.com',
  'leadconnectorhq.com',
  'msgsndr.com',
  'gohighlevel.com',
]);

function hostAllowed(hostname: string, roots: Set<string>): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  if (roots.has(host)) return true;
  return Array.from(roots).some((root) => host.endsWith(`.${root}`));
}

function clampAttrValue(key: BookingIframeAttrKey, value: unknown): string {
  return trimBookingValue(value).slice(0, ATTR_MAX_LENGTH[key]);
}

function searchFromInput(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

export function bookingIframeAttrFromSearch(search: string): BookingIframeAttrValues {
  const params = searchFromInput(search);
  const out: BookingIframeAttrValues = {};
  BOOKING_IFRAME_ATTR_KEYS.forEach((key) => {
    const value = clampAttrValue(key, params.get(key));
    if (value) out[key] = value;
  });
  return out;
}

export function bookingIframeAttrFromRecord(
  record: Record<string, unknown> | null | undefined,
): BookingIframeAttrValues {
  if (!record || typeof record !== 'object') return {};
  const out: BookingIframeAttrValues = {};
  BOOKING_IFRAME_ATTR_KEYS.forEach((key) => {
    const value = clampAttrValue(key, record[key]);
    if (value) out[key] = value;
  });
  return out;
}

export function mergeBookingIframeAttr(
  preferred: BookingIframeAttrValues,
  fallback: BookingIframeAttrValues,
): BookingIframeAttrValues {
  const out: BookingIframeAttrValues = {};
  BOOKING_IFRAME_ATTR_KEYS.forEach((key) => {
    const value = firstNonEmptyBookingValue(preferred[key], fallback[key]);
    if (value) out[key] = clampAttrValue(key, value);
  });
  return out;
}

export function serializeBookingIframeAttr(values: BookingIframeAttrValues): string {
  return JSON.stringify(bookingIframeAttrFromRecord(values));
}

export function deserializeBookingIframeAttr(raw: string | null | undefined): BookingIframeAttrValues {
  if (!raw || !raw.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return bookingIframeAttrFromRecord(parsed as Record<string, unknown>);
  } catch {
    return {};
  }
}

function clickIdFromLanding(landing: string | undefined | null, key: BookingIframeAttrKey): string {
  if (!landing) return '';
  try {
    const search = /^https?:\/\//i.test(landing)
      ? new URL(landing).search
      : landing.includes('?')
        ? landing.slice(landing.indexOf('?'))
        : '';
    return clampAttrValue(key, searchFromInput(search).get(key));
  } catch {
    return '';
  }
}

export function bookingIframeAttrFromAttributionCookie(
  cookie: string | null | undefined,
): BookingIframeAttrValues {
  const touch = deserializeAttributionCookie(cookie);
  if (!touch) return {};
  return mergeBookingIframeAttr(
    bookingIframeAttrFromRecord({
      utm_source: touch.utm_source,
      utm_medium: touch.utm_medium,
      utm_campaign: touch.utm_campaign,
      utm_content: touch.utm_content,
      utm_term: touch.utm_term,
      fbclid: touch.fbclid,
      gclid: touch.gclid,
    }),
    {
      fbclid: clickIdFromLanding(touch.landing, 'fbclid'),
      gclid: clickIdFromLanding(touch.landing, 'gclid'),
    },
  );
}

/** URL, then stored visit, then last-touch cookie, then first-touch cookie. */
export function resolveBookingIframeAttr(input: {
  search?: string;
  stored?: string | null;
  lastCookie?: string | null;
  firstCookie?: string | null;
}): BookingIframeAttrValues {
  return mergeBookingIframeAttr(
    bookingIframeAttrFromSearch(input.search || ''),
    mergeBookingIframeAttr(
      deserializeBookingIframeAttr(input.stored),
      mergeBookingIframeAttr(
        bookingIframeAttrFromAttributionCookie(input.lastCookie),
        bookingIframeAttrFromAttributionCookie(input.firstCookie),
      ),
    ),
  );
}

export function searchFromBookingIframeAttr(values: BookingIframeAttrValues): string {
  const params = new URLSearchParams();
  BOOKING_IFRAME_ATTR_KEYS.forEach((key) => {
    const value = clampAttrValue(key, values[key]);
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

function parseSrc(src: string): URL | null {
  const trimmed = src.trim();
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

/** Widget/calendar booking iframes only. Chat loader and GTM stay untouched. */
export function isBookingWidgetIframeSrc(src: string): boolean {
  const url = parseSrc(src);
  if (!url) return false;
  if (url.protocol !== 'https:') return false;
  if (!hostAllowed(url.hostname, BOOKING_IFRAME_HOSTS)) return false;
  return /\/widget\/bookings?\//i.test(url.pathname);
}

export function applyBookingIframeAttrToSrc(
  src: string,
  values: BookingIframeAttrValues,
): string {
  if (!isBookingWidgetIframeSrc(src)) return src;
  const query = searchFromBookingIframeAttr(values);
  if (!query) return src;
  return mergeIncomingQueryOntoWidget(src, query).toString();
}

export function isAllowedBookingMessageOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:') return false;
    return hostAllowed(url.hostname, BOOKING_MESSAGE_HOSTS);
  } catch {
    return false;
  }
}

export type BookingWidgetFetchQueryMessage = {
  type: 'fetch-query-params';
  iframeName: string;
  locationId: string;
};

export type BookingWidgetCompleteMessage = {
  type: 'msgsndr-booking-complete';
  fingerprint: string;
  calendarId: string;
  email: string;
  contactId: string;
};

export type BookingWidgetParsedMessage =
  | BookingWidgetFetchQueryMessage
  | BookingWidgetCompleteMessage;

/**
 * Shapes taken from GHL calendar JS (stcdn CK8TxMlH / CeAWCpaa):
 * ["fetch-query-params", window.name, location_id]
 * ["msgsndr-booking-complete", { fingerprint, calendarId }]
 */
export function parseBookingWidgetMessage(data: unknown): BookingWidgetParsedMessage | null {
  if (!Array.isArray(data) || typeof data[0] !== 'string') return null;
  if (data[0] === 'fetch-query-params') {
    return {
      type: 'fetch-query-params',
      iframeName: typeof data[1] === 'string' ? data[1] : '',
      locationId: typeof data[2] === 'string' ? data[2] : '',
    };
  }
  if (data[0] === 'msgsndr-booking-complete') {
    const payload = data[1] && typeof data[1] === 'object' && !Array.isArray(data[1])
      ? data[1] as Record<string, unknown>
      : {};
    return {
      type: 'msgsndr-booking-complete',
      fingerprint: trimBookingValue(payload.fingerprint),
      calendarId: trimBookingValue(payload.calendarId),
      email: trimBookingValue(payload.email),
      contactId: trimBookingValue(
        firstNonEmptyBookingValue(payload.contactId, payload.contact_id),
      ),
    };
  }
  return null;
}

export function bookingCompleteHasContactIdentity(
  message: BookingWidgetCompleteMessage,
): boolean {
  return Boolean(message.email || message.contactId);
}

/** Reply the calendar listens for: [0]=query-params, [1]=urlParams, [2]=url, [3]=referrer. */
export function bookingQueryParamsReply(
  values: BookingIframeAttrValues,
  pageUrl: string,
  referrer: string,
): [string, Record<string, string>, string, string] {
  const urlParams: Record<string, string> = {};
  BOOKING_IFRAME_ATTR_KEYS.forEach((key) => {
    const value = clampAttrValue(key, values[key]);
    if (value) urlParams[key] = value;
  });
  return ['query-params', urlParams, pageUrl, referrer];
}

export function handleBookingWidgetMessage(input: {
  origin: string;
  data: unknown;
  pageUrl: string;
  referrer: string;
  values: BookingIframeAttrValues;
}):
  | { kind: 'query-params'; reply: ReturnType<typeof bookingQueryParamsReply>; targetOrigin: string }
  | { kind: 'booking-complete'; message: BookingWidgetCompleteMessage }
  | null {
  if (!isAllowedBookingMessageOrigin(input.origin)) return null;
  const parsed = parseBookingWidgetMessage(input.data);
  if (!parsed) return null;
  if (parsed.type === 'fetch-query-params') {
    return {
      kind: 'query-params',
      reply: bookingQueryParamsReply(input.values, input.pageUrl, input.referrer),
      targetOrigin: input.origin,
    };
  }
  return { kind: 'booking-complete', message: parsed };
}
