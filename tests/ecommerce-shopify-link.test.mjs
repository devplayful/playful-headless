import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  AGENCIA_SHOPIFY_HREF,
  ECOMMERCE_SHOPIFY_LINK_SLUG,
  ECOMMERCE_SHOPIFY_LINK_LABEL,
  ECOMMERCE_SERVICES_BLOCK_MARKER,
  htmlAlreadyLinksToAgenciaShopify,
  rewriteEcommerceShopifyLink,
} = await import('../utils/ecommerce-shopify-link.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const elementor = readFileSync(new URL('../components/ElementorPageContent.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');

function functionBody(source, name) {
  const start = source.indexOf(`export async function ${name}`);
  assert.notEqual(start, -1, `missing ${name}`);
  const nextExport = source.indexOf('\nexport ', start + 1);
  return nextExport === -1 ? source.slice(start) : source.slice(start, nextExport);
}

const SERVICES_INTRO =
  `<div class="sub-heading">${ECOMMERCE_SERVICES_BLOCK_MARKER}</div>` +
  '<section class="elementor-element-e2926f5">logos</section>';

test('constants target the e-commerce → Shopify interior', () => {
  assert.equal(AGENCIA_SHOPIFY_HREF, '/agencia-shopify');
  assert.equal(ECOMMERCE_SHOPIFY_LINK_SLUG, 'agencia-e-commerce');
  assert.match(ECOMMERCE_SHOPIFY_LINK_LABEL, /Shopify/i);
});

test('wraps the first unlinked Shopify mention on the e-commerce slug', () => {
  const html = '<p>Implementamos catálogos en Shopify y WooCommerce.</p>';
  const rewritten = rewriteEcommerceShopifyLink(html, 'agencia-e-commerce');
  assert.match(rewritten, /<a href="\/agencia-shopify">Shopify<\/a>/);
  assert.equal((rewritten.match(/href="\/agencia-shopify"/g) || []).length, 1);
  assert.match(rewritten, /WooCommerce/);
});

test('does not wrap a Shopify mention already inside an anchor', () => {
  const html = '<p><a href="/blog/otro">Shopify</a> en el texto.</p>';
  const rewritten = rewriteEcommerceShopifyLink(html, 'agencia-e-commerce');
  assert.doesNotMatch(rewritten, /href="\/agencia-shopify"/);
});

test('does not wrap Shopify inside an attribute', () => {
  const html = '<img alt="Shopify storefront" src="/x.png"><p>Sin mención usable.</p>';
  const rewritten = rewriteEcommerceShopifyLink(html, 'agencia-e-commerce');
  assert.doesNotMatch(rewritten, /alt="<a href/);
  assert.doesNotMatch(rewritten, /href="\/agencia-shopify"/);
});

test('inserts a compact CTA in the services block when there is no Shopify mention', () => {
  const rewritten = rewriteEcommerceShopifyLink(SERVICES_INTRO, 'agencia-e-commerce');
  assert.match(
    rewritten,
    new RegExp(`${ECOMMERCE_SERVICES_BLOCK_MARKER} También implementamos <a href="/agencia-shopify">${ECOMMERCE_SHOPIFY_LINK_LABEL}</a>\\.`),
  );
  assert.equal((rewritten.match(/href="\/agencia-shopify"/g) || []).length, 1);
});

test('is a no-op on other service slugs', () => {
  const html = `<p>Shopify</p>${SERVICES_INTRO}`;
  assert.equal(rewriteEcommerceShopifyLink(html, 'agencia-seo'), html);
  assert.equal(rewriteEcommerceShopifyLink(html, 'agencia-sem'), html);
  assert.equal(rewriteEcommerceShopifyLink(html, 'agencia-diseno-web'), html);
});

test('is idempotent when an href to /agencia-shopify already exists', () => {
  const html =
    `<p>Ver <a href="/agencia-shopify">Agencia Shopify</a>. Shopify otra vez.</p>` +
    SERVICES_INTRO;
  assert.equal(rewriteEcommerceShopifyLink(html, 'agencia-e-commerce'), html);
  assert.equal(htmlAlreadyLinksToAgenciaShopify(html), true);
});

test('prefers wrapping a mention over inserting the services CTA', () => {
  const html = `<p>Migración a Shopify.</p>${SERVICES_INTRO}`;
  const rewritten = rewriteEcommerceShopifyLink(html, 'agencia-e-commerce');
  assert.match(rewritten, /<a href="\/agencia-shopify">Shopify<\/a>/);
  assert.doesNotMatch(rewritten, /También implementamos/);
});

test('getPageBySlug and Elementor compose the Shopify rewriter', () => {
  const body = functionBody(wordpress, 'getPageBySlug');
  assert.match(body, /rewriteEcommerceShopifyLink\(/);
  assert.match(body, /rewriteElementorBodyHrefs\(/);
  assert.match(elementor, /rewriteElementorBodyHrefs\(/);
  assert.match(elementor, /rewriteEcommerceShopifyLink\(restoreOldBodyCopy\(html\), slug\)/);
  assert.match(slugPage, /'agencia-e-commerce'/);
});

test('header and footer stay out of the Shopify interior rewriter', () => {
  assert.doesNotMatch(header, /rewriteEcommerceShopifyLink/);
  assert.doesNotMatch(footer, /rewriteEcommerceShopifyLink/);
  assert.doesNotMatch(header, /href="\/agencia-shopify"/);
  assert.doesNotMatch(footer, /href="\/agencia-shopify"/);
});
