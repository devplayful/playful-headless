import 'server-only';

import { useNewCmsSource } from '@/lib/cms-source';
import * as wp from './wordpress';
import {
  publicWebpIfPresent,
} from '@/lib/public-webp-src';
import {
  resolveBlogCoverAlt,
  resolveBlogCoverUrl,
} from '@/lib/blog-cover-image';
import { repairBlogPostYoastCanonical } from '@/utils/blog-yoast-canonical';
import {
  rewriteWpRenderedHtmlFields,
  rewriteWpYoastFields,
} from './rewrite-in-site-hrefs.mjs';
import { listStagingLocalBlogStaticParams } from '@/lib/blog-local-posts';

export * from './wordpress';

export async function getBlogPosts(
  page?: number,
  perPage?: number,
  categorySlug?: string,
): Promise<{ posts: wp.WPPost[]; totalPages: number }> {
  if (!useNewCmsSource()) {
    return wp.getBlogPosts(page, perPage, categorySlug);
  }
  const { getBlogPostsFromExport } = await import('./cms-export/blog');
  const fromExport = await getBlogPostsFromExport(page ?? 1, perPage ?? 6, categorySlug ?? '');
  const processedPosts = await wp.hydrateBlogListingPosts(fromExport.posts);
  return { posts: processedPosts, totalPages: fromExport.totalPages };
}

export async function getBlogStaticParams(): Promise<Array<{ slug: string[] }>> {
  if (!useNewCmsSource()) {
    return wp.getBlogStaticParams();
  }
  const { getBlogStaticParamsFromExport } = await import('./cms-export/blog');
  const fromExport = await getBlogStaticParamsFromExport();
  return [...fromExport, ...listStagingLocalBlogStaticParams()];
}

export async function getBlogPostBySlug(slug: string): Promise<wp.WPPost | null> {
  if (!useNewCmsSource()) {
    return wp.getBlogPostBySlug(slug);
  }
  const { getBlogPostBySlugFromExport } = await import('./cms-export/blog');
  const post = await getBlogPostBySlugFromExport(slug);
  if (!post) return null;
  if (post._embedded) {
    if (post._embedded['wp:featuredmedia']?.[0]) {
      const media = post._embedded['wp:featuredmedia'][0];
      post.featured_media_url = media.source_url;
      post.featured_media_alt = media.alt_text || '';
    }
    if (post._embedded.author?.[0]) {
      post.author = post._embedded.author[0];
      post.author_name = post.author.name;
    }
  }
  post.featured_media_url = publicWebpIfPresent(
    resolveBlogCoverUrl(post.slug, post.featured_media_url || ''),
  );
  post.featured_media_alt = resolveBlogCoverAlt(post.slug, post.featured_media_alt || '');
  return repairBlogPostYoastCanonical(
    rewriteWpYoastFields(rewriteWpRenderedHtmlFields(post)),
  );
}

export async function getSuccessStoryBySlug(slug: string): Promise<wp.SuccessStory | null> {
  if (!useNewCmsSource()) {
    return wp.getSuccessStoryBySlug(slug);
  }
  const { getSuccessStoryBySlugFromExport } = await import('./cms-export/casos');
  return getSuccessStoryBySlugFromExport(slug);
}

export async function getAllCaseStudies(): Promise<any[]> {
  if (!useNewCmsSource()) {
    return wp.getAllCaseStudies();
  }
  const { getAllCaseStudiesFromExport } = await import('./cms-export/casos');
  return getAllCaseStudiesFromExport();
}
