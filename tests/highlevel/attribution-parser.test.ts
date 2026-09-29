import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DIRECT_SOURCE,
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
    search: '?utm_source=qa&utm_medium=test&utm_campaign=atribucion-qa&utm_content=v1&utm_term=prueba&gclid=QA-GCLID-TEST&fbclid=QA-FBCLID-TEST',
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
  assert.equal(touch.fbclid, 'QA-FBCLID-TEST');
  assert.equal(touch.landing, '/agencia-seo?utm_source=qa&utm_medium=test&utm_campaign=atribucion-qa&utm_content=v1&utm_term=prueba&gclid=QA-GCLID-TEST&fbclid=QA-FBCLID-TEST');
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
    captured: true, utm_source: '', gclid: 'x', fbclid: '', referrer: '',
  }), 'google');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', fbclid: 'y', referrer: '',
  }), 'facebook');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', fbclid: '', referrer: 'https://t.co/abc',
  }), 't.co');
  assert.equal(resolveAttributionSource({
    captured: true, utm_source: '', gclid: '', fbclid: '', referrer: '',
  }), DIRECT_SOURCE);
  assert.equal(resolveAttributionSource({
    captured: false, utm_source: '', gclid: '', fbclid: '', referrer: '',
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
    search: '?utm_source=qa&gclid=1',
    host: 'playfulagency.com',
  });
  const restored = deserializeAttributionCookie(serializeAttributionCookie(touch));
  assert.equal(restored?.utm_source, 'qa');
  assert.equal(restored?.gclid, '1');
  assert.equal(shouldCaptureAttributionPath('/api/contact'), false);
  assert.equal(shouldCaptureAttributionPath('/contactar-agencia-de-marketing-digital'), true);
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
