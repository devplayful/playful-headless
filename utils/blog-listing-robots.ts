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
export function shouldNoindexBlogListing(
  searchParams?: BlogListingSearchParams | null,
): boolean {
  if (!searchParams) {
    return false;
  }

  const pagePresent = searchParams.page !== undefined;
  const categoryPresent = searchParams.category !== undefined;
  const anyOtherQuery = Object.entries(searchParams).some(
    ([key, value]) => value !== undefined && key !== 'page' && key !== 'category',
  );

  if (
    categoryPresent
    && !pagePresent
    && !anyOtherQuery
    && typeof searchParams.category === 'string'
    && BLOG_CATEGORIES_WITH_OWN_TEXT.has(searchParams.category)
  ) {
    return false;
  }

  return pagePresent || categoryPresent || anyOtherQuery;
}
