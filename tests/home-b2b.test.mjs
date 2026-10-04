import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../app/home-copy.ts', import.meta.url), 'utf8');
const problemas = readFileSync(new URL('../components/MaterialServicesSection.tsx', import.meta.url), 'utf8');
const metodo = readFileSync(new URL('../components/SolucionesPlayful.tsx', import.meta.url), 'utf8');

test('home keeps organization JSON-LD and trailing-slash canonical', () => {
  assert.equal((home.match(/id="playful-organization"/g) || []).length, 1);
  assert.match(home, /__html: ORGANIZATION_JSON_LD/);
  assert.match(home, /rel="canonical" href=\{HOME_CANONICAL\}/);
});

test('home has a single visible h1 and antetitulo is not a heading', () => {
  assert.match(home, /<h1 className="playful-h1">/);
  assert.equal((home.match(/<h1\b/g) || []).length, 1);
  assert.match(home, /<p className="playful-miga-pan">\{HOME_HERO.antetitulo\}<\/p>/);
  assert.doesNotMatch(home, /<(h[1-6])[^>]*>\{HOME_HERO.antetitulo\}/);
});

test('home booking CTAs use /reunion-playful, not the GHL widget', () => {
  assert.match(copy, /ctaHref: SERVICE_BOOKING_HREF/);
  assert.doesNotMatch(copy, /api\.playfulagency\.com\/widget\/bookings\/reunion-playful/);
  assert.match(problemas, /HOME_PROBLEMAS.ctaHref/);
  assert.match(metodo, /HOME_METODO.ctaHref/);
  assert.match(home, /HOME_HERO.ctaHref/);
  assert.match(home, /HOME_CTA_FINAL.ctaHref/);
});

test('home keeps the /agencia-shopify internado', () => {
  assert.match(copy, /shopifyHref: '\/agencia-shopify'/);
  assert.match(home, /HOME_HERO.shopifyHref/);
});

test('home title, meta and H1 come from the B2B piece', () => {
  assert.match(copy, /Playful Agency: tienda online de marca en Shopify y WooCommerce/);
  assert.match(copy, /La tienda online de tu marca, entregada a tiempo y conectada a tu operación/);
  assert.match(home, /title: HOME_META.title/);
  assert.match(home, /description: HOME_META.description/);
});

test('home keeps the next\/image hero and the case carousel', () => {
  assert.match(home, /from ['"]next\/image['"]/);
  assert.match(home, /src="\/images\/playful-imagen-banner\.png"/);
  assert.match(home, /<CarouselResultados/);
  assert.match(home, /cases=\{homeCases\}/);
});
