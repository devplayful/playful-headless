/**
 * Normalización de URLs de medios WordPress → claves estables en Vercel Blob
 * y reescritura de HTML (src / srcset). Sin subida: solo mapas y render bajo flag.
 */

export const CMS_BLOB_IMAGES_ENV = 'CMS_BLOB_IMAGES';

export function isBlobImagesEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  const v = env[CMS_BLOB_IMAGES_ENV];
  return v === '1' || v === 'true';
}

const WP_ENDPOINT_HOST = 'endpoint.playfulagency.com';
const WP_UPLOADS_PREFIX = '/wp-content/uploads/';
const WP_PROXY_HOST_RE = /^i[0-3]\.wp\.com$/i;

const PLAYFUL_HOST_SUFFIXES = [
  WP_ENDPOINT_HOST,
  'crear.endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
];

function decodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/** ¿Es una URL de imagen/medio servida desde WP (directo, proxy wp.com o subdominio crear.*)? */
export function isMigratableWordPressMediaUrl(raw: string): boolean {
  if (typeof raw !== 'string' || !raw.trim()) return false;
  const trimmed = raw.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('/images/')) return false;
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    if (!/^https?:\/\//i.test(absolute)) return false;
    const url = new URL(absolute);
    if (WP_PROXY_HOST_RE.test(url.hostname)) {
      const inner = url.pathname.replace(/^\//, '');
      if (!inner) return false;
      const innerUrl = new URL(`https://${inner}`);
      return innerUrl.pathname.startsWith(WP_UPLOADS_PREFIX);
    }
    if (PLAYFUL_HOST_SUFFIXES.includes(url.hostname)) {
      return url.pathname.startsWith(WP_UPLOADS_PREFIX);
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Canonicaliza a https://endpoint.playfulagency.com/wp-content/uploads/…
 * (sin query ni fragmento; path decodificado).
 */
export function canonicalWordPressUploadUrl(raw: string): string | null {
  if (!isMigratableWordPressMediaUrl(raw)) return null;
  try {
    const absolute = raw.trim().startsWith('//') ? `https:${raw.trim()}` : raw.trim();
    const url = new URL(absolute);
    let host = url.hostname;
    let pathname = url.pathname;

    if (WP_PROXY_HOST_RE.test(host)) {
      const inner = pathname.replace(/^\//, '');
      const innerUrl = new URL(`https://${inner}`);
      host = innerUrl.hostname;
      pathname = innerUrl.pathname;
    }

    if (!pathname.startsWith(WP_UPLOADS_PREFIX)) return null;
    if (host !== WP_ENDPOINT_HOST && !host.endsWith('.playfulagency.com')) return null;

    const path = decodePath(pathname);
    return `https://${WP_ENDPOINT_HOST}${path}`;
  } catch {
    return null;
  }
}

/** Clave idempotente en Blob: media/AAAA/MM/nombre.ext */
export function blobStorageKeyFromCanonicalUrl(canonical: string): string | null {
  try {
    const url = new URL(canonical);
    if (url.hostname !== WP_ENDPOINT_HOST || !url.pathname.startsWith(WP_UPLOADS_PREFIX)) {
      return null;
    }
    const relative = url.pathname.slice(WP_UPLOADS_PREFIX.length);
    const parts = relative.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return `media/${parts.join('/')}`;
  } catch {
    return null;
  }
}

export function blobPublicUrlFromKey(
  key: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const base =
    env.BLOB_PUBLIC_BASE_URL?.replace(/\/$/, '') ||
    'https://xl21culwxno499zc.public.blob.vercel-storage.com';
  return `${base}/${key.replace(/^\//, '')}`;
}

export function plannedBlobUrlForSource(raw: string, env?: NodeJS.ProcessEnv): string | null {
  const canonical = canonicalWordPressUploadUrl(raw);
  if (!canonical) return null;
  const key = blobStorageKeyFromCanonicalUrl(canonical);
  if (!key) return null;
  return blobPublicUrlFromKey(key, env);
}

const IMG_URL_IN_HTML_RE =
  /(?:\bsrc\s*=\s*|\bsrcset\s*=\s*["']|url\s*\(\s*["']?)([^"'\s>)]+)/gi;

function parseSrcset(value: string): string[] {
  const out: string[] = [];
  for (const part of value.split(',')) {
    const url = part.trim().split(/\s+/)[0];
    if (url) out.push(url);
  }
  return out;
}

/** Extrae URLs de img/src, srcset y url() en estilos inline. */
export function extractImageUrlsFromHtml(html: string): string[] {
  if (!html) return [];
  const found = new Set<string>();
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = /\bsrc\s*=\s*(["'])([^"']*)\1/i.exec(tag)?.[2];
    if (src) found.add(src);
    const srcset = /\bsrcset\s*=\s*(["'])([^"']*)\1/i.exec(tag)?.[2];
    if (srcset) for (const u of parseSrcset(srcset)) found.add(u);
  }
  for (const match of Array.from(html.matchAll(IMG_URL_IN_HTML_RE))) {
    const u = match[1];
    if (u && isMigratableWordPressMediaUrl(u)) found.add(u);
  }
  return Array.from(found);
}

export type BlobUrlMap = Record<string, string>;

/** Sustituye URLs conocidas en HTML (src, srcset, comillas). URLs no migrables se dejan igual. */
export function rewriteHtmlWithBlobMap(html: string, map: BlobUrlMap): string {
  if (!html || !map || Object.keys(map).length === 0) return html;
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  let out = html;
  for (const [from, to] of entries) {
    if (!from || from === to) continue;
    out = out.split(from).join(to);
    const enc = encodeURI(from);
    if (enc !== from) out = out.split(enc).join(to);
  }
  return out;
}

/** Aplica el mapa solo a URLs migrables; el resto del HTML no cambia. */
export function rewriteMigratableUrlsInHtml(html: string, map: BlobUrlMap): string {
  if (!html) return html;
  const effective: BlobUrlMap = {};
  for (const [from, to] of Object.entries(map)) {
    if (isMigratableWordPressMediaUrl(from)) effective[from] = to;
  }
  return rewriteHtmlWithBlobMap(html, effective);
}

export function buildBlobMapFromCanonicalEntries(
  entries: Array<{ sourceUrl: string; canonical: string }>,
  env?: NodeJS.ProcessEnv,
): BlobUrlMap {
  const map: BlobUrlMap = {};
  for (const { sourceUrl, canonical } of entries) {
    const key = blobStorageKeyFromCanonicalUrl(canonical);
    if (!key) continue;
    const blob = blobPublicUrlFromKey(key, env);
    map[sourceUrl] = blob;
    map[canonical] = blob;
  }
  return map;
}

export function maybeRewriteHtmlForBlob(
  html: string,
  map: BlobUrlMap | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!isBlobImagesEnabled(env) || !map) return html;
  return rewriteMigratableUrlsInHtml(html, map);
}

export function maybeRewriteMediaUrl(
  url: string,
  map: BlobUrlMap | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!url || !isBlobImagesEnabled(env) || !map) return url;
  if (map[url]) return map[url];
  const canonical = canonicalWordPressUploadUrl(url);
  if (canonical && map[canonical]) return map[canonical];
  return url;
}
