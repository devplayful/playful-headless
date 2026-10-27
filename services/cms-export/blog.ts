import type { WPPost } from '@/services/wordpress';
import { filterOpenBlogPosts } from '@/utils/blog-closed-paths';
import { mergeProductionLocalBlogPosts, paginateBlogPosts } from '@/lib/blog-local-posts';
import { loadCmsExportBundle } from './load-bundle';

function mediaFeatured(mediaId?: number, bundle = loadCmsExportBundle()) {
  if (!mediaId) return undefined;
  const m = bundle.mediaById.get(mediaId);
  if (!m?.source_url) return undefined;
  return [{
    id: m.id,
    source_url: m.source_url,
    alt_text: m.alt_text || '',
    media_details: m.media_details,
  }];
}

function categoryTerms(post: any, bundle = loadCmsExportBundle()) {
  const ids: number[] = Array.isArray(post.categories) ? post.categories : [];
  const cats = ids
    .map((id) => bundle.categories.find((c) => c.id === id))
    .filter(Boolean)
    .map((c) => ({ id: c.id, name: c.name, slug: c.slug, taxonomy: 'category' }));
  return [cats, []];
}

function authorEmbedded(post: any, bundle = loadCmsExportBundle()) {
  const authorId = typeof post.author === 'number' ? post.author : post.author?.id;
  const a = bundle.authors.find((u) => u.id === authorId);
  if (!a) return [];
  return [{
    id: a.id,
    name: a.name,
    slug: a.slug,
    url: a.url,
    avatar_urls: a.avatar_urls,
  }];
}

export function exportedPostToWpPost(raw: any): WPPost {
  const featured = mediaFeatured(raw.featured_media);
  const [cats, tags] = categoryTerms(raw);
  const authors = authorEmbedded(raw);
  return {
    ...raw,
    title: raw.title || { rendered: '' },
    content: raw.content || { rendered: '' },
    excerpt: raw.excerpt || { rendered: '' },
    _embedded: {
      'wp:featuredmedia': featured,
      'wp:term': [cats, tags],
      author: authors,
    },
    categories: cats,
    tags,
    author: authors[0] || raw.author,
    author_name: authors[0]?.name,
  } as WPPost;
}

function publishedPosts(): WPPost[] {
  const bundle = loadCmsExportBundle();
  return bundle.posts
    .filter((p) => p.status === 'publish')
    .map(exportedPostToWpPost)
    .sort((a, b) => {
      const da = a.date_gmt || a.date || '';
      const db = b.date_gmt || b.date || '';
      return db.localeCompare(da);
    });
}

export async function getBlogPostsFromExport(
  page: number,
  perPage: number,
  categorySlug: string,
): Promise<{ posts: WPPost[]; totalPages: number }> {
  let posts = publishedPosts();
  if (categorySlug) {
    const cat = loadCmsExportBundle().categories.find((c) => c.slug === categorySlug);
    if (!cat) {
      return paginateBlogPosts(filterOpenBlogPosts(mergeProductionLocalBlogPosts<WPPost>([], { categorySlug })), page, perPage);
    }
    posts = posts.filter((p) => (p.categories || []).some((c: any) => c.id === cat.id || c.slug === categorySlug));
  }
  const merged = filterOpenBlogPosts(mergeProductionLocalBlogPosts(posts, { categorySlug }));
  return paginateBlogPosts(merged, page, perPage);
}

export async function getBlogPostBySlugFromExport(slug: string): Promise<WPPost | null> {
  const raw = loadCmsExportBundle().posts.find((p) => p.slug === slug && p.status === 'publish');
  if (!raw) return null;
  return exportedPostToWpPost(raw);
}

export async function getBlogStaticParamsFromExport(): Promise<Array<{ slug: string[] }>> {
  const posts = filterOpenBlogPosts(publishedPosts());
  return posts.map((post) => ({
    slug: [post.categories?.[0]?.slug || 'sin-categoria', post.slug],
  }));
}
