#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { rewriteMediaUrlsInValue } from '../lib/wp-snapshot/rewrite-media-urls.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS_DIR = path.join(ROOT, 'data', 'wp-snapshot', 'collections');

let changed = 0;
for (const file of fs.readdirSync(COLLECTIONS_DIR)) {
  if (!file.endsWith('.json')) continue;
  const abs = path.join(COLLECTIONS_DIR, file);
  const before = fs.readFileSync(abs, 'utf8');
  const next = rewriteMediaUrlsInValue(JSON.parse(before));
  const after = `${JSON.stringify(next, null, 2)}\n`;
  if (after !== before) {
    fs.writeFileSync(abs, after);
    changed += 1;
    console.log(`rewrote ${file}`);
  }
}
console.log(JSON.stringify({ changed }, null, 2));