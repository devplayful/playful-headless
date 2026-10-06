import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  BOOKING_QUERY_KEYS,
  BOOKING_WIDGET_HREF,
  SERVICE_BOOKING_HREF,
  bookingHrefFromPageSearch,
  bookingQueryFromAttributionTouch,
  bookingQueryFromLanding,
  bookingQueryFromSearch,
  buildBookingQueryValues,
  buildBookingWidgetUrl,
  firstNonEmptyBookingValue,
  isBookingHref,
  mergeBookingQuery,
  resolveBookingWidgetRedirect,
  searchFromBookingValues,
  toServiceBookingHref,
} = await import('../utils/booking-attribution.ts');
const {
  emptyAttribution,
  serializeAttributionCookie,
} = await import('../lib/contact/attribution.ts');
const { rewriteBookingWidgetHrefs, rewriteElementorBodyHrefs, BOOKING_HREF } = await import('../utils/booking.ts');

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const shopifyPage = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
const gracias = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
const blogPage = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');

const LAST_TOUCH = emptyAttribution({
  captured: true,
  source: 'google',
  landing: '/agencia-shopify?gclid=COOKIE123&gbraid=GBRAID-LT&utm_source=google&utm_campaign=cookie-lt&utm_medium=cpc&utm_term=shopify&utm_content=hero',
  utm_source: 'google',
  utm_medium: 'cpc',
  utm_campaign: 'cookie-lt',
  utm_term: 'shopify',
  utm_content: 'hero',
  gclid: 'COOKIE123',
});

const FIRST_TOUCH = emptyAttribution({
  captured: true,
  source: 'google',
  landing: '/?gclid=FIRST999&wbraid=WBRAID-FT&utm_source=google&utm_campaign=cookie-ft',
  utm_source: 'google',
  utm_campaign: 'cookie-ft',
  gclid: 'FIRST999',
});

test('booking query keys are only the Ads click ids and five utms', () => {
  assert.deepEqual([...BOOKING_QUERY_KEYS], [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ]);
  assert.equal(BOOKING_WIDGET_HREF, 'https://api.playfulagency.com/widget/bookings/reunion-playful');
  assert.equal(BOOKING_HREF, BOOKING_WIDGET_HREF);
  assert.equal(SERVICE_BOOKING_HREF, '/reunion-playful');
});

test('builder keeps URL values and drops empty keys', () => {
  const values = bookingQueryFromSearch(
    '?gclid=TEST123&utm_source=google&utm_campaign=x&utm_medium=&utm_term=&fbclid=ignore',
  );
  assert.deepEqual(values, {
    gclid: 'TEST123',
    utm_source: 'google',
    utm_campaign: 'x',
  });
  assert.equal(searchFromBookingValues(values), '?gclid=TEST123&utm_source=google&utm_campaign=x');
  assert.equal(searchFromBookingValues({}), '');
  assert.equal(firstNonEmptyBookingValue('', '  ', 'kept'), 'kept');
});

test('builder prefers current URL, then pa_attr_lt, then pa_attr_ft', () => {
  const lastCookie = serializeAttributionCookie(LAST_TOUCH);
  const firstCookie = serializeAttributionCookie(FIRST_TOUCH);

  const fromUrl = buildBookingQueryValues({
    search: '?gclid=TEST123&utm_source=google&utm_campaign=x',
    lastCookie,
    firstCookie,
  });
  assert.equal(fromUrl.gclid, 'TEST123');
  assert.equal(fromUrl.utm_source, 'google');
  assert.equal(fromUrl.utm_campaign, 'x');
  assert.equal(fromUrl.gbraid, 'GBRAID-LT');
  assert.equal(fromUrl.utm_medium, 'cpc');

  const fromLast = buildBookingQueryValues({
    search: '',
    lastCookie,
    firstCookie,
  });
  assert.equal(fromLast.gclid, 'COOKIE123');
  assert.equal(fromLast.utm_campaign, 'cookie-lt');
  assert.equal(fromLast.gbraid, 'GBRAID-LT');
  assert.equal(fromLast.wbraid, 'WBRAID-FT');

  const fromFirst = buildBookingQueryValues({
    search: '',
    lastCookie: '',
    firstCookie,
  });
  assert.equal(fromFirst.gclid, 'FIRST999');
  assert.equal(fromFirst.utm_campaign, 'cookie-ft');
  assert.equal(fromFirst.wbraid, 'WBRAID-FT');
});

test('cookie JSON fields win over landing leftovers, landing fills gbraid/wbraid', () => {
  const touch = bookingQueryFromAttributionTouch(LAST_TOUCH);
  assert.equal(touch.gclid, 'COOKIE123');
  assert.equal(touch.gbraid, 'GBRAID-LT');
  assert.deepEqual(bookingQueryFromLanding('/agencia-sem?wbraid=W1&gclid=L1'), {
    wbraid: 'W1',
    gclid: 'L1',
  });
  assert.deepEqual(mergeBookingQuery({ gclid: 'A' }, { gclid: 'B', utm_source: 'google' }), {
    gclid: 'A',
    utm_source: 'google',
  });
});

test('route resolver 302s to the widget with URL query, cookie fallback, or a clean Location', () => {
  const lastCookie = serializeAttributionCookie(LAST_TOUCH);

  const fromUrl = resolveBookingWidgetRedirect({
    search: '?gclid=TEST123&utm_source=google&utm_campaign=x',
  });
  assert.equal(fromUrl.status, 302);
  assert.equal(
    fromUrl.location,
    'https://api.playfulagency.com/widget/bookings/reunion-playful?gclid=TEST123&utm_source=google&utm_campaign=x',
  );

  const fromCookie = resolveBookingWidgetRedirect({
    search: '',
    lastCookie,
  });
  const cookieTarget = new URL(fromCookie.location);
  assert.equal(fromCookie.status, 302);
  assert.equal(cookieTarget.origin, 'https://api.playfulagency.com');
  assert.equal(cookieTarget.pathname, '/widget/bookings/reunion-playful');
  assert.equal(cookieTarget.searchParams.get('gclid'), 'COOKIE123');
  assert.equal(cookieTarget.searchParams.get('utm_source'), 'google');
  assert.equal(cookieTarget.searchParams.get('utm_campaign'), 'cookie-lt');
  assert.equal(cookieTarget.searchParams.get('gbraid'), 'GBRAID-LT');
  assert.equal(cookieTarget.search, searchFromBookingValues(buildBookingQueryValues({ lastCookie })));

  const clean = resolveBookingWidgetRedirect({ search: '' });
  assert.equal(clean.status, 302);
  assert.equal(clean.location, BOOKING_WIDGET_HREF);
  assert.equal(new URL(clean.location).search, '');
  assert.equal(buildBookingWidgetUrl({ search: '?utm_medium=' }), BOOKING_WIDGET_HREF);
});

test('middleware wires the resolver instead of a static /reunion-playful 301', () => {
  assert.match(middleware, /resolveBookingWidgetRedirect/);
  assert.match(middleware, /ATTRIBUTION_COOKIE_LAST/);
  assert.match(middleware, /ATTRIBUTION_COOKIE_FIRST/);
  assert.match(middleware, /Cache-Control': 'private, no-store'/);
  assert.doesNotMatch(
    middleware,
    /'\/reunion-playful':\s*'https:\/\/api\.playfulagency\.com\/widget\/bookings\/reunion-playful'/,
  );
  assert.match(middleware, /'\/reunion-playful'/);
  assert.match(middleware, /'\/reunion-playful\/'/);
});

test('visible booking hrefs stay on /reunion-playful and rewrite widget URLs', () => {
  assert.equal(isBookingHref('/reunion-playful'), true);
  assert.equal(isBookingHref(BOOKING_WIDGET_HREF), true);
  assert.equal(isBookingHref('https://playfulagency.com/reunion-playful?gclid=1'), true);
  assert.equal(isBookingHref('/contactar-agencia-de-marketing-digital'), false);
  assert.equal(
    toServiceBookingHref(`${BOOKING_WIDGET_HREF}?gclid=TEST123&utm_medium=`),
    '/reunion-playful?gclid=TEST123',
  );
  assert.equal(bookingHrefFromPageSearch('?gclid=TEST123&utm_source=google&foo=1'), '/reunion-playful?gclid=TEST123&utm_source=google');
  assert.equal(bookingHrefFromPageSearch(''), '/reunion-playful');

  const html = [
    `<a href="${BOOKING_WIDGET_HREF}">Agendar</a>`,
    '<a href="https://playfulagency.com/reunion-playful?gclid=A&utm_source=">Apex</a>',
    '<a href="/contactar-agencia-de-marketing-digital">Formulario</a>',
  ].join('');
  const rewritten = rewriteBookingWidgetHrefs(html);
  assert.equal((rewritten.match(/href="\/reunion-playful"/g) || []).length, 1);
  assert.match(rewritten, /href="\/reunion-playful\?gclid=A"/);
  assert.doesNotMatch(rewritten, /api\.playfulagency\.com/);
  assert.match(rewritten, /href="\/contactar-agencia-de-marketing-digital"/);

  const otherLanding = rewriteElementorBodyHrefs(
    `<a href="${BOOKING_WIDGET_HREF}">Agendar</a>`,
    'marketing-internacional',
  );
  assert.match(otherLanding, /href="\/reunion-playful"/);
  assert.doesNotMatch(otherLanding, /api\.playfulagency\.com/);
});

test('Shopify, gracias and blog CTAs go through /reunion-playful; layout propagates query', () => {
  assert.match(shopifyPage, /href = SERVICE_BOOKING_HREF/);
  assert.match(shopifyPage, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.doesNotMatch(shopifyPage, /buttonLink=\{BOOKING_HREF\}/);
  assert.doesNotMatch(shopifyPage, /href=\{BOOKING_HREF\}/);
  assert.doesNotMatch(gracias, /api\.playfulagency\.com\/widget\/bookings/);
  assert.match(blogPage, /rewriteBookingWidgetHrefs\(/);
  assert.match(layout, /BookingQueryPropagator/);
  assert.match(layout, /AttributionCapture/);
});
