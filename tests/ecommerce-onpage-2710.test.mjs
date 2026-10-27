import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ECOMMERCE_ONPAGE_SLUG,
  ECOMMERCE_H1_BEFORE,
  ECOMMERCE_H1_AFTER,
  ECOMMERCE_FIRST_H2_BEFORE,
  ECOMMERCE_FIRST_H2_AFTER,
  ECOMMERCE_H2_ANSWER_HOLE,
  ECOMMERCE_JUMEX_CASE_HREF,
  ECOMMERCE_ODWALLA_CASE_HREF,
  ECOMMERCE_JUMEX_CASE_ANCHOR,
  ECOMMERCE_ODWALLA_CASE_ANCHOR,
  rewriteEcommerceOnpage2710,
} = await import('../utils/ecommerce-onpage-2710.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

const SAMPLE = [
  `<h1 class="elementor-heading-title elementor-size-default">${ECOMMERCE_H1_BEFORE}</h1>`,
  `<h2 class="elementor-heading-title elementor-size-default">${ECOMMERCE_FIRST_H2_BEFORE}</h2>`,
  '<p>Intro de la landing.</p>',
  '<h2 class="main-heading">Marcas que han trabajado con nosotros</h2>',
  '<div class="sub-heading">Nuestros clientes han logrado resultados.</div>',
].join('');

test('rewrites H1, first H2 and case anchors only on agencia-e-commerce', () => {
  const rewritten = rewriteEcommerceOnpage2710(SAMPLE, ECOMMERCE_ONPAGE_SLUG);
  assert.match(rewritten, new RegExp(`<h1[^>]*>${ECOMMERCE_H1_AFTER}</h1>`));
  assert.doesNotMatch(rewritten, new RegExp(ECOMMERCE_H1_BEFORE));
  assert.match(rewritten, new RegExp(`<h2[^>]*>${ECOMMERCE_FIRST_H2_AFTER.replace(/[?]/g, '\\?')}</h2>`));
  assert.doesNotMatch(rewritten, new RegExp(`>${ECOMMERCE_FIRST_H2_BEFORE}<`));
  assert.match(rewritten, new RegExp(ECOMMERCE_H2_ANSWER_HOLE.replace(/[?]/g, '\\?')));
  assert.match(
    rewritten,
    new RegExp(`<a href="${ECOMMERCE_JUMEX_CASE_HREF}">${ECOMMERCE_JUMEX_CASE_ANCHOR}</a>`),
  );
  assert.match(
    rewritten,
    new RegExp(`<a href="${ECOMMERCE_ODWALLA_CASE_HREF}">${ECOMMERCE_ODWALLA_CASE_ANCHOR}</a>`),
  );
});

test('is a no-op on other service slugs', () => {
  for (const slug of ['agencia-seo', 'agencia-sem', 'agencia-diseno-web', 'agencia-shopify']) {
    assert.equal(rewriteEcommerceOnpage2710(SAMPLE, slug), SAMPLE);
  }
});

test('is idempotent on the e-commerce slug', () => {
  const once = rewriteEcommerceOnpage2710(SAMPLE, ECOMMERCE_ONPAGE_SLUG);
  const twice = rewriteEcommerceOnpage2710(once, ECOMMERCE_ONPAGE_SLUG);
  assert.equal(twice, once);
  assert.equal((twice.match(/data-playful-ecom-case-links/g) || []).length, 1);
  assert.equal((twice.match(/data-playful-copy-hole="ecom-h2-answer"/g) || []).length, 1);
});

test('inserts case links after the visible results heading when restoreOldBodyCopy already ran', () => {
  const html =
    '<h2 class="main-heading playful-wp-hidden-heading">Marcas que han trabajado con nosotros</h2>' +
    '<h2 class="main-heading">No confíes solo en nuestra palabra, mira los resultados</h2>' +
    '<div class="sub-heading">Nuestros clientes.</div>';
  const rewritten = rewriteEcommerceOnpage2710(html, ECOMMERCE_ONPAGE_SLUG);
  assert.match(
    rewritten,
    /mira los resultados<\/h2><p data-playful-ecom-case-links="2710">/,
  );
  assert.equal((rewritten.match(/caso Jumex en Shopify/g) || []).length, 1);
});

test('getPageBySlug and Elementor compose the on-page rewriter', () => {
  assert.match(wordpress, /rewriteEcommerceOnpage2710\(/);
  assert.match(elementor, /rewriteEcommerceOnpage2710\(/);
});

test('header, footer and root layout stay out of the rewriter', () => {
  assert.doesNotMatch(header, /rewriteEcommerceOnpage2710/);
  assert.doesNotMatch(footer, /rewriteEcommerceOnpage2710/);
  assert.doesNotMatch(layout, /rewriteEcommerceOnpage2710/);
  assert.doesNotMatch(header, /caso Jumex en Shopify/);
  assert.doesNotMatch(footer, /caso Jumex en Shopify/);
});
