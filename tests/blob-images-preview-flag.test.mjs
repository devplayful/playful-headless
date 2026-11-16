import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOB_IMAGES_PREVIEW_BRANCHES,
  CMS_BLOB_IMAGES_ENV,
  isBlobImagesEnabled,
} from '../lib/blob-image-url.ts';

describe('isBlobImagesEnabled', () => {
  it('producción sin CMS_BLOB_IMAGES=true → legacy (endpoint)', () => {
    assert.equal(isBlobImagesEnabled({ VERCEL_ENV: 'production' }), false);
    assert.equal(
      isBlobImagesEnabled({ VERCEL_ENV: 'production', CMS_BLOB_IMAGES_ENV: 'false' }),
      false,
    );
    assert.equal(
      isBlobImagesEnabled({ VERCEL_ENV: 'production', CMS_BLOB_IMAGES_ENV: '1' }),
      false,
    );
  });

  it('producción con CMS_BLOB_IMAGES=true → Blob', () => {
    assert.equal(
      isBlobImagesEnabled({ VERCEL_ENV: 'production', CMS_BLOB_IMAGES_ENV: 'true' }),
      true,
    );
  });

  it('preview rama integración H7 → Blob', () => {
    assert.equal(
      isBlobImagesEnabled({
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'cursor/payload-h7-integracion',
      }),
      true,
    );
  });

  it('solo preview de ramas H2 e integración H7', () => {
    for (const ref of BLOB_IMAGES_PREVIEW_BRANCHES) {
      assert.equal(
        isBlobImagesEnabled({
          VERCEL_ENV: 'preview',
          VERCEL_GIT_COMMIT_REF: ref,
        }),
        true,
        ref,
      );
    }
    assert.equal(
      isBlobImagesEnabled({
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: 'main',
      }),
      false,
    );
  });

  it('local/script con CMS_BLOB_IMAGES=1', () => {
    assert.equal(isBlobImagesEnabled({ [CMS_BLOB_IMAGES_ENV]: '1' }), true);
  });
});
