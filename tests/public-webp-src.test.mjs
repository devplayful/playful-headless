import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { publicWebpIfPresent } from '../lib/public-webp-src.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function webpSize(buffer) {
  const chunk = buffer.toString('ascii', 12, 16);
  if (chunk === 'VP8X') {
    return {
      width: buffer.readUIntLE(24, 3) + 1,
      height: buffer.readUIntLE(27, 3) + 1,
    };
  }
  assert.equal(chunk, 'VP8 ', `expected VP8/VP8X chunk, got ${chunk}`);
  const startCode = buffer.toString('hex', 23, 26);
  assert.equal(startCode, '9d012a');
  return {
    width: buffer.readUInt16LE(26) & 0x3fff,
    height: buffer.readUInt16LE(28) & 0x3fff,
  };
}

function pngSize(buffer) {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

const LCP_PAIRS = [
  '/images/playful-imagen-banner.png',
  '/images/nosotros-playful-imagen.png',
  '/images/agencia-shopify/hero-gORwV7MSXO@1x.png',
  '/images/agencia-shopify/hero-gORwV7MSXO@2x.png',
  '/images/blog/01-actualizar-magnific-mELf0NZhJQ.png',
  '/images/blog/03-google-ia-magnific-IfxaU6ntvE.png',
  '/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
];

test('publicWebpIfPresent swaps local PNG for a same-aspect webp sibling', () => {
  for (const png of LCP_PAIRS) {
    const webp = png.replace(/\.png$/, '.webp');
    assert.equal(publicWebpIfPresent(png), webp);
    assert.ok(existsSync(join(root, 'public', webp.replace(/^\//, ''))), webp);
    const pngBuf = readFileSync(join(root, 'public', png.replace(/^\//, '')));
    const webpBuf = readFileSync(join(root, 'public', webp.replace(/^\//, '')));
    assert.deepEqual(webpSize(webpBuf), pngSize(pngBuf), png);
    assert.ok(webpBuf.byteLength < pngBuf.byteLength, `${webp} should be smaller than ${png}`);
  }
});

test('publicWebpIfPresent leaves remotes, svg and missing siblings alone', () => {
  assert.equal(
    publicWebpIfPresent('https://endpoint.playfulagency.com/wp-content/uploads/a.png'),
    'https://endpoint.playfulagency.com/wp-content/uploads/a.png',
  );
  assert.equal(publicWebpIfPresent('/images/avatar-playful.svg'), '/images/avatar-playful.svg');
  assert.equal(publicWebpIfPresent('/images/og/home.jpg'), '/images/og/home.jpg');
  assert.equal(publicWebpIfPresent(''), '');
});

test('wordpress listing and shopify hero consume the helper without rewriting overrides', () => {
  const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../components/HomeHeroArt.tsx', import.meta.url), 'utf8');
  const shopify = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
  const zelle = readFileSync(new URL('../utils/ecommerce-zelle-cover.ts', import.meta.url), 'utf8');
  const covers = readFileSync(new URL('../lib/blog-cover-image.ts', import.meta.url), 'utf8');
  assert.match(wordpress, /publicWebpIfPresent\(\s*resolveBlogCoverUrl/);
  assert.match(home, /publicWebpIfPresent\(HOME_HERO_POSTER_PNG\)/);
  assert.match(home, /HOME_HERO_POSTER_PNG = '\/images\/playful-imagen-banner\.png'/);
  assert.match(shopify, /publicWebpIfPresent\(HERO_ART_1X\)/);
  assert.match(shopify, /<Image[\s\S]*publicWebpIfPresent\(HERO_ART_1X\)/);
  assert.match(zelle, /ZELLE_APPROVED_COVER_SRC = publicWebpIfPresent\(ZELLE_APPROVED_COVER\)/);
  assert.match(covers, /01-actualizar-magnific-mELf0NZhJQ\.png/);
  assert.doesNotMatch(covers, /01-actualizar-magnific-mELf0NZhJQ\.webp/);
});
