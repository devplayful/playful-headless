#!/usr/bin/env node
/**
 * Install rescued media from Agent Store into public/wp-static; symlink public/wp-media.
 */
import { mkdirSync, copyFileSync, existsSync, symlinkSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const STORE =
  process.env.RESCATE_STORE ||
  '/cursor/stores/self/wp-backup-2026-11-19/missing-media';
const ROOT = join(process.cwd(), 'public');

function storeNameToRelPath(name) {
  const m = /^wp-content__uploads__(\d{4})__(\d{2})__(.+)$/.exec(name);
  if (!m) return null;
  const file = decodeURIComponent(m[3].replace(/__/g, '/'));
  return `wp-content/uploads/${m[1]}/${m[2]}/${file}`;
}

const installed = [];
for (const name of readdirSync(STORE)) {
  if (name === 'download-log.json') continue;
  const rel = storeNameToRelPath(name);
  if (!rel) {
    console.warn('skip unknown', name);
    continue;
  }
  if (rel.includes('Herramienta-SEO-2.png')) {
    console.log('skip Herramienta-SEO-2 (wp-media #424)');
    continue;
  }

  const staticPath = join(ROOT, 'wp-static', rel);
  const mediaPath = join(ROOT, 'wp-media', rel);
  mkdirSync(dirname(staticPath), { recursive: true });
  copyFileSync(join(STORE, name), staticPath);

  mkdirSync(dirname(mediaPath), { recursive: true });
  if (!existsSync(mediaPath)) {
    const relLink = relative(dirname(mediaPath), staticPath);
    try {
      symlinkSync(relLink, mediaPath);
    } catch {
      copyFileSync(staticPath, mediaPath);
    }
  }
  installed.push(`/wp-media/${rel}`);
}

const out = join(process.cwd(), 'docs/wp-static-rescate-paths.json');
writeFileSync(out, JSON.stringify({ count: installed.length, paths: installed }, null, 2));
console.log(JSON.stringify({ count: installed.length, manifest: out }, null, 2));