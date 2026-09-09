type BlogListingSearchParams = {
  [key: string]: string | string[] | undefined;
};

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

  return pagePresent || categoryPresent || anyOtherQuery;
}
