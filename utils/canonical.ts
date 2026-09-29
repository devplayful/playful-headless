const SITE_ORIGIN = 'https://playfulagency.com';

/**
 * Absolute https apex URL for a pathname. No query string.
 * Home keeps a trailing slash to match the sitemap loc; interiors do not.
 */
export function canonicalForPath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return `${SITE_ORIGIN}/`;
  }
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${withSlash.replace(/\/+$/, '')}`;
}

/**
 * Absolute URL for an asset that may already be remote (WordPress media)
 * or a site-relative path (`/images/...`). Does not strip filename slashes.
 */
export function toAbsoluteSiteUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const withSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SITE_ORIGIN}${withSlash}`;
}
