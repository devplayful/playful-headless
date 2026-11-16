/**
 * One-shot export of public WordPress REST content into data/wp-snapshot/.
 * Re-run when refreshing the frozen copy; runtime never calls endpoint.playfulagency.com.
 *
 * Usage: WORDPRESS_EXPORT_BASE=https://endpoint.playfulagency.com/wp-json \
 *        node --experimental-strip-types scripts/export-wp-snapshot.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { sanitizeWpObject } from '../lib/wp-snapshot/sanitize-content.mjs';
import { rewriteMediaUrlsInValue, remotePathToLocal } from '../lib/wp-snapshot/rewrite-media-urls.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SNAPSHOT_ROOT = path.join(ROOT, 'data', 'wp-snapshot');
const COLLECTIONS_DIR = path.join(SNAPSHOT_ROOT, 'collections');
const WP_MEDIA_DIR = path.join(ROOT, 'public', 'wp-media');
const WP_STATIC_DIR = path.join(ROOT, 'public', 'wp-static');

const EXPORT_BASE = (process.env.WORDPRESS_EXPORT_BASE || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const FETCH_TIMEOUT_MS = 30_000;
const IMAGE_SIZE_ABORT_BYTES = 300 * 1024 * 1024;

const ELEMENTOR_STATIC_URLS: string[] = [
  'https://endpoint.playfulagency.com/wp-content/uploads/elementor/css/post-8.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/frontend.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/conditionals/apple-webkit.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-heading.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-image.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-spacer.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-accordion.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-icon-list.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-social-icons.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/widget-image-carousel.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor-pro/assets/css/widget-form.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/eicons/css/elementor-icons.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/font-awesome/css/all.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/font-awesome/css/v4-shims.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/font-awesome/css/solid.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/font-awesome/css/brands.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/animations/styles/zoomIn.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/swiper/v8/css/swiper.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/css/conditionals/e-swiper.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/mae-widgets.min.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/core-icons.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/pollock-icons.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/cubeportfolio.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/flickity.css',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/css/magnific.popup.css',
  'https://endpoint.playfulagency.com/wp-includes/js/jquery/jquery.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/js/webpack.runtime.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/js/frontend-modules.min.js',
  'https://endpoint.playfulagency.com/wp-includes/js/jquery/ui/core.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/js/frontend.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/elementor/assets/lib/swiper/v8/swiper.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/waitforimages.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/gsap.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/core.min.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/flickity.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/cubeportfolio.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/parallax-scroll.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/magnific.popup.js',
  'https://endpoint.playfulagency.com/wp-content/plugins/masterlayer-addons-for-elementor/assets/js/init.js',
];

const SERVICE_PAGE_SLUGS = [
  'home-2',
  'podcast',
  'agencia-e-commerce',
  'agencia-diseno-web',
  'marketing-internacional',
  'agencia-seo',
  'agencia-ux-ui',
  'agencia-sem',
  'seo-expertos',
  'seo-vigo',
  'contactar-agencia-de-marketing-digital',
];

const URL_IN_JSON_RE = /https?:\/\/(?:endpoint\.playfulagency\.com|i[0-2]\.wp\.com|[a-z0-9-]+\.crear\.endpoint\.playfulagency\.com)[^\s"'<>\\)]+/gi;
const LOCAL_MEDIA_RE = /\/wp-media(\/wp-content\/uploads\/[^\s"'<>\\)]+)/gi;
const AUDIO_RE = /\.(mp3|m4a|wav|ogg)(\?|$)/i;

function isDownloadableRemoteUrl(url: string): boolean {
  if (!url || AUDIO_RE.test(url)) return false;
  try {
    const { pathname } = new URL(url);
    if (pathname.startsWith('/wp-content/uploads/')) return true;
    if (pathname.startsWith('/wp-content/plugins/')) return true;
    if (pathname.startsWith('/wp-content/themes/')) return true;
    if (pathname.startsWith('/wp-includes/')) return true;
    if (url.includes('i0.wp.com') || url.includes('i1.wp.com') || url.includes('i2.wp.com')) return true;
  } catch {
    return false;
  }
  return false;
}

async function wpFetchJson(url: string): Promise<{ data: unknown; headers: Headers }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new Error(`GET ${url} failed: ${response.status}`);
    }
    const data = await response.json();
    return { data, headers: response.headers };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllPages<T>(buildUrl: (page: number) => string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const { data, headers } = await wpFetchJson(buildUrl(page));
    if (!Array.isArray(data)) throw new Error(`Expected array from ${buildUrl(page)}`);
    items.push(...(data as T[]));
    totalPages = parseInt(headers.get('x-wp-totalpages') || '1', 10) || 1;
    page += 1;
  } while (page <= totalPages);
  return items;
}

function ensureDir(dir: string) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file: string, value: unknown) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function collectUrlsFromValue(value: unknown, out: Set<string>) {
  if (value == null) return;
  if (typeof value === 'string') {
    for (const match of Array.from(value.matchAll(URL_IN_JSON_RE))) {
      out.add(match[0].replace(/[)\\]",]+$/, ''));
    }
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectUrlsFromValue(item, out);
    return;
  }
  if (typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      collectUrlsFromValue(nested, out);
    }
  }
}

function normalizeDownloadUrl(raw: string): { fetchUrl: string; sitePath: string; isStatic: boolean } | null {
  try {
    if (raw.includes('i0.wp.com') || raw.includes('i1.wp.com') || raw.includes('i2.wp.com')) {
      const u = new URL(raw);
      const decoded = decodeURIComponent(u.pathname.replace(/^\//, ''));
      const inner = new URL(decoded);
      const sitePath = inner.pathname;
      const fetchUrl = `https://endpoint.playfulagency.com${sitePath}`;
      const isStatic = !sitePath.startsWith('/wp-content/uploads/');
      return { fetchUrl, sitePath, isStatic };
    }
    const u = new URL(raw);
  if (u.hostname !== 'endpoint.playfulagency.com' && !u.hostname.endsWith('.crear.endpoint.playfulagency.com')) {
    return null;
  }
  const sitePath = u.pathname;
  const isStatic = sitePath.startsWith('/wp-includes/')
    || (sitePath.startsWith('/wp-content/') && !sitePath.startsWith('/wp-content/uploads/'));
  return { fetchUrl: raw.split('?')[0], sitePath, isStatic };
  } catch {
    return null;
  }
}

function localPathFor(sitePath: string, isStatic: boolean): string {
  const base = isStatic ? WP_STATIC_DIR : WP_MEDIA_DIR;
  return path.join(base, sitePath.replace(/^\//, ''));
}

async function downloadBinary(url: string, dest: string): Promise<number> {
  ensureDir(path.dirname(dest));
  if (fs.existsSync(dest)) {
    const stat = fs.statSync(dest);
    if (stat.isDirectory()) {
      console.warn(`[export] skip EISDIR ${dest}`);
      return 0;
    }
    return stat.size;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      console.warn(`[export] skip ${url} (${response.status})`);
      return 0;
    }
    const buf = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return buf.length;
  } catch (error) {
    console.warn(`[export] failed ${url}:`, error);
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

function patchYoastCanonicals(value: unknown): unknown {
  if (value == null) return value;
  if (Array.isArray(value)) return value.map(patchYoastCanonicals);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(obj)) {
      if (key === 'yoast_head_json' && nested && typeof nested === 'object') {
        const yoast = { ...(nested as Record<string, unknown>) };
        if (typeof yoast.canonical === 'string') {
          yoast.canonical = yoast.canonical.replace(/https?:\/\/endpoint\.playfulagency\.com/gi, 'https://playfulagency.com');
        }
        out[key] = yoast;
      } else {
        out[key] = patchYoastCanonicals(nested);
      }
    }
    return out;
  }
  return value;
}

async function main() {
  console.log(`[export] source ${EXPORT_BASE}`);
  ensureDir(COLLECTIONS_DIR);
  ensureDir(WP_MEDIA_DIR);
  ensureDir(WP_STATIC_DIR);

  const posts = await fetchAllPages<Record<string, unknown>>((page) => (
    `${EXPORT_BASE}/wp/v2/posts?status=publish&per_page=100&page=${page}`
    + '&_embed=wp:featuredmedia,wp:term,author&acf_format=standard'
  ));
  const postsSanitized = posts.map((p) => rewriteMediaUrlsInValue(patchYoastCanonicals(sanitizeWpObject(p))));

  const categories = await fetchAllPages<Record<string, unknown>>((page) => (
    `${EXPORT_BASE}/wp/v2/categories?per_page=100&page=${page}`
  ));

  const authorIds = new Set<number>();
  for (const post of postsSanitized) {
    const author = post.author;
    if (typeof author === 'number') authorIds.add(author);
    const embedded = post._embedded as Record<string, unknown> | undefined;
    const authors = embedded?.author as Array<{ id?: number }> | undefined;
    authors?.forEach((a) => { if (a?.id) authorIds.add(a.id); });
  }
  const users: Record<string, unknown>[] = [];
  if (authorIds.size > 0) {
    const chunk = Array.from(authorIds);
    for (let i = 0; i < chunk.length; i += 100) {
      const slice = chunk.slice(i, i + 100);
      const { data } = await wpFetchJson(
        `${EXPORT_BASE}/wp/v2/users?include=${slice.join(',')}&per_page=100`,
      );
      if (Array.isArray(data)) users.push(...data);
    }
  }
  const usersRewritten = users.map((u) => rewriteMediaUrlsInValue(u));

  const mediaIds = new Set<number>();
  for (const post of postsSanitized) {
    if (typeof post.featured_media === 'number' && post.featured_media > 0) {
      mediaIds.add(post.featured_media);
    }
  }
  const media: Record<string, unknown>[] = [];
  if (mediaIds.size > 0) {
    const ids = Array.from(mediaIds);
    for (let i = 0; i < ids.length; i += 100) {
      const slice = ids.slice(i, i + 100);
      const { data } = await wpFetchJson(
        `${EXPORT_BASE}/wp/v2/media?include=${slice.join(',')}&per_page=100`,
      );
      if (Array.isArray(data)) media.push(...data);
    }
  }
  const mediaRewritten = media.map((m) => rewriteMediaUrlsInValue(m));

  const pages: Record<string, unknown>[] = [];
  for (const slug of SERVICE_PAGE_SLUGS) {
    const { data } = await wpFetchJson(
      `${EXPORT_BASE}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content,yoast_head`,
    );
    if (Array.isArray(data) && data[0]) {
      pages.push(rewriteMediaUrlsInValue(sanitizeWpObject(data[0])));
    }
  }

  const podcast = await fetchAllPages<Record<string, unknown>>((page) => (
    `${EXPORT_BASE}/wp/v2/podcast?per_page=100&page=${page}&_embed=wp:featuredmedia,wp:term`
  ));
  const podcastRewritten = podcast.map((e) => rewriteMediaUrlsInValue(patchYoastCanonicals(sanitizeWpObject(e))));

  const equipo = await fetchAllPages<Record<string, unknown>>((page) => (
    `${EXPORT_BASE}/wp/v2/equipo?per_page=100&page=${page}&_embed=wp:term,wp:featuredmedia`
  ));
  const equipoRewritten = equipo.map((e) => rewriteMediaUrlsInValue(sanitizeWpObject(e)));

  const casos = await fetchAllPages<Record<string, unknown>>((page) => (
    `${EXPORT_BASE}/wp/v2/casos-de-exito?status=publish&per_page=50&page=${page}`
    + '&_embed=wp:featuredmedia&acf_format=standard'
  ));
  const casosRewritten = casos.map((c) => rewriteMediaUrlsInValue(sanitizeWpObject(c)));

  writeJson(path.join(COLLECTIONS_DIR, 'posts.json'), postsSanitized);
  writeJson(path.join(COLLECTIONS_DIR, 'categories.json'), categories);
  writeJson(path.join(COLLECTIONS_DIR, 'users.json'), usersRewritten);
  writeJson(path.join(COLLECTIONS_DIR, 'media.json'), mediaRewritten);
  writeJson(path.join(COLLECTIONS_DIR, 'pages.json'), pages);
  writeJson(path.join(COLLECTIONS_DIR, 'podcast.json'), podcastRewritten);
  writeJson(path.join(COLLECTIONS_DIR, 'equipo.json'), equipoRewritten);
  writeJson(path.join(COLLECTIONS_DIR, 'casos-de-exito.json'), casosRewritten);

  const urlSet = new Set<string>(ELEMENTOR_STATIC_URLS);
  for (const collection of [postsSanitized, pages, podcastRewritten, equipoRewritten, casosRewritten, mediaRewritten, usersRewritten]) {
    collectUrlsFromValue(collection, urlSet);
  }

  const audioManifest: Array<{ url: string; bytes?: number }> = [];
  let totalBytes = 0;
  let fileCount = 0;
  let abortedMedia = false;

  for (const collection of [postsSanitized, pages, podcastRewritten, equipoRewritten, casosRewritten]) {
    const text = JSON.stringify(collection);
    for (const match of Array.from(text.matchAll(LOCAL_MEDIA_RE))) {
      const sitePath = match[1].split('?')[0];
      urlSet.add(`https://endpoint.playfulagency.com${sitePath}`);
    }
  }

  for (const raw of Array.from(urlSet)) {
    if (AUDIO_RE.test(raw)) {
      audioManifest.push({ url: raw });
      continue;
    }
    if (!isDownloadableRemoteUrl(raw)) continue;
    const normalized = normalizeDownloadUrl(raw);
    if (!normalized) continue;
    const dest = localPathFor(normalized.sitePath, normalized.isStatic);
    if (totalBytes >= IMAGE_SIZE_ABORT_BYTES) {
      abortedMedia = true;
      continue;
    }
    const bytes = await downloadBinary(normalized.fetchUrl, dest);
    if (bytes > 0) {
      totalBytes += bytes;
      fileCount += 1;
    }
  }

  for (const staticUrl of ELEMENTOR_STATIC_URLS) {
    const normalized = normalizeDownloadUrl(staticUrl);
    if (!normalized) continue;
    const dest = localPathFor(normalized.sitePath, true);
    const bytes = await downloadBinary(normalized.fetchUrl, dest);
    if (bytes > 0 && !fs.existsSync(dest)) {
      totalBytes += bytes;
      fileCount += 1;
    }
  }

  const manifest = {
    exportedAt: new Date().toISOString(),
    source: EXPORT_BASE,
    counts: {
      posts: postsSanitized.length,
      categories: categories.length,
      users: usersRewritten.length,
      media: mediaRewritten.length,
      pages: pages.length,
      podcast: podcastRewritten.length,
      equipo: equipoRewritten.length,
      casosDeExito: casosRewritten.length,
    },
    media: {
      filesCommitted: fileCount,
      totalBytes,
      totalMegabytes: Math.round((totalBytes / (1024 * 1024)) * 100) / 100,
      abortedOver300MB: abortedMedia,
      audioSkipped: audioManifest,
    },
    contentHash: createHash('sha256').update(JSON.stringify({
      posts: postsSanitized.length,
      podcast: podcastRewritten.length,
    })).digest('hex').slice(0, 16),
  };
  writeJson(path.join(SNAPSHOT_ROOT, 'manifest.json'), manifest);

  console.log('[export] done', JSON.stringify(manifest, null, 2));
  if (abortedMedia) {
    console.error('[export] ABORT: media would exceed 300 MB cap');
    process.exitCode = 2;
  }
}

main().catch((error) => {
  console.error('[export] fatal', error);
  process.exit(1);
});
