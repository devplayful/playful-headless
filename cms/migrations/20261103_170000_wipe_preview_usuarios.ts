import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres';
import { sql } from '@payloadcms/db-postgres';

const SENTINEL_KEY = 'playful.wipe-preview-usuarios.h7-20261103';

function rowsOf(result: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(result)) return result as Array<Record<string, unknown>>;
  if (
    result &&
    typeof result === 'object' &&
    'rows' in result &&
    Array.isArray((result as { rows: unknown }).rows)
  ) {
    return (result as { rows: Array<Record<string, unknown>> }).rows;
  }
  return [];
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  if (process.env.VERCEL_ENV !== 'preview') {
    console.log(
      'wipe-preview-usuarios: migrate no-op (solo VERCEL_ENV=preview; nunca Production)',
    );
    return;
  }

  const sentinel = rowsOf(
    await db.execute(sql`select key from payload_kv where key = ${SENTINEL_KEY} limit 1`),
  );
  const listed = rowsOf(await db.execute(sql`select email from usuarios order by id`));
  const emails = listed
    .map((row) => (typeof row.email === 'string' ? row.email : ''))
    .filter(Boolean);

  if (sentinel.length) {
    console.log(
      JSON.stringify({
        emailsDeleted: [],
        remaining: emails.length,
        initialized: emails.length > 0,
      }),
    );
    console.log('wipe-preview-usuarios: sentinel presente; no se vuelve a borrar');
    return;
  }

  await db.execute(sql`
    delete from payload_preferences
    where id in (
      select distinct parent_id from payload_preferences_rels
      where usuarios_id is not null
    )
  `);
  await db.execute(sql`
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
  await db.execute(sql`delete from usuarios`);
  await db.execute(sql`
    delete from payload_preferences p
    where not exists (
      select 1 from payload_preferences_rels r where r.parent_id = p.id
    )
  `);
  await db.execute(sql`
    delete from payload_locked_documents d
    where not exists (
      select 1 from payload_locked_documents_rels r where r.parent_id = d.id
    )
  `);

  const after = rowsOf(await db.execute(sql`select count(*) as n from usuarios`));
  const remaining = Number(after[0]?.n ?? 0);
  if (remaining !== 0) {
    throw new Error('wipe-preview-usuarios: remaining != 0');
  }

  const data = JSON.stringify({ wipedAt: new Date().toISOString(), emails });
  await db.execute(
    sql`insert into payload_kv (key, data) values (${SENTINEL_KEY}, cast(${data} as jsonb))`,
  );

  console.log(
    JSON.stringify({
      emailsDeleted: emails,
      remaining: 0,
      initialized: false,
    }),
  );
  console.log('wipe-preview-usuarios: create-first-user abierto (initialized=false)');
}

export async function down(_args: MigrateDownArgs): Promise<void> {}
