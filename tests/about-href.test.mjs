import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  NOSOTROS_HREF,
  ABOUT_HREF_REWRITE_SLUGS,
  isAboutPageHref,
  isAboutHrefRewriteSlug,
  rewriteAboutHrefs,
  rewriteElementorBodyHrefs,
  rewriteServiceBookingCtas,
} = await import('../utils/booking.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const elementor = readFileSync(new URL('../components/ElementorPageContent.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const booking = readFileSync(new URL('../utils/booking.ts', import.meta.url), 'utf8');

const MASTER_BUTTON = (href, label) =>
  `<a class="master-button btn-accent icon-none big btn-hover-2" href="${href}">` +
  `<span class="inner"><span class="content-base"><span class="text">${label}</span></span>` +
  `<span class="content-hover"><span class="text">${label}</span></span></span></a>`;

function functionBody(source, name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const nextExport = source.indexOf('\nexport ', start + 1);
  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

test('nosotros target is the live relative about path', () => {
  assert.equal(NOSOTROS_HREF, '/nosotros');
});

test('allowlist is only the three landings with live /about in main', () => {
  assert.deepEqual([...ABOUT_HREF_REWRITE_SLUGS], [
    'agencia-seo',
    'agencia-sem',
    'agencia-diseno-web',
  ]);
  assert.equal(isAboutHrefRewriteSlug('agencia-seo'), true);
  assert.equal(isAboutHrefRewriteSlug('agencia-sem'), true);
  assert.equal(isAboutHrefRewriteSlug('agencia-diseno-web'), true);
  assert.equal(isAboutHrefRewriteSlug('agencia-e-commerce'), false);
  assert.equal(isAboutHrefRewriteSlug('agencia-shopify'), false);
  assert.equal(isAboutHrefRewriteSlug('marketing-internacional'), false);
});

test('isAboutPageHref accepts relative, trailing slash, apex, www and WP hosts', () => {
  const hits = [
    '/about',
    '/about/',
    'https://playfulagency.com/about',
    'https://playfulagency.com/about/',
    'https://www.playfulagency.com/about',
    'https://www.playfulagency.com/about/',
    'https://endpoint.playfulagency.com/about/',
    'https://old.playfulagency.com/about',
    '//playfulagency.com/about?utm=1#equipo',
  ];
  for (const href of hits) {
    assert.equal(isAboutPageHref(href), true, href);
  }

  assert.equal(isAboutPageHref('/nosotros'), false);
  assert.equal(isAboutPageHref('/about-us'), false);
  assert.equal(isAboutPageHref('/agencia-seo'), false);
  assert.equal(isAboutPageHref('https://linkedin.com/about'), false);
});

test('rewrites every body /about href on an allowlisted slug and keeps copy', () => {
  const html = [
    MASTER_BUTTON('/about', 'Contacta a tu Agencia SEO'),
    MASTER_BUTTON('/about/', 'Comienza tu estrategia SEO'),
    MASTER_BUTTON('https://playfulagency.com/about', 'Observa Nuestros Casos de Éxito de SEO >'),
    MASTER_BUTTON('https://www.playfulagency.com/about/', 'Comecemos a trabajar en tu web'),
    MASTER_BUTTON('https://endpoint.playfulagency.com/about/', '¡Me interesa!'),
    MASTER_BUTTON('/casos-de-exito-agencia-de-marketing-digital/', 'Conoce a nuestros héroes'),
  ].join('\n');

  const rewritten = rewriteAboutHrefs(html, 'agencia-seo');

  assert.equal((rewritten.match(/href="\/nosotros"/g) || []).length, 5);
  assert.equal(rewritten.includes('/about'), false);
  assert.equal(rewritten.includes('playfulagency.com/about'), false);
  assert.match(rewritten, /<span class="text">Contacta a tu Agencia SEO<\/span>/);
  assert.match(rewritten, /<span class="text">¡Me interesa!<\/span>/);
  assert.match(rewritten, /Conoce a nuestros héroes/);
});

test('rewrites absolute WP about hrefs used in live Elementor HTML', () => {
  const html = [
    MASTER_BUTTON('https://endpoint.playfulagency.com/about/', '¡Quiero resultados inmediatos!'),
    `<a class="master-link icon-right" href="/about/" >` +
      `<span>¡Hacemos SEO desde los cimientos!</span></a>`,
    MASTER_BUTTON('https://playfulagency.com/about', '¡Quiero un sitio web!'),
  ].join('');

  const rewritten = rewriteAboutHrefs(html, 'agencia-diseno-web');
  assert.equal(rewritten.includes('/about'), false);
  assert.equal(rewritten.includes('playfulagency.com/about'), false);
  assert.equal((rewritten.match(/href="\/nosotros"/g) || []).length, 3);
  assert.match(rewritten, /¡Quiero resultados inmediatos!/);
  assert.match(rewritten, /¡Hacemos SEO desde los cimientos!/);
  assert.match(rewritten, /¡Quiero un sitio web!/);
});

test('does not rewrite e-com, shopify or other SERVICE_SLUGS', () => {
  const html = MASTER_BUTTON('/about/', 'Sobre Playful');
  assert.equal(rewriteAboutHrefs(html, 'agencia-e-commerce'), html);
  assert.equal(rewriteAboutHrefs(html, 'agencia-shopify'), html);
  assert.equal(rewriteAboutHrefs(html, 'marketing-internacional'), html);
  assert.equal(rewriteAboutHrefs(html, 'agencia-ux-ui'), html);
});

test('skips the sticky header even if an /about fragment leaked into HTML', () => {
  const html =
    `<a class="playful-boton-header px-3 py-2" href="/about">Nosotros</a>` +
    MASTER_BUTTON('/about/', '¡Me interesa!');

  const rewritten = rewriteAboutHrefs(html, 'agencia-sem');
  assert.match(rewritten, /playful-boton-header[^>]+href="\/about">Nosotros<\/a>/);
  assert.match(rewritten, /master-button[^>]+href="\/nosotros"/);
  assert.match(rewritten, /<span class="text">¡Me interesa!<\/span>/);
});

test('rewriter is idempotent on already-rewritten /nosotros anchors', () => {
  const first = rewriteAboutHrefs(
    MASTER_BUTTON('/about/', '¡Excelente quiero comenzar!'),
    'agencia-sem',
  );
  assert.equal(rewriteAboutHrefs(first, 'agencia-sem'), first);
  assert.match(first, /href="\/nosotros"/);
});

test('composed Elementor rewriter still books contact CTAs and remaps /about', () => {
  const html = [
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', '¡Quiero saber más!'),
    MASTER_BUTTON('/about/', 'Contacta a tu Agencia SEO'),
  ].join('');

  const rewritten = rewriteElementorBodyHrefs(html, 'agencia-seo');
  assert.equal(rewritten.includes('contactar-agencia-de-marketing-digital'), false);
  assert.equal(rewritten.includes('/about'), false);
  assert.match(rewritten, /href="\/reunion-playful"/);
  assert.match(rewritten, /href="\/nosotros"/);
  assert.match(rewritten, /¡Quiero saber más!/);
  assert.match(rewritten, /Contacta a tu Agencia SEO/);
  assert.equal(
    rewriteElementorBodyHrefs(html, 'agencia-seo'),
    rewriteAboutHrefs(rewriteServiceBookingCtas(html, 'agencia-seo'), 'agencia-seo'),
  );
});

test('getPageBySlug and ElementorPageContent use the composed body rewriter', () => {
  const body = functionBody(wordpress, 'getPageBySlug');
  assert.match(body, /rewriteElementorBodyHrefs\(/);
  assert.match(elementor, /rewriteElementorBodyHrefs\(restoreOldBodyCopy\(html\), slug\)/);
  assert.match(slugPage, /slug=\{slug\}/);
  assert.match(booking, /export function rewriteAboutHrefs/);
  assert.match(booking, /export function rewriteElementorBodyHrefs/);
});

test('header and footer Nosotros stay on /nosotros without the rewriter', () => {
  assert.match(header, /href="\/nosotros"/);
  assert.match(footer, /href="\/nosotros"/);
  assert.doesNotMatch(header, /href="\/about"/);
  assert.doesNotMatch(footer, /href="\/about"/);
  assert.doesNotMatch(header, /rewriteAboutHrefs|rewriteElementorBodyHrefs/);
  assert.doesNotMatch(footer, /rewriteAboutHrefs|rewriteElementorBodyHrefs/);
});
