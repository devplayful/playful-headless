import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  OG_JPEG_SIZE,
  OG_JPEG_BY_PATH,
  OG_JPEG_BY_BLOG_SLUG,
  ogJpegForPath,
  ogJpegForBlogSlug,
  ogJpegMeta,
} = await import('../lib/og-images.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function jpegSize(buffer) {
  let i = 2;
  while (i < buffer.length - 9) {
    if (buffer[i] !== 0xff) break;
    const marker = buffer[i + 1];
    const size = buffer.readUInt16BE(i + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return { width: buffer.readUInt16BE(i + 7), height: buffer.readUInt16BE(i + 5) };
    }
    i += 2 + size;
  }
  return { width: 0, height: 0 };
}

test('og maps cover home, blog listing, cases and a Magnific post', () => {
  assert.equal(OG_JPEG_SIZE.width, 1200);
  assert.equal(OG_JPEG_SIZE.height, 630);
  assert.equal(ogJpegForPath('/'), '/images/og/home.jpg');
  assert.equal(ogJpegForPath('/blog'), '/images/og/home.jpg');
  assert.equal(ogJpegForPath('/nosotros'), '/images/og/home.jpg');
  assert.match(ogJpegForPath('/casos-de-exito/jumex-shopify-dtc-ecommerce'), /jumex/);
  assert.match(ogJpegForBlogSlug('actualizar-tu-e-commerce'), /\/images\/og\//);
  assert.deepEqual(ogJpegMeta('/images/og/home.jpg', 'X'), {
    url: '/images/og/home.jpg',
    width: 1200,
    height: 630,
    alt: 'X',
  });
  assert.ok(Object.keys(OG_JPEG_BY_PATH).length >= 110);
  assert.ok(Object.keys(OG_JPEG_BY_BLOG_SLUG).length >= 90);
});

test('every mapped OG JPEG exists, is 1200×630 and ≤300 KB', async () => {
  const unique = new Set([
    ...Object.values(OG_JPEG_BY_PATH),
    ...Object.values(OG_JPEG_BY_BLOG_SLUG),
  ]);
  for (const rel of unique) {
    const file = join(root, 'public', rel.replace(/^\//, ''));
    assert.ok(existsSync(file), rel);
    const buffer = await readFile(file);
    assert.ok(buffer.byteLength <= 300 * 1024, `${rel} is ${buffer.byteLength}`);
    assert.deepEqual(jpegSize(buffer), { width: 1200, height: 630 }, rel);
  }
});
