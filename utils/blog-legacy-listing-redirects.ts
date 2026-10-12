import { BLOG_LISTING_CATEGORY_SLUGS } from './blog-url.ts';
import type { BlogSeoDecision } from './amp-junk-query.ts';
import { searchFromParams } from './amp-junk-query.ts';

const BLOG_LISTING_CATEGORY_SLUG_SET = new Set<string>(BLOG_LISTING_CATEGORY_SLUGS);

function normalizePath(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

function listingRedirect(params: URLSearchParams): BlogSeoDecision {
  return {
    type: 'redirect',
    pathname: '/blog',
    search: searchFromParams(params),
    status: 308,
  };
}

/**
 * WordPress-era category archives and paginated listing paths that must 308
 * once to a 200 /blog listing URL (query variants are rewritten to /blog/q).
 */
export function blogLegacyListingRedirectDecision(pathname: string): BlogSeoDecision | { type: 'next' } {
  const path = normalizePath(pathname);
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'category' && parts.length === 2) {
    const slug = parts[1];
    const params = new URLSearchParams();
    if (BLOG_LISTING_CATEGORY_SLUG_SET.has(slug)) {
      params.set('category', slug);
    }
    return listingRedirect(params);
  }

  if (parts[0] === 'blog' && parts[1] === 'category' && parts.length === 3) {
    const slug = parts[2];
    const params = new URLSearchParams();
    if (BLOG_LISTING_CATEGORY_SLUG_SET.has(slug)) {
      params.set('category', slug);
    }
    return listingRedirect(params);
  }

  if (parts[0] === 'blog' && parts[1] === 'page' && parts.length === 3 && /^\d+$/.test(parts[2])) {
    const params = new URLSearchParams();
    params.set('page', parts[2]);
    return listingRedirect(params);
  }

  if (
    parts[0] === 'blog'
    && parts.length === 4
    && parts[2] === 'page'
    && BLOG_LISTING_CATEGORY_SLUG_SET.has(parts[1])
    && /^\d+$/.test(parts[3])
  ) {
    const params = new URLSearchParams();
    params.set('page', parts[3]);
    params.set('category', parts[1]);
    return listingRedirect(params);
  }

  return { type: 'next' };
}
