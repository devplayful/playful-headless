const IN_SITE_PAGE_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
]);

const WP_ASSET_PATH_PREFIXES = ['/wp-content', '/wp-includes', '/wp-json', '/wp-admin'];

const APEX_ORIGIN = 'https://playfulagency.com';

/** Absolute or protocol-relative in-site page URLs (not /wp-* assets). */
const IN_SITE_URL_RE = /(?:https?:)?\/\/(?:endpoint\.|old\.|www\.)?playfulagency\.com[^\s"'<>]*/gi;

export function rewritePageHref(url) {
  const trimmed = url.trim();
  const parsed = trimmed.match(/^(https?:)?\/\/([^/]+)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i);
  if (!parsed) return url;

  const host = parsed[2].toLowerCase();
  if (!IN_SITE_PAGE_HOSTS.has(host)) return url;

  const path = parsed[3] || '/';
  if (WP_ASSET_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return url;
  }

  const query = parsed[4] || '';
  const hash = parsed[5] || '';
  const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
  return `${normalized}${query}${hash}`;
}

/** Rewrites in-site page hrefs to relative Next paths; leaves wp-content/assets untouched. */
export function rewriteInSitePageHrefs(html) {
  return html.replace(/href=(["'])([^"']+)\1/gi, (_full, quote, href) => {
    return `href=${quote}${rewritePageHref(href)}${quote}`;
  });
}

/**
 * Same host/path rules as rewritePageHref, but emits apex https URLs.
 * /wp-content and other WP assets stay on their original host.
 */
export function rewriteInSiteUrlToApex(url) {
  const rewritten = rewritePageHref(url);
  if (rewritten === url || !rewritten.startsWith('/')) {
    return url;
  }
  return `${APEX_ORIGIN}${rewritten}`;
}

/**
 * RSC / JSON-LD often store Yoast HTML with `\u003c` tags or `\/` slashes.
 * Decode those so IN_SITE_URL_RE can see `https://endpoint.../blog/`.
 */
function decodeLiveEscapes(text) {
  return text
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\\//g, '/');
}

/** Rewrites every in-site page URL inside a string (og:url, JSON-LD, etc.). */
export function rewriteInSiteUrlsInText(text) {
  if (typeof text !== 'string') return text;
  return decodeLiveEscapes(text).replace(IN_SITE_URL_RE, (match) => rewriteInSiteUrlToApex(match));
}

function rewriteYoastJsonValue(value) {
  if (typeof value === 'string') {
    return rewriteInSiteUrlsInText(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteYoastJsonValue(item));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      out[key] = rewriteYoastJsonValue(nested);
    }
    return out;
  }
  return value;
}

function isYoastKey(key) {
  return typeof key === 'string' && key.toLowerCase().includes('yoast');
}

/**
 * Walk arrays/objects so listing copies (`categories`, `_embedded['wp:term']`)
 * get the same Yoast rewrite as the top-level post.
 */
function rewriteYoastTree(value) {
  if (Array.isArray(value)) {
    return value.map((item) => rewriteYoastTree(item));
  }
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, nested] of Object.entries(value)) {
      if (isYoastKey(key)) {
        out[key] = typeof nested === 'string'
          ? rewriteInSiteUrlsInText(nested)
          : rewriteYoastJsonValue(nested);
      } else {
        out[key] = rewriteYoastTree(nested);
      }
    }
    return out;
  }
  return value;
}

/**
 * Rewrites endpoint/old/www page URLs inside Yoast HTML + JSON, including
 * nested term/category copies that /blog serializes into the RSC payload.
 * /wp-content media URLs are left alone.
 */
export function rewriteWpYoastFields(item) {
  return rewriteYoastTree(item);
}

function rewriteRenderedField(field) {
  if (!field || typeof field !== 'object' || typeof field.rendered !== 'string') {
    return field;
  }
  return {
    ...field,
    rendered: rewriteInSitePageHrefs(field.rendered),
  };
}

/**
 * Maps WP REST `content.rendered` / `excerpt.rendered` through rewriteInSitePageHrefs.
 * Used by listing and single-post pipelines so RSC/client payloads do not keep
 * endpoint.playfulagency.com navigation hrefs.
 */
export function rewriteWpRenderedHtmlFields(item) {
  if (!item || typeof item !== 'object') return item;
  const next = { ...item };
  if ('content' in item) next.content = rewriteRenderedField(item.content);
  if ('excerpt' in item) next.excerpt = rewriteRenderedField(item.excerpt);
  return next;
}
