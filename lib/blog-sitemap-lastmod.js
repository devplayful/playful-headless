const fs = require('fs');
const path = require('path');

const SNAPSHOT_POSTS_PATH = path.join(__dirname, '..', 'data', 'wp-snapshot', 'collections', 'posts.json');
const MAP_PATH = path.join(__dirname, '..', 'config', 'blog-sitemap-lastmod.json');

/** Production-local posts that are not in the WordPress export yet. */
const LOCAL_BLOG_SITEMAP_LASTMOD = {
  '/blog/tecnologia/cashea-para-comercios': '2026-09-29T00:00:00.000Z',
  // Publicado solo en Next (no está en el export WP publish); fecha alineada con seo-cruce 2810.
  '/blog/seo/migracion-seo-cambiar-de-plataforma-alternativa': '2025-10-28T12:00:00.000Z',
};

const ARTICLE_ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ARTICLE_ISO_WITH_ZONE = /(?:Z|[+-]\d{2}:\d{2})$/i;
const ARTICLE_ISO_ZONELESS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

function toSitemapLastmod(value) {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || ARTICLE_ISO_DATE_ONLY.test(trimmed)) return null;
  if (ARTICLE_ISO_WITH_ZONE.test(trimmed)) return trimmed;
  if (ARTICLE_ISO_ZONELESS.test(trimmed)) return `${trimmed}Z`;
  const timestamp = Date.parse(trimmed);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function loadSnapshotPosts() {
  if (!fs.existsSync(SNAPSHOT_POSTS_PATH)) {
    throw new Error(`Missing snapshot posts at ${SNAPSHOT_POSTS_PATH}`);
  }
  const posts = JSON.parse(fs.readFileSync(SNAPSHOT_POSTS_PATH, 'utf8'));
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('Refusing to build blog sitemap lastmod without snapshot posts');
  }
  return posts;
}

function primaryCategorySlug(post) {
  const categories = post._embedded?.['wp:term']?.[0]
    ?.filter((term) => term.taxonomy === 'category') ?? [];
  return categories[0]?.slug || 'sin-categoria';
}

function buildBlogSitemapLastmodMap(posts) {
  const map = {};
  for (const post of posts) {
    if (!post?.slug) continue;
    const lastmod = toSitemapLastmod(post.modified_gmt || post.date_gmt);
    if (!lastmod) continue;
    const blogPath = `/blog/${primaryCategorySlug(post)}/${post.slug}`;
    map[blogPath] = lastmod;
  }
  return map;
}

async function getBlogSitemapLastmodMap() {
  const posts = loadSnapshotPosts();
  return {
    ...buildBlogSitemapLastmodMap(posts),
    ...LOCAL_BLOG_SITEMAP_LASTMOD,
  };
}

function persistBlogSitemapLastmodMap(map) {
  const sorted = {};
  for (const key of Object.keys(map).sort((left, right) => left.localeCompare(right, 'en'))) {
    sorted[key] = map[key];
  }
  fs.writeFileSync(MAP_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  return sorted;
}

function readBlogSitemapLastmodMap() {
  if (!fs.existsSync(MAP_PATH)) return {};
  return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
}

module.exports = {
  MAP_PATH,
  toSitemapLastmod,
  buildBlogSitemapLastmodMap,
  getBlogSitemapLastmodMap,
  persistBlogSitemapLastmodMap,
  readBlogSitemapLastmodMap,
};
