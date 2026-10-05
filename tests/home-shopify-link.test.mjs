import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../app/home-copy.ts', import.meta.url), 'utf8');
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

function heroFollowup(source) {
  const heroStart = source.indexOf('{/* Hero Section */}');
  assert.notEqual(heroStart, -1, 'missing home hero');
  const heroEnd = source.indexOf('</section>', heroStart);
  assert.notEqual(heroEnd, -1, 'missing home hero close');
  const followupEnd = source.indexOf('<MaterialServicesSection', heroEnd);
  assert.notEqual(followupEnd, -1, 'missing problemas section after hero followup');
  return {
    hero: source.slice(heroStart, heroEnd),
    followup: source.slice(heroEnd, followupEnd),
  };
}

test('home keeps one contextual Agencia Shopify anchor in the post-hero text module', () => {
  const { hero, followup } = heroFollowup(home);
  assert.match(copy, /Si la tienda de tu marca ya funciona en Shopify o el plan es migrar a Shopify/);
  assert.match(copy, /shopifyHref: '\/agencia-shopify'/);
  assert.match(copy, /shopifyAnchor: 'agencia Shopify'/);
  assert.doesNotMatch(hero, /HOME_HERO.shopifyHref/);
  assert.match(followup, /HOME_HERO.shopifyHref/);
  assert.match(followup, /HOME_HERO.shopifyAnchor/);
  assert.equal((followup.match(/HOME_HERO.shopifyHref/g) || []).length, 1);
  assert.match(
    followup,
    /<Link href=\{HOME_HERO.shopifyHref\} className="font-medium text-\[#440099\] underline">/,
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
