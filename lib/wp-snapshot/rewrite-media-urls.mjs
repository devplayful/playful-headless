const WP_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'i0.wp.com',
  'i1.wp.com',
  'i2.wp.com',
]);

const CREAR_SUBDOMAIN_RE = /^https?:\/\/([a-z0-9-]+\.)?crear\.endpoint\.playfulagency\.com/i;
const CREAR_AGENCY_HOST = 'crear.playfulagency.com';
const CREAR_AGENCY_RE = /^https?:\/\/crear\.playfulagency\.com/i;
const ENDPOINT_RE = /https?:\/\/endpoint\.playfulagency\.com/gi;
const I0_WP_RE = /https?:\/\/i0\.wp\.com\/([^?\s"'<>]+)/gi;
const I1_WP_RE = /https?:\/\/i1\.wp\.com\/([^?\s"'<>]+)/gi;
const I2_WP_RE = /https?:\/\/i2\.wp\.com\/([^?\s"'<>]+)/gi;

function decodePhotonPath(path) {
  try {
    const decoded = decodeURIComponent(path);
    if (decoded.startsWith('http')) return decoded;
    return `https://${decoded.replace(/^\/+/, '')}`;
  } catch {
    return `https://${path}`;
  }
}

export const WP_MEDIA_PREFIX = '/wp-media';
export const WP_STATIC_PREFIX = '/wp-static';

/**
 * Map a remote WordPress asset path to same-origin snapshot paths.
 */
export function remotePathToLocal(urlString, { staticAsset = false } = {}) {
  if (!urlString || typeof urlString !== 'string') return urlString;
  let url;
  try {
    url = new URL(urlString.trim());
  } catch {
    return urlString;
  }
  if (CREAR_SUBDOMAIN_RE.test(urlString) || url.hostname === CREAR_AGENCY_HOST) {
    const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
    const prefix =
      staticAsset && !path.startsWith('/wp-content/uploads/') ? WP_STATIC_PREFIX : WP_MEDIA_PREFIX;
    if (path.startsWith('/wp-content/uploads/') || path.startsWith('/wp-content/')) {
      return `${prefix}${path}`;
    }
    if (path.startsWith('/wp-includes/')) {
      return `${WP_STATIC_PREFIX}${path}`;
    }
    return `${WP_MEDIA_PREFIX}${path}`;
  }
  if (!WP_HOSTS.has(url.hostname) && url.hostname !== 'endpoint.playfulagency.com') {
    return urlString;
  }
  if (url.hostname.startsWith('i') && url.hostname.endsWith('.wp.com')) {
    const decoded = decodeURIComponent(url.pathname.replace(/^\//, ''));
    try {
      const inner = new URL(decoded);
      const path = inner.pathname.startsWith('/') ? inner.pathname : `/${inner.pathname}`;
      const prefix = staticAsset ? WP_STATIC_PREFIX : WP_MEDIA_PREFIX;
      return `${prefix}${path}`;
    } catch {
      return urlString;
    }
  }
  const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
  const prefix = staticAsset ? WP_STATIC_PREFIX : WP_MEDIA_PREFIX;
  if (path.startsWith('/wp-content/uploads/') || path.startsWith('/wp-content/')) {
    return `${prefix}${path}`;
  }
  if (path.startsWith('/wp-includes/')) {
    return `${WP_STATIC_PREFIX}${path}`;
  }
  return urlString;
}

const RELATIVE_UPLOAD_RE = /(?<=["'(\s])\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;
const RELATIVE_WP_STATIC_RE = /(?<=["'(\s])\/wp-content\/(?:plugins|themes|includes)\/[^\s"'<>\\)]+/gi;
const APEX_WP_CONTENT_RE =
  /https?:\/\/(?:www\.)?playfulagency\.com(\/wp-content\/(?:uploads|plugins|themes|includes)\/[^\s"'<>\\)]+)/gi;

export function rewriteRelativeUploadPaths(input) {
  if (typeof input !== 'string' || !input) return input;
  return input.replace(RELATIVE_UPLOAD_RE, (match) => `${WP_MEDIA_PREFIX}${match}`);
}

export function rewriteRelativeWpStaticPaths(input) {
  if (typeof input !== 'string' || !input) return input;
  return input.replace(RELATIVE_WP_STATIC_RE, (match) => `${WP_STATIC_PREFIX}${match}`);
}

/** Apex /wp-content/* in HTML or RSC strings → /wp-media or /wp-static (no live WP). */
export function rewriteApexWpContentPaths(input) {
  if (typeof input !== 'string' || !input) return input;
  return input.replace(APEX_WP_CONTENT_RE, (_full, path) => {
    if (path.startsWith('/wp-content/uploads/')) {
      return `${WP_MEDIA_PREFIX}${path}`;
    }
    return `${WP_STATIC_PREFIX}${path}`;
  });
}

export function rewriteStringUrls(input) {
  if (typeof input !== 'string' || !input) return input;
  let out = input
    .replace(/\/\/i0\.wp\.com\/([^"'\s<>\\)]+)/gi, (_m, path) => remotePathToLocal(decodePhotonPath(path)))
    .replace(/\/\/i1\.wp\.com\/([^"'\s<>\\)]+)/gi, (_m, path) => remotePathToLocal(decodePhotonPath(path)))
    .replace(/\/\/i2\.wp\.com\/([^"'\s<>\\)]+)/gi, (_m, path) => remotePathToLocal(decodePhotonPath(path)))
    .replace(I0_WP_RE, (_m, path) => remotePathToLocal(`https://endpoint.playfulagency.com/${decodeURIComponent(path)}`))
    .replace(I1_WP_RE, (_m, path) => remotePathToLocal(`https://endpoint.playfulagency.com/${decodeURIComponent(path)}`))
    .replace(I2_WP_RE, (_m, path) => remotePathToLocal(`https://endpoint.playfulagency.com/${decodeURIComponent(path)}`))
    .replace(
      /https?:\/\/([a-z0-9-]+\.)?crear\.endpoint\.playfulagency\.com\/wp-content\/uploads\/[^"'<>\s)]+/gi,
      (match) => remotePathToLocal(match),
    )
    .replace(
      /https?:\/\/crear\.playfulagency\.com\/wp-content\/uploads\/[^"'<>\s)]+/gi,
      (match) => remotePathToLocal(match),
    )
    .replace(
      /https?:\/\/crear\.playfulagency\.com\/wp-content\/(?!uploads)[^"'<>\s)]+/gi,
      (match) => remotePathToLocal(match, { staticAsset: true }),
    )
    .replace(/https?:\/\/endpoint\.playfulagency\.com\/wp-content\/uploads\/[^"'<>\s)]+/gi, (match) => remotePathToLocal(match))
    .replace(/https?:\/\/endpoint\.playfulagency\.com\/wp-content\/(?!uploads)[^"'<>\s)]+/gi, (match) => remotePathToLocal(match, { staticAsset: true }))
  .replace(/https?:\/\/endpoint\.playfulagency\.com\/wp-includes\/[^"'<>\s)]+/gi, (match) => remotePathToLocal(match, { staticAsset: true }))
    .replace(/https?:\/\/crear\.playfulagency\.com/gi, 'https://playfulagency.com')
    .replace(/https?:\/\/([a-z0-9-]+\.)?crear\.endpoint\.playfulagency\.com/gi, 'https://playfulagency.com')
    .replace(/https?:\/\/endpoint\.playfulagency\.com/gi, 'https://playfulagency.com');
  out = out.replace(/endpoint\.playfulagency\.com/gi, 'playfulagency.com');
  out = rewriteApexWpContentPaths(out);
  out = rewriteRelativeUploadPaths(out);
  out = rewriteRelativeWpStaticPaths(out);
  return out;
}

export function rewriteMediaUrlsInValue(value) {
  if (value == null) return value;
  if (Array.isArray(value)) {
    return value.map((item) => rewriteMediaUrlsInValue(item));
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (key === 'source_url' && typeof nested === 'string') {
        out[key] = remotePathToLocal(nested);
      } else if (key === 'url' && typeof nested === 'string' && nested.includes('endpoint.playfulagency.com')) {
        out[key] = remotePathToLocal(nested);
      } else if (key === 'canonical' && typeof nested === 'string' && nested.includes('endpoint.playfulagency.com')) {
        out[key] = nested.replace(ENDPOINT_RE, 'https://playfulagency.com');
      } else {
        out[key] = rewriteMediaUrlsInValue(nested);
      }
    }
    return out;
  }
  if (typeof value === 'string') {
    return rewriteStringUrls(value);
  }
  return value;
}
