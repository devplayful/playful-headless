#!/usr/bin/env node
/**
 * Inventario estático de rutas que pueden contactar WordPress en vivo.
 * Clasifica: runtime-guarded (snapshot), build-seed (tras fix), scripts-manuales, strings-en-HTML.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const CODE_EXT = new Set(['.ts', '.tsx', '.mts', '.mjs', '.js']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.next' || name === '.git') continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (CODE_EXT.has(path.extname(name))) out.push(full);
  }
  return out;
}

const patterns = [
  {
    id: 'live-fetch-fn',
    re: /\bwpFetch\b|\bfetch\s*\(\s*[`'"].*endpoint\.playfulagency/,
    note: 'Llamada HTTP directa (revisar si está en ruta de build)',
  },
  {
    id: 'wp-json-url',
    re: /endpoint\.playfulagency\.com\/wp-json/,
    note: 'URL REST WP en código',
  },
  {
    id: 'wordpress-request-guarded',
    re: /wordpressFetch(Collection)?\(/,
    note: 'Pasa por wordpress-request.mjs (snapshot si LIVE_FETCH off)',
  },
  {
    id: 'snapshot-router',
    re: /wordpressFetchFromSnapshot|wp-snapshot/,
    note: 'Lectura local snapshot',
  },
];

const files = walk(ROOT);
const hits = [];
for (const file of files) {
  const rel = path.relative(ROOT, file);
  if (rel.startsWith('tests/')) continue;
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const pat of patterns) {
      if (pat.re.test(line)) {
        hits.push({ file: rel, line: i + 1, id: pat.id, note: pat.note, snippet: line.trim().slice(0, 120) });
      }
    }
  });
}

const buildRuntimeEffective = hits.filter((h) => {
  if (h.file.startsWith('scripts/export') || h.file.startsWith('scripts/import')) return false;
  if (h.file.startsWith('scripts/audit') && h.file !== 'scripts/audit-wp-static-endpoint-inventory.ts') return false;
  if (h.file === 'scripts/servicios-wp-for-seed.mjs' && h.id === 'live-fetch-fn') return false;
  if (h.id === 'wordpress-request-guarded' || h.id === 'snapshot-router') return false;
  if (h.id === 'wp-json-url' && h.file === 'scripts/servicios-wp-for-seed.mjs') {
    return h.snippet.includes('WORDPRESS_API_URL');
  }
  return h.id === 'live-fetch-fn' || (h.id === 'wp-json-url' && !h.file.includes('export-wp-snapshot'));
});

const manual = hits.filter((h) => h.file.startsWith('scripts/') && /export|import|audit|mirror|about-href|service-booking-cta-curl/.test(h.file));

const out = {
  generatedAt: new Date().toISOString(),
  summary: {
    totalHits: hits.length,
    manualScriptHits: manual.length,
    buildRuntimeUncategorized: buildRuntimeEffective.length,
  },
  buildRuntimeUncategorized: buildRuntimeEffective,
  manualScriptsSample: manual.slice(0, 40),
  serviciosSeedNote:
    'cms:seed-servicios: solo VERCEL_ENV=preview + DATABASE_URL; usa wordpressFetchCollection → snapshot (WORDPRESS_LIVE_FETCH off).',
  runtimeNote: 'services/wordpress.ts → wordpress-request.mjs → snapshot cuando LIVE_FETCH off.',
};

console.log(JSON.stringify(out, null, 2));