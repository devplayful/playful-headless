const WORDPRESS_POSTS_URL = 'https://endpoint.playfulagency.com/wp-json/wp/v2/posts';
const WORDPRESS_RETRYABLE_STATUS = new Set([408, 425, 429]);
const WORDPRESS_ATTEMPT_TIMEOUT_MS = 8_000;

async function fetchWordPressPage(page, attempts = 3) {
  const url = new URL(WORDPRESS_POSTS_URL);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', '100');
  url.searchParams.set('_embed', 'wp:term');
  // WordPress requires `_links` for `_embedded` expansion. These are the only
  // response fields needed to derive category redirects; excluding full post
  // bodies keeps the response safely below Next's 2 MB data-cache ceiling.
  url.searchParams.set('_fields', 'slug,_links,_embedded');

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
        // Reading and parsing are part of the attempt. fetch() may resolve as
        // soon as headers arrive while the response body later stalls/fails.
        const posts = await response.json();
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
        `WordPress redirect inventory request failed on attempt ${attempt}/${attempts}`,
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

async function getBlogCategoryRedirects() {
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
    throw new Error('Refusing to build without the WordPress blog redirect inventory');
  }

  const redirects = new Map();

  for (const post of posts) {
    const categories = post._embedded?.['wp:term']?.[0]
      ?.filter((term) => term.taxonomy === 'category') ?? [];
    const primaryCategory = categories[0]?.slug || 'sin-categoria';
    const destination = `/blog/${primaryCategory}/${post.slug}`;

    for (const category of categories.slice(1)) {
      if (!category.slug || category.slug === primaryCategory) continue;
      redirects.set(`/blog/${category.slug}/${post.slug}`, destination);
    }
  }

  return [...redirects.entries()].map(([source, destination]) => ({
    source,
    destination,
    permanent: true,
  }));
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // WordPress is a small shared origin. Keep static generation deliberately
    // tightly bounded so a release cannot create the burst of REST calls
    // that previously produced transient 500s and false 404 pages.
    staticGenerationMaxConcurrency: 2,
    staticGenerationMinPagesPerWorker: 1_000,
    // The WordPress request layer owns the retry budget. Keep a single page
    // generation attempt so Next does not multiply those origin requests.
    staticGenerationRetryCount: 1,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'endpoint.playfulagency.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    // Opcional: Configura tamaños de imagen para diferentes breakpoints
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Opcional: Configura formatos de imagen soportados
    formats: ['image/avif', 'image/webp'],
  },
  // Opcional: Configuración de cabeceras de seguridad
  async headers() {
    return [
      {
        // Aplica estas cabeceras a todas las rutas
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async redirects() {
    return getBlogCategoryRedirects();
  },
};

module.exports = nextConfig;
