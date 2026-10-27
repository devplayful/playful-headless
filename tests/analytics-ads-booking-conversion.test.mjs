import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ADS_BOOKING_LABEL_FALLBACK,
  ADS_BOOKING_SENT_PREFIX,
  ADS_BOOKING_TX_STORAGE_KEY,
  ADS_CONVERSION_ID,
  adsBookingConversionLabel,
  adsBookingSendTo,
  adsBookingTransactionIdFromBookingId,
  bookingSignalsFromSearch,
  fireAdsBookingConversion,
  paBookingCookieLine,
  persistPaBookingCookies,
  resetAdsBookingConversionForTests,
  resolveAdsBookingTransactionId,
  sanitizePaBookingEc,
  sanitizePaBookingId,
  scheduleAdsBookingConversion,
} = await import('../lib/analytics/ads-booking-conversion.ts');

const SEND_TO = `${ADS_CONVERSION_ID}/${ADS_BOOKING_LABEL_FALLBACK}`;
const GHL_ID = 'a'.repeat(32);

function memoryStorage() {
  const records = new Map();
  return {
    getItem: (key) => (records.has(key) ? records.get(key) : null),
    setItem: (key, value) => { records.set(key, value); },
    records,
  };
}

test('label falls back to the GTM Reunión agendada label and accepts a safe override', () => {
  assert.equal(ADS_BOOKING_LABEL_FALLBACK, 'xpozCJHPv_EcEKDS8ssB');
  assert.equal(adsBookingConversionLabel(''), ADS_BOOKING_LABEL_FALLBACK);
  assert.equal(adsBookingConversionLabel('nope label'), ADS_BOOKING_LABEL_FALLBACK);
  assert.equal(adsBookingConversionLabel('AbC_123-ok'), 'AbC_123-ok');
  assert.equal(adsBookingSendTo('AbC_123-ok'), `${ADS_CONVERSION_ID}/AbC_123-ok`);
  assert.equal(adsBookingSendTo(ADS_BOOKING_LABEL_FALLBACK), SEND_TO);
});

test('sanitizes booking id and enhanced-conversion values before they become cookies', () => {
  assert.equal(sanitizePaBookingId(' test '), 'test');
  assert.equal(sanitizePaBookingId(GHL_ID), GHL_ID);
  assert.equal(sanitizePaBookingId(''), null);
  assert.equal(sanitizePaBookingId('   '), null);
  assert.equal(sanitizePaBookingId('a b'), null);
  assert.equal(sanitizePaBookingId('a;b'), null);
  assert.equal(sanitizePaBookingId('a=b'), null);
  assert.equal(sanitizePaBookingId('a,b'), null);
  assert.equal(sanitizePaBookingId(`"${GHL_ID}"`), null);
  assert.equal(sanitizePaBookingId('x'.repeat(129)), null);
  assert.equal(sanitizePaBookingId(null), null);

  assert.equal(sanitizePaBookingEc(' 1 '), '1');
  assert.equal(sanitizePaBookingEc('{"consent":true}'), '{"consent":true}');
  assert.equal(sanitizePaBookingEc(''), null);
  assert.equal(sanitizePaBookingEc('bad;cookie'), null);
  assert.equal(sanitizePaBookingEc('a\nb'), null);
  assert.equal(sanitizePaBookingEc('x'.repeat(1801)), null);
  assert.equal(sanitizePaBookingEc('café'), null);

  assert.deepEqual(
    bookingSignalsFromSearch(`?pa_booking_id=${GHL_ID}&pa_booking_ec=1&conv=Schedule`),
    [
      { name: 'pa_booking_id', value: GHL_ID },
      { name: 'pa_booking_ec', value: '1' },
    ],
  );
  assert.deepEqual(
    bookingSignalsFromSearch('?pa_booking_id=a;b&pa_booking_ec=1'),
    [{ name: 'pa_booking_ec', value: '1' }],
  );
  assert.deepEqual(bookingSignalsFromSearch('?conv=Schedule'), []);
});

test('cookie line is Path=/ Max-Age=1800 SameSite=Lax Secure, Domain only on apex and www', () => {
  assert.equal(
    paBookingCookieLine('pa_booking_id', 'test', 'playfulagency.com'),
    'pa_booking_id=test; Path=/; Max-Age=1800; SameSite=Lax; Secure; Domain=playfulagency.com',
  );
  assert.equal(
    paBookingCookieLine('pa_booking_ec', '1', 'www.playfulagency.com'),
    'pa_booking_ec=1; Path=/; Max-Age=1800; SameSite=Lax; Secure; Domain=playfulagency.com',
  );
  const preview = paBookingCookieLine('pa_booking_id', 'test', 'playful-headless.vercel.app');
  assert.equal(preview, 'pa_booking_id=test; Path=/; Max-Age=1800; SameSite=Lax; Secure');
  assert.equal(preview.includes('Domain='), false);
  assert.equal(
    paBookingCookieLine('pa_booking_id', 'test', 'localhost'),
    'pa_booking_id=test; Path=/; Max-Age=1800; SameSite=Lax; Secure',
  );

  const lines = [];
  persistPaBookingCookies({
    search: '?conv=Schedule&pa_booking_id=test&pa_booking_ec=1',
    hostname: 'playful-git-preview.vercel.app',
    writeLine: (line) => lines.push(line),
  });
  assert.deepEqual(lines, [
    'pa_booking_id=test; Path=/; Max-Age=1800; SameSite=Lax; Secure',
    'pa_booking_ec=1; Path=/; Max-Age=1800; SameSite=Lax; Secure',
  ]);
});

test('transaction_id is the query id, ghl-prefixed only for the 32-hex GTM cookie, else stable per session', () => {
  resetAdsBookingConversionForTests();
  assert.equal(adsBookingTransactionIdFromBookingId('test'), 'test');
  assert.equal(adsBookingTransactionIdFromBookingId(GHL_ID), `ghl-${GHL_ID}`);

  const storage = memoryStorage();
  assert.equal(
    resolveAdsBookingTransactionId('?conv=Schedule&pa_booking_id=test', storage),
    'test',
  );
  assert.equal(
    resolveAdsBookingTransactionId(`?pa_booking_id=${GHL_ID}`, storage),
    `ghl-${GHL_ID}`,
  );

  const session = memoryStorage();
  const first = resolveAdsBookingTransactionId('?conv=Schedule', session);
  const second = resolveAdsBookingTransactionId('', session);
  assert.equal(first, second);
  assert.match(first, /^sess-[0-9a-f-]{8,}$/);
  assert.equal(session.records.get(ADS_BOOKING_TX_STORAGE_KEY), first);

  resetAdsBookingConversionForTests();
  const again = resolveAdsBookingTransactionId('?conv=Schedule', session);
  assert.equal(again, first);
});

test('dedupes the Ads conversion by transaction_id and skips qa and non-Schedule', () => {
  resetAdsBookingConversionForTests();
  const storage = memoryStorage();
  const calls = [];
  const gtag = (...args) => { calls.push(args); };
  const search = '?conv=Schedule&pa_booking_id=test&pa_booking_ec=1';

  const first = fireAdsBookingConversion({ search, storage, gtag });
  const second = fireAdsBookingConversion({ search, storage, gtag });
  assert.equal(first.status, 'sent');
  assert.equal(first.transactionId, 'test');
  assert.equal(first.sendTo, SEND_TO);
  assert.equal(second.status, 'duplicate');
  assert.equal(second.transactionId, 'test');
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], [
    'event',
    'conversion',
    { send_to: SEND_TO, transaction_id: 'test' },
  ]);
  assert.equal(storage.records.get(`${ADS_BOOKING_SENT_PREFIX}test`), '1');

  resetAdsBookingConversionForTests();
  const reloaded = fireAdsBookingConversion({ search, storage, gtag });
  assert.equal(reloaded.status, 'duplicate');
  assert.equal(reloaded.transactionId, 'test');
  assert.equal(calls.length, 1);

  assert.equal(
    fireAdsBookingConversion({ search: '?conv=Lead&pa_booking_id=test', storage, gtag }).status,
    'ignored',
  );
  assert.equal(
    fireAdsBookingConversion({
      search: '?conv=Schedule&qa=1&pa_booking_id=other',
      storage,
      gtag,
    }).status,
    'qa',
  );
  assert.equal(calls.length, 1);

  const ghl = fireAdsBookingConversion({
    search: `?conv=Schedule&pa_booking_id=${GHL_ID}`,
    storage,
    gtag,
  });
  assert.equal(ghl.status, 'sent');
  assert.equal(ghl.transactionId, `ghl-${GHL_ID}`);
  assert.equal(calls[1][2].transaction_id, `ghl-${GHL_ID}`);
});

test('queues one conversion and loads gtag only when the page has no gtag yet', () => {
  resetAdsBookingConversionForTests();
  const storage = memoryStorage();
  const win = { dataLayer: [] };
  const loads = [];
  const queued = fireAdsBookingConversion({
    search: '?conv=Schedule&pa_booking_id=test',
    storage,
    window: win,
    loadScript: () => { loads.push('gtag'); },
  });
  assert.equal(queued.status, 'queued');
  assert.equal(loads.length, 1);
  const commands = win.dataLayer.map((args) => Array.from(args));
  assert.equal(commands[0][0], 'js');
  assert.deepEqual(commands[1], ['config', ADS_CONVERSION_ID, { send_page_view: false }]);
  assert.deepEqual(commands[2], [
    'event',
    'conversion',
    { send_to: SEND_TO, transaction_id: 'test' },
  ]);

  const again = fireAdsBookingConversion({
    search: '?conv=Schedule&pa_booking_id=test',
    storage,
    window: win,
    loadScript: () => { loads.push('again'); },
  });
  assert.equal(again.status, 'duplicate');
  assert.deepEqual(loads, ['gtag']);

  resetAdsBookingConversionForTests();
  const existing = [];
  const ready = {
    dataLayer: [],
    gtag: (...args) => { existing.push(args); },
  };
  const sent = fireAdsBookingConversion({
    search: '?conv=Schedule&pa_booking_id=ready-1',
    storage: memoryStorage(),
    window: ready,
    loadScript: () => { throw new Error('should reuse the existing gtag'); },
  });
  assert.equal(sent.status, 'sent');
  assert.equal(sent.transactionId, 'ready-1');
  assert.equal(existing.length, 1);
  assert.equal(existing[0][0], 'event');
});

test('short retry waits without blocking and stops after send or the deadline', () => {
  const waits = [];
  let clock = 1_000;
  let attempts = 0;
  const cancel = scheduleAdsBookingConversion({
    now: clock,
    nowFn: () => clock,
    retryMs: 50,
    maxWaitMs: 1500,
    setTimeoutFn: (handler, ms) => {
      waits.push(ms);
      clock += ms;
      if (waits.length < 3) handler();
      return waits.length;
    },
    clearTimeoutFn: () => {},
    fire: () => {
      attempts += 1;
      if (attempts < 3) return { status: 'waiting', transactionId: 'sess-1' };
      return { status: 'queued', transactionId: 'sess-1', sendTo: SEND_TO };
    },
  });
  assert.equal(attempts, 3);
  assert.deepEqual(waits, [50, 50]);
  cancel();

  let now = 0;
  const expired = [];
  scheduleAdsBookingConversion({
    now: 0,
    nowFn: () => now,
    retryMs: 50,
    maxWaitMs: 80,
    setTimeoutFn: (handler, ms) => {
      expired.push(ms);
      now += ms;
      handler();
      return 1;
    },
    clearTimeoutFn: () => {},
    fire: () => ({ status: 'waiting' }),
  });
  assert.equal(expired.length < 5, true);
  assert.equal(now >= 80, true);
});

test('gracias wires cookies and the conversion without touching layout, header, footer or global CSS', () => {
  const tracker = readFileSync(new URL('../components/BookAppointmentTracker.tsx', import.meta.url), 'utf8');
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const header = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');
  const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
  const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');

  assert.match(tracker, /persistPaBookingCookies/);
  assert.match(tracker, /pushBookAppointmentOnce/);
  assert.match(tracker, /scheduleAdsBookingConversion/);
  assert.match(middleware, /appendPaBookingCookies/);
  assert.match(middleware, /paBookingCookieLine/);
  assert.match(page, /BookAppointmentTracker/);
  assert.doesNotMatch(page, /gtag\(/);
  assert.doesNotMatch(layout, /ads-booking-conversion|pa_booking_id|pa_booking_ec/);
  assert.doesNotMatch(header, /ads-booking-conversion|pa_booking_id|pa_booking_ec/);
  assert.doesNotMatch(footer, /ads-booking-conversion|pa_booking_id|pa_booking_ec/);
  assert.doesNotMatch(globals, /ads-booking-conversion|pa_booking_id|pa_booking_ec/);
});
