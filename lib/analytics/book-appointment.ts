import { isQaTraffic } from './qa-traffic.ts';

export const BOOK_APPOINTMENT_EVENT = 'book_appointment';
export const BOOK_APPOINTMENT_GA4_SEND_TO = 'G-WH76RQWSCT';
export const BOOK_APPOINTMENT_STORAGE_PREFIX = 'playful:ga4:book_appointment:';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const sentInMemory = new Set<string>();

/**
 * GHL thank-you redirects sometimes append `?conv=Schedule` to a URL that
 * already carries conv, yielding `?conv=Schedule?conv=Schedule`. URLSearchParams
 * then reads conv as `Schedule?conv=Schedule`, which breaks strict checks.
 */
function normalizeSearchRaw(search: string): string {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return raw.replace(/\?(?=conv=)/gi, '&');
}

function searchParams(search: string): URLSearchParams {
  return new URLSearchParams(normalizeSearchRaw(search));
}

export function readConvParam(search: string): string | null {
  const value = searchParams(search).get('conv');
  if (!value) return null;
  const primary = value.split('?')[0]?.split('&')[0]?.trim() ?? '';
  return primary || null;
}

export function shouldTrackBookAppointment(search: string): boolean {
  return readConvParam(search) === 'Schedule';
}

/** Collapses duplicate/malformed conv into a single query param for the address bar. */
export function normalizeThankYouSearch(search: string): string {
  const conv = readConvParam(search);
  if (!conv) return search;
  const params = searchParams(search);
  const clean = new URLSearchParams();
  params.forEach((v, key) => {
    if (key === 'conv') return;
    clean.append(key, v);
  });
  clean.set('conv', conv);
  const qs = clean.toString();
  return qs ? `?${qs}` : '';
}

export function bookAppointmentPageLocation(input: {
  pathname?: string;
  search: string;
}): string {
  const pathname = input.pathname || '/gracias';
  const normalized = normalizeThankYouSearch(input.search);
  const search = normalized || input.search;
  if (!search || search === '?') return pathname;
  return search.startsWith('?') ? `${pathname}${search}` : `${pathname}?${search}`;
}

export function bookAppointmentDedupeKey(search: string): string {
  const bookingId = searchParams(search).get('pa_booking_id')?.trim();
  if (bookingId) return bookingId;
  return 'gracias:conv=Schedule';
}

function storageKey(dedupeKey: string): string {
  return `${BOOK_APPOINTMENT_STORAGE_PREFIX}${dedupeKey}`;
}

function readStorageFlag(key: string, storage?: StorageLike | null): boolean {
  if (storage) {
    try {
      return storage.getItem(key) === '1';
    } catch {
      return sentInMemory.has(key);
    }
  }
  return sentInMemory.has(key);
}

function writeStorageFlag(key: string, storage?: StorageLike | null): void {
  if (storage) {
    try {
      storage.setItem(key, '1');
      return;
    } catch {
      sentInMemory.add(key);
      return;
    }
  }
  sentInMemory.add(key);
}

/** Synchronous claim so React StrictMode / double effects only emit once. */
function claimBookAppointmentSend(key: string, storage?: StorageLike | null): boolean {
  if (sentInMemory.has(key)) return false;
  if (readStorageFlag(key, storage)) {
    sentInMemory.add(key);
    return false;
  }
  sentInMemory.add(key);
  writeStorageFlag(key, storage);
  return true;
}

/** Same inline stub as app/layout.tsx when production omits the head script (preview). */
export function ensureGtagStub(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') return;
  window.gtag = function gtag(...args: unknown[]) {
    const layer = window.dataLayer as unknown[] | undefined;
    if (!layer) return;
    // gtag.js replays queued `arguments` objects from the layout stub.
    layer.push(args);
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

export function bookAppointmentGtagParams(input: {
  pathname?: string;
  search: string;
}): Record<string, string> {
  return {
    send_to: BOOK_APPOINTMENT_GA4_SEND_TO,
    page_location: bookAppointmentPageLocation(input),
  };
}

/**
 * Sends book_appointment via gtag (GA4 direct, not GTM). Once per booking:
 * pa_booking_id when present, otherwise once per session for conv=Schedule.
 * Installs the gtag queue stub if layout did not (Vercel preview builds).
 */
export function pushBookAppointmentOnce(input: {
  search: string;
  pathname?: string;
  storage?: StorageLike | null;
}): boolean {
  if (typeof window === 'undefined') return false;
  if (isQaTraffic()) return false;
  if (!shouldTrackBookAppointment(input.search)) return false;

  const key = storageKey(bookAppointmentDedupeKey(input.search));
  const storage = input.storage === undefined ? defaultStorage() : input.storage;
  if (!claimBookAppointmentSend(key, storage)) return false;

  ensureGtagStub();
  window.gtag!(
    'event',
    BOOK_APPOINTMENT_EVENT,
    bookAppointmentGtagParams({
      pathname: input.pathname,
      search: input.search,
    }),
  );
  return true;
}

export function resetBookAppointmentForTests(): void {
  sentInMemory.clear();
}
