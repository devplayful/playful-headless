#!/usr/bin/env node
/**
 * Download /wp-content/uploads assets referenced by data/wp-snapshot into public/wp-media/.
 * One-shot before endpoint shutdown; does not mutate snapshot JSON (runtime rewrite handles paths).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS_DIR = path.join(ROOT, 'data', 'wp-snapshot', 'collections');
const WP_MEDIA_DIR = path.join(ROOT, 'public', 'wp-media');
const ORIGIN = (process.env.WP_MEDIA_ORIGIN || 'https://endpoint.playfulagency.com').replace(/\/$/, '');
const MAX_BYTES = Number(process.env.WP_MEDIA_MAX_BYTES || 150 * 1024 * 1024);
const CONCURRENCY = 8;
const TIMEOUT_MS = 45_000;

const WP_MEDIA_RE = /\/wp-media(\/wp-content\/uploads\/[^\s"'<>\\)]+)/gi;
const REL_UPLOAD_RE = /(?:^|[^\w])(\/wp-content\/uploads\/[^\s"'<>\\)]+)/gi;
const REMOTE_URL_RE = /https?:\/\/(?:i[0-2]\.wp\.com\/[^\s"'<>\\)]+|(?:[a-z0-9-]+\.)?crear\.endpoint\.playfulagency\.com[^\s"'<>\\)]+|endpoint\.playfulagency\.com[^\s"'<>\\)]+)/gi;

function decodePhotonUrl(raw) {
  try {
    const u = new URL(raw);
    if (!/^i[0-2]\.wp\.com$/i.test(u.hostname)) return null;
    const inner = decodeURIComponent(u.pathname.replace(/^\//, ''));
    const innerUrl = new URL(inner.startsWith('http') ? inner : `https://${inner}`);
    if (!innerUrl.pathname.startsWith('/wp-content/uploads/')) return null;
    return innerUrl.pathname.split('?')[0];
  } catch {
    return null;
  }
}

function sitePathFromRemoteUrl(raw) {
  try {
    const photon = decodePhotonUrl(raw.split('?')[0]);
    if (photon) return photon;
    const u = new URL(raw.split('?')[0]);
    if (!u.hostname.includes('playfulagency.com')) return null;
    if (!u.pathname.startsWith('/wp-content/uploads/')) return null;
    return u.pathname;
  } catch {
    return null;
  }
}

function collectUploadPaths(value, paths) {
  if (value == null) return;
  if (typeof value === 'string') {
    for (const match of value.matchAll(WP_MEDIA_RE)) {
      paths.add(match[1].split('?')[0]);
    }
    for (const match of value.matchAll(REL_UPLOAD_RE)) {
      const p = match[1].split('?')[0];
      if (p.startsWith('/wp-content/uploads/')) paths.add(p);
    }
    for (const match of value.matchAll(REMOTE_URL_RE)) {
      const sitePath = sitePathFromRemoteUrl(match[0]);
      if (sitePath) paths.add(sitePath);
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUploadPaths(item, paths);
    return;
  }
  if (typeof value === 'object') {
    for (const nested of Object.values(value)) collectUploadPaths(nested, paths);
  }
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function localDest(sitePath) {
  return path.join(WP_MEDIA_DIR, sitePath.replace(/^\//, ''));
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { signal: controller.signal, headers: { 'user-agent': 'PlayfulSnapshotMirror/1.0' } });
  } finally {
    clearTimeout(timer);
  }
}

async function downloadOne(sitePath) {
  const dest = localDest(sitePath);
  if (fs.existsSync(dest)) {
    const stat = fs.statSync(dest);
    return { sitePath, bytes: stat.size, skipped: true };
  }
  const url = `${ORIGIN}${sitePath}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) {
    return { sitePath, bytes: 0, error: `HTTP ${res.status}` };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  ensureDir(path.dirname(dest));
  fs.writeFileSync(dest, buf);
  return { sitePath, bytes: buf.length, skipped: false };
}

async function runPool(items, worker) {
  const results = [];
  let index = 0;
  async function next() {
    while (index < items.length) {
      const i = index;
      index += 1;
      results[i] = await worker(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, () => next()));
  return results;
}

async function main() {
  const paths = new Set();
  for (const file of fs.readdirSync(COLLECTIONS_DIR)) {
    if (!file.endsWith('.json')) continue;
    collectUploadPaths(JSON.parse(fs.readFileSync(path.join(COLLECTIONS_DIR, file), 'utf8')), paths);
  }
  const sorted = Array.from(paths).sort();
  console.log(JSON.stringify({ phase: 'inventory', uniquePaths: sorted.length }, null, 2));

  let totalBytes = 0;
  let fileCount = 0;
  let errors = [];
  const manifest = { downloaded: 0, skipped: 0, failed: 0, totalBytes: 0, files: sorted.length };

  const pending = [];
  for (const sitePath of sorted) {
    const dest = localDest(sitePath);
    if (fs.existsSync(dest)) {
      totalBytes += fs.statSync(dest).size;
      fileCount += 1;
      manifest.skipped += 1;
      continue;
    }
    pending.push(sitePath);
  }

  let aborted = false;
  await runPool(pending, async (sitePath) => {
    if (aborted) return null;
    if (totalBytes >= MAX_BYTES) {
      aborted = true;
      return null;
    }
    const result = await downloadOne(sitePath);
    if (result.error) {
      manifest.failed += 1;
      errors.push(result);
      return result;
    }
    totalBytes += result.bytes;
    fileCount += 1;
    if (result.skipped) manifest.skipped += 1;
    else manifest.downloaded += 1;
    if (totalBytes >= MAX_BYTES) aborted = true;
    return result;
  });
  if (aborted && totalBytes >= MAX_BYTES) {
    console.error(JSON.stringify({ abort: true, reason: 'WP_MEDIA_MAX_BYTES', totalBytes, max: MAX_BYTES }));
    process.exitCode = 2;
  }

  manifest.totalBytes = totalBytes;
  manifest.totalMegabytes = Math.round((totalBytes / (1024 * 1024)) * 100) / 100;
  manifest.errorSample = errors.slice(0, 20);
  const manifestPath = path.join(ROOT, 'data', 'wp-snapshot', 'wp-media-mirror.json');
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify({ phase: 'done', ...manifest }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});