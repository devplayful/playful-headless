import test from 'node:test';
import assert from 'node:assert/strict';

const { canonicalForPath, toAbsoluteSiteUrl } = await import('../utils/canonical.ts');

test('home canonical keeps the sitemap trailing slash', () => {
  assert.equal(canonicalForPath('/'), 'https://playfulagency.com/');
  assert.equal(canonicalForPath(''), 'https://playfulagency.com/');
});

test('interior canonicals stay without a trailing slash', () => {
  assert.equal(canonicalForPath('/nosotros'), 'https://playfulagency.com/nosotros');
  assert.equal(canonicalForPath('/agencia-shopify'), 'https://playfulagency.com/agencia-shopify');
  assert.equal(canonicalForPath('/agencia-seo'), 'https://playfulagency.com/agencia-seo');
  assert.equal(canonicalForPath('/agencia-sem'), 'https://playfulagency.com/agencia-sem');
  assert.equal(canonicalForPath('/agencia-diseno-web'), 'https://playfulagency.com/agencia-diseno-web');
  assert.equal(canonicalForPath('/shopify-precios'), 'https://playfulagency.com/shopify-precios');
  assert.equal(canonicalForPath('/blog/seo/aprende-todo-sobre-el-seo'), 'https://playfulagency.com/blog/seo/aprende-todo-sobre-el-seo');
});

test('toAbsoluteSiteUrl keeps remote media and prefixes site-relative assets', () => {
  assert.equal(
    toAbsoluteSiteUrl('/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png'),
    'https://playfulagency.com/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
  );
  assert.equal(
    toAbsoluteSiteUrl('https://endpoint.playfulagency.com/wp-content/uploads/zelle.jpg'),
    'https://endpoint.playfulagency.com/wp-content/uploads/zelle.jpg',
  );
  assert.equal(toAbsoluteSiteUrl(''), '');
});
