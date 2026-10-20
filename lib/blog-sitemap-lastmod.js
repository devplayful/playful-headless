const fs = require('fs');
const path = require('path');

const WORDPRESS_POSTS_URL = 'https://endpoint.playfulagency.com/wp-json/wp/v2/posts';
const WORDPRESS_RETRYABLE_STATUS = new Set([408, 425, 429]);
const WORDPRESS_ATTEMPT_TIMEOUT_MS = 8_000;
const MAP_PATH = path.join(__dirname, '..', 'config', 'blog-sitemap-lastmod.json');

/** Production-local posts that are not in the WordPress export yet. */
const LOCAL_BLOG_SITEMAP_LASTMOD = {
  '/blog/tecnologia/cashea-para-comercios': '2026-09-29T00:00:00.000Z',
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

async function fetchWordPressPage(page, attempts = 3) {
  const url = new URL(WORDPRESS_POSTS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', '100');
  url.searchParams.set('status', 'publish');
  url.searchParams.set('_embed', 'wp:term');
  url.searchParams.set('_fields', 'slug,modified,modified_gmt,_links,_embedded');

  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    let stopRetrying = false;
    let response;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), WORDPRESS_ATTEMPT_TIMEOUT_MS);
    try {
      response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      if (response.status === 200) {
        const body = await response.arrayBuffer();
        const posts = JSON.parse(new TextDecoder().decode(body));
        if (!Array.isArray(posts)) {
          throw new Error('WordPress posts response was not a collection');
        }
        return { posts, response };
      }

      const error = new Error(`WordPress posts request failed with ${response.status}`);
      const retryable = WORDPRESS_RETRYABLE_STATUS.has(response.status)
        || (response.status >= 500 && response.status <= 599);
      lastError = error;
      stopRetrying = !retryable;
      await response.body?.cancel().catch(() => {});
    } catch (error) {
      await response?.body?.cancel().catch(() => {});
      lastError = new Error(
        `WordPress sitemap lastmod request failed on attempt ${attempt}/${attempts}`,
        { cause: error },
      );
    } finally {
      clearTimeout(timeout);
    }

    if (stopRetrying) throw lastError;

    if (attempt < attempts) {
      const backoff = 250 * (2 ** (attempt - 1));
      const jitter = Math.floor(Math.random() * 150);
      await new Promise((resolve) => setTimeout(resolve, backoff + jitter));
    }
  }

  throw lastError ?? new Error('WordPress posts request failed');
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
    const lastmod = toSitemapLastmod(post.modified_gmt || post.modified);
    if (!lastmod) continue;
    const blogPath = `/blog/${primaryCategorySlug(post)}/${post.slug}`;
    map[blogPath] = lastmod;
  }
  return map;
}

async function getBlogSitemapLastmodMap() {
  const posts = [];
  let page = 1;
  let totalPages = 1;

  do {
    const { posts: pagePosts, response } = await fetchWordPressPage(page);
    totalPages = Number(response.headers.get('x-wp-totalpages') || '1');
    posts.push(...pagePosts);
    page += 1;
  } while (page <= totalPages);

  if (posts.length === 0) {
    throw new Error('Refusing to build blog sitemap lastmod without WordPress posts');
  }

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
