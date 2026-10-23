import test from 'node:test';
import assert from 'node:assert/strict';
import { applyBlogListingPins, BLOG_LISTING_PINS } from '../config/blog-listing-pins.ts';
import { localBlogListingDateMs } from '../lib/blog-local-posts.ts';

test('pins CIMA first and Zelle second', () => {
  const posts = ['a', 'b', 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', 'c', 'premios-cima-2026-soytechno-playful'].map((slug) => ({ slug }));
  assert.deepEqual(applyBlogListingPins(posts).map((p) => p.slug).slice(0, 3),
    ['premios-cima-2026-soytechno-playful', 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', 'a']);
  assert.equal(BLOG_LISTING_PINS.length, 2);
});

test('missing pins are skipped', () => {
  assert.deepEqual(applyBlogListingPins([{ slug: 'a' }, { slug: 'b' }]).map((p) => p.slug), ['a', 'b']);
});

test('listing date ignores modified when date exists', () => {
  assert.equal(localBlogListingDateMs({ date: '2020-01-01T00:00:00Z', modified: '2026-10-23T00:00:00Z' }), Date.parse('2020-01-01T00:00:00Z'));
});
