import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  BOOK_APPOINTMENT_EVENT,
  BOOK_APPOINTMENT_STORAGE_PREFIX,
  pushBookAppointmentOnce,
  readBookingId,
  resetBookAppointmentForTests,
} from '../lib/analytics/book-appointment.ts';
import { sendGtagEvent } from '../lib/analytics/gtag-event.ts';
import { pushGenerateLead } from '../lib/contact/analytics.ts';
import { PLAYFUL_QA_UA } from '../lib/analytics/qa-traffic.ts';
import {
  CONVERSION_EVENTS,
  isAutomatedClient,
  isConversionBotSuspect,
  isHeadlessOrCrawlerUserAgent,
  markRealInteraction,
  publishTrafficType,
  resetTrafficTypeForTests,
  resolveTrafficFlags,
  shouldSuppressConversion,
  TRAFFIC_TYPE_BOT,
  TRAFFIC_TYPE_QA,
  TRAFFIC_TYPE_USER,
} from '../lib/analytics/traffic-type.ts';

async function withWindow<T>(value: unknown, run: () => T | Promise<T>): Promise<T> {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value,
  });
  try {
    return await run();
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
}

function withNavigator(value: unknown, run: () => void) {
  const original = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value,
  });
  try {
    run();
  } finally {
    if (original) Object.defineProperty(globalThis, 'navigator', original);
    else delete (globalThis as { navigator?: unknown }).navigator;
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

test('detects QA, webdriver, headless/crawler UA; humans stay user', () => {
  resetTrafficTypeForTests();
  assert.deepEqual(
    resolveTrafficFlags({ search: '?qa=1', userAgent: 'Chrome' }),
    { traffic_type: TRAFFIC_TYPE_QA, bot_suspect: false },
  );
  assert.deepEqual(
    resolveTrafficFlags({ search: '', userAgent: PLAYFUL_QA_UA }),
    { traffic_type: TRAFFIC_TYPE_QA, bot_suspect: false },
  );
  assert.equal(isAutomatedClient({ search: '?qa=1', userAgent: 'HeadlessChrome' }), false);
  assert.equal(isAutomatedClient({ webdriver: true, userAgent: 'Chrome' }), true);
  assert.equal(isHeadlessOrCrawlerUserAgent('Mozilla/5.0 HeadlessChrome/120'), true);
  assert.equal(isHeadlessOrCrawlerUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)'), true);
  assert.equal(isHeadlessOrCrawlerUserAgent('Mozilla/5.0 (X11; Linux x86_64) Chrome/128'), false);
  assert.deepEqual(
    resolveTrafficFlags({ search: '', userAgent: 'Mozilla/5.0 HeadlessChrome/120' }),
    { traffic_type: TRAFFIC_TYPE_BOT, bot_suspect: true },
  );
  assert.deepEqual(
    resolveTrafficFlags({ search: '', userAgent: 'Chrome', webdriver: false }),
    { traffic_type: TRAFFIC_TYPE_USER, bot_suspect: false },
  );
});

test('suppresses generate_lead, cta_reunion_click and book_appointment for QA and bots', () => {
  resetTrafficTypeForTests();
  for (const event of CONVERSION_EVENTS) {
    assert.equal(shouldSuppressConversion(event, { search: '?qa=1', userAgent: 'Chrome' }), true);
    assert.equal(shouldSuppressConversion(event, { search: '', userAgent: PLAYFUL_QA_UA }), true);
    assert.equal(shouldSuppressConversion(event, {
      search: '',
      userAgent: 'Chrome',
      webdriver: true,
      interacted: true,
    }), true);
  }
  assert.equal(shouldSuppressConversion('page_view', { webdriver: true }), false);
  assert.equal(shouldSuppressConversion('cta_contact_click', {
    userAgent: 'HeadlessChrome',
  }), false);
});

test('no interaction before convert is bot_suspect except book_appointment', () => {
  resetTrafficTypeForTests();
  assert.equal(isConversionBotSuspect('generate_lead', {
    userAgent: 'Chrome',
    webdriver: false,
    interacted: false,
  }), true);
  assert.equal(isConversionBotSuspect('cta_reunion_click', {
    userAgent: 'Chrome',
    webdriver: false,
    interacted: false,
  }), true);
  assert.equal(isConversionBotSuspect('book_appointment', {
    userAgent: 'Chrome',
    webdriver: false,
    interacted: false,
  }), false);
  assert.equal(shouldSuppressConversion('generate_lead', {
    userAgent: 'Chrome',
    interacted: true,
  }), false);
  markRealInteraction();
  assert.equal(shouldSuppressConversion('cta_reunion_click', { userAgent: 'Chrome' }), false);
});

test('publishTrafficType writes QA flag to dataLayer and does not emit conversions', async () => {
  resetTrafficTypeForTests();
  resetBookAppointmentForTests();
  const gtagCalls: unknown[] = [];
  await withWindow({
    dataLayer: [],
    gtag: (...args: unknown[]) => { gtagCalls.push(args); },
    location: { search: '?qa=1', pathname: '/agencia-shopify' },
  }, () => {
    withNavigator({ userAgent: PLAYFUL_QA_UA, webdriver: false }, () => {
      const flags = publishTrafficType();
      assert.equal(flags.traffic_type, TRAFFIC_TYPE_QA);
      assert.equal(window.__playfulQa, 1);
      assert.deepEqual(window.dataLayer, [{
        traffic_type: TRAFFIC_TYPE_QA,
        bot_suspect: false,
      }]);
      assert.deepEqual(gtagCalls[0], ['set', {
        traffic_type: TRAFFIC_TYPE_QA,
        bot_suspect: false,
      }]);

      sendGtagEvent('cta_reunion_click', { page_path: '/agencia-shopify' });
      assert.equal(pushBookAppointmentOnce({
        search: '?conv=Schedule&pa_booking_id=qa-1',
        storage: memoryStorage(),
      }), false);
    });
  });
  assert.equal(gtagCalls.length, 1);
});

test('book_appointment fires once per booking_id from cookie or query, never generate_lead', async () => {
  resetTrafficTypeForTests();
  resetBookAppointmentForTests();
  markRealInteraction();
  assert.equal(readBookingId('?conv=Schedule', 'pa_booking_id=cookie-9'), 'cookie-9');
  assert.equal(
    readBookingId('?conv=Schedule&pa_booking_id=query-1', 'pa_booking_id=cookie-9'),
    'query-1',
  );

  const storage = memoryStorage();
  const dataLayer: Array<Record<string, unknown>> = [];
  await withWindow({ dataLayer }, () => {
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule',
      cookie: 'pa_booking_id=res-77',
      storage,
    }), true);
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule',
      cookie: 'pa_booking_id=res-77',
      storage,
    }), false);
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule&pa_booking_id=res-77',
      storage,
    }), false);
    assert.equal(dataLayer.length, 1);
    assert.equal(dataLayer[0].event, BOOK_APPOINTMENT_EVENT);
    assert.equal(dataLayer[0].booking_id, 'res-77');
    assert.equal(dataLayer[0].traffic_type, TRAFFIC_TYPE_USER);
    assert.equal(dataLayer[0].bot_suspect, false);
    assert.equal(storage.records.get(`${BOOK_APPOINTMENT_STORAGE_PREFIX}res-77`), '1');
    assert.ok(!dataLayer.some((row) => row.event === 'generate_lead'));
  });

  await withWindow({ dataLayer: [] }, async () => {
    await pushGenerateLead('website-contact', 10, {
      search: '?qa=1',
      userAgent: 'Chrome',
      interacted: true,
    });
    assert.deepEqual(window.dataLayer, []);
  });
});

test('bot_suspect suppresses book_appointment and generate_lead without blocking page_view name', async () => {
  resetTrafficTypeForTests();
  resetBookAppointmentForTests();
  const storage = memoryStorage();
  await withWindow({ dataLayer: [] }, () => {
    assert.equal(pushBookAppointmentOnce({
      search: '?conv=Schedule&pa_booking_id=bot-1',
      storage,
      userAgent: 'Mozilla/5.0 HeadlessChrome/120',
    }), false);
    assert.deepEqual(window.dataLayer, []);
  });

  await withWindow({ dataLayer: [] }, async () => {
    await pushGenerateLead('website-contact', 10, {
      userAgent: 'Chrome',
      webdriver: true,
      interacted: true,
    });
    assert.deepEqual(window.dataLayer, []);
  });
});

test('does not touch layout, header, footer, global CSS or gracias JSX', () => {
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const header = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
  const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const gracias = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
  const tracker = readFileSync(new URL('../components/CtaClickTracker.tsx', import.meta.url), 'utf8');
  const book = readFileSync(new URL('../components/BookAppointmentTracker.tsx', import.meta.url), 'utf8');
  const docs = readFileSync(new URL('../docs/analytics-bots-reserva.md', import.meta.url), 'utf8');

  assert.match(tracker, /publishTrafficType/);
  assert.match(book, /document\.cookie/);
  assert.match(gracias, /BookAppointmentTracker/);
  assert.doesNotMatch(layout, /publishTrafficType|traffic_type|bot_suspect/);
  assert.doesNotMatch(header, /traffic_type|bot_suspect|book_appointment/);
  assert.doesNotMatch(footer, /traffic_type|bot_suspect|book_appointment/);
  assert.doesNotMatch(globals, /traffic_type|bot_suspect/);
  assert.doesNotMatch(gracias, /pushBookAppointmentOnce|traffic_type/);
  assert.match(docs, /book_appointment/);
  assert.match(docs, /filtro de datos/);
  assert.match(docs, /Contactar/);
});
