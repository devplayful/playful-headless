import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

const FORBIDDEN_RUNTIME_RE =
  /endpoint\.playfulagency\.com|old\.playfulagency\.com|https?:\/\/[^"'\s)]+\/wp-json\b|https?:\/\/[^"'\s)]+\/wp-includes\b/i;

const LANDING_POST_CSS = [
  'post-85582',
  'post-83510',
  'post-83848',
  'post-83849',
  'post-85604',
  'post-85722',
];

function read(rel) {
  return readFileSync(`${ROOT}/${rel}`, 'utf8');
}

test('ElementorPageScripts no expone endpoint ni admin-ajax remoto', () => {
  const src = read('components/ElementorPageScripts.tsx');
  assert.doesNotMatch(src, /endpoint\.playfulagency\.com/);
  assert.doesNotMatch(src, /old\.playfulagency\.com/);
  assert.match(src, /ajaxurl:\s*'\/wp-admin\/admin-ajax\.php'/);
  assert.match(src, /uploadUrl:\s*ELEMENTOR_UPLOADS_BASE/);
});

test('elementor-static-asset-urls usa /wp-static en runtime, endpoint solo en export', () => {
  const src = read('lib/elementor-static-asset-urls.ts');
  assert.match(src, /const WP_STATIC = '\/wp-static'/);
  const runtimeBlock = src.match(/export const ELEMENTOR_PAGE_SCRIPTS = \[([\s\S]*?)\];/)?.[1] || '';
  assert.match(runtimeBlock, /WP_STATIC\}\/wp-includes\/js\/jquery\/jquery\.min\.js/);
  assert.doesNotMatch(runtimeBlock, /endpoint\.playfulagency/);
  assert.match(src, /ELEMENTOR_PAGE_SCRIPTS_EXPORT/);
  assert.match(src, /WP_ENDPOINT_EXPORT_ORIGIN/);
});

test('casos listing URL es same-origin', () => {
  const src = read('lib/case-study-listing-image.ts');
  assert.match(src, /CASE_STUDIES_LISTING_EMBED_URL = '\/api\/public\/casos-de-exito'/);
  assert.doesNotMatch(src, /endpoint\.playfulagency/);
});

test('post-* landing CSS sin endpoint en url()', () => {
  for (const name of LANDING_POST_CSS) {
    const rel = `public/wp-static/wp-content/uploads/elementor/css/${name}.css`;
    assert.ok(existsSync(`${ROOT}/${rel}`), rel);
    const css = read(rel);
    assert.doesNotMatch(css, /endpoint\.playfulagency\.com/, name);
    assert.doesNotMatch(css, /old\.playfulagency\.com/, name);
    if (css.includes('Dayflow-Abstract-5')) {
      assert.match(css, /\/wp-media\/wp-content\/uploads\/2024\/08\/Dayflow-Abstract-5\.png/);
    }
  }
});

test('CONFETY en header fix global apunta a /wp-media', () => {
  const css = read('components/ElementorPageHeaderFix.css');
  const oldHits = css.match(/old\.playfulagency\.com/g) || [];
  assert.equal(oldHits.length, 0);
  assert.match(
    css,
    /\.elementor-element-4d2eb64[\s\S]*?background-image: url\("\/wp-media\/wp-content\/uploads\/2024\/07\/CONFETY-PLAYFUL\.png"\)/,
  );
});

test('webpack.runtime elementor apunta a bundles presentes en public/wp-static', () => {
  const runtime = read('public/wp-static/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js');
  const names = [
    ...new Set([...runtime.matchAll(/(["'])([^"']*\.bundle\.min\.js)\1/g)].map((m) => m[2])),
  ];
  assert.ok(names.length >= 20, `bundles=${names.length}`);
  for (const name of names) {
    const rel = `public/wp-static/wp-content/plugins/elementor/assets/js/${name}`;
    assert.ok(existsSync(`${ROOT}/${rel}`), rel);
  }
});

test('archivos servidos clave sin referencias WP remotas en fuente estática', () => {
  const files = [
    'lib/case-study-listing-image.ts',
    'components/ElementorPageScripts.tsx',
    ...LANDING_POST_CSS.map((n) => `public/wp-static/wp-content/uploads/elementor/css/${n}.css`),
  ];
  for (const rel of files) {
    const text = read(rel);
    assert.doesNotMatch(text, FORBIDDEN_RUNTIME_RE, rel);
  }
});