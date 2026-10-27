import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const LP_PATHS = [
  '/lp/calentamiento',
  '/lp/integraciones-pasarela-erp',
  '/lp/propuesta-ecommerce',
];

const sharedPage = readFileSync(new URL('../app/lp/_components/AdsWarmLandingPage.tsx', import.meta.url), 'utf8');
const nextConfig = readFileSync(new URL('../next.config.js', import.meta.url), 'utf8');
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);
const sitemap = readFileSync(new URL('../utils/apex-sitemap.ts', import.meta.url), 'utf8');
const headerNav = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');

test('ads warm landings use /reunion-playful and shared attribution propagator', () => {
  const finalCta = readFileSync(new URL('../app/lp/_components/AdsFinalCta.tsx', import.meta.url), 'utf8');
  assert.match(finalCta, /SERVICE_BOOKING_HREF/);
  assert.match(finalCta, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.doesNotMatch(sharedPage, /widget\/bookings\/reunion-playful/);
  assert.doesNotMatch(finalCta, /widget\/bookings\/reunion-playful/);
});

test('ads warm landings use LP-owned cards, FAQ and CTA (no nested button / double h2)', () => {
  assert.match(sharedPage, /AdsCaseCard/);
  assert.match(sharedPage, /AdsFaq/);
  assert.match(sharedPage, /AdsFinalCta/);
  assert.match(sharedPage, /AdsHeroArt/);
  assert.doesNotMatch(sharedPage, /CaseStudyCard/);
  assert.doesNotMatch(sharedPage, /TwoColumnCtaSection/);
  assert.doesNotMatch(sharedPage, /ServiceFaqAccordion/);
  const caseCard = readFileSync(new URL('../app/lp/_components/AdsCaseCard.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(caseCard, /<button/);
  const finalCta = readFileSync(new URL('../app/lp/_components/AdsFinalCta.tsx', import.meta.url), 'utf8');
  assert.equal([...finalCta.matchAll(/<h2/g)].length, 1);
});

test('ads warm landings are noindex in layout and next headers', () => {
  const layout = readFileSync(new URL('../app/lp/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.match(nextConfig, /source: '\/lp\/:path\*'/);
});

test('ads warm landings mount VisitaCalificada only in /lp layout', () => {
  const layout = readFileSync(new URL('../app/lp/layout.tsx', import.meta.url), 'utf8');
  const root = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const finalCta = readFileSync(new URL('../app/lp/_components/AdsFinalCta.tsx', import.meta.url), 'utf8');
  assert.match(layout, /VisitaCalificadaTracker/);
  assert.doesNotMatch(root, /VisitaCalificadaTracker/);
  assert.match(finalCta, /data-cta="lp-meta-final"/);
});

test('ads warm routes are registered and excluded from sitemap and header nav', () => {
  for (const path of LP_PATHS) {
    assert.ok(expectedRoutes.sourceRoutes.includes(path), `${path} in expected-routes`);
    assert.doesNotMatch(sitemap, new RegExp(path.replace(/\//g, '\\/')));
    assert.doesNotMatch(headerNav, new RegExp(path.replace(/\//g, '\\/')));
  }
});

test('integraciones copy notes require integrar + pasarela de pago in H1 brief', () => {
  const copy = readFileSync(
    new URL('../app/lp/integraciones-pasarela-erp/copy.ts', import.meta.url),
    'utf8',
  );
  assert.match(copy, /integrar/i);
  assert.match(copy, /pasarela de pago/i);
});

test('propuesta copy forbids invented pricing in FAQ note', () => {
  const copy = readFileSync(new URL('../app/lp/propuesta-ecommerce/copy.ts', import.meta.url), 'utf8');
  assert.match(copy, /PROHIBIDO/i);
  assert.match(copy, /cifras/i);
});

test('content notes use #453A53 so they pass contrast on #E9D7FF cards', () => {
  const placeholders = readFileSync(new URL('../app/lp/_lib/placeholders.tsx', import.meta.url), 'utf8');
  assert.match(placeholders, /text-\[#453A53\]/);
  assert.doesNotMatch(placeholders, /text-\[#6B6570\]/);
});

test('case proof includes Jumex, Odwalla and SoyTechno slugs', () => {
  const cases = readFileSync(new URL('../app/lp/_lib/ads-landing-cases.ts', import.meta.url), 'utf8');
  assert.match(cases, /jumex-shopify-dtc-ecommerce/);
  assert.match(cases, /odwalla-shopify-dtc-ecommerce/);
  assert.match(cases, /soytechno-ecommerce-venezuela/);
});
