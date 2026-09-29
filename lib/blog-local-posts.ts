import type { WPPost } from '@/services/wordpress';
import { CASHEA_COMERCIOS_BLOG_SLUG } from './blog-body-overrides.ts';

/**
 * Next-owned blog posts that are not in WordPress. The post page still
 * runs through `app/blog/[...slug]/page.tsx`; body HTML lives in
 * `blog-body-overrides.ts` (same closed-list pattern as Zelle).
 */
export const CASHEA_COMERCIOS_BLOG_PATH =
  '/blog/tecnologia/cashea-para-comercios';

const TECNOLOGIA_CATEGORY = {
  id: 24,
  slug: 'tecnologia',
  name: 'Tecnología',
  taxonomy: 'category',
} as const;

const CASHEA_PUBLISHED = '2026-09-29T00:00:00.000Z';

export const CASHEA_COMERCIOS_LOCAL_POST: WPPost = {
  id: 900001,
  date: CASHEA_PUBLISHED,
  date_gmt: CASHEA_PUBLISHED,
  modified: CASHEA_PUBLISHED,
  modified_gmt: CASHEA_PUBLISHED,
  slug: CASHEA_COMERCIOS_BLOG_SLUG,
  link: CASHEA_COMERCIOS_BLOG_PATH,
  status: 'publish',
  type: 'post',
  title: { rendered: 'Cashea para comercios: cómo ofrecer cuotas en tu tienda online' },
  excerpt: {
    rendered:
      'Si tu tienda ya vende y tus compradores te preguntan si pueden pagar en cuotas, lo que te toca entender es Cashea para comercios, que no es lo mismo que la app que usan ellos.',
  },
  content: { rendered: '' },
  categories: [{ ...TECNOLOGIA_CATEGORY }],
  author: { id: 0, name: 'Playful Agency', slug: 'playful-agency' },
  author_name: 'Playful Agency',
};

const LOCAL_BLOG_POSTS: Record<string, WPPost> = {
  [CASHEA_COMERCIOS_BLOG_SLUG]: CASHEA_COMERCIOS_LOCAL_POST,
};

export function localBlogPostBySlug(slug: string | undefined | null): WPPost | null {
  if (!slug) return null;
  return LOCAL_BLOG_POSTS[slug] || null;
}

export function localBlogStaticParams(): Array<{ slug: string[] }> {
  return Object.values(LOCAL_BLOG_POSTS).map((post) => ({
    slug: [post.categories?.[0]?.slug || 'tecnologia', post.slug],
  }));
}
