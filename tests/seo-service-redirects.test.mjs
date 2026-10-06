import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const categoryRedirects = require('../utils/blog-category-redirect-map.json');
const canibalizacionOrigins = require('../utils/blog-canibalizacion-redirect-map.json');
const seoServiceRedirects = require('../utils/seo-service-redirect-map.json');
const {
  CANIBALIZACION_301,
  isCanibalizacionOriginPath,
  mergeCanibalizacionIntoPermanent301,
} = await import('../utils/blog-canibalizacion-redirects.ts');
const {
  CLOSED_BLOG_PATHS,
  GSC_GONE_PATHS,
  blogClosedDecision,
} = await import('../utils/blog-closed-paths.ts');
const { getSitemapLocs, SITEMAP_STATIC_PATHS } = await import('../utils/apex-sitemap.ts');

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const APEX = 'https://playfulagency.com';

const NEW_301 = [
  ['/landing-seo', '/agencia-seo'],
  ['/seo', '/agencia-seo'],
  ['/servicios/seo', '/agencia-seo'],
  ['/servicios/desarrollo-web', '/agencia-diseno-web'],
];

const STAY_404 = [
  '/servicios/pautas-digitales',
  '/servicios/automatizacion-del-marketing',
];

const permanent301 = mergeCanibalizacionIntoPermanent301({
  '/servicios': '/agencia-e-commerce',
  '/services': '/agencia-e-commerce',
  '/contacto': '/contactar-agencia-de-marketing-digital',
  '/contactanos': '/contactar-agencia-de-marketing-digital',
  '/casos': '/casos-de-exito',
  '/casos-de-exito-agencia-de-marketing-digital': '/casos-de-exito',
  ...seoServiceRedirects,
  ...canibalizacionOrigins,
}, categoryRedirects);

test('closed SEO service 301s are one hop to an absolute apex 200', () => {
  assert.equal(Object.keys(seoServiceRedirects).length, 4);

  for (const [origin, destPath] of NEW_301) {
    const dest = `${APEX}${destPath}`;
    assert.equal(seoServiceRedirects[origin], dest, origin);
    assert.equal(permanent301[origin], dest, origin);
    assert.equal(isCanibalizacionOriginPath(origin), false, origin);
    assert.equal(CANIBALIZACION_301[origin], undefined, origin);
    assert.equal(blogClosedDecision(origin).type, 'next', origin);
    assert.equal(blogClosedDecision(destPath).type, 'next', destPath);
    assert.equal(SITEMAP_STATIC_PATHS.includes(destPath), true, destPath);
    assert.equal(getSitemapLocs().includes(dest), true, dest);
    assert.equal(permanent301[destPath], undefined, `dest is also an origin: ${destPath}`);
    assert.equal(CLOSED_BLOG_PATHS.includes(origin), false, origin);
    assert.equal(GSC_GONE_PATHS.includes(origin), false, origin);
  }
});

test('pautas and automatizacion stay 404 and /agencia-ux-ui stays out of the sitemap', () => {
  for (const path of STAY_404) {
    assert.equal(seoServiceRedirects[path], undefined, path);
    assert.equal(permanent301[path], undefined, path);
    assert.doesNotMatch(middlewareSource, new RegExp(`'${path.replaceAll('/', '\\/')}':`));
  }
  assert.equal(getSitemapLocs().includes(`${APEX}/agencia-ux-ui`), false);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/agencia-ux-ui'), false);
});

test('middleware 301s the new origins in one hop with an absolute Location', () => {
  assert.match(middlewareSource, /seo-service-redirect-map\.json/);
  assert.match(middlewareSource, /\.\.\.seoServiceRedirects/);
  assert.match(middlewareSource, /NextResponse\.redirect\(target, 301\)/);
  const destLookup = middlewareSource.slice(
    middlewareSource.indexOf('const dest = PERMANENT_301[path]'),
    middlewareSource.indexOf('const blogSeo'),
  );
  assert.match(destLookup, /NextResponse\.redirect\(target, 301\)/);
  assert.match(destLookup, /new URL\(dest\)/);
});
