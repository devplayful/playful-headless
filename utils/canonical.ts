const SITE_ORIGIN = 'https://playfulagency.com';

/** Absolute https apex URL for a pathname. No query string, no trailing slash. */
export function canonicalForPath(pathname: string): string {
  if (!pathname || pathname === '/') {
    return SITE_ORIGIN;
  }
  const withSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${withSlash.replace(/\/+$/, '')}`;
}
