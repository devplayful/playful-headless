type BlogListingSearchParams = {
  [key: string]: string | string[] | undefined;
};

/**
 * Category listings with their own intro text (not just the post grid).
 * CEO 20 oct 21:16: only these are indexable; every other category filter is
 * noindex,follow. WP category descriptions are empty and the listing view
 * renders no per-category copy, so the set is empty today. Add a slug here
 * only together with its rendered intro text.
 */
export const BLOG_CATEGORIES_WITH_OWN_TEXT = new Set<string>([]);

/**
 * Any `/blog` listing with a query string is a duplicate of `/blog`.
 * Clean `/blog` stays indexable; canonical remains https://playfulagency.com/blog.
 */
/** Preview `?cms=1` must not change listing robots vs the same URL without that flag. */
export function stripCmsFromBlogListingSearchParams(
  searchParams?: BlogListingSearchParams | null,
): BlogListingSearchParams | null | undefined {
  if (!searchParams) return searchParams;
  if (searchParams.cms === undefined) return searchParams;
  const { cms: _cms, ...rest } = searchParams;
  return rest;
}

export function shouldNoindexBlogListing(
  searchParams?: BlogListingSearchParams | null,
): boolean {
  const params = stripCmsFromBlogListingSearchParams(searchParams);
  if (!params) {
    return false;
  }

  const pagePresent = params.page !== undefined;
  const categoryPresent = params.category !== undefined;
  const anyOtherQuery = Object.entries(params).some(
    ([key, value]) => value !== undefined && key !== 'page' && key !== 'category',
  );

  if (
    categoryPresent
    && !pagePresent
    && !anyOtherQuery
    && typeof params.category === 'string'
    && BLOG_CATEGORIES_WITH_OWN_TEXT.has(params.category)
  ) {
    return false;
  }

  return pagePresent || categoryPresent || anyOtherQuery;
}
