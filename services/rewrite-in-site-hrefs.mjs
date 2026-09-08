const IN_SITE_PAGE_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
]);

const WP_ASSET_PATH_PREFIXES = ['/wp-content', '/wp-includes', '/wp-json', '/wp-admin'];

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
