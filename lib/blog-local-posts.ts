import type { WPPost } from '@/services/wordpress';
import {
  MIGRACION_SEO_ALT_BLOG_PATH,
  MIGRACION_SEO_ALT_BLOG_SLUG,
} from './blog-body-overrides.ts';

/**
 * Next-owned blog posts that are not in WordPress. The post page still
 * runs through `app/blog/[...slug]/page.tsx`; body HTML lives in
 * `blog-body-overrides.ts` (same closed-list pattern as Zelle).
 */
const SEO_CATEGORY = {
  id: 6,
  slug: 'seo',
  name: 'Seo',
  taxonomy: 'category',
} as const;

const MIGRACION_PUBLISHED = '2026-09-29T00:00:00.000Z';

export const MIGRACION_SEO_ALT_LOCAL_POST: WPPost = {
  id: 900002,
  date: MIGRACION_PUBLISHED,
  date_gmt: MIGRACION_PUBLISHED,
  modified: MIGRACION_PUBLISHED,
  modified_gmt: MIGRACION_PUBLISHED,
  slug: MIGRACION_SEO_ALT_BLOG_SLUG,
  link: MIGRACION_SEO_ALT_BLOG_PATH,
  status: 'publish',
  type: 'post',
  title: { rendered: 'Cómo hacer una migración SEO al cambiar de plataforma de tienda online' },
  excerpt: {
    rendered:
      'Si tu tienda online ya aparece en Google y estás por cambiar de plataforma, necesitas una migración SEO, porque lo que está en juego no es el diseño ni el catálogo.',
  },
  content: { rendered: '' },
  categories: [{ ...SEO_CATEGORY }],
  author: { id: 0, name: 'Playful Agency', slug: 'playful-agency' },
  author_name: 'Playful Agency',
};

const LOCAL_BLOG_POSTS: Record<string, WPPost> = {
  [MIGRACION_SEO_ALT_BLOG_SLUG]: MIGRACION_SEO_ALT_LOCAL_POST,
};

export function localBlogPostBySlug(slug: string | undefined | null): WPPost | null {
  if (!slug) return null;
  return LOCAL_BLOG_POSTS[slug] || null;
}

export function localBlogStaticParams(): Array<{ slug: string[] }> {
  return Object.values(LOCAL_BLOG_POSTS).map((post) => ({
    slug: [post.categories?.[0]?.slug || 'seo', post.slug],
  }));
}
