import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../app/home-copy.ts', import.meta.url), 'utf8');
const problemas = readFileSync(new URL('../components/MaterialServicesSection.tsx', import.meta.url), 'utf8');
const metodo = readFileSync(new URL('../components/SolucionesPlayful.tsx', import.meta.url), 'utf8');
const carousel = readFileSync(new URL('../components/CarouselResultados.tsx', import.meta.url), 'utf8');

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
  assert.match(home, /fullDescription/);
});

test('home paints the two signed testimonials in a static two-column block', () => {
  assert.match(home, /<HomeTestimonialsBlock/);
  assert.match(home, /HOME_TESTIMONIOS.destacados/);
  assert.match(copy, /Federico Vera/);
  assert.match(copy, /Eva Cristina Luciani/);
});

test('hero keeps only the first paragraph with the H1 and CTAs; the rest follows as a text module', () => {
  const heroStart = home.indexOf('{/* Hero Section */}');
  const heroEnd = home.indexOf('</section>', heroStart);
  const hero = home.slice(heroStart, heroEnd);
  const afterHero = home.slice(heroEnd);
  assert.match(hero, /HOME_HERO\.subtitulo/);
  assert.match(hero, /HOME_HERO\.ctaPrincipal/);
  assert.match(hero, /HOME_HERO\.microcopia/);
  assert.match(hero, /HOME_HERO\.ctaSecundario/);
  assert.doesNotMatch(hero, /HOME_HERO\.cuerpo/);
  assert.doesNotMatch(hero, /HOME_HERO\.shopifyAntes/);
  assert.match(afterHero, /HOME_HERO\.cuerpo\.map/);
  assert.match(afterHero, /HOME_HERO\.shopifyAntes/);
  assert.match(afterHero, /<MaterialServicesSection/);
  const followupEnd = afterHero.indexOf('<MaterialServicesSection');
  const followup = afterHero.slice(0, followupEnd);
  assert.match(followup, /HOME_HERO\.cuerpo/);
  assert.match(followup, /HOME_HERO\.shopifyHref/);
});

test('metodo steps are full-width rows, not a three-column grid', () => {
  assert.doesNotMatch(metodo, /md:grid-cols-3/);
  assert.match(metodo, /flex flex-col gap-6 md:gap-8/);
  assert.match(metodo, /md:flex-row md:items-start/);
  assert.match(metodo, /HOME_METODO\.items/);
});

test('home case cards stretch to equal height and center the Ver caso button', () => {
  assert.match(carousel, /fullDescription \? 'min-h-\[500px\]'/);
  assert.match(carousel, /flex flex-col h-full/);
  assert.match(carousel, /fullDescription \? 'justify-center' : 'justify-end'/);
});
