import test from 'node:test';
import assert from 'node:assert/strict';

process.env.VERCEL_ENV = 'preview';
process.env.VERCEL_GIT_COMMIT_REF = 'cursor/payload-h2-imagenes-5a28';

const PREVIEW_ENV = {
  ...process.env,
  VERCEL_ENV: 'preview',
  VERCEL_GIT_COMMIT_REF: 'cursor/payload-h2-imagenes-5a28',
};

const WP = 'https://endpoint.playfulagency.com/wp-content/uploads';

const { applyBlobImagesToHtml, applyBlobImagesToUrl } = await import('../lib/blob-image-render.ts');
const { rewriteEndpointUrlsInHtmlForPreview } = await import('../lib/wp-endpoint-surface.ts');
const { isCompleteBlobMapSourceUrl, rewriteMigratableUrlsInHtml } = await import(
  '../lib/blob-image-url.ts'
);
const { loadBlobMigrationMap, clearBlobMigrationMapCache } = await import('../lib/blob-image-map.ts');

test('blog listing cover URL rewrites endpoint upload to blob when mapped', () => {
  clearBlobMigrationMapCache();
  const wp = `${WP}/2022/11/Que-es-WordPress.png`;
  const out = applyBlobImagesToUrl(wp, PREVIEW_ENV);
  assert.match(out, /\.public\.blob\.vercel-storage\.com\/media\/2022\/11\//);
  assert.doesNotMatch(out, /endpoint\.playfulagency\.com/);
});

test('seo-vigo protocol-relative SVG uploads rewrite to blob', () => {
  clearBlobMigrationMapCache();
  const html =
    '<img src="//endpoint.playfulagency.com/wp-content/uploads/2024/11/Playful-SEO-en-Vigo0.svg" />';
  const out = applyBlobImagesToHtml(html, PREVIEW_ENV);
  assert.doesNotMatch(out, /endpoint\.playfulagency\.com/);
  assert.match(out, /Playful-SEO-en-Vigo0\.svg/);
});

test('agencia-sem srcset drops unmapped size variants and keeps mapped original', () => {
  clearBlobMigrationMapCache();
  const original = `${WP}/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas.png`;
  const v300 = `${WP}/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas-300x255.png`;
  const v768 = `${WP}/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas-768x653.png`;
  const truncatedKey = `${WP}/2024/09/Haz-Pruebas-y-`;
  assert.equal(isCompleteBlobMapSourceUrl(truncatedKey), false);

  const map = loadBlobMigrationMap(PREVIEW_ENV);
  const html = `<img src="${original}" srcset="${v300} 300w, ${v768} 768w, ${original} 1024w" />`;
  const afterMap = rewriteMigratableUrlsInHtml(html, map || {}, PREVIEW_ENV);
  assert.doesNotMatch(
    afterMap,
    /blob\.vercel-storage\.com\/media\/2024\/09\/Haz-Pruebas-y-\%E2%80%A8Optimiza-tus-Campanas-300x255/,
  );

  const out = rewriteEndpointUrlsInHtmlForPreview(afterMap, PREVIEW_ENV);
  assert.doesNotMatch(out, /endpoint\.playfulagency\.com/);
  assert.match(out, /\.public\.blob\.vercel-storage\.com\/media\/2024\/09\/Haz-Pruebas-y-/);
  assert.doesNotMatch(out, /-300x255\.png/);
  assert.doesNotMatch(out, /-768x653\.png/);
});

test('seo-vigo Yoast og:image rewrites to blob when mapped', () => {
  clearBlobMigrationMapCache();
  const wp = `${WP}/2024/11/Playful-SEO-en-Vigo0.svg`;
  const out = applyBlobImagesToUrl(wp, PREVIEW_ENV);
  assert.match(out, /\.public\.blob\.vercel-storage\.com\/media\/2024\/11\/Playful-SEO-en-Vigo0\.svg/);
  assert.doesNotMatch(out, /endpoint\.playfulagency\.com/);
});

test('srcset entries drop URLs that contain whitespace in the path', () => {
  clearBlobMigrationMapCache();
  const broken = `${WP}/2024/09/Haz-Pruebas-y- Optimiza-tus-Campanas-300x255.png`;
  const good = `${WP}/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas.png`;
  const html = `<img src="${good}" srcset="${broken} 300w, ${good} 1000w" />`;
  const out = applyBlobImagesToHtml(html, PREVIEW_ENV);
  const srcset = out.match(/\bsrcset=(["'])([^"']*)\1/i)?.[2] || '';
  assert.doesNotMatch(srcset, /300w/);
  assert.match(srcset, /1000w/);
  for (const part of srcset.split(',')) {
    const url = part.trim().split(/\s+/)[0];
    assert.doesNotMatch(url, /\s/);
  }
});
