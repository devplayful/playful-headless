import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BLOB_IMAGES_PREVIEW_BRANCH,
  CMS_BLOB_IMAGES_ENV,
  isBlobImagesEnabled,
} from '../lib/blob-image-url.ts';

describe('isBlobImagesEnabled', () => {
  it('nunca en producción', () => {
    assert.equal(
      isBlobImagesEnabled({ VERCEL_ENV: 'production', CMS_BLOB_IMAGES_ENV: '1' }),
      false,
    );
  });

  it('solo preview de la rama H2', () => {
    assert.equal(
      isBlobImagesEnabled({
        VERCEL_ENV: 'preview',
        VERCEL_GIT_COMMIT_REF: BLOB_IMAGES_PREVIEW_BRANCH,
      }),
      true,
    );
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
