import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ECOM_D6_APPEND,
  ECOM_D6_H3,
  ECOM_D6_ORIGINAL,
  ECOM_D7_APPEND,
  ECOM_D7_H3,
  ECOM_D7_ORIGINAL,
  ECOM_H2_JOSE,
  ECOM_H2_JOSE_COPY_ISSUE,
  ECOM_H2_LIVE,
  ECOM_H2_SIGNED,
  ECOM_HABLE_CLARO,
  ECOM_INTRO_HTML_380,
  ECOM_INTRO_PLACEHOLDER_ATTR,
  ECOM_VE_FAQ_ANSWER_HTML,
  ECOM_VE_FAQ_ANSWER_JSONLD,
  ECOM_VE_FAQ_QUESTION,
  ECOM_VE_FAQ_QUESTION_PREV,
  PENDIENTE_FIRMA_JOSE_380,
  SOYTECHNO_CASE_ANCHOR,
  applyJoseThenTanda6H2Order,
  isJoseH2Signed,
  rewriteEcommerceAeo2810,
} = await import('../utils/ecommerce-aeo-2810.ts');
const { SOYTECHNO_CASE_HREF } = await import('../utils/ecommerce-soytechno-case-link.ts');
const { getServiceFaqJsonLd } = await import('../utils/service-faq-jsonld.ts');
const {
  buildServiceLandingJsonLd,
  serializeServiceLandingJsonLd,
} = await import('../utils/service-landing-jsonld.ts');
const { PAGE_TITLE_OVERRIDES, PAGE_DESCRIPTION_OVERRIDES } = await import(
  '../utils/page-seo-overrides.mjs'
);

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);
const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const globalCss = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

const LIVE_H1 = 'Tu Agencia e-Commerce para Resultados Reales';
const LAST_FAQ =
  '¿Puedo trabajar con una agencia e-commerce si ya tengo una tienda en línea?';

const SAMPLE = `
<h1 class="elementor-heading-title">${LIVE_H1}</h1>
<h2 class="elementor-heading-title elementor-size-default">${ECOM_H2_LIVE}</h2>
<p>¿Buscas una Agencia e-Commerce que Hable Claro?</p>
<h3 class="elementor-image-box-title">SEO que Encuentra a tus Clientes</h3>
<p>No es magia, es estrategia. Trabajamos el SEO de tu e-commerce para que quienes buscan productos como los tuyos, te encuentren primero.</p>
<h3 class="elementor-image-box-title">Diseño que Vende (y Convence)</h3>
<p>¿Bonito y funcional? ¡Sí, se puede! Diseñamos una tienda visualmente atractiva que haga que tus clientes quieran añadir al carrito y no mirar atrás.</p>
<h2 class="main-heading">Marcas que han trabajado con nosotros</h2>
<div class="elementor-accordion-item">
  <div id="elementor-tab-title-1555" class="elementor-tab-title" data-tab="5">
    <a class="elementor-accordion-title">${LAST_FAQ}</a>
  </div>
  <div id="elementor-tab-content-1555" class="elementor-tab-content" data-tab="5"><p>Si ya tienes una tienda online.</p></div>
</div>
`;

test('rewrites the e-commerce H2, intro slot, FAQ and SoyTechno case on that slug only', () => {
  const rewritten = rewriteEcommerceAeo2810(SAMPLE, 'agencia-e-commerce');
  assert.match(rewritten, new RegExp(`<h1[^>]*>${LIVE_H1}</h1>`));
  assert.doesNotMatch(rewritten, new RegExp(`<h2[^>]*>${ECOM_H2_LIVE}</h2>`));
  assert.match(rewritten, new RegExp(`<h2[^>]*>${ECOM_H2_SIGNED}</h2>`));
  assert.ok(rewritten.includes(ECOM_INTRO_HTML_380));
  assert.ok(rewritten.includes(`data-pendiente-firma="${PENDIENTE_FIRMA_JOSE_380}"`));
  assert.ok(rewritten.includes(ECOM_VE_FAQ_ANSWER_HTML));
  assert.doesNotMatch(rewritten, /COPY SIN FIRMAR/);
  assert.match(rewritten, new RegExp(ECOM_VE_FAQ_QUESTION.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(
    rewritten,
    new RegExp(`<a href="${SOYTECHNO_CASE_HREF}">${SOYTECHNO_CASE_ANCHOR}</a>`),
  );
  assert.equal(rewriteEcommerceAeo2810(SAMPLE, 'agencia-seo'), SAMPLE);
  assert.equal(rewriteEcommerceAeo2810(rewritten, 'agencia-e-commerce'), rewritten);
});

test('appends D6 and D7 under their H3s when the live original is present', () => {
  const rewritten = rewriteEcommerceAeo2810(SAMPLE, 'agencia-e-commerce');
  assert.match(rewritten, new RegExp(ECOM_D6_H3.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(rewritten, new RegExp(ECOM_D7_H3.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.ok(rewritten.includes(`${ECOM_D6_ORIGINAL}${ECOM_D6_APPEND}`));
  assert.ok(rewritten.includes(`${ECOM_D7_ORIGINAL}${ECOM_D7_APPEND}`));
  assert.match(
    rewritten,
    /<a href="\/agencia-seo" data-pendiente-firma="PENDIENTE_FIRMA_JOSE_380">SEO para tu tienda online<\/a>/,
  );
  assert.match(
    rewritten,
    /<a href="\/agencia-ux-ui" data-pendiente-firma="PENDIENTE_FIRMA_JOSE_380">diseño UX\/UI de tu tienda<\/a>/,
  );
  assert.ok(rewritten.indexOf(ECOM_D6_H3) < rewritten.indexOf('SEO para tu tienda online'));
  assert.ok(rewritten.indexOf(ECOM_D7_H3) < rewritten.indexOf('diseño UX/UI de tu tienda'));
  assert.equal(rewriteEcommerceAeo2810(rewritten, 'agencia-e-commerce'), rewritten);
});

test('does not invent D6 or D7 when the live original is missing', () => {
  const missing = SAMPLE
    .replace(ECOM_D6_ORIGINAL, 'Otro párrafo de SEO.')
    .replace(ECOM_D7_ORIGINAL, 'Otro párrafo de diseño.');
  const rewritten = rewriteEcommerceAeo2810(missing, 'agencia-e-commerce');
  assert.doesNotMatch(rewritten, /SEO para tu tienda online/);
  assert.doesNotMatch(rewritten, /diseño UX\/UI de tu tienda/);
  assert.match(rewritten, /SEO que Encuentra a tus Clientes/);
  assert.match(rewritten, /Diseño que Vende \(y Convence\)/);
});

test('D6 can sit next to another /agencia-seo body link with a different anchor', () => {
  const html = SAMPLE.replace(
    '</h1>',
    '</h1><p>Lee nuestra <a href="/agencia-seo">agencia SEO</a>.</p>',
  );
  const rewritten = rewriteEcommerceAeo2810(html, 'agencia-e-commerce');
  assert.equal((rewritten.match(/href="\/agencia-seo"/g) || []).length, 2);
  assert.match(rewritten, /<a href="\/agencia-seo">agencia SEO<\/a>/);
  assert.match(
    rewritten,
    /<a href="\/agencia-seo" data-pendiente-firma="PENDIENTE_FIRMA_JOSE_380">SEO para tu tienda online<\/a>/,
  );
});

test('Service JSON-LD adds areaServed without LocalBusiness or address', () => {
  const jsonLd = buildServiceLandingJsonLd('agencia-e-commerce', 'desc');
  assert.equal(jsonLd.service['@type'], 'Service');
  assert.deepEqual(jsonLd.service.areaServed, [
    { '@type': 'Country', name: 'Venezuela' },
    { '@type': 'Country', name: 'España' },
    { '@type': 'Place', name: 'Latinoamérica' },
  ]);
  const serialized = serializeServiceLandingJsonLd(jsonLd.service);
  assert.doesNotMatch(serialized, /LocalBusiness/);
  assert.doesNotMatch(serialized, /"address"/);
  assert.doesNotMatch(serialized, /PostalAddress/);
});

test('FAQPage JSON-LD includes the Caracas/Venezuela question', () => {
  const faq = getServiceFaqJsonLd('agencia-e-commerce');
  assert.equal(faq.mainEntity.length, 6);
  const last = faq.mainEntity[5];
  assert.equal(
    last.name,
    '¿Puedo trabajar con Playful si mi marca está en Caracas o en otra ciudad de Venezuela?',
  );
  assert.equal(last.name, ECOM_VE_FAQ_QUESTION);
  assert.equal(last.acceptedAnswer.text, ECOM_VE_FAQ_ANSWER_JSONLD);
  assert.match(
    last.acceptedAnswer.text,
    /<a href="https:\/\/playfulagency\.com\/casos-de-exito\/soytechno-ecommerce-venezuela">el caso SoyTechno<\/a>/,
  );
  assert.equal(faq['@type'], 'FAQPage');
  assert.equal(faq['@context'], 'https://schema.org');
  JSON.parse(JSON.stringify(faq));
  assert.notEqual(last.name, ECOM_VE_FAQ_QUESTION_PREV);
});

test('accordion migrates the previous Caracas FAQ wording to the signed question', () => {
  const rewritten = rewriteEcommerceAeo2810(
    SAMPLE + ECOM_VE_FAQ_QUESTION_PREV,
    'agencia-e-commerce',
  );
  assert.match(rewritten, new RegExp(ECOM_VE_FAQ_QUESTION.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.doesNotMatch(
    rewritten,
    new RegExp(ECOM_VE_FAQ_QUESTION_PREV.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
});

test('José H2 from playful-copy #377 is prepared and stays unsigned', () => {
  assert.equal(ECOM_H2_JOSE, '');
  assert.equal(isJoseH2Signed(), false);
  assert.equal(ECOM_H2_JOSE_COPY_ISSUE, 'playful-copy#377');
  const current = rewriteEcommerceAeo2810(SAMPLE, 'agencia-e-commerce');
  assert.equal((current.match(new RegExp(`<h2[^>]*>${ECOM_H2_SIGNED}</h2>`, 'g')) || []).length, 1);
  assert.doesNotMatch(current, new RegExp(`<h2[^>]*>${ECOM_H2_LIVE}</h2>`));
  assert.match(current, new RegExp(ECOM_HABLE_CLARO.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  const fixture = '__JOSE_H2_FIXTURE_PLAYFUL_COPY_377__';
  const prepared = rewriteEcommerceAeo2810(SAMPLE, 'agencia-e-commerce', { joseH2: fixture });
  assert.ok(prepared.includes(`<h2 class="elementor-heading-title elementor-size-default">${fixture}</h2>`));
  assert.ok(prepared.indexOf(fixture) < prepared.indexOf(ECOM_H2_SIGNED));
  assert.ok(prepared.includes(ECOM_INTRO_HTML_380));
  assert.ok(prepared.indexOf(ECOM_INTRO_PLACEHOLDER_ATTR) < prepared.indexOf(ECOM_HABLE_CLARO));
  assert.ok(prepared.indexOf(ECOM_H2_SIGNED) < prepared.indexOf(ECOM_HABLE_CLARO));
  assert.doesNotMatch(prepared, new RegExp(`<h2[^>]*>${ECOM_H2_LIVE}</h2>`));
  assert.equal(applyJoseThenTanda6H2Order(SAMPLE, ''), SAMPLE);
  assert.doesNotMatch(current, /__JOSE_H2_FIXTURE_PLAYFUL_COPY_377__/);
});

test('landing rewriter does not invent the cintillos S3 phrase', () => {
  const rewritten = rewriteEcommerceAeo2810(SAMPLE, 'agencia-e-commerce');
  assert.doesNotMatch(rewritten, /diseño de tu tienda en Shopify/);
});

test('title, meta and H1 overrides stay untouched', () => {
  assert.equal(
    PAGE_TITLE_OVERRIDES['agencia-e-commerce'],
    'Agencia de ecommerce para marcas D2C | Playful',
  );
  assert.equal(
    PAGE_DESCRIPTION_OVERRIDES['agencia-e-commerce'],
    'Agencia de ecommerce para marcas que venden directo al consumidor: ordenamos tienda online, posicionamiento y diseño para vender más. Agenda tu llamada.',
  );
  assert.match(SAMPLE, new RegExp(LIVE_H1));
  assert.doesNotMatch(elementor, /yoast_wpseo_title/);
  assert.match(slugPage, /applyPageTitleOverride/);
});

test('getPageBySlug and Elementor compose the 28 oct rewriter; chrome stays out', () => {
  assert.match(wordpress, /rewriteEcommerceAeo2810\(/);
  assert.match(elementor, /rewriteEcommerceAeo2810\(/);
  assert.match(elementor, /rewriteEcommerceAeo2810\(\s*rewriteEcommerceZelleCover\(/);
  for (const source of [header, footer, layout, globalCss, middleware]) {
    assert.doesNotMatch(source, /rewriteEcommerceAeo2810/);
    assert.doesNotMatch(source, /COPY SIN FIRMAR/);
  }
});

