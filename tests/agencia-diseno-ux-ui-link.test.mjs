import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  AGENCIA_DISENO_UX_UI_ANCHOR,
  AGENCIA_DISENO_UX_UI_LINK_SLUG,
  rewriteAgenciaDisenoUxUiLink,
} = await import('../utils/agencia-diseno-ux-ui-link.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);

test('wraps the first Experiencia de usuario on agencia-diseno-web only', () => {
  const html = '<p>Experiencia de usuario optimizada en cada proyecto.</p>';
  const rewritten = rewriteAgenciaDisenoUxUiLink(html, AGENCIA_DISENO_UX_UI_LINK_SLUG);
  assert.match(
    rewritten,
    new RegExp(
      `<a href="/agencia-ux-ui">${AGENCIA_DISENO_UX_UI_ANCHOR}</a> optimizada`,
    ),
  );
  assert.equal(rewriteAgenciaDisenoUxUiLink(html, 'agencia-seo'), html);
});

test('is idempotent when /agencia-ux-ui is already linked', () => {
  const html = `<p><a href="/agencia-ux-ui">${AGENCIA_DISENO_UX_UI_ANCHOR}</a> optimizada.</p>`;
  assert.equal(rewriteAgenciaDisenoUxUiLink(html, AGENCIA_DISENO_UX_UI_LINK_SLUG), html);
});

test('getPageBySlug and Elementor compose the UX/UI interior rewriter', () => {
  assert.match(wordpress, /rewriteAgenciaDisenoUxUiLink\(/);
  assert.match(elementor, /rewriteAgenciaDisenoUxUiLink\(/);
});
