import test from 'node:test';
import assert from 'node:assert/strict';

process.env.CMS_BLOB_IMAGES = '1';
process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_GIT_COMMIT_REF = 'cursor/payload-h2-imagenes-5a28';

const { rewriteEndpointAssetUrlForPreview, rewriteElementorScriptUrlForPreview } = await import(
  '../lib/wp-endpoint-surface.ts'
);

test('CSS endpoint → copia /wp-static en preview H2', () => {
  const href =
    'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/frontend.min.css';
  const out = rewriteEndpointAssetUrlForPreview(href);
  assert.match(out, /^https:\/\/playfulagency\.com\/wp-static\//);
  assert.doesNotMatch(out, /endpoint\.playfulagency/);
});

test('JS endpoint → copia /wp-static en preview H2', () => {
  const src =
    'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/js/frontend.min.js';
  const out = rewriteElementorScriptUrlForPreview(src);
  assert.match(out, /\/wp-static\/wp-content\/plugins\/elementor\/assets\/js\/frontend.min.js/);
});
