import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../lib/home-copy.ts', import.meta.url), 'utf8');
const b2b = readFileSync(new URL('../components/HomeB2BSections.tsx', import.meta.url), 'utf8');

test('home hero uses approved Ale 2910 copy from lib/home-copy', () => {
  assert.match(copy, /HOME_ANTETITULO/);
  assert.match(copy, /marcas de consumo en Shopify, WooCommerce, Medusa y apps móviles/);
  assert.match(copy, /HOME_TITLE/);
  assert.match(copy, /Tienda online de tu marca, a tiempo \| Playful Agency/);
  assert.match(copy, /HOME_META_DESCRIPTION/);
  assert.match(copy, /30 días de garantía\. Reserva una reunión\./);
  assert.match(home, /from '@\/lib\/home-copy'/);
  assert.match(home, /\{HOME_ANTETITULO\}/);
  assert.match(home, /\{HOME_H1\}/);
  assert.match(home, /\{HOME_SUBTITULO\}/);
  assert.match(home, /\{HOME_HERO_CTA_LABEL\}/);
  assert.match(home, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.doesNotMatch(home, /playful-h1[\s\S]*perdiendo dinero/);
});

test('home hero has no Shopify service link (body link lives in B2B sections)', () => {
  const hero = home.slice(home.indexOf('data-cta-section="hero"'), home.indexOf('CimaBreaker'));
  assert.doesNotMatch(hero, /href="\/agencia-shopify"/);
  assert.doesNotMatch(hero, /HOME_SHOPIFY/);
});

test('home pasarela VE anchor uses Zelle article until landing 404 is fixed', () => {
  assert.match(copy, /HOME_PASARELA_VE_HREF[\s\S]*zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce/);
  assert.match(b2b, /HOME_PASARELA_VE_HREF/);
  assert.match(b2b, /pasarela de pagos en Venezuela/);
  assert.match(b2b, /agencia Shopify/);
});
