import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  BOOKING_ABANDON_EVENT,
  BOOKING_ABANDON_MIN_AGE_MS,
  BOOKING_ABANDON_STORAGE_PREFIX,
  BOOKING_INTENT_COOKIE,
  BOOKING_INTENT_COOKIE_DOMAIN,
  BOOKING_INTENT_MAX_AGE_SECONDS,
  BOOKING_INTENT_STORAGE_KEY,
  bookingIntentCookieDomain,
  bookingIntentCookieLine,
  clearBookingIntent,
  markBookingIntent,
  maybeFireBookingAbandon,
  parseBookingIntent,
  readBookingIntent,
  resetBookingAbandonForTests,
  type BookingIntent,
  type CookieIo,
} from '../lib/analytics/booking-abandon.ts';
import { GTAG_EP_PAGE_PATH_KEY } from '../lib/analytics/gtag-event.ts';
import { PLAYFUL_QA_UA } from '../lib/analytics/qa-traffic.ts';

const SAMPLE: BookingIntent = {
  ts: 1_000_000,
  page_path: '/agencia-e-commerce',
  link_url: '/reunion-playful',
  cta_section: 'hero',
};

function memoryStorage() {
  const records = new Map<string, string>();
  return {
    getItem: (key: string) => records.get(key) ?? null,
    setItem: (key: string, value: string) => {
      records.set(key, value);
    },
    removeItem: (key: string) => {
      records.delete(key);
    },
    records,
  };
}

function memoryCookies(): CookieIo & { lines: string[]; jar: Map<string, string> } {
  const jar = new Map<string, string>();
  const lines: string[] = [];
  return {
    jar,
    lines,
    readAll: () =>
      Array.from(jar.entries())
        .map(([name, value]) => `${name}=${value}`)
        .join('; '),
    writeLine: (line: string) => {
      lines.push(line);
      const [pair] = line.split(';');
      const eq = pair.indexOf('=');
      const name = pair.slice(0, eq);
      const value = pair.slice(eq + 1);
      if (/Max-Age=0/i.test(line) || value === '') {
        jar.delete(name);
        return;
      }
      jar.set(name, value);
    },
  };
}

function withWindow(value: unknown, run: () => void) {
  const originalWindow = globalThis.window;
  const originalNav = globalThis.navigator;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value,
  });
  if (value && typeof value === 'object' && 'navigator' in value) {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: (value as { navigator: unknown }).navigator,
    });
  } else if (value && typeof value === 'object' && 'location' in value) {
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: { userAgent: 'Mozilla/5.0' },
    });
  }
  try {
    run();
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNav,
    });
  }
}

test('cookie is pa_booking_intent with Path=/ Max-Age=1800 SameSite=Lax Secure and apex Domain', () => {
  assert.equal(bookingIntentCookieDomain('playfulagency.com'), BOOKING_INTENT_COOKIE_DOMAIN);
  assert.equal(bookingIntentCookieDomain('www.playfulagency.com'), BOOKING_INTENT_COOKIE_DOMAIN);
  assert.equal(bookingIntentCookieDomain('preview.vercel.app'), null);
  const line = bookingIntentCookieLine(SAMPLE, 'www.playfulagency.com');
  assert.match(line, new RegExp(`^${BOOKING_INTENT_COOKIE}=`));
  assert.match(line, /Path=\//);
  assert.match(line, new RegExp(`Max-Age=${BOOKING_INTENT_MAX_AGE_SECONDS}`));
  assert.match(line, /SameSite=Lax/);
  assert.match(line, /Secure/);
  assert.match(line, /Domain=playfulagency.com/);
  const preview = bookingIntentCookieLine(SAMPLE, 'playful-headless.vercel.app');
  assert.doesNotMatch(preview, /Domain=/);
});

test('round-trips intent JSON from cookie and sessionStorage', () => {
  const cookies = memoryCookies();
  const storage = memoryStorage();
  assert.equal(markBookingIntent(SAMPLE, { cookieIo: cookies, storage, hostname: 'playfulagency.com' }), true);
  assert.deepEqual(readBookingIntent({ cookieIo: cookies, storage }), SAMPLE);
  assert.equal(storage.records.get(BOOKING_INTENT_STORAGE_KEY), JSON.stringify(SAMPLE));
  assert.equal(parseBookingIntent(cookies.jar.get(BOOKING_INTENT_COOKIE) ?? null)?.ts, SAMPLE.ts);
  clearBookingIntent({ cookieIo: cookies, storage, hostname: 'playfulagency.com' });
  assert.equal(readBookingIntent({ cookieIo: cookies, storage }), null);
  assert.equal(storage.records.has(BOOKING_INTENT_STORAGE_KEY), false);
});

test('maybeFireBookingAbandon sends once with origin params then clears', () => {
  resetBookingAbandonForTests();
  const cookies = memoryCookies();
  const storage = memoryStorage();
  const calls: unknown[][] = [];
  markBookingIntent(SAMPLE, { cookieIo: cookies, storage, hostname: 'localhost' });
  withWindow({
    location: { pathname: '/', search: '' },
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
    dataLayer: [],
    navigator: { userAgent: 'Mozilla/5.0' },
  }, () => {
    const tooSoon = maybeFireBookingAbandon({
      pathname: '/',
      search: '',
      now: SAMPLE.ts + BOOKING_ABANDON_MIN_AGE_MS - 1,
      cookieIo: cookies,
      storage,
      hostname: 'localhost',
    });
    assert.equal(tooSoon, 'too_soon');
    assert.equal(calls.length, 0);
    assert.ok(readBookingIntent({ cookieIo: cookies, storage }));

    const sent = maybeFireBookingAbandon({
      pathname: '/',
      search: '',
      now: SAMPLE.ts + 45_000,
      cookieIo: cookies,
      storage,
      hostname: 'localhost',
    });
    assert.equal(sent, 'sent');
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'event');
    assert.equal(calls[0][1], BOOKING_ABANDON_EVENT);
    const payload = calls[0][2] as Record<string, unknown>;
    assert.equal(payload.page_path, SAMPLE.page_path);
    assert.equal(payload[GTAG_EP_PAGE_PATH_KEY], SAMPLE.page_path);
    assert.equal(payload.link_url, SAMPLE.link_url);
    assert.equal(payload.cta_section, SAMPLE.cta_section);
    assert.equal(payload.seconds_since_click, 45);
    assert.equal(payload.transport_type, 'beacon');
    assert.equal(payload.send_to, undefined);
    assert.equal('conversion' in payload, false);
    assert.equal(readBookingIntent({ cookieIo: cookies, storage }), null);
    assert.equal(storage.records.get(`${BOOKING_ABANDON_STORAGE_PREFIX}${SAMPLE.ts}`), '1');

    markBookingIntent(SAMPLE, { cookieIo: cookies, storage, hostname: 'localhost' });
    const again = maybeFireBookingAbandon({
      pathname: '/',
      search: '',
      now: SAMPLE.ts + 90_000,
      cookieIo: cookies,
      storage,
      hostname: 'localhost',
    });
    assert.equal(again, 'already_sent');
    assert.equal(calls.length, 1);
  });
});

test('gracias clears intent without firing, including conv=Schedule', () => {
  resetBookingAbandonForTests();
  const cookies = memoryCookies();
  const storage = memoryStorage();
  const calls: unknown[][] = [];
  markBookingIntent(SAMPLE, { cookieIo: cookies, storage, hostname: 'localhost' });
  withWindow({
    location: { pathname: '/gracias', search: '?conv=Schedule' },
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
    dataLayer: [],
    navigator: { userAgent: 'Mozilla/5.0' },
  }, () => {
    const result = maybeFireBookingAbandon({
      pathname: '/gracias',
      search: '?conv=Schedule',
      now: SAMPLE.ts + 60_000,
      cookieIo: cookies,
      storage,
      hostname: 'localhost',
    });
    assert.equal(result, 'gracias');
    assert.equal(calls.length, 0);
    assert.equal(readBookingIntent({ cookieIo: cookies, storage }), null);
  });
});

test('qa=1 and PlayfulQA/1.0 do not write or fire booking_abandon', () => {
  resetBookingAbandonForTests();
  const cookies = memoryCookies();
  const storage = memoryStorage();
  const calls: unknown[][] = [];
  assert.equal(
    markBookingIntent(SAMPLE, {
      cookieIo: cookies,
      storage,
      hostname: 'localhost',
      search: '?qa=1',
    }),
    false,
  );
  assert.equal(readBookingIntent({ cookieIo: cookies, storage }), null);

  markBookingIntent(SAMPLE, { cookieIo: cookies, storage, hostname: 'localhost' });
  withWindow({
    location: { pathname: '/', search: '?qa=1' },
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
    dataLayer: [],
    navigator: { userAgent: 'Mozilla/5.0' },
  }, () => {
    assert.equal(
      maybeFireBookingAbandon({
        pathname: '/',
        search: '?qa=1',
        now: SAMPLE.ts + 60_000,
        cookieIo: cookies,
        storage,
        hostname: 'localhost',
      }),
      'qa',
    );
    assert.equal(calls.length, 0);
    assert.ok(readBookingIntent({ cookieIo: cookies, storage }));
  });

  withWindow({
    location: { pathname: '/', search: '' },
    gtag: (...args: unknown[]) => {
      calls.push(args);
    },
    dataLayer: [],
    navigator: { userAgent: PLAYFUL_QA_UA },
  }, () => {
    assert.equal(
      maybeFireBookingAbandon({
        pathname: '/',
        search: '',
        userAgent: PLAYFUL_QA_UA,
        now: SAMPLE.ts + 60_000,
        cookieIo: cookies,
        storage,
        hostname: 'localhost',
      }),
      'qa',
    );
    assert.equal(calls.length, 0);
  });
});

test('hooks live in existing trackers; layout GTM Ads and Meta are untouched', () => {
  const tracker = readFileSync(new URL('../components/CtaClickTracker.tsx', import.meta.url), 'utf8');
  const thanks = readFileSync(new URL('../components/BookAppointmentTracker.tsx', import.meta.url), 'utf8');
  const clicks = readFileSync(new URL('../lib/analytics/cta-click.ts', import.meta.url), 'utf8');
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
  const meta = readFileSync(new URL('../components/MetaPixel.tsx', import.meta.url), 'utf8');
  const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const header = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');

  assert.match(tracker, /maybeFireBookingAbandon/);
  assert.match(tracker, /pageshow/);
  assert.match(clicks, /markBookingIntent/);
  assert.match(clicks, /CTA_REUNION_EVENT/);
  assert.match(thanks, /clearBookingIntent/);
  assert.doesNotMatch(layout, /booking-abandon|booking_abandon|pa_booking_intent/);
  assert.doesNotMatch(ga, /booking_abandon/);
  assert.doesNotMatch(gtm, /booking_abandon/);
  assert.doesNotMatch(meta, /booking_abandon/);
  assert.doesNotMatch(globals, /booking_abandon|pa_booking_intent/);
  assert.doesNotMatch(header, /booking_abandon|pa_booking_intent/);
  assert.doesNotMatch(footer, /booking_abandon|pa_booking_intent/);
});
