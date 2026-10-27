import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DIRECT_SOURCE,
  ATTRIBUTION_TTL_SECONDS,
  HIGHLEVEL_CLICK_FIELD_KEYS,
  MISSING_SOURCE,
  deserializeAttributionCookie,
  externalReferrer,
  hasCampaignSignals,
  mergeFirstTouch,
  mergeLastTouch,
  nextAttributionFromRequest,
  parseVisitAttribution,
  resolveAttributionSource,
  serializeAttributionCookie,
  shouldCaptureAttributionPath,
} from '../../lib/contact/attribution.ts';

test('parses UTMs, click ids and landing including the query', () => {
  const touch = parseVisitAttribution({
    pathname: '/agencia-seo',
    search: '?utm_source=qa&utm_medium=test&utm_campaign=atribucion-qa&utm_content=v1&utm_term=prueba&gclid=QA-GCLID-TEST&gbraid=QA-GBRAID-TEST&wbraid=QA-WBRAID-TEST&fbclid=QA-FBCLID-TEST',
    referrer: 'https://www.google.com/search?q=playful',
    host: 'playfulagency.com',
  });

  assert.equal(touch.captured, true);
  assert.equal(touch.source, 'qa');
  assert.equal(touch.utm_source, 'qa');
  assert.equal(touch.utm_medium, 'test');
  assert.equal(touch.utm_campaign, 'atribucion-qa');
  assert.equal(touch.utm_content, 'v1');
  assert.equal(touch.utm_term, 'prueba');
  assert.equal(touch.gclid, 'QA-GCLID-TEST');
  assert.equal(touch.gbraid, 'QA-GBRAID-TEST');
  assert.equal(touch.wbraid, 'QA-WBRAID-TEST');
  assert.equal(touch.fbclid, 'QA-FBCLID-TEST');
  assert.equal(touch.landing, '/agencia-seo?utm_source=qa&utm_medium=test&utm_campaign=atribucion-qa&utm_content=v1&utm_term=prueba&gclid=QA-GCLID-TEST&gbraid=QA-GBRAID-TEST&wbraid=QA-WBRAID-TEST&fbclid=QA-FBCLID-TEST');
  assert.equal(touch.referrer, 'https://www.google.com/search?q=playful');
});

test('ignores first-party and WordPress referrers', () => {
  assert.equal(externalReferrer('https://playfulagency.com/blog', 'playfulagency.com'), '');
  assert.equal(externalReferrer('https://www.playfulagency.com/', 'playfulagency.com'), '');
  assert.equal(externalReferrer('https://endpoint.playfulagency.com/contacto', 'playfulagency.com'), '');
  assert.equal(externalReferrer('https://playful-headless-abc.vercel.app/', 'playfulagency.com'), '');
  assert.equal(
    externalReferrer('https://news.ycombinator.com/item?id=1', 'playfulagency.com'),
    'https://news.ycombinator.com/item?id=1',
  );
});

test('resolves source as google, facebook, referrer host, direct or sin-dato', () => {
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: 'x', gbraid: '', wbraid: '', fbclid: '', referrer: '',
  }), 'google');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', gbraid: 'GB1', wbraid: '', fbclid: '', referrer: '',
  }), 'google');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', gbraid: '', wbraid: 'WB1', fbclid: '', referrer: '',
  }), 'google');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', gbraid: '', wbraid: '', fbclid: 'y', referrer: '',
  }), 'facebook');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', gbraid: '', wbraid: '', fbclid: '', referrer: 'https://t.co/abc',
  }), 't.co');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', gbraid: '', wbraid: '', fbclid: '', referrer: '',
  }), DIRECT_SOURCE);
  assert.equal(resolveAttributionSource({
    captured: false, utm_source: '', gclid: '', gbraid: '', wbraid: '', fbclid: '', referrer: '',
  }), MISSING_SOURCE);
});

test('keeps first-touch and updates last-touch only when new campaign signals arrive', () => {
  const first = parseVisitAttribution({
    pathname: '/',
    search: '?utm_source=qa&utm_campaign=atribucion-qa',
    host: 'playfulagency.com',
  });
  const later = parseVisitAttribution({
    pathname: '/contactar-agencia-de-marketing-digital',
    search: '',
    referrer: 'https://playfulagency.com/',
    host: 'playfulagency.com',
  });
  const newerCampaign = parseVisitAttribution({
    pathname: '/blog',
    search: '?utm_source=linkedin&utm_medium=social',
    host: 'playfulagency.com',
  });

  assert.equal(mergeFirstTouch(first, later).utm_source, 'qa');
  assert.equal(mergeFirstTouch(first, later).landing.includes('utm_source=qa'), true);
  assert.equal(mergeLastTouch(first, later).utm_source, 'qa');
  assert.equal(mergeLastTouch(first, newerCampaign).utm_source, 'linkedin');
  assert.equal(hasCampaignSignals(later), false);
});

test('round-trips cookies and ignores API/static paths', () => {
  const touch = parseVisitAttribution({
    pathname: '/',
    search: '?utm_source=qa&gclid=1&gbraid=GB1&wbraid=WB1',
    host: 'playfulagency.com',
  });
  const restored = deserializeAttributionCookie(serializeAttributionCookie(touch));
  assert.equal(restored?.utm_source, 'qa');
  assert.equal(restored?.gclid, '1');
  assert.equal(restored?.gbraid, 'GB1');
  assert.equal(restored?.wbraid, 'WB1');
  assert.equal(shouldCaptureAttributionPath('/api/contact'), false);
  assert.equal(shouldCaptureAttributionPath('/contactar-agencia-de-marketing-digital'), true);
});

test('stores gbraid and wbraid in first/last cookies and does not overwrite first touch', () => {
  const firstVisit = parseVisitAttribution({
    pathname: '/',
    search: '?gbraid=TEST_G&wbraid=TEST_W&qa=1',
    host: 'playfulagency.com',
  });
  assert.equal(firstVisit.gbraid, 'TEST_G');
  assert.equal(firstVisit.wbraid, 'TEST_W');
  assert.equal(hasCampaignSignals(firstVisit), true);
  assert.equal(firstVisit.source, 'google');

  const laterVisit = parseVisitAttribution({
    pathname: '/reunion-playful',
    search: '?gbraid=LATER_G&wbraid=LATER_W',
    host: 'playfulagency.com',
  });
  const next = nextAttributionFromRequest({
    pathname: '/reunion-playful',
    search: '?gbraid=LATER_G&wbraid=LATER_W',
    host: 'playfulagency.com',
    firstCookie: serializeAttributionCookie(firstVisit),
    lastCookie: serializeAttributionCookie(firstVisit),
  });

  assert.equal(next.first.gbraid, 'TEST_G');
  assert.equal(next.first.wbraid, 'TEST_W');
  assert.equal(next.first.landing.startsWith('/?'), true);
  assert.equal(next.last.gbraid, 'LATER_G');
  assert.equal(next.last.wbraid, 'LATER_W');
  assert.equal(mergeFirstTouch(firstVisit, laterVisit).gbraid, 'TEST_G');
  assert.equal(mergeLastTouch(firstVisit, laterVisit).gbraid, 'LATER_G');

  const restoredFirst = deserializeAttributionCookie(serializeAttributionCookie(next.first));
  const restoredLast = deserializeAttributionCookie(serializeAttributionCookie(next.last));
  assert.equal(restoredFirst?.gbraid, 'TEST_G');
  assert.equal(restoredLast?.gbraid, 'LATER_G');
  assert.equal(ATTRIBUTION_TTL_SECONDS, 90 * 24 * 60 * 60);
});

test('deserializes cookies after Next.js double-encodes serializeAttributionCookie', () => {
  const touch = parseVisitAttribution({
    pathname: '/',
    search: '?gbraid=TEST_G&wbraid=TEST_W',
    host: 'playfulagency.com',
  });
  const once = serializeAttributionCookie(touch);
  const twice = encodeURIComponent(once);
  const fromOnce = deserializeAttributionCookie(once);
  const fromTwice = deserializeAttributionCookie(twice);
  assert.equal(fromOnce?.gbraid, 'TEST_G');
  assert.equal(fromOnce?.wbraid, 'TEST_W');
  assert.equal(fromTwice?.gbraid, 'TEST_G');
  assert.equal(fromTwice?.wbraid, 'TEST_W');
});

test('builds first and last touch from request cookies', () => {
  const first = parseVisitAttribution({
    pathname: '/',
    search: '?utm_source=qa&utm_medium=test',
    host: 'playfulagency.com',
  });
  const next = nextAttributionFromRequest({
    pathname: '/contactar-agencia-de-marketing-digital',
    search: '',
    host: 'playfulagency.com',
    firstCookie: serializeAttributionCookie(first),
    lastCookie: serializeAttributionCookie(first),
  });
  assert.equal(next.first.utm_source, 'qa');
  assert.equal(next.last.utm_source, 'qa');
  assert.equal(next.last.landing.startsWith('/contactar'), false);
});

test('maps click fields to the GHL fieldKeys Ops created', () => {
  assert.deepEqual(HIGHLEVEL_CLICK_FIELD_KEYS, {
    gclid_web: 'contact.gclid_web',
    fbclid: 'contact.fbclid',
    referrer: 'contact.referrer',
  });
});
