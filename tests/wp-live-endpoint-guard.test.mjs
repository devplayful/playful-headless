import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const FORBIDDEN = [
  /endpoint\.playfulagency\.com/i,
  /\bi[0-2]\.wp\.com\b/i,
  /crear\.endpoint\.playfulagency\.com/i,
];

const SKIP_DIRS = new Set([
  'node_modules',
  '.next',
  'data',
  'docs',
  'public/wp-media',
  'tests',
]);

const SKIP_FILES = new Set([
  'export-wp-snapshot.ts',
  'audit-rendered-endpoint-urls.ts',
  'audit-wp-static-endpoint-inventory.ts',
  'audit-preview-endpoint-surfaces.ts',
  'migrate-images-to-blob.ts',
  'servicios-wp-for-seed.mjs',
  'import-wp.ts',
  'import-casos-wp.ts',
]);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const path = join(dir, name);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|js|mjs|cjs|jsx)$/.test(name) && !SKIP_FILES.has(name)) out.push(path);
  }
  return out;
}

const offenders = [];
for (const file of walk(ROOT)) {
  const rel = file.slice(ROOT.length + 1);
  if (rel.startsWith('data/wp-snapshot/')) continue;
  const text = readFileSync(file, 'utf8');
  for (const re of FORBIDDEN) {
    if (re.test(text) && !text.includes('WORDPRESS_LIVE_FETCH')) {
      offenders.push(`${rel}: ${re}`);
      break;
    }
  }
}

test('código de app/lib/services no referencia endpoint.playfulagency.com ni *.wp.com (salvo export live)', () => {
  assert.deepEqual(
    offenders,
    [],
    offenders.slice(0, 15).join('\n') || 'ok',
  );
});