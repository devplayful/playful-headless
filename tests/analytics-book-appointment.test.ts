import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  BOOK_APPOINTMENT_EVENT,
  BOOK_APPOINTMENT_STORAGE_PREFIX,
  bookAppointmentDedupeKey,
  pushBookAppointmentOnce,
  resetBookAppointmentForTests,
  shouldTrackBookAppointment,
} from '../lib/analytics/book-appointment.ts';
import { resetTrafficTypeForTests } from '../lib/analytics/traffic-type.ts';

function withWindow(value: unknown, run: () => void) {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value,
  });
  try {
    run();
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
}

function memoryStorage() {
  const records = new Map<string, string>();
  return {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => { records.set(key, value); },
    records,
  };
}

test('only Schedule conversions are booking events', () => {
  assert.equal(shouldTrackBookAppointment('?conv=Schedule'), true);
  assert.equal(shouldTrackBookAppointment('conv=Schedule&timezone=Europe/Madrid'), true);
  assert.equal(shouldTrackBookAppointment('?conv=Lead'), false);
  assert.equal(shouldTrackBookAppointment(''), false);
});

test('dedupes by pa_booking_id when present, otherwise once per session', () => {
  assert.equal(bookAppointmentDedupeKey('?conv=Schedule&pa_booking_id=abc-1'), 'abc-1');
  assert.equal(bookAppointmentDedupeKey('?conv=Schedule', 'pa_booking_id=from-cookie'), 'from-cookie');
  assert.equal(bookAppointmentDedupeKey('?conv=Schedule'), 'gracias:conv=Schedule');
});

test('pushes book_appointment through dataLayer once per booking', () => {
  resetBookAppointmentForTests();
  resetTrafficTypeForTests();
  const storage = memoryStorage();
  withWindow({ dataLayer: [] }, () => {
    assert.equal(pushBookAppointmentOnce({ search: '?conv=Schedule', storage }), true);
    assert.equal(pushBookAppointmentOnce({ search: '?conv=Schedule', storage }), false);
    assert.equal(window.dataLayer?.[0]?.event, BOOK_APPOINTMENT_EVENT);
    assert.equal(window.dataLayer?.length, 1);
    assert.equal(storage.records.get(`${BOOK_APPOINTMENT_STORAGE_PREFIX}gracias:conv=Schedule`), '1');
  });
});

test('treats a new pa_booking_id as a distinct reservation', () => {
  resetBookAppointmentForTests();
  resetTrafficTypeForTests();
  const storage = memoryStorage();
  withWindow({ dataLayer: [] }, () => {
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule&pa_booking_id=first',
      storage,
    }), true);
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule&pa_booking_id=first',
      storage,
    }), false);
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule&pa_booking_id=second',
      storage,
    }), true);
    assert.equal(window.dataLayer?.length, 2);
    assert.equal(window.dataLayer?.[0]?.event, BOOK_APPOINTMENT_EVENT);
    assert.equal(window.dataLayer?.[0]?.booking_id, 'first');
    assert.equal(window.dataLayer?.[1]?.booking_id, 'second');
  });
});

test('does not call gtag and does not fire for Lead', () => {
  resetBookAppointmentForTests();
  resetTrafficTypeForTests();
  const storage = memoryStorage();
  const gtagCalls: unknown[] = [];
  withWindow({
    dataLayer: [],
    gtag: (...args: unknown[]) => { gtagCalls.push(args); },
  }, () => {
    assert.equal(pushBookAppointmentOnce({ search: '?conv=Lead', storage }), false);
    assert.equal(pushBookAppointmentOnce({ search: '?conv=Schedule', storage }), true);
    assert.equal(gtagCalls.length, 0);
    assert.equal(window.dataLayer?.length, 1);
    assert.equal(window.dataLayer?.[0]?.event, BOOK_APPOINTMENT_EVENT);
    assert.ok(!window.dataLayer?.some((row) => row.event === 'generate_lead'));
  });
});

test('thank-you page mounts the tracker without changing gtag loading', () => {
  const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.match(page, /BookAppointmentTracker/);
  assert.match(page, /href="\/reunion-playful"/);
  assert.doesNotMatch(page, /gtag\(/);
  assert.match(ga, /strategy="afterInteractive"/);
  assert.match(ga, /gtag\/js\?id=/);
  assert.match(layout, /GoogleAnalytics/);
  assert.doesNotMatch(layout, /BookAppointmentTracker/);
});
