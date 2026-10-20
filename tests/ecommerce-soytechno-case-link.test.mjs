import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  ECOMMERCE_SOYTECHNO_CASE_SLUG,
  SOYTECHNO_CASE_HREF,
  rewriteEcommerceSoytechnoCaseLink,
} = await import('../utils/ecommerce-soytechno-case-link.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);

const CIMA_HREF =
  'https://endpoint.playfulagency.com/blog/otros/premios-cima-2026-soytechno-playful/';

test('rewrites CIMA carousel hrefs to the SoyTechno case on agencia-e-commerce', () => {
  const html = `<a class="thumb" href="${CIMA_HREF}">SoyTechno</a>`;
  const rewritten = rewriteEcommerceSoytechnoCaseLink(html, ECOMMERCE_SOYTECHNO_CASE_SLUG);
  assert.match(rewritten, new RegExp(`href="${SOYTECHNO_CASE_HREF}"`));
  assert.doesNotMatch(rewritten, /premios-cima-2026-soytechno-playful/);
});

test('is a no-op on other service slugs', () => {
  const html = `<a href="${CIMA_HREF}">SoyTechno</a>`;
  assert.equal(rewriteEcommerceSoytechnoCaseLink(html, 'agencia-shopify'), html);
});

test('getPageBySlug and Elementor compose the SoyTechno case rewriter', () => {
  assert.match(wordpress, /rewriteEcommerceSoytechnoCaseLink\(/);
  assert.match(elementor, /rewriteEcommerceSoytechnoCaseLink\(/);
});
