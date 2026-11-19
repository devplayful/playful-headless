#!/usr/bin/env node
/**
 * Inventory WP image URLs in JSON trees; HEAD-check on apex /wp-media and /wp-static.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const APEX = (process.env.APEX_BASE || 'https://playfulagency.com').replace(/\/$/, '');
const ENDPOINT = 'https://endpoint.playfulagency.com';
const CREAR = 'https://crear.playfulagency.com';
const DIRS = (process.argv[2] || 'data/wp-snapshot/collections,data/wp-backup-2026-11-19')
  .split(',')
  .map((d) => join(process.cwd(), d.trim()));

const URL_RE =
  /https?:\/\/(?:endpoint\.playfulagency\.com|crear\.playfulagency\.com|(?:www\.)?playfulagency\.com)\/wp-content\/[^\s"'<>\\)]+/gi;
const REL_RE = /\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;

function madridNow() {
  return (
    new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) +
    ' Europe/Madrid'
  );
}

function walk(val, out) {
  if (val == null) return;
  if (typeof val === 'string') {
    let m;
    const s = val;
    URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(s))) out.add(m[0].split('?')[0]);
    REL_RE.lastIndex = 0;
    while ((m = REL_RE.exec(s))) out.add(`${ENDPOINT}${m[0].split('?')[0]}`);
    return;
  }
  if (Array.isArray(val)) {
    for (const x of val) walk(x, out);
    return;
  }
  if (typeof val === 'object') {
    for (const x of Object.values(val)) walk(x, out);
  }
}

function toLocalPath(url) {
  let u = url;
  for (const host of [ENDPOINT, CREAR, APEX, 'https://playfulagency.com', 'https://www.playfulagency.com']) {
    if (u.startsWith(host)) {
      u = u.slice(host.length);
      break;
    }
  }
  if (!u.startsWith('/wp-content/')) return null;
  if (u.startsWith('/wp-content/uploads/')) return `/wp-media${u}`;
  return `/wp-static${u}`;
}

function collectFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith('.json'));
}

const urls = new Set();
for (const dir of DIRS) {
  for (const f of collectFiles(dir)) {
    try {
      walk(JSON.parse(readFileSync(join(dir, f), 'utf8')), urls);
    } catch {
      /* skip */
    }
  }
  if (existsSync(join(dir, 'types.json'))) {
    walk(JSON.parse(readFileSync(join(dir, 'types.json'), 'utf8')), urls);
  }
}

const unique = [...urls].sort();
const startedAt = madridNow();
const results = [];

for (const url of unique) {
  const local = toLocalPath(url);
  if (!local) continue;
  const check = `${APEX}${local}`;
  let status = 0;
  try {
    const res = await fetch(check, { method: 'HEAD', redirect: 'follow' });
    status = res.status;
  } catch (e) {
    status = -1;
  }
  results.push({ sourceUrl: url, localPath: local, checkUrl: check, status });
  if (results.length % 50 === 0) console.log('checked', results.length, '/', unique.length);
  await new Promise((r) => setTimeout(r, 80));
}

const ok = results.filter((r) => r.status === 200);
const missing = results.filter((r) => r.status !== 200);
const out = {
  startedAtMadrid: startedAt,
  finishedAtMadrid: madridNow(),
  totalUniqueSourceUrls: unique.length,
  checkedOnApex: results.length,
  status200: ok.length,
  missing: missing.length,
  missingList: missing,
};
const outPath = process.argv[3] || join(process.cwd(), 'data/wp-backup-2026-11-19/media-inventory.json');
writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(JSON.stringify({ total: results.length, ok: ok.length, missing: missing.length, out: outPath }));