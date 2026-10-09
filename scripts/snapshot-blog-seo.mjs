/**
 * Dump the SEO-visible fields that /blog and selected posts render.
 * Used to diff listing/article payloads before vs after the WP REST slim.
 *
 *   node --experimental-strip-types scripts/snapshot-blog-seo.mjs > /tmp/blog-seo.json
 */
import { writeFileSync } from 'node:fs';
import { getBlogPostBySlug, getBlogPosts, getRelatedBlogPostsForPost } from '../services/wordpress.ts';
import { blogPostPath, getPrimaryCategorySlug } from '../utils/blog-url.ts';
import { canonicalForPath } from '../utils/canonical.ts';
import { blogCoverForSlug } from '../lib/blog-cover-image.ts';
import { formatBlogListingDate, resolveBlogEditorialUpdate } from '../lib/blog-editorial-meta.ts';
import { excludeCurrentBlogPost } from '../lib/blog-related-posts.ts';

const SAMPLE_SLUGS = [
  '5-plataformas-para-email-marketing-efectivo',
  'como-elegir-el-mejor-framework-para-tu-web',
  'como-posicionar-tu-negocio-en-google-ads',
  'analitica-web-que-es-como-puede-ayudar-a-mi-marca',
  'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
];

function listingCard(post) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title?.rendered,
    excerpt: (post.excerpt?.rendered ?? '').replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 160),
    path: blogPostPath(post),
    category: post.categories?.[0]?.name || null,
    categorySlug: getPrimaryCategorySlug(post),
    author: post.author_name || (typeof post.author === 'object' ? post.author?.name : null) || 'Playful Agency',
    date: formatBlogListingDate(post.slug, {
      published: post.date,
      publishedGmt: post.date_gmt,
      modified: post.modified,
      modifiedGmt: post.modified_gmt,
    }),
    image: blogCoverForSlug(post.slug) || post.featured_media_url || '',
    imageAlt: post.featured_media_alt || post.title?.rendered || '',
  };
}

async function articleSnapshot(slug) {
  const post = await getBlogPostBySlug(slug);
  if (!post) return { slug, missing: true };
  const category = getPrimaryCategorySlug(post);
  const related = excludeCurrentBlogPost(
    await getRelatedBlogPostsForPost(post, { categorySlug: category }),
    { slug: post.slug, id: post.id },
  );
  const editorial = resolveBlogEditorialUpdate(post.slug, {
    published: post.date,
    publishedGmt: post.date_gmt,
    modified: post.modified,
    modifiedGmt: post.modified_gmt,
  });
  const authorName =
    (post.author && typeof post.author === 'object' && post.author.name)
    || post.author_name
    || 'Playful Agency';
  return {
    slug: post.slug,
    id: post.id,
    title: post.title?.rendered,
    h1: post.title?.rendered,
    excerpt: (post.excerpt?.rendered ?? '').replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 200),
    contentChars: (post.content?.rendered ?? '').length,
    contentHash: (post.content?.rendered ?? '').length,
    path: blogPostPath(post),
    canonical: canonicalForPath(blogPostPath(post)),
    category,
    categoryName: post.categories?.[0]?.name || null,
    author: authorName,
    date: post.date,
    dateGmt: post.date_gmt,
    modified: post.modified,
    modifiedGmt: post.modified_gmt,
    editorialUpdatedAt: editorial?.updatedAt || null,
    image: blogCoverForSlug(post.slug) || post.featured_media_url || '',
    imageAlt: post.featured_media_alt || post.title?.rendered || '',
    related: related.map((card) => ({
      slug: card.slug,
      href: card.href,
      title: card.title,
      date: card.date,
      imageUrl: card.imageUrl,
      category: card.category,
    })),
  };
}

const listing = await getBlogPosts(1, 10);
const snapshot = {
  capturedAt: new Date().toISOString(),
  listing: {
    totalPages: listing.totalPages,
    posts: listing.posts.map(listingCard),
  },
  articles: await Promise.all(SAMPLE_SLUGS.map(articleSnapshot)),
};

const out = process.argv[2];
const json = `${JSON.stringify(snapshot, null, 2)}\n`;
if (out) writeFileSync(out, json);
else process.stdout.write(json);
