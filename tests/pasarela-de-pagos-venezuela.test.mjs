import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  PAGE_META,
  FAQ_ITEMS,
  HERO,
  CTA,
  BOOKING_HREF,
  CONTACT_HREF,
  buildFaqPageJsonLd,
} = await import('../app/pasarela-de-pagos-venezuela/copy.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

const landing = readFileSync(
  new URL('../app/pasarela-de-pagos-venezuela/page.tsx', import.meta.url),
  'utf8',
);
const sitemap = buildSitemapXml();

test('meta title, description and path match signed copy', () => {
  assert.equal(PAGE_META.title, 'Pasarela de Pago funcional para tu E-commerce | Playful Agency');
  assert.equal(
    PAGE_META.description,
    '¿Eres dueño de un E-commerce con empresa constituida? Crea/Optimiza tus métodos de pago online con Playful Agency ¡Mejora la experiencia del cliente!',
  );
  assert.equal(PAGE_META.path, '/pasarela-de-pagos-venezuela');
});

test('FAQPage JSON-LD uses the five signed questions and answers exactly', () => {
  const jsonLd = buildFaqPageJsonLd();
  assert.equal(jsonLd['@type'], 'FAQPage');
  assert.equal(jsonLd.mainEntity.length, 5);
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.name),
    FAQ_ITEMS.map((item) => item.question),
  );
});

test('landing keeps one H1, booking CTAs, live shared sections and no embedded form', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 1);
  assert.match(landing, /{HERO\.h1}/);
  assert.match(landing, /styles\.bannerGrid/);
  assert.match(landing, /{CTA\.cta}/);
  assert.match(landing, /href=\{BOOKING_HREF\}/);
  assert.match(landing, /href=\{CONTACT_HREF\}/);
  assert.doesNotMatch(landing, /ContactLeadForm/);
  assert.doesNotMatch(landing, /forminator/i);
  assert.doesNotMatch(landing, /TwoColumnCtaSection/);
  assert.match(landing, /TestimonialsSection/);
  assert.match(landing, /CaseStudyCard/);
  assert.match(landing, /BlogRelatedPostsSection/);
  assert.match(landing, /PasarelaFaqAccordion/);
  assert.match(landing, /hero-sofa@2x\.png/);
  assert.match(landing, /beneficio-integracion@2x\.png/);
  assert.equal(HERO.cta, 'Agendar Reunión con Playful');
  assert.equal(CTA.cta, 'Agendar Reunión con Playful');
});

test('sitemap includes /pasarela-de-pagos-venezuela without trailing slash', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/pasarela-de-pagos-venezuela</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/pasarela-de-pagos-venezuela\//);
});
