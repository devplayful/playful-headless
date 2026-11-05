/**
 * Seed idempotente de la colección Home (singleton slug `main`).
 * Preview build: logs [HOME-CMS] por bloque + resumen; cierra conexión Payload.
 *
 *   DATABASE_URL=postgres://... npm run cms:seed-home
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  HOME_MAIN_SLUG,
  HOME_SEED_BLOCK_IDS,
  homeContentBlockSnapshot,
  type HomeSeedBlockId,
} from '../cms/data/home-main-content.ts';
import {
  homeSeedJsonEqual,
  homeSeedPayloadBody,
  parseHomeContentField,
} from '../lib/home-seed-compare.ts';

type BlockResult = 'OK' | 'ERROR';

async function fetchHomeDoc(payload: Payload) {
  const found = await payload.find({
    collection: 'home',
    where: { slug: { equals: HOME_MAIN_SLUG } },
    limit: 1,
    depth: 0,
  });
  return found.docs[0] ?? null;
}

async function upsertHome(payload: Payload): Promise<void> {
  const existing = await fetchHomeDoc(payload);
  const data = {
    slug: HOME_MAIN_SLUG,
    content: homeSeedPayloadBody(),
  };
  if (existing) {
    await payload.update({ collection: 'home', id: existing.id, data, depth: 0 });
    return;
  }
  await payload.create({ collection: 'home', data, depth: 0 });
}

function logBlock(blockId: HomeSeedBlockId, result: BlockResult, detail?: string) {
  const suffix = detail ? ` ${detail}` : '';
  console.log(`[HOME-CMS] ${blockId} ${result}${suffix}`);
}

async function main() {
  let exitCode = 0;
  let okCount = 0;
  let errCount = 0;
  const payload = await getPayload({ config });

  try {
    const beforeDoc = await fetchHomeDoc(payload);
    const beforeContent = beforeDoc ? parseHomeContentField(beforeDoc.content) : null;
    const blockWasDifferent = new Map<HomeSeedBlockId, boolean>();

    for (const blockId of HOME_SEED_BLOCK_IDS) {
      const expected = homeContentBlockSnapshot(homeSeedPayloadBody(), blockId);
      const actual = beforeContent ? homeContentBlockSnapshot(beforeContent, blockId) : null;
      blockWasDifferent.set(blockId, !homeSeedJsonEqual(expected, actual));
    }

    try {
      await upsertHome(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      for (const blockId of HOME_SEED_BLOCK_IDS) {
        logBlock(blockId, 'ERROR', `(upsert: ${message})`);
        errCount += 1;
      }
      console.log(`[HOME-CMS] resumen: ${okCount} OK / ${errCount} ERROR`);
      await payload.destroy();
      process.exit(1);
      return;
    }

    const afterDoc = await fetchHomeDoc(payload);
    const afterContent = afterDoc ? parseHomeContentField(afterDoc.content) : null;

    if (!afterContent) {
      for (const blockId of HOME_SEED_BLOCK_IDS) {
        logBlock(blockId, 'ERROR', '(documento home/main ausente tras upsert)');
        errCount += 1;
        exitCode = 1;
      }
    } else {
      for (const blockId of HOME_SEED_BLOCK_IDS) {
        const expected = homeContentBlockSnapshot(homeSeedPayloadBody(), blockId);
        const actual = homeContentBlockSnapshot(afterContent, blockId);
        if (!homeSeedJsonEqual(expected, actual)) {
          logBlock(blockId, 'ERROR', '(escritura no persistió el seed main)');
          errCount += 1;
          exitCode = 1;
          continue;
        }
        if (blockWasDifferent.get(blockId)) {
          logBlock(blockId, 'OK', '(updated)');
        } else {
          logBlock(blockId, 'OK');
        }
        okCount += 1;
      }
    }

    console.log(`[HOME-CMS] resumen: ${okCount} OK / ${errCount} ERROR`);
  } finally {
    await payload.destroy();
  }

  process.exit(exitCode);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((error) => {
    console.error('[HOME-CMS] seed ERROR', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
