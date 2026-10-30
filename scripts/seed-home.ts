/**
 * Seed idempotente de la colección Home (singleton slug `main`).
 *
 *   DATABASE_URL=postgres://... npm run cms:seed-home
 */
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  HOME_MAIN_CONTENT,
  HOME_MAIN_SLUG,
  HOME_SEED_BLOCK_IDS,
  homeContentBlockSnapshot,
  type HomeSeedBlockId,
} from '../cms/data/home-main-content.ts';

type BlockResult = 'OK' | 'ERROR';

async function findHome(payload: Payload) {
  const found = await payload.find({
    collection: 'home',
    where: { slug: { equals: HOME_MAIN_SLUG } },
    limit: 1,
    depth: 0,
  });
  return found.docs[0] ? { id: found.docs[0].id } : null;
}

async function upsertHome(payload: Payload): Promise<void> {
  const existing = await findHome(payload);
  const data = {
    slug: HOME_MAIN_SLUG,
    content: HOME_MAIN_CONTENT,
  };
  if (existing) {
    await payload.update({ collection: 'home', id: existing.id, data, depth: 0 });
    return;
  }
  await payload.create({ collection: 'home', data, depth: 0 });
}

function logBlock(blockId: HomeSeedBlockId, result: BlockResult, detail?: string) {
  const suffix = detail ? `: ${detail}` : '';
  console.log(`[HOME-CMS] ${blockId} ${result}${suffix}`);
}

async function verifyBlocks(payload: Payload): Promise<{ ok: number; err: number }> {
  const found = await payload.find({
    collection: 'home',
    where: { slug: { equals: HOME_MAIN_SLUG } },
    limit: 1,
    depth: 0,
  });
  const doc = found.docs[0];
  if (!doc?.content) {
    for (const blockId of HOME_SEED_BLOCK_IDS) {
      logBlock(blockId, 'ERROR', 'documento home/main ausente');
    }
    console.log('[HOME-CMS] resumen: 0 OK / 8 ERROR');
    return { ok: 0, err: HOME_SEED_BLOCK_IDS.length };
  }

  let ok = 0;
  let err = 0;
  for (const blockId of HOME_SEED_BLOCK_IDS) {
    try {
      const expected = homeContentBlockSnapshot(HOME_MAIN_CONTENT, blockId);
      const actual = homeContentBlockSnapshot(doc.content as typeof HOME_MAIN_CONTENT, blockId);
      const match = JSON.stringify(expected) === JSON.stringify(actual);
      if (match) {
        logBlock(blockId, 'OK');
        ok += 1;
      } else {
        logBlock(blockId, 'ERROR', 'contenido distinto al seed main');
        err += 1;
      }
    } catch (error) {
      logBlock(blockId, 'ERROR', error instanceof Error ? error.message : 'verify failed');
      err += 1;
    }
  }
  console.log(`[HOME-CMS] resumen: ${ok} OK / ${err} ERROR`);
  return { ok, err };
}

async function main() {
  const payload = await getPayload({ config });
  await upsertHome(payload);
  const { ok, err } = await verifyBlocks(payload);
  if (err !== 0 || ok !== HOME_SEED_BLOCK_IDS.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error('[HOME-CMS] seed ERROR', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
