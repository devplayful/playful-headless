/**
 * Seed idempotente H6 bloque 1 (legales) → colección paginas-codigo.
 * Preview build: logs [H6-B1] <slug> OK|ERROR + resumen; cierra Payload.
 *
 *   DATABASE_URL=postgres://... npm run cms:seed-paginas-b1
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  PAGINAS_B1_SLUGS,
  paginasB1SeedBodyForSlug,
  type PaginasB1Slug,
} from '../cms/data/paginas-b1-payload.ts';
import { paginaCodigoContentMatchesSeed } from '../lib/cms-paginas-b1.ts';

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
  console.log(`[H6-B1] ${slug} ${result}${suffix}`);
}

async function upsertSlug(payload: Payload, slug: PaginasB1Slug): Promise<void> {
  const data = paginasB1SeedBodyForSlug(slug);
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
    for (const slug of PAGINAS_B1_SLUGS) {
      const expected = paginasB1SeedBodyForSlug(slug);
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

    console.log(`[H6-B1] resumen: ${okCount} OK / ${errCount} ERROR`);
  } finally {
    await payload.destroy();
  }

  process.exit(exitCode);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((error) => {
    console.error('[H6-B1] seed ERROR', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
