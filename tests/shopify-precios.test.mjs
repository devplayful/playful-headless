import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  PRECIOS_META,
  CTA_LABEL,
  FAQ_ITEMS,
  HERO,
  HERO_SLOT,
  SERVICE_BOOKING_HREF,
  buildShopifyPreciosJsonLd,
  toInternalHref,
} = await import('../app/shopify-precios/copy.ts');
const { canonicalForPath } = await import('../utils/canonical.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

const landing = readFileSync(new URL('../app/shopify-precios/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../app/shopify-precios/copy.ts', import.meta.url), 'utf8');
const sitemap = buildSitemapXml();
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

test('meta title, description and path match the signed copy', () => {
  assert.equal(PRECIOS_META.title, 'Shopify precios y planes 2026 | Playful Agency');
  assert.equal(
    PRECIOS_META.description,
    'Shopify precios en España: planes, comisiones y el coste real de montar tu tienda. Reserva una reunión con Playful Agency.',
  );
  assert.equal(PRECIOS_META.path, '/shopify-precios');
  assert.equal(PRECIOS_META.dateModified, '2026-10-03');
});

test('canonical matches the rest of the interior landings', () => {
  assert.equal(canonicalForPath(PRECIOS_META.path), 'https://playfulagency.com/shopify-precios');
});

test('JSON-LD is WebPage + FAQPage without AggregateRating or Offer', () => {
  const jsonLd = buildShopifyPreciosJsonLd('https://playfulagency.com/shopify-precios');
  const serialized = JSON.stringify(jsonLd);
  assert.equal(jsonLd['@graph'].length, 2);
  assert.equal(jsonLd['@graph'][0]['@type'], 'WebPage');
  assert.equal(jsonLd['@graph'][0].dateModified, '2026-10-03');
  assert.equal(jsonLd['@graph'][0].name, 'Shopify precios y planes | Playful Agency');
  assert.equal(jsonLd['@graph'][1]['@type'], 'FAQPage');
  assert.equal(jsonLd['@graph'][1].mainEntity.length, 6);
  assert.deepEqual(
    jsonLd['@graph'][1].mainEntity.map((item) => item.name),
    FAQ_ITEMS.map((item) => item.question),
  );
  assert.deepEqual(
    jsonLd['@graph'][1].mainEntity.map((item) => item.acceptedAnswer.text),
    FAQ_ITEMS.map((item) => item.answer),
  );
  assert.doesNotMatch(serialized, /AggregateRating/);
  assert.doesNotMatch(serialized, /"@type":"Offer"/);
  assert.doesNotMatch(serialized, /"Offer"/);
});

test('landing keeps one H1 and booking CTAs on /reunion-playful', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 1);
  assert.match(landing, /\{HERO\.h1\}/);
  assert.equal(HERO.h1, 'Shopify precios: lo que cuesta de verdad tu tienda');
  assert.equal(CTA_LABEL, 'Reservar una reunión con Playful');
  assert.equal(SERVICE_BOOKING_HREF, '/reunion-playful');
  assert.match(landing, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.doesNotMatch(landing, /api\.playfulagency\.com\/widget\/bookings\/reunion-playful/);
  assert.doesNotMatch(copy, /href=\{BOOKING_HREF\}/);
});

test('hero uses the approved illustration with fixed size, priority and og:image', () => {
  assert.equal(HERO_SLOT.width, 552);
  assert.equal(HERO_SLOT.height, 360);
  assert.equal(HERO_SLOT.src1x, '/images/shopify-precios/hero@1x.png');
  assert.equal(HERO_SLOT.src2x, '/images/shopify-precios/hero@2x.png');
  assert.match(landing, /data-illustration-slot=\{HERO_SLOT\.id\}/);
  assert.match(landing, /aspectRatio: `\$\{HERO_SLOT\.width\} \/ \$\{HERO_SLOT\.height\}`/);
  assert.match(landing, /\/images\/heros\/shopify-precios-hero\.webp/);
  assert.match(landing, /\/images\/heros\/shopify-precios-og\.jpg/);
  assert.match(landing, /width=\{HERO_SLOT\.width\}/);
  assert.match(landing, /height=\{HERO_SLOT\.height\}/);
  assert.match(landing, /\spriority\b/);
  assert.match(landing, /twitter:/);
  assert.doesNotMatch(landing, /src=\{HERO_SLOT/);
  assert.doesNotMatch(landing, /\/images\/shopify-precios\/hero@1x\.png/);
});

test('sitemap and expected-routes include the dedicated Next route', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/shopify-precios</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/shopify-precios\//);
  assert.ok(expectedRoutes.sourceRoutes.includes('/shopify-precios'));
  assert.ok(expectedRoutes.criticalRoutes.includes('/shopify-precios'));
  assert.equal(expectedRoutes.governedConcreteRoutes['/[slug]'].includes('/shopify-precios'), false);
});

test('widget booking URLs rewrite to /reunion-playful', () => {
  assert.equal(
    toInternalHref('https://api.playfulagency.com/widget/bookings/reunion-playful'),
    '/reunion-playful',
  );
  assert.equal(
    toInternalHref('https://playfulagency.com/agencia-shopify'),
    '/agencia-shopify',
  );
});
