/**
 * Preview build (H4): import WP casos + seed idempotente + log [H4-CASOS] por slug.
 */
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { importCasosFromWordPress } from './import-casos-wp.ts';
import {
  upsertSoyTechno,
  upsertUrlVideoForSlug,
  H4_CASO_SLUGS,
} from './seed-casos-h4-lib.ts';

const LOG_PREFIX = '[H4-CASOS]';

async function logCaso(slug: string, ok: boolean, detail?: string) {
  const suffix = detail ? ` (${detail})` : '';
  console.log(`${LOG_PREFIX} ${slug} ${ok ? 'OK' : 'ERROR'}${suffix}`);
}

async function verifySlug(slug: string): Promise<boolean> {
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: 'casos',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  return Boolean(found.docs[0]);
}

async function main() {
  let exitCode = 0;
  try {
    await importCasosFromWordPress();
  } catch (err) {
    console.error(`${LOG_PREFIX} import-wp ERROR:`, err);
    exitCode = 1;
  }

  const payload = await getPayload({ config });
  try {
    await upsertSoyTechno(payload);
    await upsertUrlVideoForSlug(payload, 'jumex-shopify-dtc-ecommerce');
    await upsertUrlVideoForSlug(payload, 'odwalla-shopify-dtc-ecommerce');
  } catch (err) {
    console.error(`${LOG_PREFIX} seed ERROR:`, err);
    exitCode = 1;
  }

  for (const slug of H4_CASO_SLUGS) {
    try {
      const ok = await verifySlug(slug);
      await logCaso(slug, ok, ok ? undefined : 'documento no encontrado');
      if (!ok) exitCode = 1;
    } catch (err) {
      await logCaso(slug, false, err instanceof Error ? err.message : String(err));
      exitCode = 1;
    }
  }

  const count = await payload.count({ collection: 'casos' });
  console.log(
    JSON.stringify({ h4: 'casos', casos: count.totalDocs, slugs: H4_CASO_SLUGS }, null, 2),
  );
  process.exit(exitCode);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
