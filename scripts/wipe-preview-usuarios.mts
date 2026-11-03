/**
 * One-shot Preview: lista emails de `usuarios` y vacía la colección
 * (sesiones, locks y preferences relacionados). Nunca Production.
 *
 * Misma vía que los seeds Preview (getPayload). Sentinel en payload_kv
 * para no volver a borrar si José crea el primer usuario.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { shouldRunPreviewUsuariosWipe } from '../lib/cms-database.ts';

const SENTINEL_KEY = 'playful.wipe-preview-usuarios.h7-20261103';

type Poolish = {
  query: (
    text: string,
    values?: unknown[],
  ) => Promise<{ rows: Array<Record<string, unknown>>; rowCount?: number | null }>;
};

function summarize(row: { emails: string[]; remaining: number; initialized: boolean }) {
  return JSON.stringify({
    emailsDeleted: row.emails,
    remaining: row.remaining,
    initialized: row.initialized,
  });
}

async function main() {
  if (!shouldRunPreviewUsuariosWipe()) {
    console.log(
      'wipe-preview-usuarios: omitido (solo VERCEL_ENV=preview con DATABASE_URL; nunca Production)',
    );
    process.exit(0);
  }

  console.log('wipe-preview-usuarios: getPayload (Preview)');
  const payload = await getPayload({ config });

  try {
    const pool = (payload.db as { pool?: Poolish }).pool;
    if (!pool?.query) {
      console.error('wipe-preview-usuarios: sin pool de Payload');
      process.exit(1);
    }

    const sentinel = await pool.query('select key from payload_kv where key = $1 limit 1', [
      SENTINEL_KEY,
    ]);
    const listed = await payload.find({
      collection: 'usuarios',
      limit: 1000,
      depth: 0,
      overrideAccess: true,
    });
    const emails = listed.docs
      .map((doc) => (typeof doc.email === 'string' ? doc.email : ''))
      .filter(Boolean);

    if (sentinel.rowCount) {
      console.log(
        summarize({
          emails: [],
          remaining: listed.totalDocs,
          initialized: listed.totalDocs > 0,
        }),
      );
      console.log('wipe-preview-usuarios: sentinel presente; no se vuelve a borrar');
      return;
    }

    console.log(`wipe-preview-usuarios: borrando ${emails.length} usuario(s)`);
    for (const doc of listed.docs) {
      await payload.delete({
        collection: 'usuarios',
        id: doc.id,
        overrideAccess: true,
      });
    }

    await pool.query(`
      delete from payload_preferences
      where id in (
        select distinct parent_id from payload_preferences_rels
        where usuarios_id is not null
      )
    `);
    await pool.query(`
      delete from payload_locked_documents
      where id in (
        select distinct parent_id from payload_locked_documents_rels
        where usuarios_id is not null
      )
      and id not in (
        select distinct parent_id from payload_locked_documents_rels
        where usuarios_id is null
      )
    `);
    await pool.query(`
      delete from payload_preferences p
      where not exists (
        select 1 from payload_preferences_rels r where r.parent_id = p.id
      )
    `);
    await pool.query(`
      delete from payload_locked_documents d
      where not exists (
        select 1 from payload_locked_documents_rels r where r.parent_id = d.id
      )
    `);

    const after = await payload.find({
      collection: 'usuarios',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });
    if (after.totalDocs !== 0) {
      console.error('wipe-preview-usuarios: remaining != 0');
      process.exit(1);
    }

    await pool.query('insert into payload_kv (key, data) values ($1, $2::jsonb)', [
      SENTINEL_KEY,
      JSON.stringify({ wipedAt: new Date().toISOString(), emails }),
    ]);

    console.log(
      summarize({
        emails,
        remaining: 0,
        initialized: false,
      }),
    );
    console.log('wipe-preview-usuarios: create-first-user abierto (initialized=false)');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'error';
    console.error('wipe-preview-usuarios: fallo', message);
    process.exit(1);
  } finally {
    await payload.destroy();
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((error) => {
    console.error('wipe-preview-usuarios: fallo', error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
