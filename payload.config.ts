import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig } from 'payload';
import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { Autores } from './cms/collections/Autores.ts';
import { Casos } from './cms/collections/Casos.ts';
import { Categorias } from './cms/collections/Categorias.ts';
import { Medios } from './cms/collections/Medios.ts';
import { Paginas } from './cms/collections/Paginas.ts';
import { PaginasCodigo } from './cms/collections/PaginasCodigo.ts';
import { Posts } from './cms/collections/Posts.ts';
import { Usuarios } from './cms/collections/Usuarios.ts';
import { getPayloadConnectionString } from './lib/cms-database.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Sin DATABASE_URL (Production) la web pública sigue igual: /admin y /cms-api
// solo tocan la base en petición. Migraciones usan DATABASE_URL_UNPOOLED.
const databaseUri = getPayloadConnectionString();
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  secret: process.env.PAYLOAD_SECRET || 'solo-local-no-usar-en-produccion',
  routes: { admin: '/admin', api: '/cms-api' },
  admin: {
    user: Usuarios.slug,
    importMap: { baseDir: dirname },
    meta: { titleSuffix: ' · CMS Playful', robots: 'noindex, nofollow' },
  },
  collections: [Posts, Paginas, PaginasCodigo, Casos, Autores, Categorias, Medios, Usuarios],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: databaseUri },
    push: process.env.PAYLOAD_DB_PUSH === 'true' || process.env.NODE_ENV !== 'production',
    migrationDir: path.resolve(dirname, 'cms/migrations'),
    disableCreateDatabase: true,
  }),
  plugins: [
    vercelBlobStorage({
      enabled: Boolean(blobToken),
      collections: { medios: true },
      token: blobToken || '',
    }),
  ],
  typescript: { outputFile: path.resolve(dirname, 'cms/payload-types.ts') },
  telemetry: false,
});
