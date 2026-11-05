import 'server-only';

import type { WPPost } from '@/services/wordpress';
import {
  getBlogPostBySlug as getBlogPostBySlugFromWordpress,
  getBlogPosts as getBlogPostsFromWordpress,
  getBlogStaticParams as getBlogStaticParamsFromWordpress,
} from '@/services/wordpress';
import { publicWebpIfPresent } from '@/lib/public-webp-src';
import {
  BLOG_COVER_FALLBACK,
  resolveBlogCoverAlt,
  resolveBlogCoverUrl,
} from '@/lib/blog-cover-image';
import { repairBlogPostYoastCanonical } from '@/utils/blog-yoast-canonical';
import {
  rewriteWpRenderedHtmlFields,
  rewriteWpYoastFields,
} from '@/services/rewrite-in-site-hrefs.mjs';
import {
  findPayloadPostBySlug,
  getBlogPostsFromPayload,
  getBlogStaticParamsFromPayload,
  shouldServeBlogFromPayload,
} from '@/lib/cms-blog.server.ts';
import { isCmsBlogFromPayload } from '@/lib/cms-blog-flag.ts';
import { hasRuntimeDatabase } from '@/lib/cms-database.ts';
import { listStagingLocalBlogStaticParams } from '@/lib/blog-local-posts';

function finalizeBlogPost(post: WPPost): WPPost {
  post.featured_media_url = publicWebpIfPresent(
    resolveBlogCoverUrl(post.slug, post.featured_media_url || BLOG_COVER_FALLBACK),
  );
  post.featured_media_alt = resolveBlogCoverAlt(post.slug, post.featured_media_alt || '');
  return repairBlogPostYoastCanonical(
    rewriteWpYoastFields(rewriteWpRenderedHtmlFields(post)),
  );
}

export async function getBlogPostBySlugForPage(slug: string): Promise<WPPost | null> {
  if (await shouldServeBlogFromPayload()) {
    const fromPayload = await findPayloadPostBySlug(slug);
    if (fromPayload) return finalizeBlogPost(fromPayload);
  }
  return getBlogPostBySlugFromWordpress(slug);
}

export async function getBlogPostsForListing(
  page: number,
  perPage: number,
  categorySlug: string,
): Promise<{ posts: WPPost[]; totalPages: number }> {
  if ((await shouldServeBlogFromPayload()) || isCmsBlogFromPayload()) {
    const fromPayload = await getBlogPostsFromPayload(page, perPage, categorySlug);
    if (fromPayload.posts.length > 0 || (await shouldServeBlogFromPayload())) {
      return fromPayload;
    }
  }
  return getBlogPostsFromWordpress(page, perPage, categorySlug);
}

export async function getBlogStaticParamsForBuild(): Promise<Array<{ slug: string[] }>> {
  if (isCmsBlogFromPayload() && hasRuntimeDatabase()) {
    const fromPayload = await getBlogStaticParamsFromPayload();
    if (fromPayload.length > 0) {
      return [...fromPayload, ...listStagingLocalBlogStaticParams()];
    }
  }
  return getBlogStaticParamsFromWordpress();
}
