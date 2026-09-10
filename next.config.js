const {
  getBlogCategoryRedirects,
  persistBlogCategoryRedirectMap,
} = require('./lib/blog-category-redirects');

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
    // Inventory is still fetched so a release cannot ship without it.
    // Runtime hops live in middleware so category + AMP junk is one redirect.
    const rules = await getBlogCategoryRedirects();
    if (!process.env.NODE_TEST_CONTEXT) {
      persistBlogCategoryRedirectMap(rules);
    }
    return [];
  },
};

module.exports = nextConfig;
