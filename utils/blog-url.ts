import type { WPPost } from '@/services/wordpress';
import { remapCanibalizacionHref } from './blog-canibalizacion-redirects.ts';

const FALLBACK_CATEGORY = 'sin-categoria';

/** Slugs the listing chips already navigate with `blogListingPath({ category })`. */
export const BLOG_LISTING_CATEGORY_SLUGS = [
  'e-commerce',
  'email-marketing',
  'mas-vistos',
  'otros',
  'pautas-digitales',
  'seo',
  'tecnologia',
] as const;

const BLOG_LISTING_CATEGORY_SLUG_SET = new Set<string>(BLOG_LISTING_CATEGORY_SLUGS);

export function blogCategoryIndexSlug(pathname: string): string | null {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 2 && parts[0] === 'blog' && BLOG_LISTING_CATEGORY_SLUG_SET.has(parts[1])) {
    return parts[1];
  }
  return null;
}

export function getPrimaryCategorySlug(post: Pick<WPPost, 'categories'>): string {
  return post.categories?.[0]?.slug || FALLBACK_CATEGORY;
}

export function blogPostPath(post: Pick<WPPost, 'categories' | 'slug'>): string {
  return remapCanibalizacionHref(`/blog/${getPrimaryCategorySlug(post)}/${post.slug}`);
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
