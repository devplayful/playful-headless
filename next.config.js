const {
  getBlogCategoryRedirects,
  persistBlogCategoryRedirectMap,
} = require('./lib/blog-category-redirects');
const {
  getBlogSitemapLastmodMap,
  persistBlogSitemapLastmodMap,
} = require('./lib/blog-sitemap-lastmod');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Trailing-slash variants are 301'd by middleware in the same single hop as
  // the legacy redirects (Next's built-in 308 made slash → 308 → 301 chains).
  skipTrailingSlashRedirect: true,
  experimental: {
    // 404 global con layout de la web pública (app/global-not-found.tsx):
    // necesario porque Payload añade un segundo layout raíz.
    globalNotFound: true,
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
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
    const agencyCache = {
      key: 'Cache-Control',
      value: 'public, s-maxage=3600, stale-while-revalidate=86400',
    };
    const noIndex = { key: 'X-Robots-Tag', value: 'noindex, nofollow' };
    return [
      { source: '/firma/:path*', headers: [noIndex] },
      { source: '/images/firmas/:path*', headers: [noIndex] },
      {
        source:
          '/:slug(agencia-e-commerce|agencia-seo|agencia-sem|agencia-diseno-web|agencia-ux-ui|marketing-internacional|seo-expertos|seo-vigo)',
        headers: [agencyCache],
      },
      {
        source: '/casos-de-exito',
        headers: [agencyCache],
      },
      {
        source: '/casos-de-exito/:path*',
        headers: [agencyCache],
      },
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
      persistBlogSitemapLastmodMap(await getBlogSitemapLastmodMap());
    }
    return [];
  },
};

// Payload v3 (CMS en /admin y /cms-api). withPayload solo añade alias y
// paquetes externos de servidor; no cambia rutas ni cabeceras de la web.
const { withPayload } = require('@payloadcms/next/withPayload');

module.exports = withPayload(nextConfig, { devBundleServerPackages: false });
