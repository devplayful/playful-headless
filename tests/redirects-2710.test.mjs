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
  CASHEA_P1_COPY_ISSUE,
  CASHEA_P1_CURRENT_HTML,
  CASHEA_SITEF_P4_HTML,
  PENDIENTE_FIRMA_JOSE_380,
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

function locationFromMap(originPath, incomingSearch) {
  const dest =
    unpublishedLandingRedirects[originPath] ||
    unpublishedLandingRedirects[originPath.replace(/\/+$/, '') || '/'];
  assert.ok(dest, `missing dest for ${originPath}`);
  const url = /^https?:\/\//i.test(dest)
    ? new URL(dest)
    : new URL(dest, APEX);
  const params = new URLSearchParams(
    incomingSearch.startsWith('?') ? incomingSearch.slice(1) : incomingSearch,
  );
  url.search = params.toString() ? `?${params.toString()}` : '';
  return `${url.pathname}${url.search}`;
}

test('1) /pasarela-de-pagos-venezuela 301s in one hop to the Zelle post', () => {
  assert.equal(unpublishedLandingRedirects[PASARELA_VE_HREF], ZELLE_DEST);
  assert.equal(permanent301[PASARELA_VE_HREF], ZELLE_DEST);
  assert.equal(blogClosedDecision(PASARELA_VE_HREF).type, 'next');
  assert.equal(blogClosedDecision(`${PASARELA_VE_HREF}/`).type, 'next');
  assert.match(nextConfigSource, /skipTrailingSlashRedirect: true/);
  assert.match(middlewareSource, /NextResponse\.redirect\(target, 301\)/);
});

test('1b) slashed /pasarela-de-pagos-venezuela/ is on the map for a single 301', () => {
  const slashed = `${PASARELA_VE_HREF}/`;
  assert.equal(unpublishedLandingRedirects[slashed], ZELLE_DEST);
  assert.equal(permanent301[slashed], ZELLE_DEST);
  assert.equal(unpublishedLandingRedirects[PASARELA_VE_HREF], unpublishedLandingRedirects[slashed]);
  assert.equal(locationFromMap(slashed, ''), ZELLE_VE_HREF);
  assert.equal(locationFromMap(slashed, '?qa=1'), `${ZELLE_VE_HREF}?qa=1`);
  assert.match(middlewareSource, /PERMANENT_301\[pathname\]/);
  assert.match(middlewareSource, /hadTrailingSlash/);
});

test('2) /lp/integraciones-pasarela-erp 301s to /agencia-shopify and is not 410', () => {
  assert.equal(unpublishedLandingRedirects[LP_INTEGRACIONES_PASARELA_ERP_HREF], SHOPIFY_DEST);
  assert.equal(permanent301[LP_INTEGRACIONES_PASARELA_ERP_HREF], SHOPIFY_DEST);
  assert.equal(blogClosedDecision(LP_INTEGRACIONES_PASARELA_ERP_HREF).type, 'next');
  assert.match(middlewareSource, /target\.search = resolved\.search/);
  assert.match(middlewareSource, /\$\{resolved\.pathname\}\$\{resolved\.search\}/);
});

test('2b) Location of /lp/integraciones-pasarela-erp keeps gclid and utm_*', () => {
  const search =
    '?gclid=EAIaX0&utm_source=google&utm_medium=cpc&utm_campaign=erp&utm_content=ad&utm_term=pasarela';
  const location = locationFromMap(LP_INTEGRACIONES_PASARELA_ERP_HREF, search);
  assert.equal(location, `${AGENCIA_SHOPIFY_HREF}${search}`);
  const params = new URLSearchParams(location.slice(location.indexOf('?')));
  assert.equal(params.get('gclid'), 'EAIaX0');
  assert.equal(params.get('utm_source'), 'google');
  assert.equal(params.get('utm_medium'), 'cpc');
  assert.equal(params.get('utm_campaign'), 'erp');
  assert.equal(params.get('utm_content'), 'ad');
  assert.equal(params.get('utm_term'), 'pasarela');
  assert.match(middlewareSource, /target\.search = resolved\.search/);
  assert.match(middlewareSource, /\$\{resolved\.pathname\}\$\{resolved\.search\}/);
});

test('2c) slashed /lp/integraciones-pasarela-erp/ is a single 301 that keeps gclid and utm_*', () => {
  const slashed = `${LP_INTEGRACIONES_PASARELA_ERP_HREF}/`;
  const search =
    '?gclid=EAIaX0&utm_source=google&utm_medium=cpc&utm_campaign=erp&utm_content=ad&utm_term=pasarela';
  assert.equal(unpublishedLandingRedirects[slashed], SHOPIFY_DEST);
  assert.equal(permanent301[slashed], SHOPIFY_DEST);
  assert.equal(
    unpublishedLandingRedirects[LP_INTEGRACIONES_PASARELA_ERP_HREF],
    unpublishedLandingRedirects[slashed],
  );
  const location = locationFromMap(slashed, search);
  assert.equal(location, `${AGENCIA_SHOPIFY_HREF}${search}`);
  const params = new URLSearchParams(location.slice(location.indexOf('?')));
  assert.equal(params.get('gclid'), 'EAIaX0');
  assert.equal(params.get('utm_source'), 'google');
  assert.equal(params.get('utm_medium'), 'cpc');
  assert.equal(params.get('utm_campaign'), 'erp');
  assert.equal(params.get('utm_content'), 'ad');
  assert.equal(params.get('utm_term'), 'pasarela');
  assert.match(middlewareSource, /target\.search = resolved\.search/);
  assert.match(middlewareSource, /\$\{resolved\.pathname\}\$\{resolved\.search\}/);
});

test('3) Cashea body and template rewrite land on Zelle without hops', () => {
  assert.doesNotMatch(CASHEA_COMERCIOS_BLOG_BODY_HTML, /pasarela-de-pagos-venezuela/);
  assert.match(
    CASHEA_COMERCIOS_BLOG_BODY_HTML,
    /href="\/blog\/tecnologia\/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce">cómo integrar Zelle en tu ecommerce<\/a>/,
  );
  const sitefParagraph = CASHEA_COMERCIOS_BLOG_BODY_HTML.match(
    /<p[^>]*>Antes de sumar Cashea, revisa cómo concilia hoy tu equipo[\s\S]*?<\/p>/,
  )?.[0] || '';
  assert.equal(sitefParagraph, CASHEA_SITEF_P4_HTML);
  assert.equal(
    (sitefParagraph.match(/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce/g) || []).length,
    1,
  );
  assert.match(
    CASHEA_COMERCIOS_BLOG_BODY_HTML,
    /href="\/blog\/tecnologia\/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce"/,
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

test('3b) Cashea #380 copy is literal, two distinct Zelle anchors, no pasarela href', () => {
  assert.equal(PENDIENTE_FIRMA_JOSE_380, 'PENDIENTE_FIRMA_JOSE_380');
  assert.equal(CASHEA_P1_COPY_ISSUE, 'playful-copy#380');
  assert.match(CASHEA_P1_CURRENT_HTML, /Si también cobras con Zelle/);
  assert.match(CASHEA_P1_CURRENT_HTML, /cómo integrar Zelle en tu ecommerce/);
  assert.doesNotMatch(CASHEA_P1_CURRENT_HTML, /data-pendiente-firma/);
  assert.doesNotMatch(CASHEA_SITEF_P4_HTML, /data-pendiente-firma/);
  assert.ok(CASHEA_COMERCIOS_BLOG_BODY_HTML.includes(CASHEA_P1_CURRENT_HTML));
  assert.ok(CASHEA_COMERCIOS_BLOG_BODY_HTML.includes(CASHEA_SITEF_P4_HTML));
  const zelleAnchors = [
    ...CASHEA_COMERCIOS_BLOG_BODY_HTML.matchAll(
      /href="\/blog\/tecnologia\/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce">([^<]+)<\/a>/g,
    ),
  ].map((match) => match[1]);
  assert.deepEqual(zelleAnchors, [
    'cómo integrar Zelle en tu ecommerce',
    'Zelle en Venezuela como método de pago para tu ecommerce',
  ]);
  assert.doesNotMatch(CASHEA_COMERCIOS_BLOG_BODY_HTML, /pasarela-de-pagos-venezuela/);
  assert.doesNotMatch(CASHEA_COMERCIOS_BLOG_BODY_HTML, /<a[^>]*>pasarela de pagos en Venezuela<\/a>/);
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
