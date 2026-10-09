import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { WOOCOMMERCE_META, WOOCOMMERCE_COPY, CTA_LABEL, SERVICE_BOOKING_HREF } =
  await import('../app/agencia-woocommerce/copy.ts');
const { canonicalForPath } = await import('../utils/canonical.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');
const { buildAgencyLandingJsonLd } = await import('../lib/agency-copy-landing.ts');

const landing = readFileSync(new URL('../app/agencia-woocommerce/page.tsx', import.meta.url), 'utf8');
const copySource = readFileSync(new URL('../app/agencia-woocommerce/copy.ts', import.meta.url), 'utf8');
const sitemap = buildSitemapXml();
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

const H2S = [
  'Qué hacemos en tu tienda WooCommerce',
  'Mejora y mantenimiento de tu tienda WooCommerce',
  'Conectamos WooCommerce con tu inventario y tu facturación',
  '¿WordPress se te queda corto?',
  'Cobros en WooCommerce: Redsys y Bizum en España, pagos automáticos en Venezuela',
  'Casos publicados',
  'SEO para tu tienda WooCommerce',
  'Cómo trabajamos contigo',
  'Preguntas frecuentes sobre WooCommerce',
  'Hablemos de tu tienda WooCommerce',
];

test('meta title, description and path match the SEO-signed copy', () => {
  assert.equal(WOOCOMMERCE_META.title, 'Agencia WooCommerce: tienda y cobros | Playful Agency');
  assert.equal(
    WOOCOMMERCE_META.description,
    'Agencia WooCommerce para montar, conectar y mejorar tu tienda en WordPress, con Redsys y Bizum en España y pagos automáticos en Venezuela. Reserva reunión.',
  );
  assert.equal(WOOCOMMERCE_META.path, '/agencia-woocommerce');
  assert.equal(
    WOOCOMMERCE_COPY.hero.h1,
    'Agencia WooCommerce para montar, conectar y mejorar tu tienda online',
  );
});

test('canonical is the new SEO URL without a trailing slash', () => {
  assert.equal(canonicalForPath(WOOCOMMERCE_META.path), 'https://playfulagency.com/agencia-woocommerce');
});

test('JSON-LD is Service + BreadcrumbList + FAQPage with the seven signed questions', () => {
  const jsonLd = buildAgencyLandingJsonLd(WOOCOMMERCE_COPY, 'https://playfulagency.com/agencia-woocommerce');
  assert.deepEqual(
    jsonLd['@graph'].map((node) => node['@type']),
    ['Service', 'BreadcrumbList', 'FAQPage'],
  );
  assert.equal(jsonLd['@graph'][2].mainEntity.length, 7);
  assert.deepEqual(
    jsonLd['@graph'][2].mainEntity.map((item) => item.name),
    WOOCOMMERCE_COPY.faq.items.map((item) => item.question),
  );
});

test('H2s stay literal and the page never links the dead Venezuela payments URL', () => {
  assert.deepEqual(
    [...WOOCOMMERCE_COPY.sections.map((section) => section.h2), WOOCOMMERCE_COPY.process.h2, WOOCOMMERCE_COPY.faq.h2, WOOCOMMERCE_COPY.closing.h2],
    H2S,
  );
  const published = JSON.stringify(WOOCOMMERCE_COPY);
  assert.doesNotMatch(published, /pasarela-de-pagos-venezuela/);
  assert.doesNotMatch(copySource, /pasarela-de-pagos-venezuela/);
  assert.doesNotMatch(landing, /pasarela-de-pagos-venezuela/);
  assert.doesNotMatch(published, /Preguntas para José/);
  assert.doesNotMatch(published, /\[NO COMPROBADO/);
});

test('landing uses the agency template and booking hop', () => {
  const sharedLanding = readFileSync(
    new URL('../components/AgencyCopyLanding.tsx', import.meta.url),
    'utf8',
  );
  assert.match(landing, /AgencyCopyLanding/);
  assert.match(landing, /twitterFromOpenGraph/);
  assert.match(landing, /\/images\/heros\/agencia-woocommerce-og\.jpg/);
  assert.match(landing, /\/images\/heros\/agencia-woocommerce-hero\.webp/);
  assert.match(landing, /heroImage=/);
  assert.equal(CTA_LABEL, 'Reserva una reunión de 30 a 40 minutos');
  assert.equal(SERVICE_BOOKING_HREF, '/reunion-playful');
  assert.match(sharedLanding, /AgencyIllustrationSlot/);
  assert.match(sharedLanding, /BleedIllustrationCard/);
  assert.match(sharedLanding, /TwoColumnCtaSection/);
  assert.match(sharedLanding, /data-placeholder="PLACEHOLDER"/);
  assert.doesNotMatch(sharedLanding, /TestimonialsSection/);
  assert.doesNotMatch(sharedLanding, /BlogRelatedPostsSection/);
});

test('sitemap and expected-routes include the dedicated Next route', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-woocommerce</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-woocommerce\//);
  assert.ok(expectedRoutes.sourceRoutes.includes('/agencia-woocommerce'));
  assert.ok(expectedRoutes.criticalRoutes.includes('/agencia-woocommerce'));
  assert.equal(expectedRoutes.governedConcreteRoutes['/[slug]'].includes('/agencia-woocommerce'), false);
});
