import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  optimizeElementorLcpHero,
  firstOptimizableHeroSrc,
  ELEMENTOR_LCP_SLUGS,
} = await import('../lib/elementor-html-optimize.ts');

const ECOM = 'agencia-e-commerce';
const SVG_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/10/Payful-Agencia-de-Marketing-Internacional0.svg';

test('agencia-e-commerce SVG hero stays off /_next/image with a 437×417 box', () => {
  assert.equal(ELEMENTOR_LCP_SLUGS.has(ECOM), true);

  const withDims =
    `<img width="437" height="417" src="${SVG_SRC}" alt="e-commerce hero" srcset="/_next/image?url=${encodeURIComponent(SVG_SRC)}&w=750 750w" sizes="100vw" />`;
  const out = optimizeElementorLcpHero(withDims, ECOM);

  assert.match(out, new RegExp(`src="${SVG_SRC.replaceAll('/', '\\/')}"`));
  assert.doesNotMatch(out, /\/_next\/image/);
  assert.match(out, /width="437"/);
  assert.match(out, /height="417"/);
  assert.equal(firstOptimizableHeroSrc(withDims, ECOM), SVG_SRC);
});

test('agencia-e-commerce SVG without intrinsic size still reserves 437/417', () => {
  const bare = `<img src="${SVG_SRC}" alt="e-commerce hero" />`;
  const out = optimizeElementorLcpHero(bare, ECOM);
  assert.match(out, /width="437"/);
  assert.match(out, /height="417"/);
  assert.doesNotMatch(out, /\/_next\/image/);
  assert.match(out, /aspect-ratio:437\/417/);
});

test('optimizer source never sends the e-commerce SVG through next/image', () => {
  const source = readFileSync(
    new URL('../lib/elementor-html-optimize.ts', import.meta.url),
    'utf8',
  );
  assert.match(source, /Remote SVG never goes through `\/_next\/image` \(400\)/);
  assert.match(source, /isEcommerceSvgHero/);
  assert.match(source, /ECOM_HERO_INTRINSIC = \{ width: 437, height: 417 \}/);
  const svgGuard = source.slice(
    source.indexOf('function shouldServeHeroViaNextImage'),
    source.indexOf('function shouldRewriteHeroThroughNextImage'),
  );
  assert.match(svgGuard, /\\\.svg\(\\\?\|#\|\$\)/);
});
