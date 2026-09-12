import type { WPPost } from '@/services/wordpress';

const FALLBACK_CATEGORY = 'sin-categoria';

export function getPrimaryCategorySlug(post: Pick<WPPost, 'categories'>): string {
  return post.categories?.[0]?.slug || FALLBACK_CATEGORY;
}

export function blogPostPath(post: Pick<WPPost, 'categories' | 'slug'>): string {
  return `/blog/${getPrimaryCategorySlug(post)}/${post.slug}`;
}

/**
 * Client-navigation target for the /blog listing.
 * Page 1 omits `page` so the hub stays `/blog` (or `/blog?category=` only).
 * Do not render this string as a crawlable href for page/category queries.
 */
export function blogListingPath({
  page,
  category,
}: {
  page?: number;
  category?: string;
} = {}): string {
  const params = new URLSearchParams();
  if (typeof page === 'number' && page > 1) {
    params.set('page', String(page));
  }
  if (category) {
    params.set('category', category);
  }
  const query = params.toString();
  return query ? `/blog?${query}` : '/blog';
}
