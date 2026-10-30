/**
 * Descarga CSS/JS/fuentes de endpoint → public/wp-static (byte-identical salvo url() reescritas).
 * Genera docs/wp-static-assets-map.json e inventory.
 *
 *   node scripts/mirror-wp-static-assets.ts
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ELEMENTOR_HEADER_FIX_FONT_URLS,
  ELEMENTOR_PAGE_SCRIPTS,
  ELEMENTOR_SERVICE_PAGE_SLUGS,
  WP_ENDPOINT_ORIGIN,
} from '../lib/elementor-static-asset-urls.ts';
import {
  ELEMENTOR_CORE_STYLESHEETS,
  elementorPageStylesheetUrls,
} from '../lib/elementor-stylesheet-urls.ts';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_ROOT = path.join(ROOT, 'public/wp-static');
const MAP_PATH = path.join(ROOT, 'docs/wp-static-assets-map.json');
const INV_PATH = path.join(ROOT, 'docs/wp-static-assets-inventory.json');
const BLOB_MAP_PATH = path.join(ROOT, 'docs/blob-migration-map.json');
const UA = 'PlayfulQA/1.0';
const WP_JSON = `${WP_ENDPOINT_ORIGIN}/wp-json`;

type InvRow = {
  url: string;
  publicPath: string | null;
  httpStatus: number;
  bytes: number | null;
  kind: 'css' | 'js' | 'font' | 'other';
  error?: string;
};

const map: Record<string, string> = {};
const inventory: InvRow[] = [];
const pending = new Set<string>();

let blobImageMap: Record<string, string> = {};
try {
  blobImageMap = (JSON.parse(readFileSync(BLOB_MAP_PATH, 'utf8')) as { map: Record<string, string> }).map;
} catch {
  /* dry */
}

function kindFor(url: string): InvRow['kind'] {
  if (/\.css(\?|$)/i.test(url)) return 'css';
  if (/\.js(\?|$)/i.test(url)) return 'js';
  if (/\.(woff2?|ttf|eot|otf)(\?|$)/i.test(url)) return 'font';
  return 'other';
}

function publicPathForPathname(pathname: string): string {
  const clean = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `/wp-static${clean.split('?')[0]}`;
}

function resolveCssUrl(cssUrl: string, ref: string): string | null {
  const trimmed = ref.trim().replace(/^['"]|['"]$/g, '');
  if (!trimmed || trimmed.startsWith('data:')) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed.split('?')[0];
  if (trimmed.startsWith('//')) return `https:${trimmed.split('?')[0]}`;
  const base = new URL(cssUrl);
  try {
    return new URL(trimmed, base).href.split('?')[0];
  } catch {
    return null;
  }
}

function rewriteCssUrls(cssText: string, cssUrl: string): string {
  return cssText.replace(/url\(\s*([^)]+)\s*\)/gi, (full, inner: string) => {
    const abs = resolveCssUrl(cssUrl, inner);
    if (!abs) return full;
    if (!abs.includes('playfulagency.com') && !abs.startsWith(WP_ENDPOINT_ORIGIN)) return full;
    const mapped = map[abs] || blobImageMap[abs];
    if (!mapped) {
      pending.add(abs);
      return full;
    }
    const pub = mapped.startsWith('http') ? mapped : mapped;
    return `url("${pub}")`;
  });
}

async function fetchBytes(url: string): Promise<{ status: number; buf: Buffer | null }> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return { status: res.status, buf: null };
    return { status: res.status, buf: Buffer.from(await res.arrayBuffer()) };
  } catch (e) {
    return { status: 0, buf: null };
  }
}

async function mirrorOne(url: string): Promise<void> {
  const canonical = url.split('?')[0];
  if (map[canonical]) return;
  const pathname = new URL(canonical).pathname.replace(/^\//, '');
  const outFile = path.join(OUT_ROOT, pathname);
  const { status, buf } = await fetchBytes(canonical);
  if (status === 404 || !buf) {
    inventory.push({
      url: canonical,
      publicPath: null,
      httpStatus: status || 404,
      bytes: null,
      kind: kindFor(canonical),
      error: status === 404 ? 'not_found' : 'fetch_failed',
    });
    return;
  }
  mkdirSync(path.dirname(outFile), { recursive: true });
  let body: Buffer = buf;
  if (/\.css$/i.test(pathname)) {
    let text = buf.toString('utf8');
    text = rewriteCssUrls(text, canonical);
    body = Buffer.from(text, 'utf8');
  }
  writeFileSync(outFile, body);
  const pub = publicPathForPathname(`/${pathname}`);
  map[canonical] = pub;
  inventory.push({
    url: canonical,
    publicPath: pub,
    httpStatus: status,
    bytes: body.length,
    kind: kindFor(canonical),
  });
}

async function drainPending(maxRounds = 12): Promise<void> {
  for (let round = 0; round < maxRounds; round++) {
    const batch = Array.from(pending);
    pending.clear();
    if (batch.length === 0) break;
    for (const u of batch) {
      await mirrorOne(u);
    }
  }
}

function collectStylesheetIds(html: string, pageId: number): number[] {
  const ids = new Set<number>([pageId]);
  for (const match of Array.from(html.matchAll(/elementor-post-(\d+)/g))) {
    const id = Number(match[1]);
    if (!Number.isNaN(id)) ids.add(id);
  }
  return Array.from(ids);
}

async function wpPage(slug: string): Promise<{ id: number; html: string } | null> {
  const res = await fetch(
    `${WP_JSON}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,content`,
    { headers: { 'User-Agent': UA, Accept: 'application/json' } },
  );
  if (!res.ok) return null;
  const rows = await res.json();
  if (!rows[0]) return null;
  return { id: rows[0].id, html: rows[0].content?.rendered || '' };
}

async function collectSeedUrls(): Promise<string[]> {
  const urls = new Set<string>();
  for (const u of ELEMENTOR_CORE_STYLESHEETS) urls.add(u.split('?')[0]);
  for (const u of ELEMENTOR_PAGE_SCRIPTS) urls.add(u.split('?')[0]);
  for (const u of ELEMENTOR_HEADER_FIX_FONT_URLS) urls.add(u.split('?')[0]);
  for (const slug of ELEMENTOR_SERVICE_PAGE_SLUGS) {
    const page = await wpPage(slug);
    if (!page) continue;
    const sheets = elementorPageStylesheetUrls(page.id, collectStylesheetIds(page.html, page.id));
    for (const s of sheets) urls.add(s.split('?')[0]);
  }
  return Array.from(urls).sort();
}

async function main() {
  const seeds = await collectSeedUrls();
  for (const u of seeds) {
    await mirrorOne(u);
  }
  await drainPending();
  writeFileSync(
    MAP_PATH,
    JSON.stringify({ generated: new Date().toISOString(), origin: WP_ENDPOINT_ORIGIN, map }, null, 2) + '\n',
  );
  writeFileSync(
    INV_PATH,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        total: inventory.length,
        ok: inventory.filter((r) => r.publicPath).length,
        http404: inventory.filter((r) => r.httpStatus === 404).length,
        items: inventory,
        pendingUnresolved: Array.from(pending),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    JSON.stringify({
      seeds: seeds.length,
      mapped: Object.keys(map).length,
      http404: inventory.filter((r) => r.httpStatus === 404).length,
      pending: pending.size,
    }),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
