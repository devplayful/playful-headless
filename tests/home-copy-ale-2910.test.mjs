import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../lib/home-copy.ts', import.meta.url), 'utf8');

test('home hero uses approved Ale 2910 copy from lib/home-copy', () => {
  assert.match(copy, /HOME_ANTETITULO/);
  assert.match(copy, /marcas de consumo en Shopify, WooCommerce, Medusa y apps móviles/);
  assert.match(home, /from '@\/lib\/home-copy'/);
  assert.match(home, /\{HOME_ANTETITULO\}/);
  assert.match(home, /\{HOME_H1\}/);
  assert.match(home, /\{HOME_SUBTITULO\}/);
  assert.match(home, /\{HOME_HERO_CTA_LABEL\}/);
  assert.match(home, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.doesNotMatch(home, /playful-h1[\s\S]*perdiendo dinero/);
  assert.doesNotMatch(home, /agencia-shopify/);
});

test('home body has no Shopify service link to rename (production link is header-only)', () => {
  const hero = home.slice(home.indexOf('data-cta-section="hero"'), home.indexOf('CimaBreaker'));
  assert.doesNotMatch(hero, /href="\/agencia-shopify"/);
  assert.doesNotMatch(hero, /HOME_SHOPIFY/);
});
