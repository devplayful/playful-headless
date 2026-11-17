import { getPayload } from 'payload';
import config from '@payload-config';
import {
  getBlogPostBySlug as getBlogPostBySlugSnapshot,
  getBlogPosts as getBlogPostsSnapshot,
  getBlogStaticParams as getBlogStaticParamsSnapshot,
  getLatestBlogPosts as getLatestBlogPostsSnapshot,
  getRelatedBlogPostsForPost as getRelatedBlogPostsSnapshot,
  relatedBlogCardsFromPosts,
  type WPPost,
} from '@/services/wordpress';
import type { RelatedBlogCard } from '@/services/wordpress';
import { hasRuntimeDatabase } from './cms-database.ts';
import { withPayloadOrSnapshot } from './cms-fallback.ts';
import { shouldRenderBlogFromPayload } from './cms-blog-flag.ts';
import { applyBlobImagesToUrl } from './blob-image-render.ts';

function mapPayloadPost(doc: Record<string, unknown>): WPPost | null {
  const slug = typeof doc.slug === 'string' ? doc.slug : '';
  if (!slug) return null;
  const titulo = typeof doc.titulo === 'string' ? doc.titulo : slug;
  const content = typeof doc.contentHtml === 'string' ? doc.contentHtml : '';
  const extracto = typeof doc.extracto === 'string' ? doc.extracto : '';
  let featured = '';
  if (doc.imagenDestacada && typeof doc.imagenDestacada === 'object') {
    const media = doc.imagenDestacada as Record<string, unknown>;
    if (typeof media.url === 'string') featured = applyBlobImagesToUrl(media.url);
  }
  return {
    id: typeof doc.wpId === 'number' ? doc.wpId : 0,
    slug,
    date: typeof doc.wpDate === 'string' ? doc.wpDate : '',
    modified: typeof doc.modifiedGmt === 'string' ? String(doc.modifiedGmt) : '',
    title: { rendered: titulo },
    excerpt: { rendered: extracto },
    content: { rendered: content },
    featured_media_url: featured,
    featured_media_alt: '',
    yoast_head_json: (doc.yoast as WPPost['yoast_head_json']) ?? {},
  } as WPPost;
}

async function findPayloadPosts(limit = 20, page = 1): Promise<WPPost[]> {
  if (!hasRuntimeDatabase()) return [];
  const payload = await getPayload({ config });
  const found = await payload.find({
    collection: 'posts',
    where: { estado: { equals: 'publish' } },
    limit,
    page,
    depth: 2,
  });
  return found.docs
    .map((doc) => mapPayloadPost(doc as unknown as Record<string, unknown>))
    .filter((p): p is WPPost => Boolean(p));
}

export async function getBlogPostsWithCms(
  page = 1,
  perPage = 6,
  categorySlug = '',
  options: { renderFromPayload?: boolean } = {},
): Promise<{ posts: WPPost[]; totalPages: number }> {
  const fromPayload = options.renderFromPayload ?? shouldRenderBlogFromPayload(false);
  return withPayloadOrSnapshot(
    fromPayload,
    async () => {
      const items = await findPayloadPosts(perPage, page);
      if (categorySlug) {
        return { posts: items, totalPages: 1 };
      }
      return { posts: items, totalPages: Math.max(1, Math.ceil(items.length / perPage) || 1) };
    },
    () => getBlogPostsSnapshot(page, perPage, categorySlug),
  );
}

export async function getBlogPostBySlugWithCms(
  slug: string,
  options: { renderFromPayload?: boolean } = {},
): Promise<WPPost | null> {
  const fromPayload = options.renderFromPayload ?? shouldRenderBlogFromPayload(false);
  return withPayloadOrSnapshot(
    fromPayload,
    async () => {
      if (!hasRuntimeDatabase()) return null;
      const payload = await getPayload({ config });
      const found = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 2,
      });
      const doc = found.docs[0];
      return doc ? mapPayloadPost(doc as unknown as Record<string, unknown>) : null;
    },
    () => getBlogPostBySlugSnapshot(slug),
  );
}

export async function getLatestBlogPostsWithCms(
  count: number,
  options: { renderFromPayload?: boolean } = {},
): Promise<RelatedBlogCard[]> {
  const fromPayload = options.renderFromPayload ?? shouldRenderBlogFromPayload(false);
  return withPayloadOrSnapshot(
    fromPayload,
    async () => {
      const posts = await findPayloadPosts(count, 1);
      return relatedBlogCardsFromPosts(posts, count);
    },
    () => getLatestBlogPostsSnapshot(count),
  );
}

export async function getBlogStaticParamsWithCms(): Promise<Array<{ slug: string[] }>> {
  return getBlogStaticParamsSnapshot();
}

export async function getRelatedBlogPostsForPostWithCms(
  post: Pick<WPPost, 'id' | 'slug' | 'acf' | 'meta' | 'categories'>,
  options: { latest?: RelatedBlogCard[]; categorySlug?: string; renderFromPayload?: boolean } = {},
): Promise<RelatedBlogCard[]> {
  const fromPayload = options.renderFromPayload ?? shouldRenderBlogFromPayload(false);
  return withPayloadOrSnapshot(
    fromPayload,
    async () => options.latest ?? [],
    () => getRelatedBlogPostsSnapshot(post, options),
  );
}