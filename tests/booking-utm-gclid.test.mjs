import test from 'node:test';
import assert from 'node:assert/strict';

const {
  BOOKING_QUERY_KEYS,
  BOOKING_WIDGET_HREF,
  bookingHrefFromPageSearch,
  buildBookingWidgetUrl,
  toServiceBookingHref,
} = await import('../utils/booking-attribution.ts');
const { emptyAttribution, serializeAttributionCookie } = await import('../lib/contact/attribution.ts');

const ALL_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id'];

test('booking keys cover the click ids and six utm params (tanda 16, 28 oct)', () => {
  assert.deepEqual([...BOOKING_QUERY_KEYS].sort(), [...ALL_KEYS].sort());
});

test('visible Reservar href keeps every key from the page URL, skips empty ones', () => {
  const search = '?gclid=TEST123&gbraid=GB&wbraid=WB&fbclid=FB&utm_source=google&utm_medium=cpc&utm_campaign=c&utm_term=t&utm_content=x&utm_id=123&utm_term2=&qa=1&utm_content=';
  const href = bookingHrefFromPageSearch(search);
  const url = new URL(href, 'https://playfulagency.com');
  assert.equal(url.pathname, '/reunion-playful');
  for (const key of ALL_KEYS) assert.equal(url.searchParams.getAll(key).length, 1, key);
  assert.equal(url.searchParams.get('fbclid'), 'FB');
  assert.equal(url.searchParams.has('qa'), false);
  assert.equal(bookingHrefFromPageSearch('?gclid=&utm_source=%20'), '/reunion-playful');
});

test('widget URL: page URL wins, cookies fill gaps, no duplicates, no empties', () => {
  const last = serializeAttributionCookie(emptyAttribution({
    gclid: 'COOKIE_GCLID', fbclid: 'COOKIE_FB', utm_source: 'cookie_src', utm_medium: '',
    landing: '/agencia-shopify?wbraid=COOKIE_WB',
  }));
  const out = new URL(buildBookingWidgetUrl({ search: '?gclid=TEST123&utm_campaign=otono', lastCookie: last }));
  assert.equal(`${out.origin}${out.pathname}`, BOOKING_WIDGET_HREF);
  assert.equal(out.searchParams.get('gclid'), 'TEST123');
  assert.equal(out.searchParams.get('fbclid'), 'COOKIE_FB');
  assert.equal(out.searchParams.get('wbraid'), 'COOKIE_WB');
  assert.equal(out.searchParams.get('utm_source'), 'cookie_src');
  assert.equal(out.searchParams.get('utm_campaign'), 'otono');
  assert.equal(out.searchParams.has('utm_medium'), false);
  for (const key of ALL_KEYS) assert.ok(out.searchParams.getAll(key).length <= 1, key);
});

test('direct widget hrefs in HTML go through /reunion-playful with fbclid kept', () => {
  assert.equal(
    toServiceBookingHref('https://api.playfulagency.com/widget/bookings/reunion-playful?fbclid=FB&gclid=TEST123&utm_source='),
    '/reunion-playful?gclid=TEST123&fbclid=FB',
  );
});
