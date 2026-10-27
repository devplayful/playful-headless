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
import { Posts } from './cms/collections/Posts.ts';
import { Usuarios } from './cms/collections/Usuarios.ts';

const dirname = path.dirname(fileURLToPath(import.meta.url));

// Sin DATABASE_URI la web pública sigue funcionando: solo /admin y /cms-api
// necesitan base de datos, y se resuelven en petición (nunca en el build).
const databaseUri = process.env.DATABASE_URI || process.env.POSTGRES_URL || '';
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
  collections: [Posts, Paginas, Casos, Autores, Categorias, Medios, Usuarios],
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: databaseUri },
    push: process.env.PAYLOAD_DB_PUSH === 'true' || process.env.NODE_ENV !== 'production',
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
