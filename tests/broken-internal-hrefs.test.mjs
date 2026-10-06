import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

import { rewriteInSitePageHrefs, rewriteWpRenderedHtmlFields } from '../services/rewrite-in-site-hrefs.mjs';
import {
  BROKEN_HREF_DEFAULTS,
  CONTACT_HREF,
  DEAD_FORM_HOST_DEST,
  SKIP_BROKEN_HREF_PATHS,
  UNMAPPED_BROKEN_HREFS,
  listedUnmappedPath,
  liveBlogPathBySlug,
  parseHref,
  rewriteBrokenInternalHref,
} from '../utils/broken-internal-hrefs.ts';
import { CLOSED_BLOG_PATHS } from '../utils/blog-closed-paths.ts';

const require = createRequire(import.meta.url);
const inventory = require('./fixtures/broken-internal-href-inventory.json');

const BROKEN_TODAY = new Set([
  ...Object.keys(BROKEN_HREF_DEFAULTS),
  '/servicios/automatizacion-del-marketing',
  '/servicios/pautas-digitales',
  '/seo',
  '/e-books/Seo-Local/Playful_Agengy_Ebook_seo_local.pdf',
  '/blog/otros/podcast-una-herramienta-de-contenido-para-ganar-autoridad',
  '/como-hacer-que-se-enamoren-de-tu-marca',
  '/blog/pautas-digitales/actualizaciones-de-instagram',
  '/blog/seo/busqueda-por-voz-que-es-y-como-afecta-al-seo',
  '/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona',
  '/blog/pautas-digitales/porque-tener-un-perfil-empresarial-en-linkedin',
  '/google-grants-descubre-que-es-y-como-funciona',
  '/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/cintillos-de-promocion',
  '/los-5-problemas-de-e-commerce',
  '/actualizar-tu-e-commerce',
  '/crear-un-e-commerce',
  '/que-es-una-agencia-de-sem',
  '/publicidad-digital-en-tu-negocio',
  '/category/tecnologia',
  '/category/mas-vistos',
  '/author/stefanniparabavidez',
  '/author/lsantamaria',
  '/author/arosillo',
  '/caso-de-exito-pcm',
  '/project/bottle-mockup',
  '/project/cosmetic-mockup',
  '/project/minimalist-chair',
  '/project/ui-app-template',
  '/project/web-design',
  '/projects',
  '/blog/tecnologia/lenguajes-de-programacion-para-que-sirve-y-cuales-son-los-mas-usados',
  '/blog/email-marketing/como-hacer-un-email-marketing-eficaz-durante-la-pandemia',
]);

function extractHrefs(html) {
  return [...html.matchAll(/href=(["'])([^"']*)\1/gi)].map((match) => match[2]);
}

function isBrokenToday(href) {
  const parsed = parseHref(href);
  if (!parsed) return false;
  if (parsed.host.endsWith('.crear.endpoint.playfulagency.com')) return true;
  return BROKEN_TODAY.has(parsed.pathname);
}

function renderInventory(hrefs) {
  return hrefs.map((href, index) => `<a href="${href}">anchor-${index}</a>`).join('');
}

test('does not change anchor text when rewriting a dest', () => {
  const html = '<p>Lee <a class="x" href="/servicios/seo">trabajo SEO</a> hoy.</p>';
  const rewritten = rewriteInSitePageHrefs(html, '/blog/seo/chat-gpt-puede-mejorar-el-seo-de-una-pagina-web');
  assert.equal(rewritten, '<p>Lee <a class="x" href="/agencia-seo">trabajo SEO</a> hoy.</p>');
});

test('leaves /landing-seo and unpublished landings untouched', () => {
  const html = [
    '<a href="/landing-seo">Landing Page SEO</a>',
    '<a href="/pasarela-de-pagos-venezuela">pasarela</a>',
    '<a href="/agencia-prestashop">prestashop</a>',
    '<a href="/agencia-woocommerce">woo</a>',
  ].join('');
  assert.equal(rewriteInSitePageHrefs(html, '/blog/seo/aprende-todo-sobre-el-seo'), html);
  for (const path of SKIP_BROKEN_HREF_PATHS) {
    assert.equal(rewriteBrokenInternalHref(path, '/blog/seo/aprende-todo-sobre-el-seo'), path);
  }
});

test('maps service and misplaced blog dests from the Contenido map', () => {
  assert.equal(rewriteBrokenInternalHref('/servicios/seo'), '/agencia-seo');
  assert.equal(rewriteBrokenInternalHref('/servicios/desarrollo-web'), '/agencia-diseno-web');
  assert.equal(
    rewriteBrokenInternalHref('/servicios/desarrollo-web', '/ecommerce-mi-negocio-online'),
    '/agencia-e-commerce',
  );
  assert.equal(
    rewriteBrokenInternalHref('/seo', '/blog/seo/que-es-un-blog'),
    '/agencia-seo',
  );
  assert.equal(
    rewriteBrokenInternalHref('/seo', '/blog/seo/desarrollo-ui-ux'),
    '/blog/seo/aprende-todo-sobre-el-seo',
  );
  assert.equal(
    rewriteBrokenInternalHref(
      '/servicios/automatizacion-del-marketing',
      '/blog/pautas-digitales/la-nueva-gestion-de-google-ads',
    ),
    '/agencia-sem',
  );
  assert.equal(
    rewriteBrokenInternalHref(
      '/servicios/automatizacion-del-marketing',
      '/blog/email-marketing/haz-email-marketing-como-todo-un-experto-ejemplos',
    ),
    CONTACT_HREF,
  );
  assert.equal(
    rewriteBrokenInternalHref(
      '/servicios/pautas-digitales',
      '/blog/seo/como-hacer-posicionamiento-web-en-buscadores',
    ),
    '/agencia-sem',
  );
  assert.equal(
    rewriteBrokenInternalHref(
      '/servicios/pautas-digitales',
      '/blog/pautas-digitales/el-sms-marketing',
    ),
    '/servicios/pautas-digitales',
  );
  assert.equal(
    rewriteBrokenInternalHref('/blog/email-marketing/como-hacer-un-email-marketing-eficaz-durante-la-pandemia'),
    '/blog/email-marketing/estrategia-de-email-marketing',
  );
});

test('rewrites SEO form hosts and leaves email/promo forms listed', () => {
  assert.equal(
    rewriteBrokenInternalHref('https://seo.crear.endpoint.playfulagency.com/'),
    '/agencia-seo',
  );
  assert.equal(
    rewriteBrokenInternalHref('https://auditoria-seo.crear.endpoint.playfulagency.com/?x=1#go'),
    '/agencia-seo?x=1#go',
  );
  assert.equal(
    Object.keys(DEAD_FORM_HOST_DEST).sort().join(','),
    'auditoria-seo.crear.endpoint.playfulagency.com,seo.crear.endpoint.playfulagency.com',
  );
  const email = 'https://emailmarketing.crear.endpoint.playfulagency.com/';
  const promo = 'https://promociones.crear.endpoint.playfulagency.com/optin1631114756459';
  assert.equal(rewriteBrokenInternalHref(email), email);
  assert.equal(rewriteBrokenInternalHref(promo), promo);
  assert.equal(listedUnmappedPath(email), true);
  assert.equal(listedUnmappedPath(promo), true);
});

test('resolves bare landing slugs to the live blog path and never revives a 410', () => {
  assert.equal(
    rewriteBrokenInternalHref('/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  );
  assert.equal(
    rewriteBrokenInternalHref('/que-es-una-agencia-de-sem'),
    '/blog/mas-vistos/que-es-una-agencia-de-sem',
  );
  assert.equal(
    rewriteBrokenInternalHref('/google-grants-descubre-que-es-y-como-funciona'),
    '/google-grants-descubre-que-es-y-como-funciona',
  );
  for (const closed of CLOSED_BLOG_PATHS) {
    assert.equal(
      Object.values(BROKEN_HREF_DEFAULTS).includes(closed),
      false,
      closed,
    );
    assert.equal(liveBlogPathBySlug()[closed.split('/').pop()], undefined, closed);
  }
});

test('inventory: every mapped post keeps no leftover 404/410 dest except listed leftovers', () => {
  const leftovers = [];
  for (const [path, hrefs] of Object.entries(inventory.posts)) {
    const html = renderInventory(hrefs);
    const rewritten = rewriteInSitePageHrefs(html, path);
    const inner = [...html.matchAll(/>([^<]*)</g)].map((match) => match[1]);
    const rewrittenInner = [...rewritten.matchAll(/>([^<]*)</g)].map((match) => match[1]);
    assert.deepEqual(rewrittenInner, inner, path);
    for (const href of extractHrefs(rewritten)) {
      if (isBrokenToday(href) && !listedUnmappedPath(href, path)) {
        leftovers.push(`${path} → ${href}`);
      }
    }
  }
  assert.deepEqual(leftovers, []);
  assert.equal(Object.keys(inventory.posts).length, 58);
});

test('inventory: the four landings rewrite news-block dests and leave listed leftovers', () => {
  for (const [path, hrefs] of Object.entries(inventory.landings)) {
    const rewritten = rewriteInSitePageHrefs(renderInventory(hrefs), path);
    const leftover = extractHrefs(rewritten).filter((href) => isBrokenToday(href));
    for (const href of leftover) {
      assert.equal(listedUnmappedPath(href, path), true, `${path} → ${href}`);
    }
    assert.match(rewritten, /\/blog\/tecnologia\/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce/);
    assert.doesNotMatch(rewritten, /href="\/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce"/);
  }
  assert.deepEqual(Object.keys(inventory.landings).sort(), [
    '/agencia-diseno-web',
    '/agencia-e-commerce',
    '/agencia-sem',
    '/agencia-seo',
  ]);
});

test('rewriteWpRenderedHtmlFields uses the post slug for contextual dests', () => {
  const post = rewriteWpRenderedHtmlFields({
    slug: 'ecommerce-mi-negocio-online',
    content: { rendered: '<a href="/servicios/desarrollo-web">equipo de desarrollo web</a>' },
    excerpt: { rendered: '<a href="https://seo.crear.endpoint.playfulagency.com/">SEO</a>' },
  });
  assert.match(post.content.rendered, /href="\/agencia-e-commerce"/);
  assert.match(post.content.rendered, />equipo de desarrollo web</);
  assert.match(post.excerpt.rendered, /href="\/agencia-seo"/);
});

test('getPageBySlug and the in-site rewriter pass a source path into the broken-href map', async () => {
  const wordpress = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const rewriter = await readFile(new URL('../services/rewrite-in-site-hrefs.mjs', import.meta.url), 'utf8');
  const pageFn = wordpress.slice(
    wordpress.indexOf('export async function getPageBySlug'),
    wordpress.indexOf('\n// Interfaz para los ítems del menú'),
  );
  assert.match(pageFn, /rewriteInSitePageHrefs\(stripScripts\(rawHtml\), `\/\$\{slug\}`\)/);
  assert.match(rewriter, /rewriteBrokenInternalHref\(relative, sourcePath\)/);
  assert.match(rewriter, /item\.slug === 'string' && item\.slug \? `\/\$\{item\.slug\}`/);
});

test('unmapped leftovers stay documented and are not silently dropped', () => {
  assert.ok(UNMAPPED_BROKEN_HREFS.length >= 15);
  for (const item of UNMAPPED_BROKEN_HREFS) {
    assert.equal(rewriteBrokenInternalHref(item.href, '/agencia-seo'), item.href);
    assert.ok(item.reason.length > 8);
  }
});
