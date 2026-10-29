/**
 * Inventario y medición de archivos servidos por endpoint.playfulagency.com.
 *
 * Solo lectura. En serie, 1 petición/s, User-Agent PlayfulQA/1.0.
 *
 *   node scripts/medir-imagenes-wp.mjs            # recolecta + mide + escribe docs
 *   node scripts/medir-imagenes-wp.mjs --collect   # solo REST + repo
 *   node scripts/medir-imagenes-wp.mjs --measure   # retoma HEAD desde el checkpoint
 *   node scripts/medir-imagenes-wp.mjs --report    # regenera CSV/MD
 */
import { createWriteStream, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'docs', 'migracion');
const RAW_PATH = join(OUT_DIR, '_raw-inventario.json');
const MEASURE_PATH = join(OUT_DIR, '_medidas.json');
const CSV_PATH = join(OUT_DIR, 'imagenes-inventario.csv');
const MD_PATH = join(OUT_DIR, 'imagenes-medicion.md');
const LOG_PATH = '/tmp/imagenes-medicion.log';

const WP = 'https://endpoint.playfulagency.com';
const WP_JSON = `${WP}/wp-json`;
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;
const HOST = 'endpoint.playfulagency.com';

const CPT_FRONT = ['posts', 'pages', 'casos-de-exito', 'podcast', 'equipo'];

const args = new Set(process.argv.slice(2));
const MODE = args.has('--collect')
  ? 'collect'
  : args.has('--measure')
    ? (args.has('--report') ? 'measure+report' : 'measure')
    : args.has('--report')
      ? 'report'
      : 'all';

mkdirSync(OUT_DIR, { recursive: true });

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  try {
    const stream = createWriteStream(LOG_PATH, { flags: 'a' });
    stream.end(`${line}\n`);
  } catch {
    // ignore
  }
}

let lastRequest = 0;
let requests = 0;

async function paced() {
  const wait = lastRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  requests += 1;
}

function looksLikeAsset(value) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('WP:')) return true;
  if (/^https?:\/\/endpoint\.playfulagency\.com\/wp-content\//i.test(trimmed)) return true;
  if (/^\/\/endpoint\.playfulagency\.com\/wp-content\//i.test(trimmed)) return true;
  if (trimmed.startsWith('/wp-content/')) return true;
  return false;
}

function isUsableAssetPath(pathname) {
  if (!pathname.startsWith('/wp-content/')) return false;
  if (/[\[\]{}()$]/.test(pathname)) return false;
  if (pathname.endsWith('/wp-content/uploads') || pathname.endsWith('/wp-content/plugins') || pathname.endsWith('/')) return false;
  const last = pathname.split('/').pop() || '';
  return last.includes('.');
}

function normalizeUrl(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let value = raw.trim();
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return null;
  if (!looksLikeAsset(value)) return null;
  value = value.replace(/\\u002d/g, '-').replace(/\\\//g, '/');
  try {
    value = decodeURI(value);
  } catch {
    // keep raw
  }
  if (value.startsWith('WP:')) {
    value = `${WP}/wp-content/uploads/${value.slice(3)}`;
  }
  if (value.startsWith('//')) value = `https:${value}`;
  try {
    const url = new URL(value, `${WP}/`);
    if (url.hostname !== HOST && url.hostname !== `www.${HOST}`) return null;
    if (!isUsableAssetPath(url.pathname)) return null;
    url.protocol = 'https:';
    url.hash = '';
    url.hostname = HOST;
    return url.href;
  } catch {
    return null;
  }
}

function addOrigen(entry, tag) {
  if (!entry.origen.includes(tag)) entry.origen.push(tag);
}

function ensureEntry(map, url, extra = {}) {
  let entry = map.get(url);
  if (!entry) {
    entry = {
      url,
      origen: [],
      usado_en: 'solo_libreria',
      bytes: null,
      bytes_wp: extra.bytes_wp ?? null,
      mime: extra.mime || '',
      status: '',
      media_id: extra.media_id ?? null,
      size_name: extra.size_name || '',
      es_original: extra.es_original === true,
      es_intermedio: extra.es_intermedio === true,
      es_libreria: extra.es_libreria === true,
      medido_por: '',
    };
    map.set(url, entry);
  } else {
    if (extra.bytes_wp != null && entry.bytes_wp == null) entry.bytes_wp = extra.bytes_wp;
    if (extra.mime && !entry.mime) entry.mime = extra.mime;
    if (extra.media_id != null && entry.media_id == null) entry.media_id = extra.media_id;
    if (extra.size_name && !entry.size_name) entry.size_name = extra.size_name;
    if (extra.es_original) entry.es_original = true;
    if (extra.es_intermedio) entry.es_intermedio = true;
    if (extra.es_libreria) entry.es_libreria = true;
  }
  return entry;
}

function markFront(entry, tag) {
  addOrigen(entry, tag);
  entry.usado_en = 'front';
}

function walkAcfUrls(value, out) {
  if (value == null) return;
  if (typeof value === 'string') {
    const url = normalizeUrl(value);
    if (url) out.push(url);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walkAcfUrls(item, out);
    return;
  }
  if (typeof value === 'object') {
    if (typeof value.url === 'string') {
      const url = normalizeUrl(value.url);
      if (url) out.push(url);
    }
    if (typeof value.source_url === 'string') {
      const url = normalizeUrl(value.source_url);
      if (url) out.push(url);
    }
    for (const child of Object.values(value)) walkAcfUrls(child, out);
  }
}

function extractContentUrls(html) {
  const found = new Set();
  if (!html || typeof html !== 'string') return found;
  const add = (raw) => {
    const url = normalizeUrl(raw);
    if (url) found.add(url);
  };
  for (const match of html.matchAll(/\s(?:src|data-src|data-lazy-src|data-bg)=["']([^"']+)["']/gi)) {
    add(match[1]);
  }
  for (const match of html.matchAll(/\s(?:srcset|data-srcset)=["']([^"']+)["']/gi)) {
    for (const part of match[1].split(',')) {
      add(part.trim().split(/\s+/)[0]);
    }
  }
  for (const match of html.matchAll(/background-image\s*:\s*url\(\s*['"]?([^'")\s]+)['"]?\s*\)/gi)) {
    add(match[1]);
  }
  for (const match of html.matchAll(/url\(\s*['"]?(https?:\/\/endpoint\.playfulagency\.com\/wp-content\/[^'")\s]+)['"]?\s*\)/gi)) {
    add(match[1]);
  }
  return found;
}

function extractOgUrls(yoast) {
  const out = [];
  const images = yoast?.og_image;
  if (Array.isArray(images)) {
    for (const img of images) {
      const url = normalizeUrl(img?.url || img);
      if (url) out.push(url);
    }
  }
  return out;
}

async function wpGet(path) {
  await paced();
  const url = `${WP_JSON}${path}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
  return {
    data: await res.json(),
    total: Number(res.headers.get('x-wp-total') || 0),
    totalPages: Number(res.headers.get('x-wp-totalpages') || 1),
  };
}

async function wpAll(path) {
  const sep = path.includes('?') ? '&' : '?';
  const first = await wpGet(`${path}${sep}per_page=100&page=1`);
  const out = Array.isArray(first.data) ? [...first.data] : [];
  log(`  ${path} página 1/${first.totalPages} (total ${first.total})`);
  for (let page = 2; page <= first.totalPages; page++) {
    const next = await wpGet(`${path}${sep}per_page=100&page=${page}`);
    if (Array.isArray(next.data)) out.push(...next.data);
    log(`  ${path} página ${page}/${first.totalPages}`);
  }
  return { items: out, total: first.total, totalPages: first.totalPages };
}

function scanRepo() {
  const skipDirs = new Set([
    '.git', 'node_modules', '.next', '.pg-cms', 'media',
    'docs/qa', 'public/images', 'public/videos', 'public/casos',
  ]);
  const extOk = new Set([
    '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.css', '.json',
    '.md', '.php', '.html', '.svg', '.txt',
  ]);
  const urls = new Map(); // url -> files
  const re = /https?:\/\/endpoint\.playfulagency\.com\/wp-content\/[^\s"'`)<>\\]+/gi;
  const hostRe = /\$\{WP_HOST\}\/wp-content\/[^\s"'`)<>\\]+/g;
  const wpKeyRe = /"WP:([^"]+)"/g;

  function walk(dir) {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = join(dir, ent.name);
      const rel = relative(ROOT, full);
      if (ent.isDirectory()) {
        if (skipDirs.has(ent.name) || skipDirs.has(rel.split('/')[0]) || rel.startsWith('docs/qa')) continue;
        walk(full);
        continue;
      }
      const ext = ent.name.includes('.') ? `.${ent.name.split('.').pop()}` : '';
      if (!extOk.has(ext)) continue;
      let text;
      try {
        const st = statSync(full);
        if (st.size > 2_000_000) continue;
        text = readFileSync(full, 'utf8');
      } catch {
        continue;
      }
      const add = (raw) => {
        const url = normalizeUrl(raw);
        if (!url) return;
        if (!urls.has(url)) urls.set(url, new Set());
        urls.get(url).add(rel);
      };
      for (const match of text.matchAll(re)) add(match[0].replace(/[.,;]+$/, ''));
      for (const match of text.matchAll(hostRe)) {
        add(`${WP}/wp-content/${match[0].split('/wp-content/')[1]}`.replace(/[.,;]+$/, ''));
      }
      for (const match of text.matchAll(wpKeyRe)) add(`WP:${match[1]}`);
    }
  }
  walk(ROOT);
  return [...urls.entries()].map(([url, files]) => ({ url, files: [...files].sort() }));
}

async function collect() {
  log('Recolectando REST + repo');
  const types = await wpGet('/wp/v2/types');
  const typeNames = Object.keys(types.data || {});
  log(`Tipos WP: ${typeNames.join(', ')}`);

  const media = await wpAll('/wp/v2/media?_fields=id,source_url,mime_type,media_details,media_type,slug');
  const posts = await wpAll('/wp/v2/posts?_fields=id,slug,type,status,featured_media,content,acf,yoast_head_json');
  const pages = await wpAll('/wp/v2/pages?_fields=id,slug,type,status,featured_media,content,acf,yoast_head_json');
  const casos = await wpAll('/wp/v2/casos-de-exito?_fields=id,slug,type,status,featured_media,content,acf,yoast_head_json&acf_format=standard');
  const podcast = await wpAll('/wp/v2/podcast?_fields=id,slug,type,status,featured_media,content,acf,yoast_head_json');
  const equipo = await wpAll('/wp/v2/equipo?_fields=id,slug,type,status,featured_media,content,acf,yoast_head_json&acf_format=standard');

  const repoRefs = scanRepo();
  log(`Repo: ${repoRefs.length} URLs wp-content`);

  const items = new Map();
  const contentUrls = new Set();
  const featuredIds = new Set();
  const stats = {
    media_items: media.items.length,
    media_total_header: media.total,
    posts: posts.items.length,
    pages: pages.items.length,
    casos: casos.items.length,
    podcast: podcast.items.length,
    equipo: equipo.items.length,
    content_urls_raw: 0,
    repo_urls: repoRefs.length,
    types: typeNames,
    cpt_front: CPT_FRONT,
    requests_collect: requests,
  };

  for (const m of media.items) {
    const original = normalizeUrl(m.source_url);
    const details = m.media_details || {};
    if (original) {
      const entry = ensureEntry(items, original, {
        bytes_wp: typeof details.filesize === 'number' ? details.filesize : null,
        mime: m.mime_type || '',
        media_id: m.id,
        size_name: 'original',
        es_original: true,
        es_libreria: true,
      });
      addOrigen(entry, 'media_original');
    }
    const sizes = details.sizes || {};
    for (const [name, size] of Object.entries(sizes)) {
      const sizeUrl = normalizeUrl(size?.source_url);
      if (!sizeUrl) continue;
      if (sizeUrl === original || name === 'full') {
        if (original) {
          const entry = items.get(original);
          if (entry && typeof size.filesize === 'number' && entry.bytes_wp == null) entry.bytes_wp = size.filesize;
        }
        continue;
      }
      const entry = ensureEntry(items, sizeUrl, {
        bytes_wp: typeof size.filesize === 'number' ? size.filesize : null,
        mime: size.mime_type || m.mime_type || '',
        media_id: m.id,
        size_name: name,
        es_intermedio: true,
        es_libreria: true,
      });
      addOrigen(entry, 'media_size');
    }
  }

  function ingestContent(list, tipo) {
    for (const doc of list) {
      if (doc.featured_media) featuredIds.add(doc.featured_media);
      const html = doc.content?.rendered || '';
      const extracted = extractContentUrls(html);
      stats.content_urls_raw += extracted.size;
      for (const url of extracted) {
        contentUrls.add(url);
        markFront(ensureEntry(items, url), `content:${tipo}`);
      }
      const acfUrls = [];
      walkAcfUrls(doc.acf, acfUrls);
      for (const url of acfUrls) markFront(ensureEntry(items, url), `acf:${tipo}`);
      for (const url of extractOgUrls(doc.yoast_head_json)) {
        markFront(ensureEntry(items, url), `og:${tipo}`);
      }
    }
  }

  ingestContent(posts.items, 'posts');
  ingestContent(pages.items, 'pages');
  ingestContent(casos.items, 'casos-de-exito');
  ingestContent(podcast.items, 'podcast');
  ingestContent(equipo.items, 'equipo');

  // Destacadas: resolver id → source_url (y tamaños embebidos no; la destacada es el original)
  const mediaById = new Map(media.items.map((m) => [m.id, m]));
  for (const id of featuredIds) {
    const m = mediaById.get(id);
    const url = normalizeUrl(m?.source_url);
    if (url) markFront(ensureEntry(items, url, { media_id: id, es_original: true, es_libreria: true }), 'featured');
  }

  for (const { url, files } of repoRefs) {
    const entry = ensureEntry(items, url);
    markFront(entry, 'repo');
    entry.repo_files = files;
  }

  const payload = {
    collected_at: new Date().toISOString(),
    stats: {
      ...stats,
      unique_urls: items.size,
      front_urls: [...items.values()].filter((e) => e.usado_en === 'front').length,
      library_only: [...items.values()].filter((e) => e.usado_en !== 'front').length,
      originals: [...items.values()].filter((e) => e.es_original).length,
      intermedios: [...items.values()].filter((e) => e.es_intermedio).length,
      content_unique: contentUrls.size,
      featured_ids: featuredIds.size,
    },
    items: [...items.values()],
  };
  writeFileSync(RAW_PATH, JSON.stringify(payload));
  log(`Inventario: ${payload.stats.unique_urls} URLs únicas (front ${payload.stats.front_urls}, librería-solo ${payload.stats.library_only}, originales ${payload.stats.originals}, intermedios ${payload.stats.intermedios}, content ${payload.stats.content_unique})`);
  return payload;
}

function loadRaw() {
  if (!existsSync(RAW_PATH)) throw new Error(`Falta ${RAW_PATH}; corre --collect`);
  return JSON.parse(readFileSync(RAW_PATH, 'utf8'));
}

function loadMeasures() {
  if (!existsSync(MEASURE_PATH)) return { measured_at: null, byUrl: {} };
  return JSON.parse(readFileSync(MEASURE_PATH, 'utf8'));
}

function saveMeasures(data) {
  writeFileSync(MEASURE_PATH, JSON.stringify(data));
}

function parseContentRangeTotal(header) {
  if (!header) return null;
  const match = /\/(\d+)\s*$/.exec(header);
  return match ? Number(match[1]) : null;
}

function guessMimeFromUrl(url, headerMime) {
  if (headerMime && headerMime !== 'application/octet-stream') {
    return headerMime.split(';')[0].trim();
  }
  const path = url.split('?')[0].toLowerCase();
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.webp')) return 'image/webp';
  if (path.endsWith('.gif')) return 'image/gif';
  if (path.endsWith('.svg')) return 'image/svg+xml';
  if (path.endsWith('.pdf')) return 'application/pdf';
  if (path.endsWith('.mp4')) return 'video/mp4';
  if (path.endsWith('.webm')) return 'video/webm';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.woff2')) return 'font/woff2';
  if (path.endsWith('.woff')) return 'font/woff';
  if (path.endsWith('.ttf')) return 'font/ttf';
  return headerMime || '';
}

function abortable(ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(t) };
}

async function headOne(url) {
  await paced();
  try {
    const ab = abortable(15000);
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': UA, Accept: '*/*' },
      redirect: 'follow',
      signal: ab.signal,
    });
    ab.done();
    const len = res.headers.get('content-length');
    const mime = res.headers.get('content-type') || '';
    if (res.status === 404 || res.status === 410) {
      return { status: res.status, bytes: null, mime, via: 'HEAD' };
    }
    if (len != null && len !== '') {
      return { status: res.status, bytes: Number(len), mime, via: 'HEAD' };
    }
  } catch (err) {
    log(`  HEAD error ${url}: ${err.message}`);
  }

  await paced();
  try {
    const ab = abortable(15000);
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': UA, Accept: '*/*', Range: 'bytes=0-0' },
      redirect: 'follow',
      signal: ab.signal,
    });
    ab.done();
    const mime = res.headers.get('content-type') || '';
    const total = parseContentRangeTotal(res.headers.get('content-range'));
    const len = res.headers.get('content-length');
    try { await res.body?.cancel?.(); } catch { /* ignore */ }
    if (res.status === 404 || res.status === 410) {
      return { status: res.status, bytes: null, mime, via: 'GET-range' };
    }
    if (total != null) return { status: res.status, bytes: total, mime, via: 'GET-range' };
    if (len != null && len !== '' && res.status === 200) {
      return { status: res.status, bytes: Number(len), mime, via: 'GET-range' };
    }
    return { status: res.status, bytes: null, mime, via: 'GET-range' };
  } catch (err) {
    return { status: 0, bytes: null, mime: '', via: 'error', error: err.message };
  }
}

function measurePriority(item) {
  const missing = item.bytes_wp == null ? 0 : 10;
  if (item.usado_en === 'front' && item.es_original) return 0 + missing;
  if (item.usado_en === 'front') return 1 + missing;
  if (item.es_original) return 2 + missing;
  return 3 + missing;
}

async function measure(raw) {
  const measures = loadMeasures();
  measures.byUrl ||= {};
  const pending = raw.items
    .slice()
    .sort((a, b) => measurePriority(a) - measurePriority(b) || a.url.localeCompare(b.url))
    .filter((item) => !measures.byUrl[item.url]);
  log(`Midiendo ${pending.length} URLs pendientes de ${raw.items.length} (ya ${Object.keys(measures.byUrl).length})`);
  let i = 0;
  for (const item of pending) {
    i += 1;
    const result = await headOne(item.url);
    measures.byUrl[item.url] = {
      ...result,
      at: new Date().toISOString(),
    };
    if (i % 25 === 0 || i === pending.length) {
      measures.measured_at = new Date().toISOString();
      measures.done = Object.keys(measures.byUrl).length;
      measures.total = raw.items.length;
      saveMeasures(measures);
      log(`  HEAD ${measures.done}/${raw.items.length} último ${result.status} ${result.bytes ?? '-'} ${item.url.slice(0, 80)}`);
    }
  }
  measures.measured_at = new Date().toISOString();
  measures.done = Object.keys(measures.byUrl).length;
  measures.total = raw.items.length;
  saveMeasures(measures);
  return measures;
}

function csvEscape(value) {
  const s = value == null ? '' : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function extBucket(url, mime) {
  const path = url.split('?')[0].toLowerCase();
  const type = (mime || '').toLowerCase();
  if (type.includes('jpeg') || path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'jpg';
  if (type.includes('png') || path.endsWith('.png')) return 'png';
  if (type.includes('webp') || path.endsWith('.webp')) return 'webp';
  if (type.includes('gif') || path.endsWith('.gif')) return 'gif';
  if (type.includes('svg') || path.endsWith('.svg')) return 'svg';
  if (type.includes('pdf') || path.endsWith('.pdf')) return 'pdf';
  if (type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/.test(path)) return 'video';
  if (type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/.test(path)) return 'audio';
  if (type.includes('css') || path.endsWith('.css')) return 'css';
  if (type.includes('javascript') || path.endsWith('.js')) return 'js';
  if (type.includes('font') || /\.(woff2?|ttf|eot|otf)$/.test(path)) return 'font';
  return 'otro';
}

function gb(bytes) {
  return bytes / (1024 ** 3);
}

function mergeItems(raw, measures) {
  return raw.items.map((item) => {
    const m = measures.byUrl?.[item.url];
    const bytes = m?.bytes != null ? m.bytes : item.bytes_wp;
    const medido_por = m?.bytes != null ? m.via : (item.bytes_wp != null ? 'wp_filesize' : '');
    const mime = guessMimeFromUrl(item.url, m?.mime || item.mime);
    return {
      ...item,
      bytes: bytes ?? null,
      mime,
      status: m?.status ?? (item.bytes_wp != null ? 'wp' : ''),
      medido_por,
      origen: [...item.origen].sort(),
    };
  });
}

function summarize(items) {
  const groups = {
    front: items.filter((i) => i.usado_en === 'front'),
    library: items.filter((i) => i.es_libreria),
    originals: items.filter((i) => i.es_original),
    intermedios: items.filter((i) => i.es_intermedio),
    all: items,
  };
  const notFound = items.filter((i) => i.status === 404 || i.status === 410);
  function pack(list) {
    const byType = {};
    let bytes = 0;
    let withBytes = 0;
    let missingBytes = 0;
    for (const item of list) {
      const bucket = extBucket(item.url, item.mime);
      byType[bucket] ||= { n: 0, bytes: 0 };
      byType[bucket].n += 1;
      if (item.bytes != null) {
        byType[bucket].bytes += item.bytes;
        bytes += item.bytes;
        withBytes += 1;
      } else {
        missingBytes += 1;
      }
    }
    return { n: list.length, bytes, gb: gb(bytes), withBytes, missingBytes, byType };
  }
  return {
    front: pack(groups.front),
    library: pack(groups.library),
    originals: pack(groups.originals),
    intermedios: pack(groups.intermedios),
    all: pack(groups.all),
    notFound,
    measuredHead: items.filter((i) => i.medido_por === 'HEAD' || i.medido_por === 'GET-range').length,
    measuredWpOnly: items.filter((i) => i.medido_por === 'wp_filesize').length,
  };
}

function writeCsv(items) {
  const header = 'url,origen,usado_en,bytes,mime,status';
  const lines = [header];
  const sorted = items.slice().sort((a, b) => a.url.localeCompare(b.url));
  for (const item of sorted) {
    lines.push([
      csvEscape(item.url),
      csvEscape(item.origen.join(';')),
      csvEscape(item.usado_en),
      item.bytes == null ? '' : String(item.bytes),
      csvEscape(item.mime),
      csvEscape(item.status),
    ].join(','));
  }
  writeFileSync(CSV_PATH, `${lines.join('\n')}\n`);
}

function writeMd(raw, items, summary, extra) {
  const fmtGb = (n) => `${n.toFixed(3)} GB`;
  const fmtBytes = (n) => `${n.toLocaleString('es-ES')} B`;
  const typeRow = (pack) => {
    const order = ['jpg', 'png', 'webp', 'gif', 'svg', 'pdf', 'video', 'audio', 'css', 'js', 'font', 'otro'];
    return order
      .filter((k) => pack.byType[k])
      .map((k) => `| ${k} | ${pack.byType[k].n} | ${fmtGb(gb(pack.byType[k].bytes))} | ${fmtBytes(pack.byType[k].bytes)} |`)
      .join('\n');
  };
  const nf = extra.notFoundList || summary.notFound;
  const md = `# Medición de imágenes WordPress → Vercel Blob

Fecha de recolección REST: ${raw.collected_at}
Fecha de medición HEAD: ${extra.measured_at || 'en curso'}
Origen: \`${WP}\`
User-Agent: \`${UA}\`
Ritmo: 1 petición/s en serie (REST + HEAD).
Rama de medición: \`cursor/payload-imagenes-medicion\` (sale de \`cursor/cms-payload-fase1\`).

## Alcance

CPT que consume el front (código en \`services/wordpress.ts\`): **${raw.stats.cpt_front.join(', ')}**.
Tipos registrados en WP: ${raw.stats.types.join(', ')}.
No se inventariaron CPT que el front no llama (\`audioplayer\`, \`radioplayer\`, \`elementor_library\`, etc.).

Fuentes por URL (columna \`origen\`, puede haber varias):

- \`media_original\` / \`media_size\`: biblioteca REST \`/wp/v2/media\` (per_page=100).
- \`featured\`: \`featured_media\` de posts, páginas, casos-de-exito, podcast y equipo.
- \`acf:<cpt>\`: cualquier URL en campos ACF (incluye tamaños anidados).
- \`content:<cpt>\`: \`src\`, \`srcset\` y \`background-image\` (y \`url()\` de wp-content) en \`content.rendered\`.
- \`og:<cpt>\`: \`yoast_head_json.og_image\`.
- \`repo\`: literales \`endpoint.playfulagency.com/wp-content/\`, \`$\{WP_HOST\}/wp-content/\` y claves \`WP:\` de \`lib/image-alt-overrides.json\`.

\`usado_en=front\` = aparece en featured, ACF, content, og o repo. \`solo_libreria\` = solo en la media library.

## Recuentos de origen

| Fuente | Ítems WP | Notas |
| --- | ---: | --- |
| Media library | ${raw.stats.media_items} | header X-WP-Total=${raw.stats.media_total_header} (la diferencia no se expone en el REST público) |
| Posts | ${raw.stats.posts} | |
| Páginas | ${raw.stats.pages} | |
| casos-de-exito | ${raw.stats.casos} | |
| podcast | ${raw.stats.podcast} | |
| equipo | ${raw.stats.equipo} | |
| URLs extraídas del cuerpo (con duplicados entre documentos) | ${raw.stats.content_urls_raw} | únicas del cuerpo: ${raw.stats.content_unique} |
| URLs en el repo | ${raw.stats.repo_urls} | |

## Totales (después de deduplicar por URL)

| Escenario | Archivos | Con tamaño | Sin tamaño | GB | Bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| (i) Usado en el front | ${summary.front.n} | ${summary.front.withBytes} | ${summary.front.missingBytes} | ${summary.front.gb.toFixed(3)} | ${summary.front.bytes} |
| (ii) Librería completa (originales + intermedios) | ${summary.library.n} | ${summary.library.withBytes} | ${summary.library.missingBytes} | ${summary.library.gb.toFixed(3)} | ${summary.library.bytes} |
| (iii) Solo originales | ${summary.originals.n} | ${summary.originals.withBytes} | ${summary.originals.missingBytes} | ${summary.originals.gb.toFixed(3)} | ${summary.originals.bytes} |
| Intermedios (tamaños WP) | ${summary.intermedios.n} | ${summary.intermedios.withBytes} | ${summary.intermedios.missingBytes} | ${summary.intermedios.gb.toFixed(3)} | ${summary.intermedios.bytes} |
| Universo único (librería + front + repo) | ${summary.all.n} | ${summary.all.withBytes} | ${summary.all.missingBytes} | ${summary.all.gb.toFixed(3)} | ${summary.all.bytes} |

Tamaños: HEAD \`Content-Length\` preferente; si falta, GET \`Range: bytes=0-0\` y \`Content-Range\`.
Si HEAD/GET no dieron bytes, se usa \`media_details.filesize\` del REST (marcado \`wp_filesize\` en el raw).
Medidos por HEAD/GET-range: ${summary.measuredHead}. Solo REST filesize: ${summary.measuredWpOnly}.

### (i) Usado en el front por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
${typeRow(summary.front)}

### (ii) Librería completa por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
${typeRow(summary.library)}

### (iii) Originales por tipo

| Tipo | Archivos | GB | Bytes |
| --- | ---: | ---: | ---: |
${typeRow(summary.originals)}

## 404 / no encontrados

${nf.length === 0 ? 'Ninguno con status 404/410 en esta pasada.' : nf.map((i) => `- \`${i.status}\` ${i.url}`).join('\n')}

## Coste Vercel Blob

Fuente leída el **${extra.pricingReadAt}** (hora de Madrid):

- [Vercel Blob usage and pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing)
- [Pricing on Vercel](https://vercel.com/docs/pricing)
- [vercel.com/pricing](https://vercel.com/pricing) (tabla pública Hobby / Pro)
- [Regional pricing](https://vercel.com/docs/pricing/regional-pricing)

Tarifas oficiales (USD, sin impuestos), ejemplo de la doc (iad1) y tabla pública:

| Recurso | Precio (doc / ejemplo iad1) | Rango regional | Incluido Hobby | Incluido Pro |
| --- | --- | --- | --- | --- |
| Blob Storage Size | 0,023 USD / GB-mes | 0,023–0,041 USD / GB | 1 GB/mes | Usage-based (crédito mensual; on-demand después) |
| Blob Simple Operations | 0,40 USD / 1M | 0,35–0,56 USD / 1M | primeros 10.000 | Usage-based |
| Blob Advanced Operations | 5,00 USD / 1M | 4,50–7,00 USD / 1M | primeros 2.000 | Usage-based |
| Blob Data Transfer | 0,05 USD / GB (iad1) | 0,05–0,117 USD / GB | primeros 10 GB | Incluido en Flat Rate CDN (1 TB/mes de equipo) |

Hobby: al superar el cupo se **bloquea** Blob (no se factura extra). Pro: se cobra con el crédito mensual y luego on-demand. En Hobby el cupo se comparte con el resto de servicios del proyecto.

Plan del proyecto **playful-headless**: vive en el team de Vercel \`playfuls-projects\` (\`team_WneR3BWaDf7kGBmCMUHb6I5z\`, id de proyecto \`prj_pLpYIo0J8pjz66nVSgl8yzjYFuow\`), con dominio de producción \`playfulagency.com\`. Un team de Vercel no es Hobby (Hobby es cuenta personal). Se trata como **Pro**. Se informan ambos planes por si el store se creara en otra cuenta.

### Hipótesis de coste

- Almacenamiento mensual = GB del escenario × 0,023 USD (precio de la tabla pública / ejemplo oficial).
- Subida puntual: 1 Advanced Operation por archivo (put simple, sin multipart).  N × 5 / 1.000.000 USD.
- No hay tráfico GA4 en este box. Transferencia: se da el coste **por cada 10 GB** a 0,05 USD/GB = **0,50 USD / 10 GB** (Hobby: los primeros 10 GB/mes van incluidos; Pro: entra en Flat Rate CDN).
- Simple operations de lectura (cache MISS) no se estiman: dependen del HIT ratio.

| Escenario | GB | Hobby almacenamiento / mes | Pro almacenamiento / mes | Hobby ¿cabe? | Escritura puntual (N × 5e-6 USD) | Transfer / 10 GB |
| --- | ---: | ---: | ---: | --- | ---: | ---: |
| (i) Front | ${summary.front.gb.toFixed(3)} | ${extra.cost.front.hobbyStorage} | ${extra.cost.front.proStorage} | ${extra.cost.front.hobbyFits} | ${extra.cost.front.write} | 0,50 USD |
| (iii) Originales | ${summary.originals.gb.toFixed(3)} | ${extra.cost.originals.hobbyStorage} | ${extra.cost.originals.proStorage} | ${extra.cost.originals.hobbyFits} | ${extra.cost.originals.write} | 0,50 USD |

Hobby almacenamiento: 0 USD si GB ≤ 1; si no, el cupo no basta (acceso bloqueado; no hay overage). En la tabla se muestra también el equivalente on-demand (0,023 USD/GB) por si se subiera a Pro.

## Método

1. REST público, \`per_page=100\`, UA \`PlayfulQA/1.0\`, 1 req/s.
2. Deduplicado por URL normalizada (https, host canónico, sin hash).
3. HEAD en serie (prioridad: front+original, resto front, resto originales, intermedios).
4. Nada se subió a Vercel Blob. WordPress no se modificó.

Script: \`scripts/medir-imagenes-wp.mjs\`. Inventario: \`docs/migracion/imagenes-inventario.csv\`.
`;
  writeFileSync(MD_PATH, md);
}

function money(n) {
  return `${n.toFixed(4)} USD`;
}

function buildCost(pack) {
  const storage = pack.gb * 0.023;
  const write = pack.n * (5 / 1_000_000);
  const hobbyFits = pack.gb <= 1 ? 'sí (≤ 1 GB)' : 'no (supera 1 GB; Blob se bloquea en Hobby)';
  return {
    hobbyStorage: pack.gb <= 1 ? '0 USD (dentro del 1 GB)' : `${money(storage)} equivalentes; Hobby bloquearía`,
    proStorage: money(storage),
    hobbyFits,
    write: money(write),
  };
}

function report(raw, measures) {
  const items = mergeItems(raw, measures).filter((item) => {
    try {
      return isUsableAssetPath(new URL(item.url).pathname);
    } catch {
      return false;
    }
  });
  const summary = summarize(items);
  writeCsv(items);
  const extra = {
    measured_at: measures.measured_at,
    pricingReadAt: '28 oct 2026, 16:05–16:10 hora de Madrid (CET, UTC+1)',
    notFoundList: summary.notFound,
    cost: {
      front: buildCost(summary.front),
      originals: buildCost(summary.originals),
    },
  };
  writeMd(raw, items, summary, extra);
  writeFileSync(join(OUT_DIR, '_resumen.json'), JSON.stringify({ stats: raw.stats, summary: {
    front: summary.front,
    library: summary.library,
    originals: summary.originals,
    intermedios: summary.intermedios,
    all: summary.all,
    notFound: summary.notFound.map((i) => ({ url: i.url, status: i.status })),
    measuredHead: summary.measuredHead,
    measuredWpOnly: summary.measuredWpOnly,
  }, extra }, null, 2));
  log(`CSV ${CSV_PATH} (${items.length} filas)`);
  log(`MD  ${MD_PATH}`);
  return { items, summary };
}

async function main() {
  log(`modo=${MODE}`);
  let raw;
  if (MODE === 'collect' || MODE === 'all') raw = await collect();
  else raw = loadRaw();

  let measures = loadMeasures();
  if (MODE === 'measure' || MODE === 'measure+report' || MODE === 'all') {
    measures = await measure(raw);
  }
  if (MODE === 'report' || MODE === 'measure+report' || MODE === 'all' || MODE === 'collect') {
    report(raw, measures);
  }
  log(`peticiones HTTP de esta ejecución: ${requests}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
