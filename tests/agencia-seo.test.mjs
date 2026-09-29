import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  FAQ_ITEMS,
  SEO_META,
  HERO,
  CTA,
  SERVICE_BOOKING_HREF,
  PROBLEM,
  POSITIONING,
  ADS,
  PLATFORMS,
  PROCESS,
  CASES,
  buildFaqPageJsonLd,
  stripMarkdownLinks,
} = await import('../app/agencia-seo/copy.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

const landing = readFileSync(new URL('../app/agencia-seo/page.tsx', import.meta.url), 'utf8');
const sitemap = buildSitemapXml();

test('meta title, description and path match the signed SEO copy', () => {
  assert.equal(SEO_META.title, 'Agencia SEO para ecommerce que ya vende | Playful Agency');
  assert.equal(
    SEO_META.description,
    'Agencia SEO para ecommerce D2C que ya vende y ya paga ads. Posicionamos tu catálogo para atraer clientes que compran, no solo visitas. Agenda tu llamada.',
  );
  assert.equal(SEO_META.path, '/agencia-seo');
});

test('H1 and hero body are the signed sentences', () => {
  assert.equal(
    HERO.h1,
    'Agencia SEO para ecommerce que posiciona el catálogo que ya te está vendiendo',
  );
  assert.match(HERO.body, /Somos la agencia SEO que trabaja el posicionamiento de tiendas D2C que ya venden/);
  assert.equal(HERO.cta, 'Agenda tu llamada diagnóstica');
  assert.equal(CTA.cta, 'Agenda tu llamada diagnóstica');
});

test('FAQPage JSON-LD uses the five signed questions and answers exactly', () => {
  const jsonLd = buildFaqPageJsonLd();
  assert.equal(jsonLd['@type'], 'FAQPage');
  assert.equal(jsonLd.mainEntity.length, 5);
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.name),
    FAQ_ITEMS.map((item) => item.question),
  );
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.acceptedAnswer.text),
    FAQ_ITEMS.map((item) => stripMarkdownLinks(item.answer)),
  );
});

test('landing keeps one H1, signed CTAs and shared closing sections', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 1);
  assert.match(landing, /\{HERO\.h1\}/);
  assert.match(landing, /TwoColumnCtaSection/);
  assert.match(landing, /buttonText=\{CTA\.cta\}/);
  assert.match(landing, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.doesNotMatch(landing, /ContactLeadForm/);
  assert.match(landing, /TestimonialsSection/);
  assert.match(landing, /BlogRelatedPostsSection/);
  assert.match(landing, /ServiceFaqAccordion/);
  assert.match(landing, /function PurpleBand/);
  assert.equal(POSITIONING.items.length, 4);
  assert.equal(PROBLEM.paragraphs.length, 3);
  assert.equal(ADS.paragraphs.length, 2);
  assert.equal(PLATFORMS.paragraphs.length, 2);
  assert.equal(PROCESS.steps.length, 4);
  assert.equal(CASES.items.length, 3);
});

test('sitemap lists the interior URL without a trailing slash', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-seo</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-seo\//);
});

test('signed copy never invents PrimeShoes, prospect meetings or unsigned metrics', () => {
  const published = JSON.stringify({
    SEO_META,
    HERO,
    PROBLEM,
    POSITIONING,
    ADS,
    PLATFORMS,
    PROCESS,
    CASES,
    FAQ_ITEMS,
    CTA,
  });
  assert.doesNotMatch(published, /PrimeShoes/i);
  assert.doesNotMatch(published, /prospecto de Erika/i);
  assert.doesNotMatch(published, /Samsung/);
  assert.doesNotMatch(landing, /PrimeShoes/i);
});

test('primary SEO CTAs book via /reunion-playful', () => {
  assert.equal(SERVICE_BOOKING_HREF, '/reunion-playful');
  assert.match(landing, /href = SERVICE_BOOKING_HREF/);
  assert.match(landing, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(HERO.cta, /Agenda tu llamada/i);
  assert.match(CTA.cta, /Agenda tu llamada/i);
});
