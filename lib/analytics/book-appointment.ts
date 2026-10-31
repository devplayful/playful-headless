declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const BOOK_APPOINTMENT_EVENT = 'book_appointment';
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

function getDataLayer(): { push: (...items: Array<Record<string, unknown>>) => unknown } | undefined {
  if (typeof window === 'undefined') return undefined;
  const dataLayer = window.dataLayer;
  if (!dataLayer || typeof dataLayer.push !== 'function') return undefined;
  return dataLayer;
}

function defaultStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Queues book_appointment on the existing dataLayer. Does not call gtag or
 * change how gtag.js loads. Once per booking: pa_booking_id when present,
 * otherwise once per session for /gracias?conv=Schedule.
 */
export function pushBookAppointmentOnce(input: {
  search: string;
  storage?: StorageLike | null;
}): boolean {
  if (!shouldTrackBookAppointment(input.search)) return false;
  const key = storageKey(bookAppointmentDedupeKey(input.search));
  const storage = input.storage === undefined ? defaultStorage() : input.storage;
  if (readStorageFlag(key, storage)) return false;
  const dataLayer = getDataLayer();
  if (!dataLayer) return false;
  dataLayer.push({ event: BOOK_APPOINTMENT_EVENT });
  writeStorageFlag(key, storage);
  return true;
}

export function resetBookAppointmentForTests(): void {
  sentInMemory.clear();
}
