import {
  resolveTrafficFlags,
  shouldSuppressConversion,
  type TrafficInput,
} from './traffic-type.ts';

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const BOOK_APPOINTMENT_EVENT = 'book_appointment';
export const BOOK_APPOINTMENT_STORAGE_PREFIX = 'playful:ga4:book_appointment:';
export const BOOKING_ID_COOKIE = 'pa_booking_id';
export const BOOK_APPOINTMENT_SESSION_KEY = 'gracias:conv=Schedule';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const sentInMemory = new Set<string>();

function searchParams(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

export function shouldTrackBookAppointment(search: string): boolean {
  return searchParams(search).get('conv') === 'Schedule';
}

export function readCookieValue(cookie: string | undefined, name: string): string {
  if (!cookie) return '';
  const prefix = `${name}=`;
  for (const part of cookie.split(';')) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length).trim());
    }
  }
  return '';
}

/** Query pa_booking_id wins, then the pa_booking_id cookie. */
export function readBookingId(search: string, cookie?: string): string {
  const fromSearch = searchParams(search).get('pa_booking_id')?.trim();
  if (fromSearch) return fromSearch;
  return readCookieValue(cookie, BOOKING_ID_COOKIE).trim();
}

export function bookAppointmentDedupeKey(search: string, cookie?: string): string {
  const bookingId = readBookingId(search, cookie);
  if (bookingId) return bookingId;
  return BOOK_APPOINTMENT_SESSION_KEY;
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
 * change how gtag.js loads. Once per booking: pa_booking_id (query or cookie)
 * when present, otherwise once per session for /gracias?conv=Schedule.
 * QA and bot_suspect do not fire. Never emits generate_lead.
 */
export function pushBookAppointmentOnce(input: {
  search: string;
  cookie?: string;
  storage?: StorageLike | null;
} & TrafficInput): boolean {
  if (!shouldTrackBookAppointment(input.search)) return false;
  if (shouldSuppressConversion(BOOK_APPOINTMENT_EVENT, input)) return false;
  const bookingId = readBookingId(input.search, input.cookie);
  const key = storageKey(bookAppointmentDedupeKey(input.search, input.cookie));
  const storage = input.storage === undefined ? defaultStorage() : input.storage;
  if (readStorageFlag(key, storage)) return false;
  const dataLayer = getDataLayer();
  if (!dataLayer) return false;
  const flags = resolveTrafficFlags(input);
  dataLayer.push({
    event: BOOK_APPOINTMENT_EVENT,
    ...(bookingId ? { booking_id: bookingId } : {}),
    traffic_type: flags.traffic_type,
    bot_suspect: flags.bot_suspect,
  });
  writeStorageFlag(key, storage);
  return true;
}

export function resetBookAppointmentForTests(): void {
  sentInMemory.clear();
}
