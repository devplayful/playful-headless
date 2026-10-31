import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  blobStorageKeyFromCanonicalUrl,
  blobPublicUrlFromKey,
  canonicalWordPressUploadUrl,
  extractImageUrlsFromHtml,
  isMigratableWordPressMediaUrl,
  maybeRewriteMediaUrl,
  rewriteMigratableUrlsInHtml,
} from '../lib/blob-image-url.ts';

describe('blob-image-url', () => {
  it('canonicaliza endpoint directo', () => {
    const raw = 'https://endpoint.playfulagency.com/wp-content/uploads/2024/11/hero.jpg';
    assert.equal(canonicalWordPressUploadUrl(raw), raw);
    assert.equal(
      blobStorageKeyFromCanonicalUrl(raw),
      'media/2024/11/hero.jpg',
    );
  });

  it('canonicaliza i0.wp.com con query', () => {
    const proxy =
      'https://i0.wp.com/endpoint.playfulagency.com/wp-content/uploads/2020/06/BANNER.png?w=834&ssl=1';
    const canonical = canonicalWordPressUploadUrl(proxy);
    assert.equal(
      canonical,
      'https://endpoint.playfulagency.com/wp-content/uploads/2020/06/BANNER.png',
    );
    assert.ok(isMigratableWordPressMediaUrl(proxy));
  });

  it('deja URLs que no son WP sin cambios', () => {
    const html =
      '<img src="https://cdn.example.com/a.png" /><img src="https://endpoint.playfulagency.com/wp-content/uploads/x.png" />';
    const map = {
      'https://endpoint.playfulagency.com/wp-content/uploads/x.png':
        'https://abc.public.blob.vercel-storage.com/media/x.png',
    };
    const out = rewriteMigratableUrlsInHtml(html, map);
    assert.match(out, /cdn\.example\.com\/a\.png/);
    assert.match(out, /abc\.public\.blob\.vercel-storage\.com\/media\/x\.png/);
    assert.doesNotMatch(out, /endpoint\.playfulagency\.com\/wp-content\/uploads\/x\.png/);
  });

  it('reescribe src y srcset', () => {
    const wp = 'https://endpoint.playfulagency.com/wp-content/uploads/2022/a.png';
    const wp300 =
      'https://endpoint.playfulagency.com/wp-content/uploads/2022/a-300x200.png';
    const blob = 'https://store.public.blob.vercel-storage.com/media/2022/a.png';
    const blob300 = 'https://store.public.blob.vercel-storage.com/media/2022/a-300x200.png';
    const html = `<img src="${wp}" srcset="${wp300} 300w, ${wp} 800w" />`;
    const out = rewriteMigratableUrlsInHtml(html, {
      [wp]: blob,
      [wp300]: blob300,
    });
    assert.match(out, new RegExp(`src="${blob}"`));
    assert.match(out, /a-300x200\.png 300w/);
    assert.match(out, /a\.png 800w/);
  });

  it('extrae URLs del cuerpo', () => {
    const html =
      '<img src="https://i1.wp.com/endpoint.playfulagency.com/wp-content/uploads/2021/x.jpg?fit=640" srcset="https://endpoint.playfulagency.com/wp-content/uploads/2021/x-300x300.jpg 300w" />';
    const urls = extractImageUrlsFromHtml(html);
    assert.ok(urls.some((u) => u.includes('i1.wp.com')));
    assert.ok(urls.some((u) => u.includes('x-300x300')));
  });

  it('codifica claves Blob con % en el nombre (TAPA ¿)', () => {
    const canonical =
      'https://endpoint.playfulagency.com/wp-content/uploads/2020/08/TAPA_¿Que-es-Google-Ad-Grants-150x150.png';
    const key = blobStorageKeyFromCanonicalUrl(canonical);
    assert.equal(key, 'media/2020/08/TAPA_%C2%BFQue-es-Google-Ad-Grants-150x150.png');
    const pub = blobPublicUrlFromKey(key);
    assert.match(pub, /TAPA_%25C2%25BFQue-es-Google-Ad-Grants-150x150\.png$/);
  });

  it('maybeRewriteMediaUrl re-codifica entradas del mapa', async () => {
    const { loadBlobMigrationMap, clearBlobMigrationMapCache } = await import(
      '../lib/blob-image-map.ts'
    );
    const { maybeRewriteMediaUrl, isBlobImagesEnabled } = await import('../lib/blob-image-url.ts');
    clearBlobMigrationMapCache();
    const env = {
      ...process.env,
      VERCEL_ENV: 'preview',
      VERCEL_GIT_COMMIT_REF: 'cursor/payload-h2-imagenes-5a28',
    };
    assert.ok(isBlobImagesEnabled(env));
    const wp =
      'https://endpoint.playfulagency.com/wp-content/uploads/2020/08/TAPA_¿Que-es-Google-Ad-Grants-150x150.png';
    const map = loadBlobMigrationMap(env);
    const out = maybeRewriteMediaUrl(wp, map, env);
    assert.match(out, /TAPA_%25C2%25BFQue-es-Google-Ad-Grants-150x150\.png$/);
  });
});
