import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const unpublishedLandingRedirects = require('../utils/unpublished-landing-redirect-map.json');
const canibalizacionOrigins = require('../utils/blog-canibalizacion-redirect-map.json');
const categoryRedirects = require('../utils/blog-category-redirect-map.json');
const {
  mergeCanibalizacionIntoPermanent301,
  isCanibalizacionOriginPath,
} = await import('../utils/blog-canibalizacion-redirects.ts');
const { blogClosedDecision } = await import('../utils/blog-closed-paths.ts');
const {
  SITEMAP_UNPUBLISHED_PATHS,
  SITEMAP_STATIC_PATHS,
  getSitemapLocs,
} = await import('../utils/apex-sitemap.ts');

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const APEX = 'https://playfulagency.com';

const LANDING_301 = [
  ['/agencia-woocommerce', '/agencia-e-commerce'],
  ['/agencia-prestashop', '/agencia-e-commerce'],
  ['/shopify-precios', '/agencia-shopify'],
  ['/pasarela-de-pagos-venezuela', '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'],
  ['/lp/integraciones-pasarela-erp', '/agencia-shopify'],
];

const permanent301 = mergeCanibalizacionIntoPermanent301({
  '/servicios': '/agencia-e-commerce',
  ...unpublishedLandingRedirects,
  ...canibalizacionOrigins,
}, categoryRedirects);

test('unpublished landing 404s 301 in one hop to live ecommerce/shopify pages', () => {
  assert.equal(Object.keys(unpublishedLandingRedirects).length, 6);
  assert.equal(unpublishedLandingRedirects['/lp/calentamiento'], undefined);

  for (const [origin, destPath] of LANDING_301) {
    const dest = `${APEX}${destPath}`;
    assert.equal(unpublishedLandingRedirects[origin], dest, origin);
    assert.equal(permanent301[origin], dest, origin);
    assert.equal(isCanibalizacionOriginPath(origin), false, origin);
    assert.equal(blogClosedDecision(origin).type, 'next', origin);
    assert.equal(blogClosedDecision(destPath).type, 'next', destPath);
    assert.equal(
      SITEMAP_STATIC_PATHS.includes(destPath) || destPath.startsWith('/blog/'),
      true,
      destPath,
    );
    assert.equal(getSitemapLocs().includes(dest), true, dest);
    assert.equal(permanent301[destPath], undefined, `dest is also an origin: ${destPath}`);
    assert.equal(SITEMAP_UNPUBLISHED_PATHS.includes(origin), true, origin);
    assert.equal(getSitemapLocs().includes(`${APEX}${origin}`), false, origin);
  }
});

test('middleware loads unpublished landing redirect map before runtime lookup', () => {
  assert.match(middlewareSource, /unpublished-landing-redirect-map\.json/);
  assert.match(middlewareSource, /\.\.\.unpublishedLandingRedirects/);
});
