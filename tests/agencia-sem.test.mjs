import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  FAQ_ITEMS,
  SEM_META,
  HERO,
  CTA,
  SERVICE_BOOKING_HREF,
  SECTIONS,
  PROCESS,
  CASES,
  buildFaqPageJsonLd,
  stripMarkdownLinks,
} = await import('../app/agencia-sem/copy.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

const landing = readFileSync(new URL('../app/agencia-sem/page.tsx', import.meta.url), 'utf8');
const sitemap = buildSitemapXml();

test('meta title, description and path match the signed SEM copy', () => {
  assert.equal(SEM_META.title, 'Agencia SEM para ecommerce que ya invierte en ads | Playful Agency');
  assert.equal(
    SEM_META.description,
    'Agencia SEM para D2C que ya gasta en Shopping, PMax y feed. Optimizamos paid de tienda con control de CAC y margen. Agenda tu llamada.',
  );
  assert.equal(SEM_META.path, '/agencia-sem');
});

test('H1 and hero body are the signed sentences', () => {
  assert.equal(HERO.h1, 'SEM para ecommerce: Shopping y paid search con control de margen');
  assert.match(HERO.body, /Shopping, Performance Max y búsqueda/);
  assert.equal(HERO.cta, 'Agenda tu llamada');
  assert.equal(CTA.cta, 'Agenda tu llamada');
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
  assert.equal(SECTIONS.items.length, 4);
  assert.equal(CASES.items.length, 3);
  assert.match(PROCESS.body, /Merchant Center/);
});

test('sitemap lists the interior URL without a trailing slash', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-sem</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-sem\//);
});

test('signed copy never invents PrimeShoes, prospect meetings or unsigned metrics', () => {
  const published = JSON.stringify({
    SEM_META,
    HERO,
    SECTIONS,
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

test('primary SEM CTAs book via /reunion-playful', () => {
  assert.equal(SERVICE_BOOKING_HREF, '/reunion-playful');
  assert.match(landing, /href = SERVICE_BOOKING_HREF/);
  assert.match(landing, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.equal(HERO.cta, 'Agenda tu llamada');
});
