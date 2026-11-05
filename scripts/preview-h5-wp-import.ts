/**
 * Preview: asegura contenido H5 en Neon (posts + paginas) vía import WP idempotente.
 * Solo VERCEL_ENV=preview con DATABASE_URL. No borra datos.
 */
import { spawn } from 'node:child_process';
import { countPayloadPosts } from '../lib/cms-blog.ts';

const MIN_POSTS = 130;

function runImport(): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, ['scripts/import-wp.ts'], {
      stdio: 'inherit',
      env: { ...process.env, PAYLOAD_MIGRATING: 'false' },
    });
    child.on('exit', (code) => resolve(typeof code === 'number' ? code : 1));
    child.on('error', () => resolve(1));
  });
}

async function main() {
  if (process.env.VERCEL_ENV !== 'preview' || !(process.env.DATABASE_URL || '').trim()) {
    console.log('[H5-IMPORT] omitido (solo Preview con DATABASE_URL)');
    process.exit(0);
  }
  const count = await countPayloadPosts();
  console.log(`[H5-IMPORT] posts publicados en Payload: ${count}`);
  if (count >= MIN_POSTS) {
    console.log('[H5-IMPORT] OK — import completo ya presente');
    process.exit(0);
  }
  console.log('[H5-IMPORT] ejecutando npm run cms:import (idempotente, ~2–3 min)');
  const code = await runImport();
  if (code !== 0) {
    console.error(`[H5-IMPORT] cms:import terminó con código ${code}`);
    process.exit(code);
  }
  const after = await countPayloadPosts();
  console.log(`[H5-IMPORT] tras import: ${after} posts`);
  process.exit(after >= MIN_POSTS ? 0 : 1);
}

main().catch((err) => {
  console.error('[H5-IMPORT] fallo:', err);
  process.exit(1);
});
