/**
 * Persiste en Payload las URLs Blob del mapa (solo con CMS_BLOB_IMAGES=1).
 *
 *   CMS_BLOB_IMAGES=1 DATABASE_URI=... node scripts/seed-blob-urls.ts
 */
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { isBlobImagesEnabled } from '../lib/blob-image-url.ts';
import { applyBlobImageMapAllPayload } from '../lib/blob-image-payload.ts';

async function main() {
  if (!isBlobImagesEnabled()) {
    console.log(
      JSON.stringify({
        skipped: true,
        reason: 'CMS_BLOB_IMAGES no activo (use CMS_BLOB_IMAGES=1)',
      }),
    );
    process.exit(0);
  }
  const payload = await getPayload({ config });
  const result = await applyBlobImageMapAllPayload(payload);
  console.log(JSON.stringify({ ok: true, colecciones: result }, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
