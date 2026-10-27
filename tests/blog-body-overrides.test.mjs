import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ZELLE_VE_BLOG_SLUG,
  ZELLE_VE_BLOG_BODY_HTML,
  ZELLE_FROZEN_HEADING_IDS,
  MIGRACION_SEO_ALT_BLOG_BODY_HTML,
  blogBodyForSlug,
} = await import('../lib/blog-body-overrides.ts');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

const ZELLE_TITLE =
  'Zelle en Venezuela: Un método de pago que puedes integrar en tu tienda en línea';
const ZELLE_DOCUMENT_TITLE =
  'Zelle en Venezuela: cómo cobrar en tu tienda | Playful';
const ZELLE_META =
  'Zelle en Venezuela: cómo funciona, qué bancos lo admiten y cómo integrarlo en el checkout de tu tienda online para validar pagos sin hacerlo a mano.';

test('closed list overrides only the signed Zelle VE slug', () => {
  assert.equal(ZELLE_VE_BLOG_SLUG, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
  assert.ok(blogBodyForSlug(ZELLE_VE_BLOG_SLUG).length > 0);
  assert.equal(blogBodyForSlug('cintillos-de-promocion'), '');
  assert.equal(blogBodyForSlug('actualizar-tu-e-commerce'), '');
});

test('Zelle rewrite keeps the signed opening and aviso, drops the live WP lead', () => {
  const html = blogBodyForSlug(ZELLE_VE_BLOG_SLUG);
  assert.match(html, /Si ya recibes pagos por Zelle/);
  assert.match(html, /<blockquote>[\s\S]*<strong>Aviso importante:<\/strong>/);
  assert.doesNotMatch(html, /Para nadie es un secreto que Zelle/);
});

test('Zelle heading ids stay frozen for GSC fragment URLs', () => {
  const ids = [
    ...ZELLE_VE_BLOG_BODY_HTML.matchAll(/<h[23] id="([^"]+)">/g),
  ].map((match) => match[1]);
  assert.deepEqual(ids, [...ZELLE_FROZEN_HEADING_IDS]);
});

test('Zelle rewrite headings have ids for TOC and preserve in-site links', () => {
  const h2s = [...ZELLE_VE_BLOG_BODY_HTML.matchAll(/<h2 id="([^"]+)">([^<]+)<\/h2>/g)].map(
    (match) => ({ id: match[1], text: match[2] }),
  );
  assert.equal(h2s.length, 8);
  assert.ok(h2s.every((h) => h.id.length > 0));
  assert.equal(h2s[0].text, '¿Qué es Zelle?');
  assert.match(
    ZELLE_VE_BLOG_BODY_HTML,
    /<h3 id="tiendas-online-en-venezuela-que-usan-zelle">Tiendas Online en Venezuela que usan Zelle<\/h3>/,
  );
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /https:\/\/playfulagency\.com\/agencia-e-commerce/);
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /https:\/\/playfulagency\.com\/agencia-shopify/);
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /https:\/\/playfulagency\.com\/reunion-playful/);
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /uno de los métodos de pago más utilizados/);
  assert.match(
    ZELLE_VE_BLOG_BODY_HTML,
    /trabajamos <a href="\/agencia-shopify">la integración de pagos para marcas que venden desde Venezuela<\/a>, y Zelle/,
  );
  assert.doesNotMatch(ZELLE_VE_BLOG_BODY_HTML, /pagos-online-ecommerce/);
  assert.doesNotMatch(ZELLE_VE_BLOG_BODY_HTML, /pasarela-de-pago-ecommerce/);
  assert.match(
    ZELLE_VE_BLOG_BODY_HTML,
    /data-playful-zelle-cierre="2710"/,
  );
  assert.match(
    ZELLE_VE_BLOG_BODY_HTML,
    /<a href="\/agencia-shopify">integrar Zelle y pagos locales en tu tienda Shopify<\/a>/,
  );
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /COPY SIN FIRMAR — Contenido:/);
});

test('migración SEO override books via /reunion-playful, not the widget API', () => {
  assert.match(MIGRACION_SEO_ALT_BLOG_BODY_HTML, /href="\/reunion-playful"/);
  assert.doesNotMatch(
    MIGRACION_SEO_ALT_BLOG_BODY_HTML,
    /api\.playfulagency\.com\/widget\/bookings/,
  );
});

test('blog post page prefers the body override before WP rendered HTML', () => {
  assert.match(blogPage, /rewriteInSitePageHrefs\(/);
  assert.match(blogPage, /blogBodyForSlug\(postSlug\) \|\| post\.content\?\.rendered/);
  assert.match(blogPage, /BLOG_SEO_OVERRIDES\[postSlug\]\?\.h1/);
  assert.match(blogPage, /zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce/);
  assert.ok(blogPage.includes(ZELLE_DOCUMENT_TITLE));
  assert.ok(blogPage.includes(`h1: '${ZELLE_TITLE}'`));
  assert.ok(!blogPage.includes(`${ZELLE_TITLE} | Blog - Playful Agency`));
  assert.ok(blogPage.includes(ZELLE_META));
  assert.match(blogPage, /Cintillos de promoción en ecommerce \| Playful/);
});
