/**
 * Preview build (VERCEL_ENV=preview): seed H5 idempotente + log [H5-ALT] desde la BD.
 * Invocado desde scripts/build-with-budget.mjs tras payload migrate.
 */
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { uniqueH5PreviewBuildWpIds } from '../cms/data/posts-content-alt-h5.ts';
import { ensureH5PostsFromWp } from '../cms/lib/import-wp-h5-lite.ts';
import { logH5PreviewBuildVerification } from '../cms/lib/h5-build-verify-log.ts';
import { runH5PostsAltSeed } from '../cms/lib/h5-posts-alt-seed.ts';

async function main() {
  const payload = await getPayload({ config });
  const wpIds = uniqueH5PreviewBuildWpIds();
  await ensureH5PostsFromWp(payload, wpIds);
  await runH5PostsAltSeed(payload);
  await logH5PreviewBuildVerification(payload);
  process.exit(0);
}

main().catch((err) => {
  console.error('[H5-ALT] seed preview falló:', err);
  process.exit(1);
});
