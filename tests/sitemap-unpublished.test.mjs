import test from 'node:test';
import assert from 'node:assert/strict';

const {
  SITEMAP_STATIC_PATHS,
  SITEMAP_UNPUBLISHED_PATHS,
  getSitemapLocs,
  getSitemapPaths,
  buildSitemapXml,
} = await import('../utils/apex-sitemap.ts');

const APEX = 'https://playfulagency.com';

test('unpublished landings stay out of the production sitemap until they 200', () => {
  assert.deepEqual([...SITEMAP_UNPUBLISHED_PATHS], [
    '/agencia-prestashop',
    '/agencia-woocommerce',
    '/pasarela-de-pagos-venezuela',
    '/shopify-precios',
    '/lp/integraciones-pasarela-erp',
  ]);
  assert.equal(SITEMAP_UNPUBLISHED_PATHS.includes('/lp/calentamiento'), false);

  const locs = getSitemapLocs();
  const paths = getSitemapPaths();
  const xml = buildSitemapXml();

  for (const path of SITEMAP_UNPUBLISHED_PATHS) {
    assert.equal(SITEMAP_STATIC_PATHS.includes(path), false, path);
    assert.equal(paths.includes(path), false, path);
    assert.equal(locs.includes(`${APEX}${path}`), false, path);
    assert.doesNotMatch(
      xml,
      new RegExp(`${APEX.replaceAll('/', '\\/')}${path.replaceAll('/', '\\/')}<`),
    );
  }
});
