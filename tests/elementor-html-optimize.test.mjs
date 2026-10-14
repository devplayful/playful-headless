import test from 'node:test';
import assert from 'node:assert/strict';

const {
  optimizeElementorLcpHero,
  applyElementorIntrinsicDimensions,
  firstOptimizableHeroSrc,
} = await import('../lib/elementor-html-optimize.ts');

const HERO =
  '<img width="437" height="417" src="https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Potencia-tu-presencia-con-publicidad.png" alt="hero" />';
const LOGO =
  '<img class="swiper-slide-image" src="https://endpoint.playfulagency.com/wp-content/uploads/2024/08/Cliente-Playful-_-SoyTechno.png" alt="SoyTechno" />';

test('SEM hero is rewritten to /_next/image with sizes and fetchpriority', () => {
  const out = optimizeElementorLcpHero(HERO, 'agencia-sem');
  assert.match(out, /src="\/_next\/image\?url=/);
  assert.match(out, /fetchpriority="high"/i);
  assert.match(out, /sizes="/);
  assert.match(out, /750px/);
  assert.doesNotMatch(out, /[&?]w=437/);
  assert.doesNotMatch(out, /[&?]w=300/);
  assert.match(out, /750w/);
  assert.match(firstOptimizableHeroSrc(HERO, 'agencia-sem'), /\/_next\/image/);
});

test('carousel logos gain intrinsic width and height', () => {
  const out = applyElementorIntrinsicDimensions(LOGO);
  assert.match(out, /width="300"/);
  assert.match(out, /height="200"/);
});

test('agencia-e-commerce SVG hero matches main: /_next/image (SVG 400 avoids CLS vs origin paint)', () => {
  const svgHero =
    '<img width="437" height="417" src="https://endpoint.playfulagency.com/wp-content/uploads/2024/10/Payful-Agencia-de-Marketing-Internacional0.svg" alt="e-commerce hero" />';
  const out = optimizeElementorLcpHero(svgHero, 'agencia-e-commerce');
  assert.match(out, /src="\/_next\/image\?url=/);
  assert.doesNotMatch(out, /src="https:\/\/endpoint[^"]*Payful-Agencia-de-Marketing-Internacional0\.svg/);
  assert.match(firstOptimizableHeroSrc(svgHero, 'agencia-e-commerce'), /\/_next\/image/);
});

test('agencia-e-commerce raster hero still uses /_next/image', () => {
  const out = optimizeElementorLcpHero(HERO, 'agencia-e-commerce');
  assert.match(out, /\/_next\/image/);
});

test('agencia-ux-ui leaves the hero SVG URL untouched (/_next/image regresses mobile LCP)', () => {
  const svgHero =
    '<img width="437" height="417" src="https://endpoint.playfulagency.com/wp-content/uploads/2024/11/Playful-Transforma-tu-experiencia-digital-con-nuestra-Agencia-UX.svg" alt="UX hero" />';
  const out = optimizeElementorLcpHero(svgHero, 'agencia-ux-ui');
  assert.match(out, /Playful-Transforma-tu-experiencia-digital-con-nuestra-Agencia-UX\.svg/);
  assert.doesNotMatch(out, /\/_next\/image/);
  assert.equal(firstOptimizableHeroSrc(svgHero, 'agencia-ux-ui'), null);
});

test('marketing-internacional leaves the hero URL untouched', () => {
  const out = optimizeElementorLcpHero(HERO, 'marketing-internacional');
  assert.match(out, /Potencia-tu-presencia-con-publicidad\.png/);
  assert.doesNotMatch(out, /\/_next\/image/);
});
