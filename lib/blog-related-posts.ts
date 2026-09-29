/** Visible carousel keeps this many cards after dropping the current post. */
export const RELATED_BLOG_CARD_COUNT = 6;
/** Fetch one extra so filtering the current slug/id still fills the carousel. */
export const RELATED_BLOG_FETCH_COUNT = RELATED_BLOG_CARD_COUNT + 1;

export type RelatedBlogPostIdentity = {
  slug?: string | null;
  id?: number | string | null;
  href?: string | null;
};

function normalizeSlug(value: string | null | undefined): string {
  return (value || '').trim();
}

function normalizeId(value: number | string | null | undefined): string {
  if (value == null || value === '') return '';
  return String(value);
}

function hrefSlug(href: string | null | undefined): string {
  if (!href) return '';
  try {
    const path = new URL(href, 'https://playfulagency.com').pathname.replace(/\/$/, '');
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

function isCurrentPost<T extends RelatedBlogPostIdentity>(
  post: T,
  current: RelatedBlogPostIdentity,
): boolean {
  const slug = normalizeSlug(current.slug) || hrefSlug(current.href);
  const id = normalizeId(current.id);
  if (slug && (normalizeSlug(post.slug) === slug || hrefSlug(post.href) === slug)) {
    return true;
  }
  if (id && normalizeId(post.id) === id) {
    return true;
  }
  return false;
}

/**
 * Drop the current post (slug or id) and keep the latest `limit` cards.
 * Caller should request `RELATED_BLOG_FETCH_COUNT` so a self-hit still yields 6.
 */
export function excludeCurrentBlogPost<T extends RelatedBlogPostIdentity>(
  posts: T[],
  current: RelatedBlogPostIdentity,
  limit = RELATED_BLOG_CARD_COUNT,
): T[] {
  return posts.filter((post) => !isCurrentPost(post, current)).slice(0, limit);
}
