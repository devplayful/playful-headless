import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  AGENCIA_DISENO_WEB_HREF,
  ECOMMERCE_DISENO_WEB_ANCHOR,
  ECOMMERCE_DISENO_WEB_LINK_SLUG,
  htmlAlreadyLinksToAgenciaDisenoWeb,
  rewriteEcommerceDisenoWebLink,
} = await import('../utils/ecommerce-diseno-web-link.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const elementor = readFileSync(new URL('../components/ElementorPageContent.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');

const PHRASE =
  'En Playful Agency, entendemos que tener una tienda online va más allá de solo "estar ahí".';

test('constants target the e-commerce body link to diseño web', () => {
  assert.equal(AGENCIA_DISENO_WEB_HREF, '/agencia-diseno-web');
  assert.equal(ECOMMERCE_DISENO_WEB_LINK_SLUG, 'agencia-e-commerce');
  assert.equal(ECOMMERCE_DISENO_WEB_ANCHOR, 'tienda online');
});

test('wraps the first existing «tienda online» without adding words', () => {
  const html =
    `<div class="sub-heading">${PHRASE}</div>` +
    '<p>Mejoramos cada rincón de tu tienda online para que los usuarios naveguen.</p>';
  const rewritten = rewriteEcommerceDisenoWebLink(html, 'agencia-e-commerce');
  assert.match(rewritten, /<a href="\/agencia-diseno-web">tienda online<\/a> va más allá/);
  assert.equal((rewritten.match(/href="\/agencia-diseno-web"/g) || []).length, 1);
  assert.match(rewritten, /rincón de tu tienda online para/);
  assert.equal(rewritten.replace(/<\/?a(?: href="\/agencia-diseno-web")?>/g, ''), html);
});

test('does not invent a sentence when the phrase is missing', () => {
  const html = '<p>Sabemos que te interesa vender.</p>';
  assert.equal(rewriteEcommerceDisenoWebLink(html, 'agencia-e-commerce'), html);
});

test('does not wrap a mention already inside an anchor or an attribute', () => {
  const linked = '<p><a href="/blog/otro">tienda online</a> en el texto. Y otra tienda online libre.</p>';
  const rewritten = rewriteEcommerceDisenoWebLink(linked, 'agencia-e-commerce');
  assert.match(rewritten, /Y otra <a href="\/agencia-diseno-web">tienda online<\/a> libre/);
  assert.equal((rewritten.match(/href="\/agencia-diseno-web"/g) || []).length, 1);

  const attr = '<img alt="tienda online" src="/x.png"><p>Sin frase usable.</p>';
  assert.equal(rewriteEcommerceDisenoWebLink(attr, 'agencia-e-commerce'), attr);
});

test('is a no-op on other slugs and when the href already exists', () => {
  const html = `<p>${PHRASE}</p>`;
  assert.equal(rewriteEcommerceDisenoWebLink(html, 'agencia-seo'), html);
  assert.equal(rewriteEcommerceDisenoWebLink(html, 'agencia-diseno-web'), html);
  const already = `<p>Ver <a href="/agencia-diseno-web">diseño</a>. ${PHRASE}</p>`;
  assert.equal(rewriteEcommerceDisenoWebLink(already, 'agencia-e-commerce'), already);
  assert.equal(htmlAlreadyLinksToAgenciaDisenoWeb(already), true);
  assert.equal(
    rewriteEcommerceDisenoWebLink(rewriteEcommerceDisenoWebLink(html, 'agencia-e-commerce'), 'agencia-e-commerce'),
    rewriteEcommerceDisenoWebLink(html, 'agencia-e-commerce'),
  );
});

test('getPageBySlug and Elementor compose the diseño web rewriter', () => {
  assert.match(wordpress, /rewriteEcommerceDisenoWebLink\(/);
  assert.match(elementor, /rewriteEcommerceDisenoWebLink\(/);
  assert.match(
    elementor,
    /rewriteEcommerceShopifyLink\(\s*rewriteAgenciaDisenoUxUiLink\(restoreOldBodyCopy\(html\), slug\),/,
  );
});

test('header and footer stay out of the diseño web interior rewriter', () => {
  assert.doesNotMatch(header, /rewriteEcommerceDisenoWebLink/);
  assert.doesNotMatch(footer, /rewriteEcommerceDisenoWebLink/);
});
