import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ECOMMERCE_CTA_SECTION_SLUG,
  ecommerceCtaSectionLabels,
  rewriteEcommerceCtaSections,
} = await import('../utils/ecommerce-cta-sections.ts');
const { rewriteElementorBodyHrefs, SERVICE_BOOKING_HREF } = await import('../utils/booking.ts');

const booking = readFileSync(new URL('../utils/booking.ts', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

const MASTER_BUTTON = (href, label) =>
  `<a class="master-button btn-accent icon-none big btn-hover-2" href="${href}">` +
  `<span class="inner"><span class="content-base"><span class="text">${label}</span></span>` +
  `<span class="content-hover"><span class="text">${label}</span></span></span></a>`;

const MASTER_LINK = (href, label) =>
  `<a class="master-link icon-right" href="${href}"><span>${label}</span></a>`;

test('labels are hero / mid / final for three CTAs and unique mids beyond that', () => {
  assert.deepEqual(ecommerceCtaSectionLabels(0), []);
  assert.deepEqual(ecommerceCtaSectionLabels(1), ['hero']);
  assert.deepEqual(ecommerceCtaSectionLabels(2), ['hero', 'final']);
  assert.deepEqual(ecommerceCtaSectionLabels(3), ['hero', 'mid', 'final']);
  assert.deepEqual(ecommerceCtaSectionLabels(7), [
    'hero',
    'mid1',
    'mid2',
    'mid3',
    'mid4',
    'mid5',
    'final',
  ]);
});

test('tags booking CTAs on /agencia-e-commerce in document order', () => {
  const html = [
    MASTER_BUTTON(SERVICE_BOOKING_HREF, 'Haz que funcione tu tienda'),
    MASTER_LINK(SERVICE_BOOKING_HREF, 'Optimiza mi e-commerce'),
    MASTER_BUTTON(SERVICE_BOOKING_HREF, 'Agendar Reunión con Playful'),
  ].join('\n');

  const rewritten = rewriteEcommerceCtaSections(html, 'agencia-e-commerce');
  assert.match(rewritten, /data-cta-section="hero"/);
  assert.match(rewritten, /data-cta-section="mid"/);
  assert.match(rewritten, /data-cta-section="final"/);
  assert.equal((rewritten.match(/data-cta-section="/g) || []).length, 3);
  assert.match(rewritten, /Haz que funcione tu tienda/);
  assert.match(rewritten, /Optimiza mi e-commerce/);
});

test('is a no-op on other slugs and on non-booking hrefs', () => {
  const html = MASTER_BUTTON(SERVICE_BOOKING_HREF, 'Haz que funcione tu tienda');
  assert.equal(rewriteEcommerceCtaSections(html, 'agencia-seo'), html);
  assert.equal(rewriteEcommerceCtaSections(html, 'agencia-shopify'), html);

  const blog = MASTER_LINK('/agencia-shopify', 'Shopify');
  assert.equal(rewriteEcommerceCtaSections(blog, ECOMMERCE_CTA_SECTION_SLUG), blog);
});

test('skips header chrome and is idempotent', () => {
  const html =
    `<a class="playful-boton-header" href="${SERVICE_BOOKING_HREF}">Contáctanos</a>` +
    MASTER_BUTTON(SERVICE_BOOKING_HREF, 'Haz que funcione tu tienda');
  const once = rewriteEcommerceCtaSections(html, 'agencia-e-commerce');
  assert.match(once, /playful-boton-header[^>]*>Contáctanos/);
  assert.doesNotMatch(
    once,
    /playful-boton-header[^>]*data-cta-section/,
  );
  assert.equal((once.match(/data-cta-section="hero"/g) || []).length, 1);
  assert.equal(rewriteEcommerceCtaSections(once, 'agencia-e-commerce'), once);
});

test('rewriteElementorBodyHrefs rewrites contactar hrefs then tags sections', () => {
  const html = [
    MASTER_BUTTON(
      'https://endpoint.playfulagency.com/contactar-agencia-de-marketing-digital/',
      'Haz que funcione tu tienda',
    ),
    MASTER_LINK('/contactar-agencia-de-marketing-digital/', 'Optimiza mi e-commerce'),
    MASTER_BUTTON('/contactar-agencia-de-marketing-digital/', '¡Contáctanos y empieza ya!'),
  ].join('');

  const rewritten = rewriteElementorBodyHrefs(html, 'agencia-e-commerce');
  assert.equal((rewritten.match(/href="\/reunion-playful"/g) || []).length, 3);
  assert.match(rewritten, /data-cta-section="hero"/);
  assert.match(rewritten, /data-cta-section="mid"/);
  assert.match(rewritten, /data-cta-section="final"/);
  assert.doesNotMatch(rewritten, /contactar-agencia-de-marketing-digital/);
});

test('header, footer, root layout and global CSS stay out of the rewriter', () => {
  assert.match(booking, /rewriteEcommerceCtaSections\(/);
  assert.doesNotMatch(header, /rewriteEcommerceCtaSections/);
  assert.doesNotMatch(footer, /rewriteEcommerceCtaSections/);
  assert.doesNotMatch(layout, /rewriteEcommerceCtaSections/);
  assert.doesNotMatch(globals, /data-cta-section="hero"/);
  assert.doesNotMatch(globals, /agencia-shopify/);
});
