const WP_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'i0.wp.com',
  'i1.wp.com',
  'i2.wp.com',
]);

const CREAR_SUBDOMAIN_RE = /^https?:\/\/([a-z0-9-]+\.)?crear\.endpoint\.playfulagency\.com/i;
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
  if (CREAR_SUBDOMAIN_RE.test(urlString)) {
    const path = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
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

export function rewriteStringUrls(input) {
  if (typeof input !== 'string' || !input) return input;
  let out = input
    .replace(/https?:\/\/endpoint\.playfulagency\.com/gi, 'https://playfulagency.com')
    .replace(/https?:\/\/([a-z0-9-]+\.)?crear\.endpoint\.playfulagency\.com/gi, 'https://playfulagency.com')
    .replace(/\/\/i0\.wp\.com\/([^"'\s<>\\)]+)/gi, (_m, path) => remotePathToLocal(decodePhotonPath(path)))
    .replace(/\/\/i1\.wp\.com\/([^"'\s<>\\)]+)/gi, (_m, path) => remotePathToLocal(decodePhotonPath(path)))
    .replace(/\/\/i2\.wp\.com\/([^"'\s<>\\)]+)/gi, (_m, path) => remotePathToLocal(decodePhotonPath(path)))
    .replace(I0_WP_RE, (_m, path) => remotePathToLocal(`https://endpoint.playfulagency.com/${decodeURIComponent(path)}`))
    .replace(I1_WP_RE, (_m, path) => remotePathToLocal(`https://endpoint.playfulagency.com/${decodeURIComponent(path)}`))
    .replace(I2_WP_RE, (_m, path) => remotePathToLocal(`https://endpoint.playfulagency.com/${decodeURIComponent(path)}`))
    .replace(/https?:\/\/endpoint\.playfulagency\.com\/wp-content\/uploads\/[^"'<>\s)]+/gi, (match) => remotePathToLocal(match))
    .replace(/https?:\/\/endpoint\.playfulagency\.com\/wp-content\/(?!uploads)[^"'<>\s)]+/gi, (match) => remotePathToLocal(match, { staticAsset: true }))
    .replace(/https?:\/\/endpoint\.playfulagency\.com\/wp-includes\/[^"'<>\s)]+/gi, (match) => remotePathToLocal(match, { staticAsset: true }));
  out = out.replace(/endpoint\.playfulagency\.com/gi, 'playfulagency.com');
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
