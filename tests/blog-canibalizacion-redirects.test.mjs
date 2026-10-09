import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const categoryRedirects = require('../utils/blog-category-redirect-map.json');
const canibalizacionOrigins = require('../utils/blog-canibalizacion-redirect-map.json');
const {
  CANIBALIZACION_301,
  CANIBALIZACION_DEFERRED_PATHS,
  canibalizacionDestination,
  isCanibalizacionDestinationPath,
  isCanibalizacionOriginPath,
  mergeCanibalizacionIntoPermanent301,
  originForLegacySource,
  remapCanibalizacionHref,
} = await import('../utils/blog-canibalizacion-redirects.ts');
const {
  CLOSED_BLOG_PATHS,
  GSC_GONE_PATHS,
  blogClosedDecision,
} = await import('../utils/blog-closed-paths.ts');
const { buildSitemapXml, getSitemapLocs } = await import('../utils/apex-sitemap.ts');
const {
  INTERNACIONAL_SEO_HREF,
  rewriteInternacionalSeoHrefs,
} = await import('../utils/booking.ts');

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const APEX = 'https://playfulagency.com';

const ORIGINS = [
  [
    '/blog/pautas-digitales/5-ventajas-para-obtener-clientes-con-facebook-ads',
    '/blog/pautas-digitales/como-crear-anuncios-en-facebook',
  ],
  ['/blog/seo/todo-sobre-el-seo', '/blog/seo/aprende-todo-sobre-el-seo'],
  ['/blog/seo/como-hacer-posicionamiento-web-en-buscadores', '/blog/seo/aprende-todo-sobre-el-seo'],
  ['/blog/seo/7-consejos-seo-para-posicionar-tu-pagina', '/blog/seo/aprende-todo-sobre-el-seo'],
  [
    '/blog/otros/descubre-por-que-debes-usar-whatsapp-business-en-tu-negocio',
    '/blog/pautas-digitales/whatsapp-business',
  ],
  [
    '/blog/pautas-digitales/como-crear-anuncios-en-instagram',
    '/blog/otros/conoce-todo-sobre-instagram-ads',
  ],
  [
    '/blog/mas-vistos/como-hacer-publicidad-en-instagram-en-el-2023',
    '/blog/otros/conoce-todo-sobre-instagram-ads',
  ],
  [
    '/blog/tecnologia/chatbot-inteligencia-artificial-personalizada-para-tu-activo-digital',
    '/blog/tecnologia/como-crear-un-chatbot-para-tu-empresa-en-5-minutos',
  ],
  [
    '/blog/pautas-digitales/estrategias-de-marketing-digital-para-el-2022',
    '/blog/pautas-digitales/guia-para-hacer-marketing-digital',
  ],
  [
    '/blog/otros/por-que-debes-hacer-publicidad-digital-en-tu-negocio',
    '/blog/pautas-digitales/publicidad-digital-en-tu-negocio',
  ],
  [
    '/blog/pautas-digitales/tipos-de-publicidad-online',
    '/blog/pautas-digitales/publicidad-digital-en-tu-negocio',
  ],
  [
    '/blog/email-marketing/email-marketing-una-herramienta-que-no-puedes-dejar-de-usar-en-tu-empresa',
    '/blog/email-marketing/estrategia-de-email-marketing',
  ],
  [
    '/blog/email-marketing/email-marketing-efectivo-que-todas-las-empresas-deben-usar',
    '/blog/email-marketing/estrategia-de-email-marketing',
  ],
  [
    '/blog/email-marketing/email-marketing-beneficio-que-te-generara-ingresos',
    '/blog/email-marketing/estrategia-de-email-marketing',
  ],
  [
    '/blog/email-marketing/aprende-como-hacer-un-estrategia-digital-de-email-marketing',
    '/blog/email-marketing/estrategia-de-email-marketing',
  ],
];

const permanent301 = mergeCanibalizacionIntoPermanent301({
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
  ...canibalizacionOrigins,
}, categoryRedirects);

test('closed list is exactly 15 origins, each a 301 to an absolute apex dest', () => {
  assert.equal(Object.keys(CANIBALIZACION_301).length, 15);
  assert.equal(ORIGINS.length, 15);
  const originSet = new Set(ORIGINS.map(([origin]) => origin));
  assert.equal(originSet.size, 15);

  for (const [origin, destPath] of ORIGINS) {
    const dest = `${APEX}${destPath}`;
    assert.equal(CANIBALIZACION_301[origin], dest, origin);
    assert.equal(canibalizacionDestination(origin), dest, origin);
    assert.equal(canibalizacionDestination(`${origin}/`), dest, `${origin}/`);
    assert.equal(permanent301[origin], dest, origin);
    assert.equal(isCanibalizacionOriginPath(origin), true, origin);
    assert.equal(isCanibalizacionDestinationPath(destPath), true, destPath);
    assert.equal(isCanibalizacionOriginPath(destPath), false, destPath);
  }
});

test('no destination is also an origin — one hop only', () => {
  const origins = new Set(Object.keys(CANIBALIZACION_301));
  for (const [origin, dest] of Object.entries(CANIBALIZACION_301)) {
    assert.match(dest, /^https:\/\/playfulagency\.com\/blog\//);
    const destPath = new URL(dest).pathname;
    assert.equal(origins.has(destPath), false, `${origin} → ${destPath}`);
    assert.equal(CANIBALIZACION_301[destPath], undefined, destPath);
    assert.notEqual(origin, destPath);
  }
});

test('origins and destinations do not collide with the 410 inventory', () => {
  const closed = new Set([...CLOSED_BLOG_PATHS, ...GSC_GONE_PATHS]);
  for (const [origin, dest] of Object.entries(CANIBALIZACION_301)) {
    const destPath = new URL(dest).pathname;
    assert.equal(closed.has(origin), false, origin);
    assert.equal(closed.has(destPath), false, destPath);
    assert.equal(blogClosedDecision(origin).type, 'next', origin);
    assert.equal(blogClosedDecision(destPath).type, 'next', destPath);
  }
});

test('deferred receptor pages stay out of this 301 set', () => {
  for (const path of CANIBALIZACION_DEFERRED_PATHS) {
    assert.equal(CANIBALIZACION_301[path], undefined, path);
    assert.equal(isCanibalizacionOriginPath(path), false, path);
    assert.equal(permanent301[path], undefined, path);
  }
  assert.equal(
    categoryRedirects['/blog/pautas-digitales/que-es-una-agencia-de-sem'],
    '/blog/mas-vistos/que-es-una-agencia-de-sem',
  );
});

test('legacy apex aliases that end on a 15-origin go straight to the new dest', () => {
  assert.equal(
    permanent301['/blog/email-marketing/tipos-de-publicidad-online'],
    `${APEX}/blog/pautas-digitales/publicidad-digital-en-tu-negocio`,
  );
  assert.equal(
    permanent301['/blog/pautas-digitales/como-hacer-publicidad-en-instagram-en-el-2023'],
    `${APEX}/blog/otros/conoce-todo-sobre-instagram-ads`,
  );
  assert.equal(
    categoryRedirects['/blog/pautas-digitales/como-hacer-publicidad-en-instagram-en-el-2023'],
    '/blog/otros/conoce-todo-sobre-instagram-ads',
  );
  assert.equal(
    originForLegacySource('/blog/pautas-digitales/5-ventajas-para-obtener-clientes-con-facebook-ads'),
    '/blog/pautas-digitales/5-ventajas-para-obtener-clientes-con-facebook-ads',
  );
  assert.equal(
    permanent301['/blog/pautas-digitales/5-ventajas-para-obtener-clientes-con-facebook-ads'],
    `${APEX}/blog/pautas-digitales/como-crear-anuncios-en-facebook`,
  );
});

test('middleware 301s the merged map in one hop and does not chain through an origin', () => {
  assert.match(middlewareSource, /mergeCanibalizacionIntoPermanent301/);
  assert.match(middlewareSource, /blog-canibalizacion-redirect-map\.json/);
  assert.match(middlewareSource, /NextResponse\.redirect\(target, 301\)/);
  const destLookup = middlewareSource.slice(
    middlewareSource.indexOf('const dest = PERMANENT_301[path]'),
    middlewareSource.indexOf('const blogSeo'),
  );
  assert.match(destLookup, /NextResponse\.redirect\(target, 301\)/);
  assert.doesNotMatch(destLookup, /blogSeoRedirectDecision/);
});

test('sitemap drops the 15 origins and keeps their destinations', () => {
  const locs = getSitemapLocs();
  const xml = buildSitemapXml();
  for (const [origin, destPath] of ORIGINS) {
    const originLoc = `${APEX}${origin}`;
    const destLoc = `${APEX}${destPath}`;
    assert.equal(locs.includes(originLoc), false, originLoc);
    assert.doesNotMatch(xml, new RegExp(`${originLoc.replaceAll('/', '\\/')}<`));
    assert.equal(locs.includes(destLoc), true, destLoc);
    assert.match(xml, new RegExp(`${destLoc.replaceAll('/', '\\/')}<`));
  }
});

test('internal href remaps keep query and hash and do not touch the deferred slugs', () => {
  assert.equal(
    remapCanibalizacionHref('/blog/seo/todo-sobre-el-seo?utm=1#toc'),
    '/blog/seo/aprende-todo-sobre-el-seo?utm=1#toc',
  );
  assert.equal(
    remapCanibalizacionHref(`${APEX}/blog/pautas-digitales/tipos-de-publicidad-online/`),
    `${APEX}/blog/pautas-digitales/publicidad-digital-en-tu-negocio`,
  );
  assert.equal(
    remapCanibalizacionHref('/blog/mas-vistos/que-es-una-agencia-de-sem'),
    '/blog/mas-vistos/que-es-una-agencia-de-sem',
  );
});

test('agencia-seo and agencia-sem hrefs skip the short 301 and keep the anchor', () => {
  const html = '<a class="master-link" href="/agencia-seo-internacional-en-el-2025-es-una-necesidad">Lee el artículo</a>';
  const seo = rewriteInternacionalSeoHrefs(html, 'agencia-seo');
  const sem = rewriteInternacionalSeoHrefs(html, 'agencia-sem');
  assert.equal(seo, `<a class="master-link" href="${INTERNACIONAL_SEO_HREF}">Lee el artículo</a>`);
  assert.equal(sem, seo);
  assert.equal(rewriteInternacionalSeoHrefs(html, 'agencia-diseno-web'), html);
  assert.equal(rewriteInternacionalSeoHrefs(html, 'agencia-e-commerce'), html);
});
