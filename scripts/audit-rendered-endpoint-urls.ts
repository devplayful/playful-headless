#!/usr/bin/env node
/**
 * Fail if rendered `.next` output still references legacy WordPress hosts.
 * Usage: npm run build && node --experimental-strip-types scripts/audit-rendered-endpoint-urls.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.join(process.cwd(), '.next');
const PATTERN = /endpoint\.playfulagency\.com|i0\.wp\.com|wp-json/g;

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.html$/.test(entry.name)) out.push(full);
  }
  return out;
}

const hits: Array<{ file: string; match: string }> = [];
for (const file of walk(ROOT)) {
  const text = fs.readFileSync(file, 'utf8');
  const match = text.match(PATTERN);
  if (match) hits.push({ file, match: match[0] });
}

if (hits.length > 0) {
  console.error('Legacy WordPress URLs found in build output:');
  for (const hit of hits.slice(0, 50)) {
    console.error(`  ${hit.file}: ${hit.match}`);
  }
  process.exit(1);
}
console.log('OK: no endpoint.playfulagency.com, i0.wp.com or wp-json in .next');
