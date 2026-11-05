import { getPayload } from 'payload';
import config from '@payload-config';
import type { WPPost } from '@/services/wordpress';
import { hasRuntimeDatabase } from './cms-database.ts';
import { isCmsBlogFromPayload, resolveRenderBlogFromPayloadServer } from './cms-blog-flag.ts';
import { filterOpenBlogPosts } from '@/utils/blog-closed-paths';
import {
  mergeProductionLocalBlogPosts,
  paginateBlogPosts,
} from '@/lib/blog-local-posts';
import {
  mapPayloadPostDocToWpPost,
  mapPayloadPaginaToWpPage,
  PAGINAS_SUELTAS_PUBLIC_SLUGS,
} from './cms-blog-map.ts';

export {
  mapPayloadPostDocToWpPost,
  mapPayloadPaginaToWpPage,
  PAGINAS_SUELTAS_PUBLIC_SLUGS,
} from './cms-blog-map.ts';

type JsonRecord = Record<string, unknown>;

export async function shouldServeBlogFromPayload(): Promise<boolean> {
  if (!hasRuntimeDatabase()) return false;
  if (isCmsBlogFromPayload()) return true;
  return resolveRenderBlogFromPayloadServer();
}

async function payloadClient() {
  return getPayload({ config });
}

export async function countPayloadPosts(): Promise<number> {
  if (!hasRuntimeDatabase()) return 0;
  try {
    const payload = await payloadClient();
    const found = await payload.find({
      collection: 'posts',
      limit: 0,
      where: { estado: { equals: 'publish' } },
    });
    return found.totalDocs;
  } catch {
    return 0;
  }
}

export async function findPayloadPostBySlug(slug: string): Promise<WPPost | null> {
  if (!(await shouldServeBlogFromPayload())) return null;
  try {
    const payload = await payloadClient();
    const found = await payload.find({
      collection: 'posts',
      where: {
        and: [{ slug: { equals: slug } }, { estado: { equals: 'publish' } }],
      },
      limit: 1,
      depth: 2,
      sort: '-date',
    });
    const doc = found.docs[0];
    if (!doc) return null;
    return mapPayloadPostDocToWpPost(doc as unknown as JsonRecord);
  } catch {
    return null;
  }
}

export async function listPayloadBlogPosts(options: {
  categorySlug?: string;
  page?: number;
  perPage?: number;
} = {}): Promise<{ posts: WPPost[]; totalPages: number; totalDocs: number }> {
  if (!(await shouldServeBlogFromPayload())) {
    return { posts: [], totalPages: 0, totalDocs: 0 };
  }
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? 100));
  try {
    const payload = await payloadClient();
    const where: JsonRecord = { estado: { equals: 'publish' } };
    if (options.categorySlug) {
      const cats = await payload.find({
        collection: 'categorias',
        where: { slug: { equals: options.categorySlug } },
        limit: 1,
        depth: 0,
      });
      const catId = cats.docs[0]?.id;
      if (!catId) {
        return { posts: [], totalPages: 0, totalDocs: 0 };
      }
      where.categoria = { equals: catId };
    }
    const found = await payload.find({
      collection: 'posts',
      where: where as any,
      limit: perPage,
      page,
      depth: 2,
      sort: '-date',
    });
    const posts = found.docs
      .map((doc) => mapPayloadPostDocToWpPost(doc as unknown as JsonRecord))
      .filter((p): p is WPPost => Boolean(p));
    return {
      posts,
      totalPages: found.totalPages,
      totalDocs: found.totalDocs,
    };
  } catch {
    return { posts: [], totalPages: 0, totalDocs: 0 };
  }
}

export async function getBlogPostsFromPayload(
  page: number,
  perPage: number,
  categorySlug: string,
): Promise<{ posts: WPPost[]; totalPages: number }> {
  const all: WPPost[] = [];
  let payloadPage = 1;
  let totalPages = 1;
  do {
    const batch = await listPayloadBlogPosts({
      categorySlug: categorySlug || undefined,
      page: payloadPage,
      perPage: 100,
    });
    all.push(...batch.posts);
    totalPages = batch.totalPages;
    payloadPage += 1;
  } while (payloadPage <= totalPages);

  const merged = filterOpenBlogPosts(
    mergeProductionLocalBlogPosts(all, { categorySlug }),
  );
  return paginateBlogPosts(merged, page, perPage);
}

export async function getBlogStaticParamsFromPayload(): Promise<Array<{ slug: string[] }>> {
  const all: WPPost[] = [];
  let payloadPage = 1;
  let totalPages = 1;
  do {
    const batch = await listPayloadBlogPosts({ page: payloadPage, perPage: 100 });
    all.push(...batch.posts);
    totalPages = batch.totalPages;
    payloadPage += 1;
  } while (payloadPage <= totalPages);

  return filterOpenBlogPosts(all).map((post) => ({
    slug: [post.categories?.[0]?.slug || 'sin-categoria', post.slug],
  }));
}

export async function findPayloadPaginaBySlug(slug: string): Promise<JsonRecord | null> {
  if (!(await shouldServeBlogFromPayload())) return null;
  if (!(PAGINAS_SUELTAS_PUBLIC_SLUGS as readonly string[]).includes(slug)) return null;
  try {
    const payload = await payloadClient();
    const found = await payload.find({
      collection: 'paginas',
      where: {
        and: [{ slug: { equals: slug } }, { estado: { equals: 'publish' } }],
      },
      limit: 1,
      depth: 2,
    });
    const doc = found.docs[0];
    return doc ? (doc as unknown as JsonRecord) : null;
  } catch {
    return null;
  }
}
