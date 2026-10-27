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
} = await import('../utils/blog-canibalizacion-redirects.ts');
const { blogClosedDecision } = await import('../utils/blog-closed-paths.ts');
const {
  SITEMAP_UNPUBLISHED_PATHS,
  getSitemapLocs,
  buildSitemapXml,
} = await import('../utils/apex-sitemap.ts');
const {
  AGENCIA_SHOPIFY_HREF,
  LP_INTEGRACIONES_PASARELA_ERP_HREF,
  PASARELA_VE_HREF,
  ZELLE_VE_HREF,
  decideBrokenInternalHref,
} = await import('../utils/broken-internal-hrefs.ts');
const {
  CASHEA_COMERCIOS_BLOG_BODY_HTML,
  CASHEA_COMERCIOS_BLOG_SLUG,
} = await import('../lib/blog-body-overrides.ts');
const { rewriteInSitePageHrefs } = await import('../services/rewrite-in-site-hrefs.mjs');

const APEX = 'https://playfulagency.com';
const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const nextConfigSource = readFileSync(new URL('../next.config.js', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const globalCss = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const blogPage = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');

const ZELLE_DEST = `${APEX}${ZELLE_VE_HREF}`;
const SHOPIFY_DEST = `${APEX}${AGENCIA_SHOPIFY_HREF}`;

const permanent301 = mergeCanibalizacionIntoPermanent301({
  '/servicios': '/agencia-e-commerce',
  ...unpublishedLandingRedirects,
  ...canibalizacionOrigins,
}, categoryRedirects);

test('1) /pasarela-de-pagos-venezuela 301s in one hop to the Zelle post', () => {
  assert.equal(unpublishedLandingRedirects[PASARELA_VE_HREF], ZELLE_DEST);
  assert.equal(permanent301[PASARELA_VE_HREF], ZELLE_DEST);
  assert.equal(blogClosedDecision(PASARELA_VE_HREF).type, 'next');
  assert.equal(blogClosedDecision(`${PASARELA_VE_HREF}/`).type, 'next');
  assert.match(nextConfigSource, /skipTrailingSlashRedirect: true/);
  assert.match(middlewareSource, /NextResponse\.redirect\(target, 301\)/);
});

test('2) /lp/integraciones-pasarela-erp 301s to /agencia-shopify and is not 410', () => {
  assert.equal(unpublishedLandingRedirects[LP_INTEGRACIONES_PASARELA_ERP_HREF], SHOPIFY_DEST);
  assert.equal(permanent301[LP_INTEGRACIONES_PASARELA_ERP_HREF], SHOPIFY_DEST);
  assert.equal(blogClosedDecision(LP_INTEGRACIONES_PASARELA_ERP_HREF).type, 'next');
  assert.match(middlewareSource, /target\.search = resolved\.search/);
  assert.match(middlewareSource, /\$\{resolved\.pathname\}\$\{resolved\.search\}/);
});

test('3) Cashea body and template rewrite land on Zelle without hops', () => {
  assert.doesNotMatch(CASHEA_COMERCIOS_BLOG_BODY_HTML, /pasarela-de-pagos-venezuela/);
  assert.match(
    CASHEA_COMERCIOS_BLOG_BODY_HTML,
    /href="https:\/\/playfulagency\.com\/blog\/tecnologia\/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce"/,
  );
  const stale = `<p><a href="${APEX}${PASARELA_VE_HREF}">pasarela de pagos en Venezuela</a></p>`;
  const rewritten = rewriteInSitePageHrefs(stale, `/blog/tecnologia/${CASHEA_COMERCIOS_BLOG_SLUG}`);
  assert.equal(
    rewritten,
    `<p><a href="${ZELLE_VE_HREF}">pasarela de pagos en Venezuela</a></p>`,
  );
  assert.equal(
    decideBrokenInternalHref(PASARELA_VE_HREF, `/blog/tecnologia/${CASHEA_COMERCIOS_BLOG_SLUG}`).href,
    ZELLE_VE_HREF,
  );
  assert.match(blogPage, /`\/blog\/\$\{category\}\/\$\{postSlug\}`/);
});

test('4) /lp/calentamiento stays out of 301/410 maps and chrome files stay untouched', () => {
  assert.equal(unpublishedLandingRedirects['/lp/calentamiento'], undefined);
  assert.equal(permanent301['/lp/calentamiento'], undefined);
  assert.equal(SITEMAP_UNPUBLISHED_PATHS.includes('/lp/calentamiento'), false);
  assert.equal(blogClosedDecision('/lp/calentamiento').type, 'next');
  for (const source of [header, footer, layout, globalCss]) {
    assert.doesNotMatch(source, /pasarela-de-pagos-venezuela/);
    assert.doesNotMatch(source, /integraciones-pasarela-erp/);
  }
});

test('5) sitemap and defaults do not keep the 301 origins', () => {
  const locs = getSitemapLocs();
  const xml = buildSitemapXml();
  for (const origin of [PASARELA_VE_HREF, LP_INTEGRACIONES_PASARELA_ERP_HREF]) {
    assert.equal(SITEMAP_UNPUBLISHED_PATHS.includes(origin), true, origin);
    assert.equal(locs.includes(`${APEX}${origin}`), false, origin);
    assert.doesNotMatch(xml, new RegExp(`${origin.replaceAll('/', '\\/')}<`));
  }
  assert.equal(locs.includes(ZELLE_DEST), true);
  assert.equal(locs.includes(SHOPIFY_DEST), true);
  assert.equal(
    decideBrokenInternalHref(LP_INTEGRACIONES_PASARELA_ERP_HREF, '/blog/tecnologia/cashea-para-comercios').href,
    AGENCIA_SHOPIFY_HREF,
  );
});
