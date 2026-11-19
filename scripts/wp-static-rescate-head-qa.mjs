#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://127.0.0.1:3011').replace(/\/$/, '');
const manifest = JSON.parse(readFileSync(join(process.cwd(), 'docs/wp-static-rescate-paths.json'), 'utf8'));

function madridNow() {
  return (
    new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) +
    ' Europe/Madrid'
  );
}

const started = madridNow();
const results = [];
for (const path of manifest.paths) {
  const url = `${BASE}${path}`;
  let status = 0;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    status = res.status;
  } catch {
    status = -1;
  }
  results.push({ path, url, status });
  await new Promise((r) => setTimeout(r, 40));
}
const out = { startedAtMadrid: started, finishedAtMadrid: madridNow(), base: BASE, results };
writeFileSync('/cursor/stores/self/wp-static-rescate/head-local.json', JSON.stringify(out, null, 2));
const bad = results.filter((r) => r.status !== 200);
console.log(JSON.stringify({ ok: bad.length === 0, total: results.length, bad }, null, 2));
process.exit(bad.length ? 1 : 0);