import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  DISENO_META,
  HERO,
  CTA,
  FAQ_ITEMS,
  AUDIENCE,
  SCREENS,
  PLATFORMS,
  CRO,
  PROCESS,
  CASES,
  BOOKING_HREF,
  buildFaqPageJsonLd,
} = await import('../app/agencia-diseno-web/copy.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

const landing = readFileSync(new URL('../app/agencia-diseno-web/page.tsx', import.meta.url), 'utf8');
const copySource = readFileSync(new URL('../app/agencia-diseno-web/copy.ts', import.meta.url), 'utf8');
const sitemap = buildSitemapXml();
const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

const published = JSON.stringify({
  DISENO_META,
  HERO,
  CTA,
  FAQ_ITEMS,
  AUDIENCE,
  SCREENS,
  PLATFORMS,
  CRO,
  PROCESS,
  CASES,
});

test('title, meta and H1 stay on the production strings', () => {
  assert.equal(DISENO_META.title, 'Agencia Diseño Web Personalizamos tu Web | Playful Agency');
  assert.equal(
    DISENO_META.description,
    'Activa tu presencia en línea con una agencia diseño web que dé vida a tu marca. En Playful Agency, creamos ese sitio web.',
  );
  assert.equal(DISENO_META.path, '/agencia-diseno-web');
  assert.equal(HERO.h1, 'Agencia de diseño web: Dando vida a tu visión en línea');
  assert.doesNotMatch(published, /Diseño de tienda online que convierte el tráfico que ya pagas/);
  assert.doesNotMatch(published, /Diseño de tienda online para ecommerce que ya vende/);
  assert.doesNotMatch(published, /para D2C que ya factura/);
});

test('signed body copy is pasted without pending marks or caps', () => {
  assert.match(HERO.body, /página de lista de productos \(PLP\)/);
  assert.match(SCREENS.items[2].body, /Instapago, SITEF, Banesco Panamá, Cashea/);
  assert.match(SCREENS.items[2].body, /en WooCommerce podemos implementar/);
  assert.match(PROCESS.intro, /Las propuestas visuales forman parte del trabajo/);
  assert.match(FAQ_ITEMS[3].answer, /cada proyecto tiene 30 días de garantía después del lanzamiento/);
  assert.match(PLATFORMS.items[1].body, /SoyTechno/);
  assert.doesNotMatch(published, /PENDIENTE/);
  assert.doesNotMatch(copySource, /PENDIENTE/);
  assert.doesNotMatch(landing, /PENDIENTE/);
  assert.doesNotMatch(published, /\[[A-ZÁÉÍÓÚÑÜ][^\]\n]{8,}\](?!\()/);
  assert.doesNotMatch(copySource, /\[[A-ZÁÉÍÓÚÑÜ][^\]\n]{8,}\](?!\()/);
  assert.doesNotMatch(landing, /\[[A-ZÁÉÍÓÚÑÜ][^\]\n]{8,}\](?!\()/);
});

test('FAQPage JSON-LD uses the seven signed questions and answers exactly', () => {
  const jsonLd = buildFaqPageJsonLd();
  assert.equal(jsonLd['@type'], 'FAQPage');
  assert.equal(jsonLd.mainEntity.length, 7);
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.name),
    FAQ_ITEMS.map((item) => item.question),
  );
  assert.deepEqual(
    jsonLd.mainEntity.map((item) => item.acceptedAnswer.text),
    FAQ_ITEMS.map((item) => item.answer),
  );
});

test('landing keeps one H1, signed CTAs and the copy.ts pattern', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 1);
  assert.match(landing, /\{HERO\.h1\}/);
  assert.match(landing, /\{CTA\.h2\}/);
  assert.equal(HERO.cta, 'Agenda tu llamada diagnóstica');
  assert.equal(CTA.cta, 'Agenda tu llamada diagnóstica');
  assert.match(landing, /href = BOOKING_HREF/);
  assert.match(landing, /ServiceFaqAccordion/);
  assert.match(landing, /TestimonialsSection/);
  assert.match(landing, /BlogRelatedPostsSection/);
  assert.doesNotMatch(landing, /ContactLeadForm/);
  assert.doesNotMatch(slugPage, /'agencia-diseno-web'/);
});

test('sitemap and route manifest treat the landing as its own source', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-diseno-web</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-diseno-web\//);
  assert.ok(expectedRoutes.sourceRoutes.includes('/agencia-diseno-web'));
  assert.ok(expectedRoutes.criticalRoutes.includes('/agencia-diseno-web'));
  assert.ok(!expectedRoutes.governedConcreteRoutes['/[slug]'].includes('/agencia-diseno-web'));
});

test('primary CTAs book the GHL reunion widget', () => {
  assert.equal(
    BOOKING_HREF,
    'https://api.playfulagency.com/widget/bookings/reunion-playful',
  );
  assert.match(HERO.cta, /Agenda tu llamada diagnóstica/);
  assert.match(CTA.cta, /Agenda tu llamada diagnóstica/);
});
