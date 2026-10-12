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
  assert.match(firstOptimizableHeroSrc(HERO, 'agencia-sem'), /\/_next\/image/);
});

test('carousel logos gain intrinsic width and height', () => {
  const out = applyElementorIntrinsicDimensions(LOGO);
  assert.match(out, /width="300"/);
  assert.match(out, /height="200"/);
});

test('agencia-e-commerce hero uses /_next/image like other LCP slugs', () => {
  const out = optimizeElementorLcpHero(HERO, 'agencia-e-commerce');
  assert.match(out, /\/_next\/image/);
});

test('marketing-internacional leaves the hero URL untouched', () => {
  const out = optimizeElementorLcpHero(HERO, 'marketing-internacional');
  assert.match(out, /Potencia-tu-presencia-con-publicidad\.png/);
  assert.doesNotMatch(out, /\/_next\/image/);
});
