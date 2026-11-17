/**
 * Import idempotente desde data/wp-snapshot → Payload (podcast-episodios, equipo).
 * Requiere DATABASE_URL y PAYLOAD_SECRET en local/preview. No ejecutar en producción.
 */
import { getPayload } from 'payload';
import config from '@payload-config';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const snap = (name: string) =>
  JSON.parse(readFileSync(join(root, 'data', 'wp-snapshot', 'collections', name), 'utf8'));

async function upsertByWpId(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'podcast-episodios' | 'equipo',
  items: Array<Record<string, unknown>>,
) {
  let upserted = 0;
  for (const item of items) {
    const wpId = Number(item.id);
    const slug = String(item.slug || '');
    if (!wpId || !slug) continue;
    const titulo = String(item.title?.rendered || item.title || slug).replace(/<[^>]+>/g, '');
    const data = {
      wpId,
      slug,
      titulo,
      estado: String(item.status || 'publish'),
      extracto: String(item.excerpt?.rendered || '').replace(/<[^>]+>/g, ' ').trim(),
      contentHtml: String(item.content?.rendered || ''),
      wpDate: String(item.date_gmt || item.date || ''),
      cargo: typeof item.cargo === 'string' ? item.cargo : undefined,
      rol: typeof item.rol === 'string' ? item.rol : undefined,
      acf: item.acf ?? undefined,
    };
    const existing = await payload.find({
      collection,
      where: { wpId: { equals: wpId } },
      limit: 1,
      depth: 0,
    });
    const id = existing.docs[0]?.id;
    if (id) {
      await payload.update({ collection, id, data: data as never, depth: 0 });
    } else {
      await payload.create({ collection, data: data as never, depth: 0 });
    }
    upserted += 1;
  }
  return upserted;
}

async function main() {
  if (process.env.VERCEL_ENV === 'production') {
    console.error('seed-from-wp-snapshot: rechazado en production');
    process.exit(1);
  }
  const payload = await getPayload({ config });
  const podcast = await upsertByWpId(payload, 'podcast-episodios', snap('podcast.json'));
  const equipo = await upsertByWpId(payload, 'equipo', snap('equipo.json'));
  console.log(JSON.stringify({ podcast, equipo }, null, 2));
  await payload.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});