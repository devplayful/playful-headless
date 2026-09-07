import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { FAQ_ITEMS, SHOPIFY_META, HERO, CTA, SERVICES, buildFaqPageJsonLd } = await import(
  '../app/agencia-shopify/copy.ts'
);

const landing = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
const sitemap = readFileSync(new URL('../app/sitemap.xml/route.ts', import.meta.url), 'utf8');
const form = readFileSync(new URL('../components/ContactLeadForm.tsx', import.meta.url), 'utf8');

test('meta title, description and path match the signed v9 copy', () => {
  assert.equal(SHOPIFY_META.title, 'Agencia Shopify para marcas que ya venden | Playful Agency');
  assert.equal(
    SHOPIFY_META.description,
    'Agencia Shopify para marcas que ya venden: implementamos y migramos tu tienda para un checkout optimizado y mejor conversión. Agenda una llamada.',
  );
  assert.equal(SHOPIFY_META.path, '/agencia-shopify');
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

test('landing keeps one H1, signed CTAs, High Level form and empty illustration slots', () => {
  assert.equal((landing.match(/<h1\b/g) || []).length, 1);
  assert.match(landing, /{HERO\.h1}/);
  assert.match(landing, /submitLabel=\{CTA\.formButton\}/);
  assert.match(landing, /<ContactLeadForm/);
  assert.match(landing, /heading=\{null\}/);
  assert.equal(CTA.formButton, 'Agenda tu llamada de 30 a 40 minutos');
  assert.equal(HERO.cta, '¿Hablamos?');
  const contentSlots = SERVICES.items.filter((item) => item.slot);
  assert.equal(contentSlots.length, 5);
  assert.match(landing, /data-illustration-slot=\{id\}/);
  assert.doesNotMatch(landing, /Shopify Plus/i);
  assert.doesNotMatch(landing, /Cocina/i);
  assert.doesNotMatch(landing, /magnific/i);
});

test('sitemap lists the interior URL without a trailing slash', () => {
  assert.match(sitemap, /https:\/\/playfulagency\.com\/agencia-shopify</);
  assert.doesNotMatch(sitemap, /https:\/\/playfulagency\.com\/agencia-shopify\//);
});

test('signed copy never invents Plus, Cocina notes, surtido or prices', () => {
  const published = JSON.stringify({
    SHOPIFY_META,
    HERO,
    SERVICES,
    FAQ_ITEMS,
    CTA,
  });
  assert.doesNotMatch(published, /Shopify Plus/i);
  assert.doesNotMatch(published, /Cocina/);
  assert.doesNotMatch(published, /surtido/i);
  assert.doesNotMatch(published, /\$\d/);
});

test('shared High Level form still owns qualification and receipt recovery', () => {
  assert.match(form, /name="decisionRole"/);
  assert.match(form, /name="salesModel"/);
  assert.match(form, /name="monthlyRevenue"/);
  assert.match(form, /name="projectTiming"/);
  assert.match(form, /await submitRequest\('reconcile'\)/);
  assert.match(form, /Comprobar estado de la entrega/);
});
