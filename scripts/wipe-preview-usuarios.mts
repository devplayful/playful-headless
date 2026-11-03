/**
 * One-shot Preview: lista emails de `usuarios` y vacía la colección
 * (sesiones, locks y preferences relacionados). Nunca Production.
 *
 * Sentinel en payload_kv para no volver a borrar si José crea el primer usuario.
 */
import { Client } from 'pg';
import { getPayloadConnectionString, shouldRunPreviewUsuariosWipe } from '../lib/cms-database.ts';

const SENTINEL_KEY = 'playful.wipe-preview-usuarios.h7-20261103';

function summarize(row: { emails: string[]; remaining: number; initialized: boolean }) {
  return JSON.stringify({
    emailsDeleted: row.emails,
    remaining: row.remaining,
    initialized: row.initialized,
  });
}

async function main() {
  if (!shouldRunPreviewUsuariosWipe()) {
    console.log('wipe-preview-usuarios: omitido (solo VERCEL_ENV=preview con DATABASE_URL; nunca Production)');
    process.exit(0);
  }

  const connectionString = getPayloadConnectionString();
  if (!connectionString) {
    console.error('wipe-preview-usuarios: sin cadena de conexión');
    process.exit(1);
  }

  const client = new Client({ connectionString, connectionTimeoutMillis: 15_000 });
  await client.connect();

  try {
    const sentinel = await client.query<{ key: string }>(
      'select key from payload_kv where key = $1 limit 1',
      [SENTINEL_KEY],
    );
    const listed = await client.query<{ email: string }>(
      'select email from usuarios order by id',
    );
    const emails = listed.rows.map((row) => row.email).filter(Boolean);

    if (sentinel.rowCount) {
      const remaining = emails.length;
      console.log(
        summarize({
          emails: [],
          remaining,
          initialized: remaining > 0,
        }),
      );
      console.log('wipe-preview-usuarios: sentinel presente; no se vuelve a borrar');
      return;
    }

    await client.query('begin');
    await client.query(`
      delete from payload_preferences
      where id in (
        select distinct parent_id from payload_preferences_rels
        where usuarios_id is not null
      )
    `);
    await client.query(`
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
    await client.query('delete from usuarios');
    await client.query(`
      delete from payload_preferences p
      where not exists (
        select 1 from payload_preferences_rels r where r.parent_id = p.id
      )
    `);
    await client.query(`
      delete from payload_locked_documents d
      where not exists (
        select 1 from payload_locked_documents_rels r where r.parent_id = d.id
      )
    `);

    const after = await client.query<{ n: string }>(
      'select count(*)::text as n from usuarios',
    );
    const remaining = Number(after.rows[0]?.n || 0);
    if (remaining !== 0) {
      await client.query('rollback');
      console.error('wipe-preview-usuarios: remaining != 0; rollback');
      process.exit(1);
    }

    await client.query(
      `insert into payload_kv (key, data) values ($1, $2::jsonb)`,
      [SENTINEL_KEY, JSON.stringify({ wipedAt: new Date().toISOString(), emails })],
    );
    await client.query('commit');

    console.log(
      summarize({
        emails,
        remaining: 0,
        initialized: false,
      }),
    );
    console.log('wipe-preview-usuarios: create-first-user abierto (initialized=false)');
  } catch (error) {
    try {
      await client.query('rollback');
    } catch {
      // ignore
    }
    const message = error instanceof Error ? error.message : 'error';
    console.error('wipe-preview-usuarios: fallo', message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
