import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { ZELLE_VE_BLOG_SLUG, ZELLE_VE_BLOG_BODY_HTML } = await import(
  '../lib/blog-body-overrides.ts'
);
const {
  CIMA_BLOG_SLUG,
  CIMA_FAQ_H3S,
  CIMA_SHOPIFY_LINK_DECISION,
  UNSIGNED_FINAL_CTA_BUTTON,
  ZELLE_CIERRE_SHOPIFY_ANCHOR,
  blogFinalCtaButtonText,
  blogFinalCtaHref,
  blogHeroTitleIsH2Duplicate,
  demoteCimaFaqHeadings,
  isBlogOnpage2710Slug,
} = await import('../utils/blog-onpage-2710.ts');
const { CONTACT_HREF, SERVICE_BOOKING_HREF } = await import('../utils/booking.ts');

const blogPage = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const listing = readFileSync(new URL('../app/blog/blog-listing-view.tsx', import.meta.url), 'utf8');

const CONTROL_SLUG = 'cintillos-de-promocion';

const CIMA_BODY = `
<h2 id="que-son-los-premios-cima-2026">¿Qué son los Premios CIMA 2026?</h2>
<p>Los Premios CIMA 2026 son la cuarta edición.</p>
<h3 id="que-son-los-premios-cima">¿Qué son los premios CIMA?</h3>
<p>Los Premios CIMA son un certamen venezolano de mercadeo y creatividad.</p>
<h3 id="cuando-y-donde-fue-la-gala-faq">¿Cuándo y dónde fue la gala de los Premios CIMA 2026?</h3>
<p>La gala fue el 19 de octubre de 2026.</p>
<h3 id="quien-gano-faq">¿Quién ganó los Premios CIMA 2026 en Plataforma de E-commerce?</h3>
<p>Ganaron SoyTechno y Playful Agency.</p>
<h3 id="que-consiguio-soytechno-2025">¿Qué consiguió SoyTechno en 2025?</h3>
<p>En 2025 SoyTechno cerró el año con 12.722 ventas.</p>
`;

test('only Zelle and CIMA are in the closed on-page slug list', () => {
  assert.equal(ZELLE_VE_BLOG_SLUG, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
  assert.equal(CIMA_BLOG_SLUG, 'premios-cima-2026-soytechno-playful');
  assert.equal(isBlogOnpage2710Slug(ZELLE_VE_BLOG_SLUG), true);
  assert.equal(isBlogOnpage2710Slug(CIMA_BLOG_SLUG), true);
  assert.equal(isBlogOnpage2710Slug(CONTROL_SLUG), false);
  assert.equal(isBlogOnpage2710Slug('cashea-para-comercios'), false);
});

test('hero H2 is demoted only for Zelle and CIMA', () => {
  assert.equal(blogHeroTitleIsH2Duplicate(ZELLE_VE_BLOG_SLUG), true);
  assert.equal(blogHeroTitleIsH2Duplicate(CIMA_BLOG_SLUG), true);
  assert.equal(blogHeroTitleIsH2Duplicate(CONTROL_SLUG), false);
  assert.match(blogPage, /blogHeroTitleIsH2Duplicate\(postSlug\)/);
  assert.match(blogPage, /<h1 className="sr-only">\{pageH1\}<\/h1>/);
  assert.match(
    blogPage,
    /<h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-\[#2A0064\] leading-tight mb-6">/,
  );
});

test('final CTA goes to /reunion-playful only for Zelle and CIMA', () => {
  assert.equal(blogFinalCtaHref(ZELLE_VE_BLOG_SLUG), SERVICE_BOOKING_HREF);
  assert.equal(blogFinalCtaHref(CIMA_BLOG_SLUG), SERVICE_BOOKING_HREF);
  assert.equal(blogFinalCtaHref(CONTROL_SLUG), CONTACT_HREF);
  assert.equal(blogFinalCtaHref('cashea-para-comercios'), CONTACT_HREF);
  assert.equal(blogFinalCtaButtonText(ZELLE_VE_BLOG_SLUG), UNSIGNED_FINAL_CTA_BUTTON);
  assert.equal(blogFinalCtaButtonText(CIMA_BLOG_SLUG), UNSIGNED_FINAL_CTA_BUTTON);
  assert.equal(
    blogFinalCtaButtonText(CONTROL_SLUG),
    'Llena el formulario y hablemos sobre tu web',
  );
  assert.match(blogPage, /buttonLink=\{blogFinalCtaHref\(postSlug\)\}/);
  assert.match(UNSIGNED_FINAL_CTA_BUTTON, /COPY SIN FIRMAR — Contenido:/);
});

test('CIMA FAQ H3s leave the heading tree only on that slug', () => {
  const cima = demoteCimaFaqHeadings(CIMA_BODY, CIMA_BLOG_SLUG);
  assert.equal((cima.match(/<h3\b/g) || []).length, 0);
  assert.equal((cima.match(/<h2\b/g) || []).length, 1);
  assert.equal((cima.match(/data-playful-faq-q="cima-2710"/g) || []).length, 4);
  for (const question of CIMA_FAQ_H3S) {
    assert.match(cima, new RegExp(`<strong>${question.replace(/[?]/g, '\\?')}</strong>`));
  }

  const control = demoteCimaFaqHeadings(CIMA_BODY, CONTROL_SLUG);
  assert.equal(control, CIMA_BODY);
  assert.equal((control.match(/<h3\b/g) || []).length, 4);

  const zelle = demoteCimaFaqHeadings(ZELLE_VE_BLOG_BODY_HTML, ZELLE_VE_BLOG_SLUG);
  assert.equal(zelle, ZELLE_VE_BLOG_BODY_HTML);
});

test('CIMA does not inject /agencia-shopify because SoyTechno is WooCommerce', () => {
  assert.equal(CIMA_SHOPIFY_LINK_DECISION.addAgenciaShopify, false);
  assert.equal(CIMA_SHOPIFY_LINK_DECISION.existingHref, '/agencia-e-commerce');
  assert.match(CIMA_SHOPIFY_LINK_DECISION.reason, /WooCommerce/);
  assert.doesNotMatch(blogPage, /agencia Shopify para marcas D2C/);
});

test('Zelle closing block uses the signed Shopify anchor and reunion button hole', () => {
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /data-playful-zelle-cierre="2710"/);
  assert.match(
    ZELLE_VE_BLOG_BODY_HTML,
    new RegExp(`<a href="/agencia-shopify">${ZELLE_CIERRE_SHOPIFY_ANCHOR}</a>`),
  );
  assert.match(ZELLE_VE_BLOG_BODY_HTML, /href="\/reunion-playful"/);
  assert.doesNotMatch(
    ZELLE_VE_BLOG_BODY_HTML.slice(ZELLE_VE_BLOG_BODY_HTML.indexOf('data-playful-zelle-cierre')),
    /<h[1-6]\b/,
  );
});

test('blog listing dates and shared chrome stay untouched', () => {
  assert.doesNotMatch(listing, /blog-onpage-2710/);
  assert.doesNotMatch(listing, /blogFinalCtaHref/);
  assert.doesNotMatch(listing, /demoteCimaFaqHeadings/);
  assert.doesNotMatch(header, /blog-onpage-2710/);
  assert.doesNotMatch(footer, /blog-onpage-2710/);
  assert.match(blogPage, /demoteCimaFaqHeadings\(/);
});
