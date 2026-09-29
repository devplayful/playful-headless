import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ZELLE_VE_BLOG_SLUG,
  ZELLE_VE_BLOG_BODY_HTML,
  CASHEA_COMERCIOS_BLOG_SLUG,
  CASHEA_COMERCIOS_BLOG_BODY_HTML,
  blogBodyForSlug,
} = await import('../lib/blog-body-overrides.ts');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

const ZELLE_TITLE =
  'Zelle en Venezuela: Un método de pago que puedes integrar en tu tienda en línea';
const ZELLE_DOCUMENT_TITLE =
  'Zelle en Venezuela: cobra en tu tienda online | Playful';
const ZELLE_META =
  'Integra Zelle como método de pago en tu tienda online en Venezuela y automatiza la validación. Playful conecta tu checkout; no abrimos ni creamos cuentas Zelle.';

test('closed list overrides only the signed Zelle VE and Cashea slugs', () => {
  assert.equal(ZELLE_VE_BLOG_SLUG, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
  assert.equal(CASHEA_COMERCIOS_BLOG_SLUG, 'cashea-para-comercios');
  assert.ok(blogBodyForSlug(ZELLE_VE_BLOG_SLUG).length > 0);
  assert.ok(blogBodyForSlug(CASHEA_COMERCIOS_BLOG_SLUG).length > 0);
  assert.equal(blogBodyForSlug('cintillos-de-promocion'), '');
  assert.equal(blogBodyForSlug('actualizar-tu-e-commerce'), '');
  assert.equal(blogBodyForSlug('migracion-seo-cambiar-de-plataforma'), '');
});

test('Zelle rewrite keeps the signed opening and aviso, drops the live WP lead', () => {
  const html = blogBodyForSlug(ZELLE_VE_BLOG_SLUG);
  assert.match(html, /Si ya recibes pagos por Zelle/);
  assert.match(html, /<blockquote>[\s\S]*<strong>Aviso importante:<\/strong>/);
  assert.doesNotMatch(html, /Para nadie es un secreto que Zelle/);
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
});

test('Cashea rewrite keeps the signed opening, headings and in-site links', () => {
  const html = blogBodyForSlug(CASHEA_COMERCIOS_BLOG_SLUG);
  assert.match(html, /Si tu tienda ya vende y tus compradores te preguntan/);
  assert.match(
    html,
    /<h2 id="que-es-cashea-para-un-comercio-y-que-es-la-app-del-comprador">Qué es Cashea para un comercio \(y qué es la app del comprador\)<\/h2>/,
  );
  assert.match(
    html,
    /<h3 id="playful-me-puede-afiliar-a-cashea">¿Playful me puede afiliar a Cashea\?<\/h3>/,
  );
  assert.match(html, /https:\/\/playfulagency\.com\/pasarela-de-pagos-venezuela/);
  assert.match(html, /https:\/\/playfulagency\.com\/reunion-playful/);
  assert.match(html, /<code>cashea-web-checkout-sdk<\/code>/);
  assert.doesNotMatch(html, /PrimeShoes/i);
  assert.doesNotMatch(html, /calzado/i);
  const h2s = [...CASHEA_COMERCIOS_BLOG_BODY_HTML.matchAll(/<h2 id="([^"]+)">/g)];
  assert.equal(h2s.length, 8);
});

test('blog post page prefers the body override before WP rendered HTML', () => {
  assert.match(blogPage, /blogBodyForSlug\(postSlug\) \|\| post\.content\?\.rendered/);
  assert.match(blogPage, /BLOG_SEO_OVERRIDES\[postSlug\]\?\.h1/);
  assert.match(blogPage, /zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce/);
  assert.ok(blogPage.includes(ZELLE_DOCUMENT_TITLE));
  assert.ok(blogPage.includes(`h1: '${ZELLE_TITLE}'`));
  assert.ok(!blogPage.includes(`${ZELLE_TITLE} | Blog - Playful Agency`));
  assert.ok(blogPage.includes(ZELLE_META));
  assert.ok(blogPage.includes('Cashea para comercios: cuotas en tu tienda online'));
  assert.ok(blogPage.includes('cashea-para-comercios'));
  assert.match(blogPage, /Cintillos publicitarios en ecommerce: guía práctica \| Playful/);
  assert.match(
    blogPage,
    /Cintillos publicitarios en ecommerce: cómo diseñarlos para atraer y retener clientes/,
  );
});
