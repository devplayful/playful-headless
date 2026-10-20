import { isQaTraffic } from './qa-traffic.ts';
import { sendGtagEvent } from './gtag-event.ts';

export const BOOKING_ABANDON_EVENT = 'booking_abandon';
export const BOOKING_INTENT_COOKIE = 'pa_booking_intent';
export const BOOKING_INTENT_STORAGE_KEY = 'pa_booking_intent';
export const BOOKING_ABANDON_STORAGE_PREFIX = 'playful:ga4:booking_abandon:';
/** 30 minutes — PR #315. Not a 7-day attribution cookie. */
export const BOOKING_INTENT_MAX_AGE_SECONDS = 1800;
/** Skip the outbound /reunion-playful 302 so we do not fire on the way to GHL. */
export const BOOKING_ABANDON_MIN_AGE_MS = 20_000;
export const BOOKING_INTENT_COOKIE_DOMAIN = 'playfulagency.com';

export type BookingIntent = {
  ts: number;
  page_path: string;
  link_url: string;
  cta_section: string;
};

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type CookieIo = {
  readAll: () => string;
  writeLine: (line: string) => void;
};

const sentInMemory = new Set<string>();

function defaultCookieIo(): CookieIo | null {
  if (typeof document === 'undefined') return null;
  return {
    readAll: () => document.cookie,
    writeLine: (line) => {
      document.cookie = line;
    },
  };
}

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function defaultHostname(): string {
  if (typeof window === 'undefined') return '';
  return window.location?.hostname || '';
}

export function bookingIntentCookieDomain(hostname: string): string | null {
  const host = hostname.trim().toLowerCase().replace(/^\.+|\.+$/g, '');
  if (!host) return null;
  if (host === BOOKING_INTENT_COOKIE_DOMAIN || host.endsWith(`.${BOOKING_INTENT_COOKIE_DOMAIN}`)) {
    return BOOKING_INTENT_COOKIE_DOMAIN;
  }
  return null;
}

export function isGraciasPath(pathname: string): boolean {
  const path = (pathname || '/').replace(/\/+$/, '') || '/';
  return path === '/gracias';
}

export function bookingAbandonDedupeKey(ts: number): string {
  return `${BOOKING_ABANDON_STORAGE_PREFIX}${ts}`;
}

export function serializeBookingIntent(intent: BookingIntent): string {
  return JSON.stringify({
    ts: intent.ts,
    page_path: intent.page_path,
    link_url: intent.link_url,
    cta_section: intent.cta_section,
  });
}

function intentFromUnknown(parsed: unknown): BookingIntent | null {
  if (!parsed || typeof parsed !== 'object') return null;
  const value = parsed as Partial<BookingIntent>;
  if (!Number.isFinite(value.ts)) return null;
  return {
    ts: Number(value.ts),
    page_path: typeof value.page_path === 'string' ? value.page_path : '',
    link_url: typeof value.link_url === 'string' ? value.link_url : '',
    cta_section: typeof value.cta_section === 'string' ? value.cta_section : '',
  };
}

export function parseBookingIntent(raw: string | null | undefined): BookingIntent | null {
  if (!raw) return null;
  try {
    return intentFromUnknown(JSON.parse(raw));
  } catch {
    try {
      return intentFromUnknown(JSON.parse(decodeURIComponent(raw)));
    } catch {
      return null;
    }
  }
}

export function bookingIntentCookieLine(
  intent: BookingIntent | null,
  hostname = '',
): string {
  const domain = bookingIntentCookieDomain(hostname);
  const domainPart = domain ? `; Domain=${domain}` : '';
  const attrs = `; Path=/; Max-Age=${intent ? BOOKING_INTENT_MAX_AGE_SECONDS : 0}; SameSite=Lax; Secure${domainPart}`;
  if (!intent) return `${BOOKING_INTENT_COOKIE}=${attrs}`;
  return `${BOOKING_INTENT_COOKIE}=${encodeURIComponent(serializeBookingIntent(intent))}${attrs}`;
}

function readCookieValue(cookieIo: CookieIo | null, name: string): string | null {
  if (!cookieIo) return null;
  const prefix = `${name}=`;
  const match = cookieIo.readAll().split('; ').find((part) => part.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

function readStorageIntent(storage: StorageLike | null): BookingIntent | null {
  if (!storage) return null;
  try {
    return parseBookingIntent(storage.getItem(BOOKING_INTENT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStorageIntent(storage: StorageLike | null, intent: BookingIntent | null): void {
  if (!storage) return;
  try {
    if (!intent) {
      storage.removeItem(BOOKING_INTENT_STORAGE_KEY);
      return;
    }
    storage.setItem(BOOKING_INTENT_STORAGE_KEY, serializeBookingIntent(intent));
  } catch {
    // sessionStorage is a duplicate of the cookie; failure must not block the CTA.
  }
}

function readSentFlag(key: string, storage: StorageLike | null): boolean {
  if (sentInMemory.has(key)) return true;
  if (!storage) return false;
  try {
    return storage.getItem(key) === '1';
  } catch {
    return sentInMemory.has(key);
  }
}

function writeSentFlag(key: string, storage: StorageLike | null): void {
  sentInMemory.add(key);
  if (!storage) return;
  try {
    storage.setItem(key, '1');
  } catch {
    // In-memory flag still holds for this page.
  }
}

export function readBookingIntent(input?: {
  cookieIo?: CookieIo | null;
  storage?: StorageLike | null;
}): BookingIntent | null {
  const cookieIo = input?.cookieIo === undefined ? defaultCookieIo() : input.cookieIo;
  const storage = input?.storage === undefined ? defaultStorage() : input.storage;
  return parseBookingIntent(readCookieValue(cookieIo, BOOKING_INTENT_COOKIE))
    || readStorageIntent(storage);
}

export function clearBookingIntent(input?: {
  cookieIo?: CookieIo | null;
  storage?: StorageLike | null;
  hostname?: string;
}): void {
  const cookieIo = input?.cookieIo === undefined ? defaultCookieIo() : input.cookieIo;
  const storage = input?.storage === undefined ? defaultStorage() : input.storage;
  const hostname = input?.hostname === undefined ? defaultHostname() : input.hostname;
  cookieIo?.writeLine(bookingIntentCookieLine(null, hostname));
  writeStorageIntent(storage, null);
}

export function markBookingIntent(
  intent: BookingIntent,
  input?: {
    cookieIo?: CookieIo | null;
    storage?: StorageLike | null;
    hostname?: string;
    search?: string;
    userAgent?: string;
  },
): boolean {
  if (isQaTraffic({ search: input?.search, userAgent: input?.userAgent })) {
    return false;
  }
  const cookieIo = input?.cookieIo === undefined ? defaultCookieIo() : input.cookieIo;
  const storage = input?.storage === undefined ? defaultStorage() : input.storage;
  const hostname = input?.hostname === undefined ? defaultHostname() : input.hostname;
  cookieIo?.writeLine(bookingIntentCookieLine(intent, hostname));
  writeStorageIntent(storage, intent);
  return true;
}

function canSendBookingAbandon(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.gtag === 'function') return true;
  return Boolean(window.dataLayer && typeof window.dataLayer.push === 'function');
}

export type BookingAbandonFireResult =
  | 'sent'
  | 'missing'
  | 'qa'
  | 'gracias'
  | 'too_soon'
  | 'already_sent'
  | 'no_transport';

/**
 * On a later apex page view: if intent exists, the visitor is not on /gracias,
 * and the click is older than 20s, fire booking_abandon once and clear.
 * QA traffic is a no-op (cookie stays). Not a conversion.
 */
export function maybeFireBookingAbandon(input?: {
  pathname?: string;
  search?: string;
  userAgent?: string;
  now?: number;
  cookieIo?: CookieIo | null;
  storage?: StorageLike | null;
  hostname?: string;
}): BookingAbandonFireResult {
  const cookieIo = input?.cookieIo === undefined ? defaultCookieIo() : input.cookieIo;
  const storage = input?.storage === undefined ? defaultStorage() : input.storage;
  const hostname = input?.hostname === undefined ? defaultHostname() : input.hostname;
  const pathname = input?.pathname
    ?? (typeof window === 'undefined' ? '/' : window.location?.pathname || '/');
  const search = input?.search
    ?? (typeof window === 'undefined' ? '' : window.location?.search || '');
  const now = input?.now ?? Date.now();

  const intent = readBookingIntent({ cookieIo, storage });
  if (!intent) return 'missing';

  if (isQaTraffic({ search, userAgent: input?.userAgent })) return 'qa';

  if (isGraciasPath(pathname)) {
    clearBookingIntent({ cookieIo, storage, hostname });
    return 'gracias';
  }

  const dedupeKey = bookingAbandonDedupeKey(intent.ts);
  if (readSentFlag(dedupeKey, storage)) {
    clearBookingIntent({ cookieIo, storage, hostname });
    return 'already_sent';
  }

  if (now - intent.ts < BOOKING_ABANDON_MIN_AGE_MS) return 'too_soon';

  if (!canSendBookingAbandon()) return 'no_transport';

  sendGtagEvent(
    BOOKING_ABANDON_EVENT,
    {
      page_path: intent.page_path || 'unknown',
      link_url: intent.link_url,
      cta_section: intent.cta_section,
      seconds_since_click: Math.max(0, Math.round((now - intent.ts) / 1000)),
      transport_type: 'beacon',
    },
  );
  writeSentFlag(dedupeKey, storage);
  clearBookingIntent({ cookieIo, storage, hostname });
  return 'sent';
}

export function resetBookingAbandonForTests(): void {
  sentInMemory.clear();
}
