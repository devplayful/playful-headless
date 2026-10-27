import { shouldTrackBookAppointment } from './book-appointment.ts';
import { isQaTraffic } from './qa-traffic.ts';

/**
 * Google Ads conversion «Reunión agendada».
 *
 * Verified 2026-10-27 from the published container
 * https://www.googletagmanager.com/gtm.js?id=GTM-MXHKJ4NW
 * The only `__awct` tag (tag_id 9) is:
 * - vtp_conversionId: 427600160
 * - vtp_conversionLabel: xpozCJHPv_EcEKDS8ssB
 * - vtp_orderId: JS macro that reads cookie `pa_booking_id` with
 *   /[a-f0-9]{32}/ and returns `ghl-` + that value
 * - user_data: JS macro that reads cookie `pa_booking_ec` on
 *   playfulagency.com/gracias?conv=Schedule
 * It fires on `gtm.js` when the path contains `/gracias`, the URL contains
 * `conv=Schedule`, and the order id contains `ghl-`.
 *
 * NEXT_PUBLIC_ADS_BOOKING_LABEL overrides the label. Anything else falls
 * back to the label above.
 */
export const ADS_CONVERSION_ID = 'AW-427600160';
export const ADS_BOOKING_LABEL_FALLBACK = 'xpozCJHPv_EcEKDS8ssB';
export const ADS_GTAG_SCRIPT_SRC =
  `https://www.googletagmanager.com/gtag/js?id=${ADS_CONVERSION_ID}`;

export const PA_BOOKING_ID_COOKIE = 'pa_booking_id';
export const PA_BOOKING_EC_COOKIE = 'pa_booking_ec';
export const PA_BOOKING_COOKIE_MAX_AGE_SECONDS = 1800;
export const PA_BOOKING_COOKIE_DOMAIN = 'playfulagency.com';

export const ADS_BOOKING_TX_STORAGE_KEY = 'playful:ads:booking-transaction-id';
export const ADS_BOOKING_SENT_PREFIX = 'playful:ads:booking-conversion:';

/** Short, non-blocking wait used only when gtag cannot be queued yet. */
export const ADS_BOOKING_GTAG_RETRY_MS = 50;
export const ADS_BOOKING_GTAG_WAIT_MS = 1_500;

const LABEL_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;
const BOOKING_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const GHL_BOOKING_ID_PATTERN = /^[a-f0-9]{32}$/;
const EC_UNSAFE_PATTERN = /[\u0000-\u001F\u007F;]/;
const EC_PRINTABLE_ASCII = /^[\u0020-\u007E]+$/;

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

export type BookingSignalCookie = {
  name: typeof PA_BOOKING_ID_COOKIE | typeof PA_BOOKING_EC_COOKIE;
  value: string;
};

export type AdsBookingFireStatus =
  | 'ignored'
  | 'qa'
  | 'duplicate'
  | 'sent'
  | 'queued'
  | 'waiting';

export type AdsBookingFireResult = {
  status: AdsBookingFireStatus;
  transactionId?: string;
  sendTo?: string;
};

const sentInMemory = new Set<string>();
let memoryTransactionId: string | null = null;

function searchParams(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

export function adsBookingConversionLabel(fromEnv?: string | null): string {
  const raw = (fromEnv ?? process.env.NEXT_PUBLIC_ADS_BOOKING_LABEL ?? '').trim();
  if (LABEL_PATTERN.test(raw)) return raw;
  return ADS_BOOKING_LABEL_FALLBACK;
}

export function adsBookingSendTo(label = adsBookingConversionLabel()): string {
  return `${ADS_CONVERSION_ID}/${label}`;
}

export function sanitizePaBookingId(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!BOOKING_ID_PATTERN.test(value)) return null;
  return value;
}

export function sanitizePaBookingEc(raw: string | null | undefined): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value || value.length > 1800) return null;
  if (EC_UNSAFE_PATTERN.test(value) || !EC_PRINTABLE_ASCII.test(value)) return null;
  return value;
}

export function paBookingCookieDomain(hostname: string): string | null {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (host === PA_BOOKING_COOKIE_DOMAIN || host === `www.${PA_BOOKING_COOKIE_DOMAIN}`) {
    return PA_BOOKING_COOKIE_DOMAIN;
  }
  return null;
}

export function paBookingCookieLine(name: string, value: string, hostname = ''): string {
  const domain = paBookingCookieDomain(hostname);
  const domainPart = domain ? `; Domain=${domain}` : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${PA_BOOKING_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax; Secure${domainPart}`;
}

export function bookingSignalsFromSearch(search: string): BookingSignalCookie[] {
  const params = searchParams(search);
  const signals: BookingSignalCookie[] = [];
  const id = sanitizePaBookingId(params.get(PA_BOOKING_ID_COOKIE));
  const ec = sanitizePaBookingEc(params.get(PA_BOOKING_EC_COOKIE));
  if (id) signals.push({ name: PA_BOOKING_ID_COOKIE, value: id });
  if (ec) signals.push({ name: PA_BOOKING_EC_COOKIE, value: ec });
  return signals;
}

export function persistPaBookingCookies(input: {
  search: string;
  hostname: string;
  writeLine?: (line: string) => void;
}): string[] {
  const write = input.writeLine
    ?? ((line: string) => {
      if (typeof document === 'undefined') return;
      document.cookie = line;
    });
  const lines = bookingSignalsFromSearch(input.search).map((signal) =>
    paBookingCookieLine(signal.name, signal.value, input.hostname));
  for (const line of lines) write(line);
  return lines;
}

/**
 * transaction_id shared with the GTM tag when the booking id is the 32-hex
 * value that tag reads. GTM's order-id macro stores `ghl-` + that cookie,
 * and Google Ads dedupes on the exact id. Any other safe id (including the
 * preview probe `test`) is sent as itself.
 */
export function adsBookingTransactionIdFromBookingId(bookingId: string): string {
  if (GHL_BOOKING_ID_PATTERN.test(bookingId)) return `ghl-${bookingId}`;
  return bookingId;
}

function createSessionTransactionId(): string {
  const uuid = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}${Math.random().toString(16).slice(2, 14)}`;
  return `sess-${uuid}`;
}

export function resolveAdsBookingTransactionId(
  search: string,
  storage?: StorageLike | null,
): string {
  const bookingId = sanitizePaBookingId(searchParams(search).get(PA_BOOKING_ID_COOKIE));
  if (bookingId) return adsBookingTransactionIdFromBookingId(bookingId);

  if (storage) {
    try {
      const existing = sanitizePaBookingId(storage.getItem(ADS_BOOKING_TX_STORAGE_KEY));
      if (existing) {
        memoryTransactionId = existing;
        return existing;
      }
    } catch {
      // sessionStorage can throw; fall through to the in-memory id.
    }
  }

  if (memoryTransactionId) return memoryTransactionId;

  const created = createSessionTransactionId();
  memoryTransactionId = created;
  if (storage) {
    try {
      storage.setItem(ADS_BOOKING_TX_STORAGE_KEY, created);
    } catch {
      // The in-memory id still keeps this document on one transaction_id.
    }
  }
  return created;
}

function sentKey(transactionId: string): string {
  return `${ADS_BOOKING_SENT_PREFIX}${transactionId}`;
}

function readSent(key: string, storage?: StorageLike | null): boolean {
  if (sentInMemory.has(key)) return true;
  if (!storage) return false;
  try {
    return storage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function writeSent(key: string, storage?: StorageLike | null): void {
  sentInMemory.add(key);
  if (!storage) return;
  try {
    storage.setItem(key, '1');
  } catch {
    // The in-memory flag still blocks a second hit in this document.
  }
}

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function installGtagStub(win: Window): void {
  const layer = (Array.isArray(win.dataLayer) ? win.dataLayer : []) as unknown[];
  win.dataLayer = layer as Window['dataLayer'];
  if (typeof win.gtag === 'function') return;
  win.gtag = function gtag() {
    layer.push(arguments);
  };
}

function documentHasGtagScript(doc: Document): boolean {
  return Boolean(doc.querySelector('script[src*="googletagmanager.com/gtag/js"]'));
}

export function ensureAdsGtagScript(doc: Document = document): boolean {
  if (documentHasGtagScript(doc)) return false;
  const script = doc.createElement('script');
  script.async = true;
  script.src = ADS_GTAG_SCRIPT_SRC;
  script.id = 'playful-ads-booking-gtag';
  (doc.head || doc.documentElement).appendChild(script);
  return true;
}

export function fireAdsBookingConversion(input: {
  search?: string;
  storage?: StorageLike | null;
  userAgent?: string;
  gtag?: (...args: unknown[]) => void;
  loadScript?: () => void;
  window?: Window | null;
} = {}): AdsBookingFireResult {
  const search = input.search
    ?? (typeof window === 'undefined' ? '' : window.location?.search || '');
  if (!shouldTrackBookAppointment(search)) return { status: 'ignored' };
  if (isQaTraffic({ search, userAgent: input.userAgent })) return { status: 'qa' };

  const storage = input.storage === undefined ? defaultStorage() : input.storage;
  const transactionId = resolveAdsBookingTransactionId(search, storage);
  const key = sentKey(transactionId);
  const sendTo = adsBookingSendTo();
  if (readSent(key, storage)) {
    return { status: 'duplicate', transactionId, sendTo };
  }

  const payload = { send_to: sendTo, transaction_id: transactionId };
  if (typeof input.gtag === 'function') {
    input.gtag('event', 'conversion', payload);
    writeSent(key, storage);
    return { status: 'sent', transactionId, sendTo };
  }

  const win = input.window === undefined
    ? (typeof window === 'undefined' ? null : window)
    : input.window;
  if (!win) return { status: 'waiting', transactionId, sendTo };

  const hadGtag = typeof win.gtag === 'function';
  installGtagStub(win);
  if (!hadGtag) {
    win.gtag!('js', new Date());
    win.gtag!('config', ADS_CONVERSION_ID, { send_page_view: false });
  }
  win.gtag!('event', 'conversion', payload);
  if (!hadGtag) {
    if (input.loadScript) input.loadScript();
    else if (typeof win.document !== 'undefined') ensureAdsGtagScript(win.document);
  }
  writeSent(key, storage);
  return { status: hadGtag ? 'sent' : 'queued', transactionId, sendTo };
}

export function scheduleAdsBookingConversion(input?: {
  retryMs?: number;
  maxWaitMs?: number;
  now?: number;
  nowFn?: () => number;
  setTimeoutFn?: (handler: () => void, ms: number) => number;
  clearTimeoutFn?: (id: number) => void;
  fire?: () => AdsBookingFireResult;
}): () => void {
  const retryMs = input?.retryMs ?? ADS_BOOKING_GTAG_RETRY_MS;
  const maxWaitMs = input?.maxWaitMs ?? ADS_BOOKING_GTAG_WAIT_MS;
  const nowFn = input?.nowFn ?? Date.now;
  const started = input?.now ?? nowFn();
  const fire = input?.fire ?? (() => fireAdsBookingConversion());
  const setTimer = input?.setTimeoutFn
    ?? ((handler: () => void, ms: number) => window.setTimeout(handler, ms));
  const clearTimer = input?.clearTimeoutFn
    ?? ((id: number) => window.clearTimeout(id));

  let cancelled = false;
  let timer: number | undefined;

  const tick = () => {
    if (cancelled) return;
    const result = fire();
    if (result.status !== 'waiting') return;
    if (nowFn() - started >= maxWaitMs) return;
    timer = setTimer(tick, retryMs);
  };

  tick();
  return () => {
    cancelled = true;
    if (timer !== undefined) clearTimer(timer);
  };
}

export function resetAdsBookingConversionForTests(): void {
  sentInMemory.clear();
  memoryTransactionId = null;
}
