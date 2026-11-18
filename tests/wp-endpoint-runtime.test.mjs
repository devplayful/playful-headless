import test from 'node:test';
import assert from 'node:assert/strict';

delete process.env.CMS_BLOB_IMAGES;
delete process.env.VERCEL_ENV;

const { rewriteEndpointAssetUrlForRuntime } = await import('../lib/wp-endpoint-surface.ts');

test('rewriteEndpointAssetUrlForRuntime maps Elementor CSS without CMS_BLOB_IMAGES', () => {
  const href =
    'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/frontend.min.css';
  const out = rewriteEndpointAssetUrlForRuntime(href, {});
  assert.equal(out, '/wp-static/wp-content/plugins/elementor/assets/css/frontend.min.css');
  assert.doesNotMatch(out, /endpoint\.playfulagency/);
});

test('rewriteEndpointAssetUrlForRuntime maps uploads to /wp-media without blob flag', () => {
  const href =
    'https://endpoint.playfulagency.com/wp-content/uploads/2022/07/E8_T2_Podcast-Bendita-Web.jpg';
  const out = rewriteEndpointAssetUrlForRuntime(href, {});
  assert.equal(
    out,
    '/wp-media/wp-content/uploads/2022/07/E8_T2_Podcast-Bendita-Web.jpg',
  );
});