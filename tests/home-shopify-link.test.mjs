import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const jumexOdwallaLink = readFileSync(
  new URL('../app/casos-de-exito/[slug]/ShopifyServiceLink.tsx', import.meta.url),
  'utf8',
);
const jumexOdwallaUtil = readFileSync(
  new URL('../utils/case-study-shopify-link.ts', import.meta.url),
  'utf8',
);

function heroBody(source) {
  const start = source.indexOf('Left Content');
  assert.notEqual(start, -1, 'missing home hero left column');
  const end = source.indexOf('Right Illustration Area', start);
  assert.notEqual(end, -1, 'missing home hero right column');
  return source.slice(start, end);
}

test('home hero body has one contextual Agencia Shopify anchor', () => {
  const body = heroBody(home);
  assert.match(body, /Si tu tienda ya corre en Shopify/);
  assert.match(body, /href="\/agencia-shopify"/);
  assert.match(body, />[\s\n]*Agencia Shopify[\s\n]*</);
  assert.equal((body.match(/href="\/agencia-shopify"/g) || []).length, 1);
  assert.match(
    body,
    /<a href="\/agencia-shopify" className="font-medium text-\[#440099\] underline">/,
  );
});

test('home shopify internado is not a nav or footer item', () => {
  assert.doesNotMatch(footer, /agencia-shopify/);
  assert.match(header, /title: 'Shopify', url: '\/agencia-shopify'/);
});

test('Jumex/Odwalla Agencia Shopify body anchors stay untouched', () => {
  assert.match(jumexOdwallaLink, /href=\{CASE_STUDY_SHOPIFY_HREF\}/);
  assert.match(jumexOdwallaLink, /\{CASE_STUDY_SHOPIFY_LABEL\}/);
  assert.match(jumexOdwallaUtil, /CASE_STUDY_SHOPIFY_HREF = '\/agencia-shopify'/);
  assert.match(jumexOdwallaUtil, /CASE_STUDY_SHOPIFY_LABEL = 'Agencia Shopify'/);
});
