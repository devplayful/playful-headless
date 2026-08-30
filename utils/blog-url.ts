import type { WPPost } from '@/services/wordpress';

const FALLBACK_CATEGORY = 'sin-categoria';

export function getPrimaryCategorySlug(post: Pick<WPPost, 'categories'>): string {
  return post.categories?.[0]?.slug || FALLBACK_CATEGORY;
}

export function blogPostPath(post: Pick<WPPost, 'categories' | 'slug'>): string {
  return `/blog/${getPrimaryCategorySlug(post)}/${post.slug}`;
}
