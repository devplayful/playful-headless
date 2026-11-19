#!/usr/bin/env node
/**
 * Read-only full export from public WP REST (context=view, paginated).
 * Usage: node scripts/export-wp-backup-final.mjs [outDir]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.env.WP_BACKUP_BASE || 'https://endpoint.playfulagency.com/wp-json').replace(
  /\/$/,
  '',
);
const OUT = process.argv[2] || join(process.cwd(), 'data', 'wp-backup-2026-11-19');
const PER_PAGE = 100;
const TIMEOUT_MS = 45_000;

const CORE_COLLECTIONS = [
  { file: 'posts.json', path: '/wp/v2/posts' },
  { file: 'pages.json', path: '/wp/v2/pages' },
  { file: 'podcast.json', path: '/wp/v2/podcast' },
  { file: 'casos-de-exito.json', path: '/wp/v2/casos-de-exito' },
  { file: 'equipo.json', path: '/wp/v2/equipo' },
  { file: 'media.json', path: '/wp/v2/media' },
  { file: 'categories.json', path: '/wp/v2/categories' },
  { file: 'tags.json', path: '/wp/v2/tags' },
  { file: 'users.json', path: '/wp/v2/users' },
];

function madridNow() {
  return (
    new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) +
    ' Europe/Madrid'
  );
}

async function fetchJson(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  let res;
  try {
    res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    });
  } finally {
    clearTimeout(t);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText} ${url}\n${body.slice(0, 400)}`);
  }
  return res;
}

async function fetchAll(collectionPath) {
  const items = [];
  let page = 1;
  let totalPages = 1;
  while (page <= totalPages) {
    const url = `${BASE}${collectionPath}?context=view&per_page=${PER_PAGE}&page=${page}`;
    const res = await fetchJson(url);
    const tp = Number(res.headers.get('x-wp-totalpages') || '1');
    const total = Number(res.headers.get('x-wp-total') || '0');
    totalPages = Math.max(1, tp);
    const chunk = await res.json();
    if (!Array.isArray(chunk)) {
      throw new Error(`Non-array JSON from ${url}`);
    }
    items.push(...chunk);
    if (page === 1) {
      console.log(`  ${collectionPath}: total=${total} pages=${totalPages}`);
    }
    page += 1;
  }
  return items;
}

const startedAt = madridNow();
console.log('export_started', startedAt, 'base', BASE, 'out', OUT);

mkdirSync(OUT, { recursive: true });

const counts = {};
let typesSummary = {};
try {
  const typesRes = await fetchJson(`${BASE}/wp/v2/types`);
  typesSummary = await typesRes.json();
  writeFileSync(join(OUT, 'types.json'), JSON.stringify(typesSummary, null, 2));
} catch (err) {
  console.error('FATAL types', err.message);
  process.exit(2);
}

for (const { file, path } of CORE_COLLECTIONS) {
  try {
    console.log('fetch', path);
    const items = await fetchAll(path);
    writeFileSync(join(OUT, file), JSON.stringify(items, null, 2));
    counts[file.replace('.json', '')] = items.length;
  } catch (err) {
    console.error('FATAL', path, err.message);
    writeFileSync(
      join(OUT, 'manifest-error.json'),
      JSON.stringify({ failedAtMadrid: madridNow(), path, error: err.message }, null, 2),
    );
    process.exit(2);
  }
}

const finishedAt = madridNow();
const manifest = {
  source: BASE,
  startedAtMadrid: startedAt,
  finishedAtMadrid: finishedAt,
  counts,
  typeSlugs: Object.keys(typesSummary),
  files: CORE_COLLECTIONS.map((c) => c.file),
};
writeFileSync(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(JSON.stringify(manifest, null, 2));