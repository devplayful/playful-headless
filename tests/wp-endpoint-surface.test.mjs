import test from 'node:test';
import assert from 'node:assert/strict';

process.env.CMS_BLOB_IMAGES = '1';
process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_GIT_COMMIT_REF = 'cursor/payload-h2-imagenes-5a28';

const {
  rewriteEndpointAssetUrlForPreview,
  stripWtiLikeTrackingPixels,
  countEndpointHostRefs,
} = await import('../lib/wp-endpoint-surface.ts');

test('CSS endpoint → legacy-wp same-origin en preview H2', () => {
  const href =
    'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/frontend.min.css';
  const out = rewriteEndpointAssetUrlForPreview(href);
  assert.match(out, /^https:\/\/playfulagency\.com\/legacy-wp\//);
  assert.doesNotMatch(out, /endpoint\.playfulagency/);
});

test('elimina pixel wti-like-post bajo flag', () => {
  const html =
    '<img src="https://endpoint.playfulagency.com/wp-content/plugins/wti-like-post/images/pixel.gif" width="1">';
  const out = stripWtiLikeTrackingPixels(html);
  assert.equal(out.trim(), '');
  assert.equal(countEndpointHostRefs(out), 0);
});
