import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const categoryRedirects = require('../utils/blog-category-redirect-map.json');
const canibalizacionOrigins = require('../utils/blog-canibalizacion-redirect-map.json');
const seoServiceRedirects = require('../utils/seo-service-redirect-map.json');
const unpublishedLandingRedirects = require('../utils/unpublished-landing-redirect-map.json');
const seoCruce2810Redirects = require('../utils/seo-cruce-2810-redirect-map.json');
const {
  mergeCanibalizacionIntoPermanent301,
} = await import('../utils/blog-canibalizacion-redirects.ts');
const {
  blogClosedDecision,
} = await import('../utils/blog-closed-paths.ts');
const {
  existingWorking301s,
  existingWorking410s,
  pathnameFromDest,
  SEO_CRUCE_2810_REDIRECTS,
  SEO_CRUCE_GONE_PATHS,
} = await import('../utils/seo-cruce-2810.ts');
const { canonicalForPath } = await import('../utils/canonical.ts');
const { buildSitemapXml, getSitemapLocs, SITEMAP_STATIC_PATHS } = await import(
  '../utils/apex-sitemap.ts'
);

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const blogPage = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
const importManifest = require('../docs/migracion/payload-importar.json');
const APEX = 'https://playfulagency.com';

const LIVE_301 = existingWorking301s();
const LIVE_410 = existingWorking410s();

function buildPermanent301() {
  return {
    ...mergeCanibalizacionIntoPermanent301({
      '/servicios': '/agencia-e-commerce',
      '/services': '/agencia-e-commerce',
      '/contacto': '/contactar-agencia-de-marketing-digital',
      '/contactanos': '/contactar-agencia-de-marketing-digital',
      '/casos': '/casos-de-exito',
      '/casos-de-exito-agencia-de-marketing-digital': '/casos-de-exito',
      '/e-books/Seo-Local/Playful_Agengy_Ebook_seo_local.pdf': '/agencia-seo',
      '/blog/email-marketing/tipos-de-publicidad-online':
        `${APEX}/blog/pautas-digitales/publicidad-digital-en-tu-negocio`,
      '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads':
        `${APEX}/blog/otros/conoce-todo-sobre-instagram-ads`,
      '/otros/conoce-todo-sobre-instagram-ads':
        `${APEX}/blog/otros/conoce-todo-sobre-instagram-ads`,
      '/agencia-seo-internacional-en-el-2025-es-una-necesidad':
        `${APEX}/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad`,
      '/blog/tecnologia/zelle-en-venezuela-un-metodo-pago-para-tu-ecommerce':
        `${APEX}/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`,
      '/blog/tecnologia/zelle-venezuela-metodo-de-pago-para-tu-ecommerce':
        `${APEX}/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`,
      '/blog/tecnologia/zelle-venezuela-un-metodo-de-pago-para-tu-ecommerce':
        `${APEX}/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`,
      '/blog/pautas-digitales/aprende-a-humanizar-la-marca-de-tu-negocio':
        '/blog/pautas-digitales/storytelling-en-el-marketing-digital',
      '/blog/mas-vistos/los-5-procesos-de-e-commerce':
        '/blog/mas-vistos/los-5-problemas-de-e-commerce',
      '/blog/mas-vistos/como-elegir-un-buen-framework':
        '/blog/mas-vistos/como-elegir-el-mejor-framework-para-tu-web',
      ...seoServiceRedirects,
      ...unpublishedLandingRedirects,
      ...canibalizacionOrigins,
    }, categoryRedirects),
    ...seoCruce2810Redirects,
  };
}

const permanent301 = buildPermanent301();

function destPathOf(origin) {
  const dest = permanent301[origin];
  return dest ? pathnameFromDest(dest) : null;
}

test('CSV freeze: 19 live 301s stay in code with the same destination', () => {
  assert.equal(LIVE_301.length, 19);
  for (const { url, dest } of LIVE_301) {
    const expected = pathnameFromDest(dest);
    const actual = destPathOf(url);
    assert.equal(actual, expected, `${url} → ${expected}`);
    assert.equal(blogClosedDecision(url).type, 'next', url);
    assert.equal(permanent301[expected], undefined, `chain: ${url} → ${expected}`);
  }
});

test('CSV freeze: 32 live 410s stay gone in code', () => {
  assert.equal(LIVE_410.length, 32);
  for (const url of LIVE_410) {
    assert.deepEqual(blogClosedDecision(url), { type: 'gone', status: 410 }, url);
    assert.deepEqual(blogClosedDecision(`${url}/`), { type: 'gone', status: 410 }, `${url}/`);
    assert.equal(permanent301[url], undefined, url);
  }
});

test('SEO cruce 22 new 301s are one hop and last-write the closed list', () => {
  assert.equal(Object.keys(SEO_CRUCE_2810_REDIRECTS).length, 22);
  assert.match(middlewareSource, /seo-cruce-2810-redirect-map\.json/);
  assert.match(middlewareSource, /\.\.\.seoCruce2810Redirects/);
  assert.match(middlewareSource, /NextResponse\.redirect\(target, 301\)/);
  assert.doesNotMatch(middlewareSource, /NextResponse\.redirect\([^)]*,\s*308\)/);

  for (const [origin, dest] of Object.entries(SEO_CRUCE_2810_REDIRECTS)) {
    const destPath = pathnameFromDest(dest);
    assert.equal(permanent301[origin], dest, origin);
    assert.equal(destPathOf(origin), destPath, origin);
    assert.equal(blogClosedDecision(origin).type, 'next', origin);
    assert.equal(permanent301[destPath], undefined, `dest is also an origin: ${destPath}`);
    assert.notEqual(origin, destPath);
  }
});

test('SEO cruce 410s are exact: /landing-page and /test-blog, not /lp/*', () => {
  assert.deepEqual([...SEO_CRUCE_GONE_PATHS], ['/landing-page', '/test-blog']);
  for (const path of SEO_CRUCE_GONE_PATHS) {
    assert.deepEqual(blogClosedDecision(path), { type: 'gone', status: 410 }, path);
    assert.deepEqual(blogClosedDecision(`${path}/`), { type: 'gone', status: 410 }, `${path}/`);
    assert.equal(permanent301[path], undefined, path);
  }
  assert.deepEqual(blogClosedDecision('/lp/integraciones-pasarela-erp'), { type: 'next' });
  assert.deepEqual(blogClosedDecision('/lp/foo'), { type: 'next' });
  assert.deepEqual(blogClosedDecision('/landing-page/foo'), { type: 'next' });
  assert.deepEqual(blogClosedDecision('/test-blog-foo'), { type: 'next' });
});

test('/seo-vigo stays 200, is imported, and has one sitemap loc', () => {
  const loc = `${APEX}/seo-vigo`;
  assert.equal(SITEMAP_STATIC_PATHS.includes('/seo-vigo'), true);
  assert.equal(getSitemapLocs().filter((item) => item === loc).length, 1);
  assert.equal((buildSitemapXml().match(/<loc>https:\/\/playfulagency\.com\/seo-vigo<\/loc>/g) || []).length, 1);
  assert.equal(permanent301['/seo-vigo'], undefined);
  assert.equal(blogClosedDecision('/seo-vigo').type, 'next');
  assert.equal(importManifest.pagesToImport.length, 1);
  assert.equal(importManifest.pagesToImport[0].url, '/seo-vigo');
  assert.equal(importManifest.pagesToImport[0].kind, 'page');
});

test('migración-seo-alternativa has own canonical, no noindex, one sitemap loc', () => {
  const path = '/blog/seo/migracion-seo-cambiar-de-plataforma-alternativa';
  const loc = `${APEX}${path}`;
  assert.equal(canonicalForPath(path), loc);
  assert.match(blogPage, /canonicalForPath\(\s*blogPostPath\(post\),?\s*\)/);
  assert.doesNotMatch(blogPage, /MIGRACION_SEO_PLAN_PATH/);
  assert.doesNotMatch(blogPage, /MIGRACION_SEO_ALT_BLOG_SLUG[\s\S]{0,80}robots/);
  assert.doesNotMatch(blogPage, /index:\s*false/);
  assert.equal(getSitemapLocs().filter((item) => item === loc).length, 1);
  assert.equal((buildSitemapXml().match(/<loc>https:\/\/playfulagency\.com\/blog\/seo\/migracion-seo-cambiar-de-plataforma-alternativa<\/loc>/g) || []).length, 1);
});

test('/agencia-sem keeps its own absolute canonical', () => {
  assert.equal(canonicalForPath('/agencia-sem'), `${APEX}/agencia-sem`);
  assert.match(slugPage, /canonicalForPath\(`\/\$\{slug\}`\)/);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/agencia-sem'), true);
  assert.equal(getSitemapLocs().includes(`${APEX}/agencia-sem`), true);
});
