import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { PRESTASHOP_META, PRESTASHOP_COPY, CTA_LABEL, SERVICE_BOOKING_HREF } =
  await import('../app/agencia-prestashop/copy.ts');
const { canonicalForPath } = await import('../utils/canonical.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');
const { buildAgencyLandingJsonLd, toInternalHref } = await import(
  '../lib/agency-copy-landing.ts'
);

const landing = readFileSync(new URL('../app/agencia-prestashop/page.tsx', import.meta.url), 'utf8');
const copySource = readFileSync(new URL('../app/agencia-prestashop/copy.ts', import.meta.url), 'utf8');
const sharedLanding = readFileSync(
  new URL('../components/AgencyCopyLanding.tsx', import.meta.url),
  'utf8',
);
const sitemap = buildSitemapXml();
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

const H2S = [
  'Qué hacemos en tu tienda PrestaShop',
  'Catálogo, fichas y un backoffice fácil de administrar',
  'SEO para tiendas PrestaShop',
  'Mantenimiento de tu tienda PrestaShop',
  'Cobros en PrestaShop con Redsys y Bizum',
  'Si PrestaShop se te queda corto, migramos tu tienda a Shopify',
  'Casos publicados',
  'Cómo trabajamos contigo',
  'Preguntas frecuentes sobre PrestaShop',
  'Hablemos de tu tienda PrestaShop',
];

test('meta title, description and path match the signed copy', () => {
  assert.equal(PRESTASHOP_META.title, 'Agencia PrestaShop: tienda, SEO y migración | Playful Agency');
  assert.equal(
    PRESTASHOP_META.description,
    'Agencia PrestaShop para tu tienda online: catálogo, fichas, SEO y cobros con un solo equipo, y migración a Shopify si la necesitas. Reserva tu reunión.',
  );
  assert.equal(PRESTASHOP_META.path, '/agencia-prestashop');
  assert.equal(PRESTASHOP_COPY.hero.h1, 'Agencia PrestaShop para tu tienda online: catálogo, SEO y cobros');
});

test('canonical stays on the existing slug without a trailing slash', () => {
  assert.equal(canonicalForPath(PRESTASHOP_META.path), 'https://playfulagency.com/agencia-prestashop');
});

test('JSON-LD is Service + BreadcrumbList + FAQPage with the eight signed questions', () => {
  const jsonLd = buildAgencyLandingJsonLd(PRESTASHOP_COPY, 'https://playfulagency.com/agencia-prestashop');
  assert.deepEqual(
    jsonLd['@graph'].map((node) => node['@type']),
    ['Service', 'BreadcrumbList', 'FAQPage'],
  );
  assert.equal(jsonLd['@graph'][2].mainEntity.length, 8);
  assert.deepEqual(
    jsonLd['@graph'][2].mainEntity.map((item) => item.name),
    PRESTASHOP_COPY.faq.items.map((item) => item.question),
  );
  assert.deepEqual(
    jsonLd['@graph'][2].mainEntity.map((item) => item.acceptedAnswer.text),
    PRESTASHOP_COPY.faq.items.map((item) => item.answer),
  );
});

test('H2s and unchecked marks stay literal', () => {
  assert.deepEqual(
    [...PRESTASHOP_COPY.sections.map((section) => section.h2), PRESTASHOP_COPY.process.h2, PRESTASHOP_COPY.faq.h2, PRESTASHOP_COPY.closing.h2],
    H2S,
  );
  const published = JSON.stringify(PRESTASHOP_COPY);
  assert.match(published, /\[NO COMPROBADO: ¿ofrecemos el mantenimiento de PrestaShop/);
  assert.match(published, /\[NO COMPROBADO: ¿hemos integrado nosotros la pasarela de Redsys/);
  assert.match(published, /\[NO COMPROBADO: ¿qué proyectos PrestaShop podemos citar\?\]/);
  assert.doesNotMatch(published, /Preguntas para José/);
  assert.doesNotMatch(published, /pasarela-de-pagos-venezuela/);
});

test('landing uses the agency template, booking hop and generic og image', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 0);
  assert.match(landing, /AgencyCopyLanding/);
  assert.match(landing, /twitterFromOpenGraph/);
  assert.match(landing, /SITE_OG_IMAGE/);
  assert.match(sharedLanding, /ServiceFaqAccordion/);
  assert.match(sharedLanding, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.equal(CTA_LABEL, 'Reserva una reunión de 30 a 40 minutos');
  assert.equal(SERVICE_BOOKING_HREF, '/reunion-playful');
  assert.doesNotMatch(copySource, /pasarela-de-pagos-venezuela/);
  assert.doesNotMatch(sharedLanding, /pasarela-de-pagos-venezuela/);
});

test('sitemap and expected-routes include the dedicated Next route', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-prestashop</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-prestashop\//);
  assert.ok(expectedRoutes.sourceRoutes.includes('/agencia-prestashop'));
  assert.ok(expectedRoutes.criticalRoutes.includes('/agencia-prestashop'));
  assert.equal(expectedRoutes.governedConcreteRoutes['/[slug]'].includes('/agencia-prestashop'), false);
});

test('widget booking URLs rewrite to /reunion-playful', () => {
  assert.equal(
    toInternalHref('https://api.playfulagency.com/widget/bookings/reunion-playful'),
    '/reunion-playful',
  );
});
