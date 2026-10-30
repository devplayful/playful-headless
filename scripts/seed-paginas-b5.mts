/**
 * Seed idempotente H6 bloque 5 (404) → colección paginas-codigo.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  PAGINAS_B5_SLUGS,
  paginasB5SeedBodyForSlug,
  type PaginasB5Slug,
} from '../cms/data/paginas-b5-payload.ts';
import { paginaCodigoContentMatchesSeed } from '../lib/paginas-b1-seed-compare.ts';

type BlockResult = 'OK' | 'ERROR';

async function findBySlug(payload: Payload, slug: string) {
  const found = await payload.find({
    collection: 'paginas-codigo',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  return found.docs[0] ?? null;
}

function logSlug(slug: string, result: BlockResult, detail?: string) {
  const suffix = detail ? ` ${detail}` : '';
  console.log(`[H6-B5] ${slug} ${result}${suffix}`);
}

async function upsertSlug(payload: Payload, slug: PaginasB5Slug): Promise<void> {
  const data = paginasB5SeedBodyForSlug(slug);
  const existing = await findBySlug(payload, slug);
  if (existing) {
    await payload.update({
      collection: 'paginas-codigo',
      id: existing.id,
      data,
      depth: 0,
    });
    return;
  }
  await payload.create({ collection: 'paginas-codigo', data, depth: 0 });
}

async function main() {
  let exitCode = 0;
  let okCount = 0;
  let errCount = 0;
  const payload = await getPayload({ config });

  try {
    for (const slug of PAGINAS_B5_SLUGS) {
      const expected = paginasB5SeedBodyForSlug(slug);
      try {
        await upsertSlug(payload, slug);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        logSlug(slug, 'ERROR', `(upsert: ${message})`);
        errCount += 1;
        exitCode = 1;
        continue;
      }

      const doc = await findBySlug(payload, slug);
      if (!doc || typeof doc.content !== 'object' || !doc.content) {
        logSlug(slug, 'ERROR', '(documento ausente tras upsert)');
        errCount += 1;
        exitCode = 1;
        continue;
      }

      const normalized = {
        id: doc.id,
        titulo: String(doc.titulo ?? slug),
        slug: String(doc.slug ?? slug),
        bloque: String(doc.bloque ?? ''),
        content: doc.content as Record<string, unknown>,
      };

      if (!paginaCodigoContentMatchesSeed(normalized, expected.content)) {
        logSlug(slug, 'ERROR', '(checksum no persistió)');
        errCount += 1;
        exitCode = 1;
        continue;
      }

      logSlug(slug, 'OK');
      okCount += 1;
    }

    console.log(`[H6-B5] resumen: ${okCount} OK / ${errCount} ERROR`);
  } finally {
    await payload.destroy();
  }

  process.exit(exitCode);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((error) => {
    console.error('[H6-B5] seed ERROR', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
