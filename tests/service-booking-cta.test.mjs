import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  BOOKING_HREF,
  BOOKING_CTA_LABEL,
  CONTACT_HREF,
  SERVICE_BOOKING_CTA_SLUGS,
  isContactCtaLabel,
  isContactPageHref,
  isServiceBookingCtaSlug,
  rewriteServiceBookingCtas,
} = await import('../utils/booking.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const elementor = readFileSync(new URL('../components/ElementorPageContent.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const shopifyCopy = readFileSync(new URL('../app/agencia-shopify/copy.ts', import.meta.url), 'utf8');

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

test('shared booking constant matches the Shopify GHL widget', () => {
  assert.equal(BOOKING_HREF, 'https://api.playfulagency.com/widget/bookings/reunion-playful');
  assert.equal(BOOKING_CTA_LABEL, 'Agendar Reunión con Playful');
  assert.equal(CONTACT_HREF, '/contactar-agencia-de-marketing-digital');
  assert.match(shopifyCopy, /export \{ BOOKING_HREF, CONTACT_HREF \} from '\.\.\/\.\.\/utils\/booking\.ts'/);
});

test('allowlist is only the four GO service landings', () => {
  assert.deepEqual([...SERVICE_BOOKING_CTA_SLUGS], [
    'agencia-e-commerce',
    'agencia-seo',
    'agencia-sem',
    'agencia-diseno-web',
  ]);
  assert.equal(isServiceBookingCtaSlug('agencia-seo'), true);
  assert.equal(isServiceBookingCtaSlug('marketing-internacional'), false);
  assert.equal(isServiceBookingCtaSlug('agencia-ux-ui'), false);
  assert.equal(isServiceBookingCtaSlug('seo-expertos'), false);
});

test('isContactPageHref accepts relative, trailing slash, apex and WP hosts', () => {
  const hits = [
    '/contactar-agencia-de-marketing-digital',
    '/contactar-agencia-de-marketing-digital/',
    'https://playfulagency.com/contactar-agencia-de-marketing-digital',
    'https://playfulagency.com/contactar-agencia-de-marketing-digital/',
    'https://www.playfulagency.com/contactar-agencia-de-marketing-digital',
    'https://endpoint.playfulagency.com/contactar-agencia-de-marketing-digital/',
    'https://old.playfulagency.com/contactar-agencia-de-marketing-digital',
    '//playfulagency.com/contactar-agencia-de-marketing-digital?utm=1#form',
  ];
  for (const href of hits) {
    assert.equal(isContactPageHref(href), true, href);
  }

  assert.equal(isContactPageHref('/agencia-seo'), false);
  assert.equal(isContactPageHref('https://linkedin.com/contactar-agencia-de-marketing-digital'), false);
  assert.equal(isContactPageHref(BOOKING_HREF), false);
});

test('isContactCtaLabel matches Contáctanos variants and generic closers', () => {
  assert.equal(isContactCtaLabel('Contáctanos'), true);
  assert.equal(isContactCtaLabel('Contáctanos…'), true);
  assert.equal(isContactCtaLabel('¡Contáctanos!'), true);
  assert.equal(isContactCtaLabel('¡Contáctanos y empieza ya!'), true);
  assert.equal(isContactCtaLabel('Agenda una Reunión'), true);
  assert.equal(isContactCtaLabel('¡Hablemos!'), true);
  assert.equal(isContactCtaLabel('¡Hablemos de publicidad!'), false);
  assert.equal(isContactCtaLabel('¡Quiero saber más!'), false);
  assert.equal(isContactCtaLabel('Haz que funcione tu tienda'), false);
  assert.equal(isContactCtaLabel('¡Hagamos una página web!'), false);
  assert.equal(isContactCtaLabel(BOOKING_CTA_LABEL), false);
});

test('rewrites every body contactar href on an allowlisted slug', () => {
  const html = [
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', '¡Quiero saber más!'),
    MASTER_BUTTON('https://playfulagency.com/contactar-agencia-de-marketing-digital', '¡Contáctanos y empieza ya!'),
    MASTER_BUTTON('https://endpoint.playfulagency.com/casos-de-exito-agencia-de-marketing-digital/', 'Conoce a nuestros héroes'),
  ].join('\n');

  const rewritten = rewriteServiceBookingCtas(html, 'agencia-seo');

  assert.equal(
    (rewritten.match(/api\.playfulagency\.com\/widget\/bookings\/reunion-playful/g) || []).length,
    2,
  );
  assert.equal(rewritten.includes('contactar-agencia-de-marketing-digital'), false);
  assert.match(rewritten, /<span class="text">¡Quiero saber más!<\/span>/);
  assert.match(rewritten, new RegExp(`<span class="text">${BOOKING_CTA_LABEL}</span>`));
  assert.match(rewritten, /Conoce a nuestros héroes/);
});

test('rewrites absolute WP and relative contactar hrefs used in live Elementor HTML', () => {
  const html = [
    MASTER_BUTTON(
      'https://endpoint.playfulagency.com/contactar-agencia-de-marketing-digital/',
      'Haz que funcione tu tienda',
    ),
    `<a class="master-link icon-right" href="/contactar-agencia-de-marketing-digital/" >` +
      `<span>Optimiza mi e-commerce</span></a>`,
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', '¡Contáctanos y empieza ya!'),
  ].join('');

  const rewritten = rewriteServiceBookingCtas(html, 'agencia-e-commerce');
  assert.equal(rewritten.includes('contactar-agencia-de-marketing-digital'), false);
  assert.match(rewritten, /Haz que funcione tu tienda/);
  assert.match(rewritten, /Optimiza mi e-commerce/);
  assert.equal((rewritten.match(new RegExp(BOOKING_CTA_LABEL, 'g')) || []).length, 2);
});

test('diseño-web closer ¡Hablemos! becomes the booking label so the page has Agendar copy', () => {
  const html = [
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', '¡Hagamos una página web!'),
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', '¡Hablemos!'),
  ].join('');

  const rewritten = rewriteServiceBookingCtas(html, 'agencia-diseno-web');
  assert.equal(rewritten.includes('contactar-agencia-de-marketing-digital'), false);
  assert.match(rewritten, /¡Hagamos una página web!/);
  assert.doesNotMatch(rewritten, /¡Hablemos!/);
  assert.match(rewritten, new RegExp(BOOKING_CTA_LABEL));
});

test('does not rewrite other SERVICE_SLUGS such as marketing-internacional', () => {
  const html = MASTER_BUTTON(
    '/contactar-agencia-de-marketing-digital/',
    '¡Contáctanos y empieza ya!',
  );
  assert.equal(rewriteServiceBookingCtas(html, 'marketing-internacional'), html);
  assert.equal(rewriteServiceBookingCtas(html, 'agencia-ux-ui'), html);
  assert.equal(rewriteServiceBookingCtas(html, 'seo-vigo'), html);
});

test('skips the sticky header Contáctanos even if it appears in the HTML fragment', () => {
  const html =
    `<a class="playful-boton-header px-3 py-2" href="/contactar-agencia-de-marketing-digital">Contáctanos</a>` +
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', 'Contáctanos');

  const rewritten = rewriteServiceBookingCtas(html, 'agencia-sem');
  assert.match(
    rewritten,
    /playful-boton-header[^>]+href="\/contactar-agencia-de-marketing-digital">Contáctanos<\/a>/,
  );
  assert.match(rewritten, new RegExp(`master-button[^>]+href="${BOOKING_HREF.replaceAll('/', '\\/')}"`));
  assert.match(rewritten, new RegExp(`<span class="text">${BOOKING_CTA_LABEL}</span>`));
});

test('rewriter is idempotent on already-booked CTAs', () => {
  const first = rewriteServiceBookingCtas(
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', 'Contáctanos'),
    'agencia-seo',
  );
  assert.equal(rewriteServiceBookingCtas(first, 'agencia-seo'), first);
});

test('getPageBySlug maps Elementor HTML through the booking rewriter', () => {
  const body = functionBody(wordpress, 'getPageBySlug');
  assert.match(body, /rewriteInSitePageHrefs\(/);
  assert.match(body, /rewriteServiceBookingCtas\(/);
});

test('slug page passes the WP slug into ElementorPageContent', () => {
  assert.match(slugPage, /slug=\{slug\}/);
  assert.match(elementor, /rewriteServiceBookingCtas\(restoreOldBodyCopy\(html\), slug\)/);
  assert.match(slugPage, /'marketing-internacional'/);
  assert.match(slugPage, /'agencia-e-commerce'/);
});

test('header and footer Contáctanos still go to the contact page', () => {
  assert.match(header, /href="\/contactar-agencia-de-marketing-digital"/);
  assert.match(header, /Contáctanos/);
  assert.match(footer, /href="\/contactar-agencia-de-marketing-digital"/);
  assert.match(footer, /Contáctanos/);
  assert.doesNotMatch(header, /BOOKING_HREF|rewriteServiceBookingCtas/);
  assert.doesNotMatch(footer, /BOOKING_HREF|rewriteServiceBookingCtas/);
});
