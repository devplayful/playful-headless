import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const categoryRedirects = require('../utils/blog-category-redirect-map.json');
const canibalizacionOrigins = require('../utils/blog-canibalizacion-redirect-map.json');
const seoServiceRedirects = require('../utils/seo-service-redirect-map.json');
const unpublishedLandingRedirects = require('../utils/unpublished-landing-redirect-map.json');
const seoCruce2810Redirects = require('../utils/seo-cruce-2810-redirect-map.json');
const noImportManifest = require('../docs/migracion/payload-no-importar.json');
const {
  mergeCanibalizacionIntoPermanent301,
} = await import('../utils/blog-canibalizacion-redirects.ts');
const { blogClosedDecision } = await import('../utils/blog-closed-paths.ts');
const {
  noImportUrls,
  pathnameFromDest,
} = await import('../utils/seo-cruce-2810.ts');
const { buildSitemapXml, getSitemapLocs } = await import('../utils/apex-sitemap.ts');

const APEX = 'https://playfulagency.com';

const permanent301 = {
  ...mergeCanibalizacionIntoPermanent301({
    '/servicios': '/agencia-e-commerce',
    '/services': '/agencia-e-commerce',
    '/contacto': '/contactar-agencia-de-marketing-digital',
    '/contactanos': '/contactar-agencia-de-marketing-digital',
    '/casos': '/casos-de-exito',
    '/casos-de-exito-agencia-de-marketing-digital': '/casos-de-exito',
    '/blog/email-marketing/tipos-de-publicidad-online':
      `${APEX}/blog/pautas-digitales/publicidad-digital-en-tu-negocio`,
    '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads':
      `${APEX}/blog/otros/conoce-todo-sobre-instagram-ads`,
    '/otros/conoce-todo-sobre-instagram-ads':
      `${APEX}/blog/otros/conoce-todo-sobre-instagram-ads`,
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad':
      `${APEX}/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad`,
    '/blog/pautas-digitales/aprende-a-humanizar-la-marca-de-tu-negocio':
      '/blog/pautas-digitales/storytelling-en-el-marketing-digital',
    ...seoServiceRedirects,
    ...unpublishedLandingRedirects,
    ...canibalizacionOrigins,
  }, categoryRedirects),
  ...seoCruce2810Redirects,
};

function resolveNoImport(url) {
  if (blogClosedDecision(url).type === 'gone') {
    return { status: 410, dest: null };
  }
  const dest = permanent301[url];
  if (dest) {
    return { status: 301, dest: pathnameFromDest(dest) };
  }
  return { status: 0, dest: null };
}

test('no-importar manifest lists the 75 CSV URLs and none enter the sitemap', () => {
  const rows = noImportUrls();
  assert.equal(rows.length, 75);
  assert.equal(noImportManifest.count, 75);
  assert.equal(noImportManifest.urls.length, 75);
  assert.deepEqual(
    noImportManifest.urls.map((item) => item.url),
    rows.map((row) => row.url),
  );

  const locs = getSitemapLocs();
  const xml = buildSitemapXml();
  for (const row of rows) {
    const loc = row.url === '/' ? `${APEX}/` : `${APEX}${row.url}`;
    assert.equal(locs.includes(loc), false, loc);
    assert.doesNotMatch(
      xml,
      new RegExp(`<loc>${loc.replaceAll('/', '\\/').replaceAll('.', '\\.')}</loc>`),
    );
  }
});

test('each no-importar URL resolves in code to its 301 or 410', () => {
  for (const item of noImportManifest.urls) {
    const resolved = resolveNoImport(item.url);
    assert.equal(resolved.status, item.expected, `${item.url} → ${item.expected}`);
    if (item.expected === 301) {
      assert.equal(resolved.dest, pathnameFromDest(item.destino_301), item.url);
    }
    if (item.expected === 410) {
      assert.equal(resolved.dest, null, item.url);
    }
  }
});
