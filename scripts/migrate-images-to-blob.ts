/**
 * Inventario de URLs de imagen WordPress y migración dry-run / upload a Vercel Blob.
 *
 *   node scripts/migrate-images-to-blob.ts              # dry-run (default)
 *   node scripts/migrate-images-to-blob.ts --dry-run
 *   node scripts/migrate-images-to-blob.ts --upload       # requiere BLOB_READ_WRITE_TOKEN
 *
 * REST WP: GET en serie, máx. 1 req/s, UA PlayfulQA/1.0.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CASO_ACF_IMAGE_FIELDS } from '../cms/collections/casos-acf-fields.ts';
import {
  blobPublicUrlFromKey,
  blobStorageKeyFromCanonicalUrl,
  canonicalWordPressUploadUrl,
  extractImageUrlsFromHtml,
  isMigratableWordPressMediaUrl,
  plannedBlobUrlForSource,
  type BlobUrlMap,
} from '../lib/blob-image-url.ts';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(
  /\/$/,
  '',
);
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;
const INVENTORY_PATH =
  process.env.BLOB_INVENTORY_PATH || path.join(process.cwd(), 'docs/blob-migration-inventory.json');
const MAP_PATH =
  process.env.BLOB_MIGRATION_MAP_PATH || path.join(process.cwd(), 'docs/blob-migration-map.json');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(ROOT, '..');

type SourceRef = { kind: string; detail: string };

type InventoryRow = {
  url: string;
  canonicalUrl: string | null;
  blobKey: string | null;
  blobUrl: string | null;
  sources: SourceRef[];
  inUse: boolean;
  httpStatus: number | null;
  sizeBytes: number | null;
  error: string | null;
};

let lastWpRequest = 0;
let requests = 0;
let headRequests = 0;

async function rateLimitedWpFetch(url: string, init?: RequestInit): Promise<Response> {
  const wait = lastWpRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastWpRequest = Date.now();
  requests++;
  return fetch(url, { ...init, headers: { 'User-Agent': UA, ...(init?.headers || {}) } });
}

async function probeHead(url: string, init?: RequestInit): Promise<Response> {
  headRequests++;
  return fetch(url, { ...init, headers: { 'User-Agent': UA, ...(init?.headers || {}) } });
}

async function wp(pathname: string): Promise<any> {
  const res = await rateLimitedWpFetch(`${WP}${pathname}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${pathname}`);
  return res.json();
}

async function wpAll(pathname: string): Promise<any[]> {
  const sep = pathname.includes('?') ? '&' : '?';
  const first = await rateLimitedWpFetch(
    `${WP}${pathname}${sep}per_page=100&page=1`,
    { headers: { Accept: 'application/json' } },
  );
  if (!first.ok) throw new Error(`HTTP ${first.status} en ${pathname}`);
  const totalPages = Number(first.headers.get('x-wp-totalpages') || 1);
  const out: any[] = [...(await first.json())];
  for (let page = 2; page <= totalPages; page++) {
    const res = await rateLimitedWpFetch(
      `${WP}${pathname}${sep}per_page=100&page=${page}`,
      { headers: { Accept: 'application/json' } },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status} en ${pathname} p${page}`);
    out.push(...(await res.json()));
  }
  return out;
}

function yoastOg(item: any): string | null {
  const y = item.yoast_head_json || {};
  return Array.isArray(y.og_image) && y.og_image[0]?.url ? y.og_image[0].url : null;
}

function addUrl(
  registry: Map<string, InventoryRow>,
  raw: string,
  source: SourceRef,
): void {
  const url = raw.trim();
  if (!url || !isMigratableWordPressMediaUrl(url)) return;
  const canonical = canonicalWordPressUploadUrl(url);
  const key = canonical ? blobStorageKeyFromCanonicalUrl(canonical) : null;
  const blobUrl = plannedBlobUrlForSource(url);
  const existing = registry.get(url);
  if (existing) {
    existing.sources.push(source);
    return;
  }
  registry.set(url, {
    url,
    canonicalUrl: canonical,
    blobKey: key,
    blobUrl,
    sources: [source],
    inUse: true,
    httpStatus: null,
    sizeBytes: null,
    error: null,
  });
}

function scanFileContent(filePath: string, rel: string, registry: Map<string, InventoryRow>): void {
  let text: string;
  try {
    text = readFileSync(filePath, 'utf8');
  } catch {
    return;
  }
  const re =
    /https?:\/\/(?:i[0-3]\.wp\.com\/)?(?:endpoint\.|crear\.endpoint\.)?playfulagency\.com\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;
  for (const match of text.match(re) || []) {
    addUrl(registry, match.replace(/[)\]'"]+$/, ''), { kind: 'repo', detail: rel });
  }
}

function walkRepo(dir: string, registry: Map<string, InventoryRow>): void {
  const skip = new Set(['node_modules', '.next', '.git', 'docs/blob-migration-inventory.json']);
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (skip.has(name)) continue;
    const full = path.join(dir, name);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) walkRepo(full, registry);
    else if (/\.(tsx?|jsx?|mjs|cjs|json|html|css|md)$/i.test(name)) {
      scanFileContent(full, path.relative(REPO_ROOT, full), registry);
    }
  }
}

async function probeUrl(row: InventoryRow): Promise<void> {
  const target = row.canonicalUrl || row.url;
  try {
    const res = await probeHead(target, { method: 'HEAD' });
    row.httpStatus = res.status;
    const len = res.headers.get('content-length');
    row.sizeBytes = len ? Number(len) : null;
    if (!res.ok) row.error = `HTTP ${res.status}`;
  } catch (err: any) {
    row.error = String(err?.message || err).slice(0, 200);
  }
}

async function collectFromWordPress(registry: Map<string, InventoryRow>): Promise<void> {
  const posts = await wpAll('/wp/v2/posts?_fields=id,slug,content,featured_media,yoast_head_json');
  const paginas = await wpAll('/wp/v2/pages?_fields=id,slug,content,featured_media,yoast_head_json');
  const casos = await wpAll('/wp/v2/casos-de-exito?_fields=id,slug,content,featured_media,acf,yoast_head_json');

  const mediaIds = new Set<number>();
  for (const it of [...posts, ...paginas, ...casos]) {
    if (it.featured_media) mediaIds.add(it.featured_media);
  }
  for (const c of casos) {
    for (const f of CASO_ACF_IMAGE_FIELDS) {
      const v = c.acf?.[f];
      if (typeof v === 'number' && v > 0) mediaIds.add(v);
    }
  }

  for (const p of posts) {
    const html = p.content?.rendered || '';
    for (const u of extractImageUrlsFromHtml(html)) {
      addUrl(registry, u, { kind: 'wp-post-content', detail: String(p.slug) });
    }
    const og = yoastOg(p);
    if (og) addUrl(registry, og, { kind: 'wp-post-og', detail: String(p.slug) });
  }
  for (const pg of paginas) {
    const html = pg.content?.rendered || '';
    for (const u of extractImageUrlsFromHtml(html)) {
      addUrl(registry, u, { kind: 'wp-page-content', detail: String(pg.slug) });
    }
    const og = yoastOg(pg);
    if (og) addUrl(registry, og, { kind: 'wp-page-og', detail: String(pg.slug) });
  }
  for (const c of casos) {
    const html = c.content?.rendered || '';
    for (const u of extractImageUrlsFromHtml(html)) {
      addUrl(registry, u, { kind: 'wp-caso-content', detail: String(c.slug) });
    }
    const og = yoastOg(c);
    if (og) addUrl(registry, og, { kind: 'wp-caso-og', detail: String(c.slug) });
  }

  const all = Array.from(mediaIds);
  for (let i = 0; i < all.length; i += 100) {
    const chunk = all.slice(i, i + 100);
    const list = await wp(
      `/wp/v2/media?include=${chunk.join(',')}&per_page=100&_fields=id,source_url,media_details`,
    );
    for (const m of list) {
      addUrl(registry, m.source_url, { kind: 'wp-media', detail: String(m.id) });
      const sizes = m.media_details?.sizes;
      if (sizes && typeof sizes === 'object') {
        for (const v of Object.values(sizes) as any[]) {
          if (v?.source_url) addUrl(registry, v.source_url, { kind: 'wp-media-size', detail: String(m.id) });
        }
      }
      const fs = m.media_details?.filesize;
      if (typeof fs === 'number' && m.source_url && registry.has(m.source_url)) {
        registry.get(m.source_url)!.sizeBytes = fs;
      }
    }
  }
}

function buildMap(rows: InventoryRow[]): BlobUrlMap {
  const map: BlobUrlMap = {};
  for (const row of rows) {
    if (!row.blobUrl) continue;
    map[row.url] = row.blobUrl;
    if (row.canonicalUrl) map[row.canonicalUrl] = row.blobUrl;
  }
  return map;
}

async function uploadMissing(rows: InventoryRow[], map: BlobUrlMap): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error('BLOB_READ_WRITE_TOKEN no definido; abortando --upload.');
    process.exit(1);
  }
  const { put, head } = await import('@vercel/blob');
  for (const row of rows) {
    if (!row.blobKey || !row.canonicalUrl) continue;
    const existing = map[row.canonicalUrl] || map[row.url];
    try {
      if (existing) {
        const check = await head(existing);
        if (check?.url) {
          console.log(`skip (exists) ${row.blobKey}`);
          continue;
        }
      }
    } catch {
      /* no existe aún */
    }
    const res = await probeHead(row.canonicalUrl);
    if (!res.ok) {
      console.warn(`skip (fetch ${res.status}) ${row.canonicalUrl}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    const uploaded = await put(row.blobKey, buf, {
      access: 'public',
      token,
      addRandomSuffix: false,
    });
    map[row.url] = uploaded.url;
    map[row.canonicalUrl] = uploaded.url;
    console.log(`uploaded ${row.blobKey} → ${uploaded.url}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const upload = args.includes('--upload');
  const dryRun = args.includes('--dry-run') || !upload;

  const registry = new Map<string, InventoryRow>();
  console.log('Recopilando URLs desde WordPress REST…');
  await collectFromWordPress(registry);
  console.log('Escaneando repositorio…');
  walkRepo(REPO_ROOT, registry);

  const rows = Array.from(registry.values()).sort((a, b) => a.url.localeCompare(b.url));
  const canonicalSet = new Set<string>();
  for (const row of rows) {
    if (row.canonicalUrl) canonicalSet.add(row.canonicalUrl);
  }
  console.log(`Sondeando ${canonicalSet.size} canonical únicas (HEAD paralelo, REST ya a 1 req/s)…`);
  const probeCache = new Map<string, Pick<InventoryRow, 'httpStatus' | 'sizeBytes' | 'error'>>();
  const toProbe = [...canonicalSet];
  const CONCURRENCY = 12;
  for (let i = 0; i < toProbe.length; i += CONCURRENCY) {
    const chunk = toProbe.slice(i, i + CONCURRENCY);
    await Promise.all(
      chunk.map(async (canonical) => {
        const stub: InventoryRow = {
          url: canonical,
          canonicalUrl: canonical,
          blobKey: blobStorageKeyFromCanonicalUrl(canonical),
          blobUrl: plannedBlobUrlForSource(canonical),
          sources: [],
          inUse: true,
          httpStatus: null,
          sizeBytes: null,
          error: null,
        };
        const existing = rows.find((r) => r.canonicalUrl === canonical && r.sizeBytes != null);
        if (existing?.sizeBytes) {
          stub.sizeBytes = existing.sizeBytes;
          stub.httpStatus = 200;
        } else {
          await probeUrl(stub);
        }
        probeCache.set(canonical, {
          httpStatus: stub.httpStatus,
          sizeBytes: stub.sizeBytes,
          error: stub.error,
        });
      }),
    );
  }
  for (const row of rows) {
    const key = row.canonicalUrl || row.url;
    const cached = probeCache.get(key);
    if (cached) {
      row.httpStatus = cached.httpStatus;
      row.sizeBytes = row.sizeBytes ?? cached.sizeBytes;
      row.error = cached.error;
    }
  }

  let totalBytes = 0;
  let count404 = 0;
  for (const c of canonicalSet) {
    const cached = probeCache.get(c);
    if (!cached) continue;
    if (cached.httpStatus === 404) count404++;
    if (cached.sizeBytes && cached.httpStatus === 200) totalBytes += cached.sizeBytes;
  }

  const summary = {
    generado: new Date().toISOString(),
    origenWp: WP,
    peticionesRest: requests,
    peticionesHead: headRequests,
    urlsUnicas: rows.length,
    canonicalUnicas: canonicalSet.size,
    totalBytesEstimados: totalBytes,
    totalGbEstimados: Number((totalBytes / 1024 ** 3).toFixed(3)),
    http404: count404,
    items: rows,
  };

  writeFileSync(INVENTORY_PATH, JSON.stringify(summary, null, 2) + '\n');
  console.log(`Inventario → ${INVENTORY_PATH}`);

  const map = buildMap(rows);
  const mapDoc = {
    generado: summary.generado,
    modo: dryRun ? 'dry-run' : 'upload',
    blobPublicBase: process.env.BLOB_PUBLIC_BASE_URL || null,
    map,
  };
  writeFileSync(MAP_PATH, JSON.stringify(mapDoc, null, 2) + '\n');
  console.log(`Mapa → ${MAP_PATH} (${Object.keys(map).length} entradas)`);

  if (upload) {
    await uploadMissing(rows, map);
    mapDoc.map = map;
    mapDoc.generado = new Date().toISOString();
    writeFileSync(MAP_PATH, JSON.stringify(mapDoc, null, 2) + '\n');
  }

  console.log(
    JSON.stringify(
      {
        urlsUnicas: summary.urlsUnicas,
        canonicalUnicas: summary.canonicalUnicas,
        totalGbEstimados: summary.totalGbEstimados,
        http404: summary.http404,
        dryRun,
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
