import test from 'node:test';
import assert from 'node:assert/strict';
import { optimizeBlogInlineMedia } from '../lib/blog-inline-media.ts';

const SVG = 'https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Beneficio-6-09.svg';

test('email-marketing SVGs stay off /_next/image and load lazy', () => {
  const html = `<img class="wp-image-1" src="${SVG}" alt="chico poniendo un reloj analógico a un teléfono" width="580" height="410">`;
  const out = optimizeBlogInlineMedia(html, '5-plataformas-para-email-marketing-efectivo');
  assert.match(out, new RegExp(`src="${SVG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.match(out, /loading="lazy"/);
  assert.match(out, /decoding="async"/);
  assert.doesNotMatch(out, /\/_next\/image/);
});

test('other posts are left untouched', () => {
  const html = `<img src="${SVG}" alt="">`;
  assert.equal(optimizeBlogInlineMedia(html, 'otro-post'), html);
});
