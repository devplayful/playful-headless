import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';

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
  mergeIncomingQueryOntoWidget,
  resolveBookingWidgetRedirect,
  searchFromBookingValues,
  toServiceBookingHref,
} = await import('../utils/booking-attribution.ts');
const {
  applyBookingIframeAttrToSrc,
  BOOKING_IFRAME_ATTR_KEYS,
  BOOKING_IFRAME_ATTR_STORAGE_KEY,
  bookingCompleteHasContactIdentity,
  bookingIframeAttrFromSearch,
  bookingQueryParamsReply,
  deserializeBookingIframeAttr,
  handleBookingWidgetMessage,
  isAllowedBookingMessageOrigin,
  isBookingWidgetIframeSrc,
  mergeBookingIframeAttr,
  parseBookingWidgetMessage,
  resolveBookingIframeAttr,
  serializeBookingIframeAttr,
} = await import('../utils/booking-widget-bridge.ts');
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

test('GET /reunion-playful forwards the entire incoming query including fbclid and unknown keys', () => {
  const search = '?utm_source=facebook&utm_medium=paid_social&utm_campaign=set1&utm_content=ad1&fbclid=TEST123&gclid=G456&foo=bar';
  const { location, status } = resolveBookingWidgetRedirect({ search });
  assert.equal(status, 302);
  const target = new URL(location);
  assert.equal(target.origin, 'https://api.playfulagency.com');
  assert.equal(target.pathname, '/widget/bookings/reunion-playful');
  assert.equal(target.searchParams.get('utm_source'), 'facebook');
  assert.equal(target.searchParams.get('utm_medium'), 'paid_social');
  assert.equal(target.searchParams.get('utm_campaign'), 'set1');
  assert.equal(target.searchParams.get('utm_content'), 'ad1');
  assert.equal(target.searchParams.get('fbclid'), 'TEST123');
  assert.equal(target.searchParams.get('gclid'), 'G456');
  assert.equal(target.searchParams.get('foo'), 'bar');

  const withRest = resolveBookingWidgetRedirect({
    search: '?utm_term=shoes&gbraid=GB1&wbraid=WB1&msclkid=MS1&ttclid=TT1',
  });
  const rest = new URL(withRest.location);
  assert.equal(rest.searchParams.get('utm_term'), 'shoes');
  assert.equal(rest.searchParams.get('gbraid'), 'GB1');
  assert.equal(rest.searchParams.get('wbraid'), 'WB1');
  assert.equal(rest.searchParams.get('msclkid'), 'MS1');
  assert.equal(rest.searchParams.get('ttclid'), 'TT1');

  const noQuery = resolveBookingWidgetRedirect({ search: '' });
  assert.equal(noQuery.status, 302);
  assert.equal(noQuery.location, BOOKING_WIDGET_HREF);
});

test('widget own keys survive merge; incoming wins only on attribution keys', () => {
  const widget = `${BOOKING_WIDGET_HREF}?timezone=America/Managua&utm_source=widget-default&foo=widget`;
  const merged = mergeIncomingQueryOntoWidget(
    widget,
    '?utm_source=facebook&fbclid=TEST123&foo=bar&gclid=G456',
  );
  assert.equal(merged.searchParams.get('timezone'), 'America/Managua');
  assert.equal(merged.searchParams.get('utm_source'), 'facebook');
  assert.equal(merged.searchParams.get('fbclid'), 'TEST123');
  assert.equal(merged.searchParams.get('gclid'), 'G456');
  assert.equal(merged.searchParams.get('foo'), 'widget');
});

test('cookie fbclid fills the hop when the incoming URL omitted it', () => {
  const lastCookie = serializeAttributionCookie(emptyAttribution({
    captured: true,
    source: 'facebook',
    landing: '/agencia-shopify?fbclid=COOKIE-FB&utm_source=facebook',
    utm_source: 'facebook',
    fbclid: 'COOKIE-FB',
  }));
  const fromCookie = resolveBookingWidgetRedirect({
    search: '?utm_source=facebook',
    lastCookie,
  });
  const target = new URL(fromCookie.location);
  assert.equal(target.searchParams.get('utm_source'), 'facebook');
  assert.equal(target.searchParams.get('fbclid'), 'COOKIE-FB');

  const incomingWins = resolveBookingWidgetRedirect({
    search: '?fbclid=TEST123',
    lastCookie,
  });
  assert.equal(new URL(incomingWins.location).searchParams.get('fbclid'), 'TEST123');
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
  assert.match(layout, /BookingWidgetAttribution/);
  assert.match(layout, /AttributionCapture/);
});

test('iframe persist keeps the seven visit keys and ignores unknown fields', () => {
  const fromUrl = bookingIframeAttrFromSearch(
    '?utm_source=facebook&utm_medium=paid_social&utm_campaign=set1&utm_content=ad1&utm_term=shoes&fbclid=TEST123&gclid=G456&foo=bar',
  );
  assert.deepEqual([...BOOKING_IFRAME_ATTR_KEYS], [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'fbclid',
    'gclid',
  ]);
  assert.deepEqual(fromUrl, {
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'set1',
    utm_content: 'ad1',
    utm_term: 'shoes',
    fbclid: 'TEST123',
    gclid: 'G456',
  });
  assert.equal(deserializeBookingIframeAttr(serializeBookingIframeAttr({
    ...fromUrl,
    not_a_key: 'drop',
  })).utm_source, 'facebook');
  assert.equal(deserializeBookingIframeAttr('{not-json').utm_source, undefined);
  assert.deepEqual(
    mergeBookingIframeAttr({ utm_source: 'facebook' }, { utm_source: 'google', fbclid: 'KEEP' }),
    { utm_source: 'facebook', fbclid: 'KEEP' },
  );
});

test('iframe src merge only touches GHL booking widgets and keeps widget-only keys', () => {
  const values = {
    utm_source: 'facebook',
    utm_medium: 'paid_social',
    utm_campaign: 'set1',
    utm_content: 'ad1',
    utm_term: 'shoes',
    fbclid: 'TEST123',
    gclid: 'G456',
  };
  assert.equal(isBookingWidgetIframeSrc(BOOKING_WIDGET_HREF), true);
  assert.equal(isBookingWidgetIframeSrc(`${BOOKING_WIDGET_HREF}?timezone=America/Managua`), true);
  assert.equal(isBookingWidgetIframeSrc('https://widgets.leadconnectorhq.com/chat-widget/loader.js'), false);
  assert.equal(isBookingWidgetIframeSrc('https://www.googletagmanager.com/ns.html?id=GTM-X'), false);

  const merged = applyBookingIframeAttrToSrc(
    `${BOOKING_WIDGET_HREF}?timezone=America/Managua&utm_source=widget-default`,
    values,
  );
  const target = new URL(merged);
  assert.equal(target.origin, 'https://api.playfulagency.com');
  assert.equal(target.pathname, '/widget/bookings/reunion-playful');
  assert.equal(target.searchParams.get('timezone'), 'America/Managua');
  assert.equal(target.searchParams.get('utm_source'), 'facebook');
  assert.equal(target.searchParams.get('utm_medium'), 'paid_social');
  assert.equal(target.searchParams.get('utm_campaign'), 'set1');
  assert.equal(target.searchParams.get('utm_content'), 'ad1');
  assert.equal(target.searchParams.get('utm_term'), 'shoes');
  assert.equal(target.searchParams.get('fbclid'), 'TEST123');
  assert.equal(target.searchParams.get('gclid'), 'G456');
  assert.equal(
    applyBookingIframeAttrToSrc('https://www.googletagmanager.com/ns.html?id=GTM-X', values),
    'https://www.googletagmanager.com/ns.html?id=GTM-X',
  );
});

test('cookie fallback fills iframe keys when the page URL omitted them', () => {
  const lastCookie = serializeAttributionCookie(emptyAttribution({
    captured: true,
    source: 'facebook',
    landing: '/agencia-shopify?fbclid=COOKIE-FB&gclid=COOKIE-G&utm_source=facebook',
    utm_source: 'facebook',
    fbclid: 'COOKIE-FB',
    gclid: 'COOKIE-G',
  }));
  const values = resolveBookingIframeAttr({
    search: '?utm_medium=paid_social',
    stored: serializeBookingIframeAttr({ utm_campaign: 'stored-set' }),
    lastCookie,
  });
  assert.equal(values.utm_medium, 'paid_social');
  assert.equal(values.utm_campaign, 'stored-set');
  assert.equal(values.utm_source, 'facebook');
  assert.equal(values.fbclid, 'COOKIE-FB');
  assert.equal(values.gclid, 'COOKIE-G');
  assert.equal(BOOKING_IFRAME_ATTR_STORAGE_KEY, 'playful:booking-iframe-attr:v1');
});

test('GHL calendar postMessage: query-params reply only for allowed origins; confirm has no identity', () => {
  const values = {
    utm_source: 'facebook',
    fbclid: 'TEST123',
    gclid: 'G456',
  };
  const fetchMsg = ['fetch-query-params', 'calendar-frame', 'loc_123'];
  const allowed = handleBookingWidgetMessage({
    origin: 'https://api.playfulagency.com',
    data: fetchMsg,
    pageUrl: 'https://playfulagency.com/agencia-shopify?utm_source=facebook',
    referrer: 'https://www.facebook.com/',
    values,
  });
  assert.equal(allowed?.kind, 'query-params');
  if (allowed?.kind !== 'query-params') throw new Error('expected query-params');
  assert.equal(allowed.targetOrigin, 'https://api.playfulagency.com');
  assert.equal(allowed.reply[0], 'query-params');
  assert.deepEqual(allowed.reply[1], values);
  assert.equal(allowed.reply[2], 'https://playfulagency.com/agencia-shopify?utm_source=facebook');
  assert.equal(allowed.reply[3], 'https://www.facebook.com/');

  assert.equal(
    handleBookingWidgetMessage({
      origin: 'https://evil.example',
      data: fetchMsg,
      pageUrl: 'https://playfulagency.com/',
      referrer: '',
      values,
    }),
    null,
  );
  assert.equal(isAllowedBookingMessageOrigin('https://stcdn.leadconnectorhq.com'), true);
  assert.equal(isAllowedBookingMessageOrigin('http://api.playfulagency.com'), false);

  const complete = parseBookingWidgetMessage([
    'msgsndr-booking-complete',
    { fingerprint: 'fp_1', calendarId: 'cal_1' },
  ]);
  assert.equal(complete?.type, 'msgsndr-booking-complete');
  if (complete?.type !== 'msgsndr-booking-complete') throw new Error('expected complete');
  assert.equal(complete.fingerprint, 'fp_1');
  assert.equal(complete.calendarId, 'cal_1');
  assert.equal(complete.email, '');
  assert.equal(complete.contactId, '');
  assert.equal(bookingCompleteHasContactIdentity(complete), false);
  assert.equal(
    bookingQueryParamsReply(values, 'https://playfulagency.com/', '')[0],
    'query-params',
  );
});

test('no booking upsert route: GHL confirm does not send email or contactId', () => {
  const apiDir = new URL('../app/api', import.meta.url);
  const names = existsSync(apiDir) ? readdirSync(apiDir) : [];
  assert.equal(names.includes('booking-attribution'), false);
  assert.equal(names.includes('eshow-lista'), false);
  const component = readFileSync(new URL('../components/BookingWidgetAttribution.tsx', import.meta.url), 'utf8');
  assert.match(component, /does not upsert/);
  assert.doesNotMatch(component, /fetch\('\/api\//);
});
