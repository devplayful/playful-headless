import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { PASARELA_META, PASARELA_COPY, CTA_LABEL, SERVICE_BOOKING_HREF } =
  await import('../app/pasarela-de-pagos-venezuela/copy.ts');
const { canonicalForPath } = await import('../utils/canonical.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');
const { buildAgencyLandingJsonLd } = await import('../lib/agency-copy-landing.ts');

const landing = readFileSync(
  new URL('../app/pasarela-de-pagos-venezuela/page.tsx', import.meta.url),
  'utf8',
);
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);
const sitemap = buildSitemapXml();

const H2S = [
  'Qué es una pasarela de pagos en el e-commerce venezolano',
  'Qué necesita tu marca si ya vende en Venezuela',
  'Qué hace Playful y qué no',
  'Métodos de pago que integramos en e-commerce en Venezuela',
  'Moneda y liquidación en el checkout',
  'WooCommerce y Shopify cubren mercados distintos',
  'Preguntas frecuentes sobre pasarelas de pago en Venezuela',
  'Integra pagos en tu tienda con una reunión de diagnóstico',
];

test('meta title, description and path match Ale Propuesta (doc 6)', () => {
  assert.equal(PASARELA_META.title, 'Pasarela de pagos Venezuela para tu ecommerce | Playful');
  assert.equal(
    PASARELA_META.description,
    'Integramos en tu e-commerce los métodos de pago de Venezuela: SiTef, Instapago, Pago Móvil, Cashea, Banesco y Zelle. Reserva 30 a 40 minutos con Playful.',
  );
  assert.equal(PASARELA_META.path, '/pasarela-de-pagos-venezuela');
  assert.equal(
    PASARELA_COPY.hero.h1,
    'Pasarela de pagos en Venezuela: integra los cobros de tu e-commerce',
  );
});

test('JSON-LD is Service + BreadcrumbList + FAQPage with seven signed questions', () => {
  const jsonLd = buildAgencyLandingJsonLd(
    PASARELA_COPY,
    'https://playfulagency.com/pasarela-de-pagos-venezuela',
  );
  assert.deepEqual(
    jsonLd['@graph'].map((node) => node['@type']),
    ['Service', 'BreadcrumbList', 'FAQPage'],
  );
  assert.equal(jsonLd['@graph'][2].mainEntity.length, 7);
});

test('H2s stay literal and landing uses agency template', () => {
  assert.deepEqual(
    [
      ...PASARELA_COPY.sections.map((section) => section.h2),
      PASARELA_COPY.faq.h2,
      PASARELA_COPY.closing.h2,
    ],
    H2S,
  );
  assert.match(landing, /AgencyCopyLanding/);
  assert.equal(CTA_LABEL, 'Agenda tu reunión de diagnóstico');
  assert.equal(SERVICE_BOOKING_HREF, '/reunion');
});

test('sitemap and expected-routes include the dedicated Next route', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/pasarela-de-pagos-venezuela</);
  assert.ok(expectedRoutes.sourceRoutes.includes('/pasarela-de-pagos-venezuela'));
  assert.ok(expectedRoutes.criticalRoutes.includes('/pasarela-de-pagos-venezuela'));
  assert.equal(
    canonicalForPath(PASARELA_META.path),
    'https://playfulagency.com/pasarela-de-pagos-venezuela',
  );
});
