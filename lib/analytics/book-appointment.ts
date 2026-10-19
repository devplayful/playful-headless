declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export const BOOK_APPOINTMENT_EVENT = 'book_appointment';
export const BOOK_APPOINTMENT_STORAGE_PREFIX = 'playful:ga4:book_appointment:';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

const sentInMemory = new Set<string>();

function searchParams(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

export function shouldTrackBookAppointment(search: string): boolean {
  return searchParams(search).get('conv') === 'Schedule';
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
