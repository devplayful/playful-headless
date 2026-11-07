import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  blobUrlForBodyImage,
  countLegacyPostBodyImageSrcs,
  isLegacyPostBodyImageSrc,
  rewritePostBodyHtml,
  rewritePostBodyImagesForPreview,
  shouldRewritePostBodyImages,
} = await import('../lib/post-body-blob-images.ts');
const { loadBlobMigrationMap, clearBlobMigrationMapCache } = await import('../lib/blob-image-map.ts');

clearBlobMigrationMapCache();
const map = loadBlobMigrationMap();

const SEO_SEM_IMG =
  '<img loading="lazy" decoding="async" class="wp-image-67810" src="//i0.wp.com/crear.endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3.png" alt="Banner de Playful Agency sobre posicionamiento SEO y SEM" width="548" height="233" srcset="https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3.png 730w, https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3-300x127.png 300w, https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3-560x238.png 560w, https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3-150x64.png 150w" sizes="(max-width: 548px) 100vw, 548px" />';

const PIXEL =
  '<img src="https://endpoint.playfulagency.com/wp-content/plugins/wti-like-post/images/pixel.gif" alt="" width="1" height="1" />';

test('el mapa de Blob está cargado', () => {
  assert.ok(map);
  assert.ok(Object.keys(map).length > 2800);
});

test('reescribe src i0.wp.com y srcset de endpoint, y conserva alt, width, height y descriptors', () => {
  const out = rewritePostBodyHtml(SEO_SEM_IMG, map);
  assert.doesNotMatch(out, /i0\.wp\.com/);
  assert.doesNotMatch(out, /endpoint\.playfulagency\.com/);
  assert.match(out, /alt="Banner de Playful Agency sobre posicionamiento SEO y SEM"/);
  assert.match(out, /width="548"/);
  assert.match(out, /height="233"/);
  assert.match(out, /sizes="\(max-width: 548px\) 100vw, 548px"/);
  assert.match(out, /Herramienta-SEO-3\.png 730w/);
  assert.match(out, /Herramienta-SEO-3-300x127\.png 300w/);
  assert.match(out, /Herramienta-SEO-3-560x238\.png 560w/);
  assert.match(out, /Herramienta-SEO-3-150x64\.png 150w/);
  assert.match(out, /public\.blob\.vercel-storage\.com\/media\/2020\/08\/Herramienta-SEO-3\.png"/);
  const before = countLegacyPostBodyImageSrcs(SEO_SEM_IMG, map);
  const after = countLegacyPostBodyImageSrcs(out, map);
  assert.equal(before.srcTotal, 1);
  assert.equal(before.srcRewritten, 1);
  assert.equal(after.srcTotal, 0);
  assert.equal(rewritePostBodyHtml(out, map), out);
});

test('deja el píxel de seguimiento sin equivalente en Blob', () => {
  const out = rewritePostBodyHtml(PIXEL, map);
  assert.equal(out, PIXEL);
  const count = countLegacyPostBodyImageSrcs(PIXEL, map);
  assert.equal(count.srcTotal, 1);
  assert.equal(count.srcRewritten, 0);
  assert.deepEqual(count.srcUnmapped, [
    'https://endpoint.playfulagency.com/wp-content/plugins/wti-like-post/images/pixel.gif',
  ]);
});

test('no toca enlaces ni imágenes de otros hosts', () => {
  const html =
    '<a href="https://endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3.png">ficha</a>'
    + '<img src="https://lh3.googleusercontent.com/foto.png" alt="google" width="10" height="10" />';
  assert.equal(rewritePostBodyHtml(html, map), html);
  assert.equal(isLegacyPostBodyImageSrc('https://lh3.googleusercontent.com/foto.png'), false);
  assert.equal(
    isLegacyPostBodyImageSrc('//i0.wp.com/crear.endpoint.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-3.png'),
    true,
  );
});

test('codifica en Blob los nombres con ¿ igual que la subida', () => {
  const src = 'https://endpoint.playfulagency.com/wp-content/uploads/2020/07/playful-¿Listo-para-empezar_@2x.svg';
  const blob = blobUrlForBodyImage(src, map);
  assert.match(blob, /playful-%25C2%25BFListo-para-empezar_%402x\.svg$/);
});

test('en producción no reescribe; en preview sí', () => {
  assert.equal(shouldRewritePostBodyImages({ VERCEL_ENV: 'production', CMS_BLOB_BODY_IMAGES: '1' }), false);
  assert.equal(shouldRewritePostBodyImages({ VERCEL_ENV: 'preview' }), true);
  assert.equal(shouldRewritePostBodyImages({ CMS_BLOB_BODY_IMAGES: '1' }), true);
  assert.equal(shouldRewritePostBodyImages({}), false);
  assert.equal(rewritePostBodyImagesForPreview(SEO_SEM_IMG, { VERCEL_ENV: 'production' }), SEO_SEM_IMG);
  assert.match(
    rewritePostBodyImagesForPreview(SEO_SEM_IMG, { VERCEL_ENV: 'preview' }),
    /public\.blob\.vercel-storage\.com/,
  );
});

test('el import y el render del post usan la reescritura del cuerpo', () => {
  const importer = readFileSync(new URL('../scripts/import-wp.ts', import.meta.url), 'utf8');
  const page = readFileSync(new URL('../app/(frontend)/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
  assert.match(importer, /rewritePostBodyHtml\(p\.content\?\.rendered/);
  assert.match(page, /blogBodyForSlug\(postSlug\) \|\| post\.content\?\.rendered/);
  assert.match(page, /rewritePostBodyImagesForPreview\(\$\.html\(\)\)/);
  assert.match(page, /dangerouslySetInnerHTML=\{\{ __html: contentWithIds \}\}/);
});
