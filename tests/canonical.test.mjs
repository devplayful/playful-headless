import test from 'node:test';
import assert from 'node:assert/strict';

const { canonicalForPath } = await import('../utils/canonical.ts');

test('home canonical keeps the sitemap trailing slash', () => {
  assert.equal(canonicalForPath('/'), 'https://playfulagency.com/');
  assert.equal(canonicalForPath(''), 'https://playfulagency.com/');
});

test('interior canonicals stay without a trailing slash', () => {
  assert.equal(canonicalForPath('/nosotros'), 'https://playfulagency.com/nosotros');
  assert.equal(canonicalForPath('/agencia-shopify'), 'https://playfulagency.com/agencia-shopify');
  assert.equal(canonicalForPath('/blog/seo/aprende-todo-sobre-el-seo'), 'https://playfulagency.com/blog/seo/aprende-todo-sobre-el-seo');
});
