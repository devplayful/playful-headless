import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  PAGE_META,
  FAQ_ITEMS,
  HERO,
  CTA,
  SITEF_BLOCK,
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
  assert.match(landing, /href=\{SERVICE_BOOKING_HREF\}/);
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

test('SiTef signed block is the only SiTef heading and drops the old E-SiTef H3', () => {
  assert.equal(SITEF_BLOCK.h2, 'Cómo integrar SiTef en tu tienda online en Venezuela');
  assert.equal(SITEF_BLOCK.paragraphs.length, 6);
  assert.match(SITEF_BLOCK.paragraphs[0], /E-Sitef Botón de Pago/);
  assert.match(SITEF_BLOCK.paragraphs[5], /En Playful integramos SiTef en tiendas WooCommerce/);
  assert.equal(SITEF_BLOCK.closeLinkLabel, 'Cashea para comercios');
  assert.equal(SITEF_BLOCK.closeHref, '/blog/tecnologia/cashea-para-comercios');
  assert.equal((landing.match(/SITEF_BLOCK\.h2/g) || []).length, 1);
  assert.doesNotMatch(landing, /E-SiTef \(SiTef de Venezuela\)/);
  const copySource = readFileSync(
    new URL('../app/pasarela-de-pagos-venezuela/copy.ts', import.meta.url),
    'utf8',
  );
  assert.equal((copySource.match(/Cómo integrar SiTef en tu tienda online en Venezuela/g) || []).length, 1);
  assert.doesNotMatch(copySource, /E-SiTef \(SiTef de Venezuela\)/);
  assert.doesNotMatch(copySource, /PrimeShoes/i);
  assert.doesNotMatch(copySource, /calzado/i);
  assert.doesNotMatch(landing, /PrimeShoes/i);
  assert.doesNotMatch(landing, /calzado/i);
});

test('sitemap includes /pasarela-de-pagos-venezuela without trailing slash', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/pasarela-de-pagos-venezuela</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/pasarela-de-pagos-venezuela\//);
});
