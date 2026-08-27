/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Next.js 15 applies an automatic 308 on /path/ before redirects(), so
  // /servicios/ would never hit the 301 below unless we handle slashes ourselves.
  skipTrailingSlashRedirect: true,
  // 301s for retired WordPress paths (QA 2026-08-27).
  // statusCode: 301 (Next 15 permanent:true emits 308, not 301).
  async redirects() {
    return [
      {
        source: '/servicios',
        destination: '/agencia-e-commerce',
        statusCode: 301,
      },
      {
        source: '/servicios/',
        destination: '/agencia-e-commerce',
        statusCode: 301,
      },
      {
        source: '/services',
        destination: '/agencia-e-commerce',
        statusCode: 301,
      },
      {
        source: '/services/',
        destination: '/agencia-e-commerce',
        statusCode: 301,
      },
      {
        source: '/contacto',
        destination: '/contactar-agencia-de-marketing-digital',
        statusCode: 301,
      },
      {
        source: '/contacto/',
        destination: '/contactar-agencia-de-marketing-digital',
        statusCode: 301,
      },
      {
        source: '/casos',
        destination: '/casos-de-exito-agencia-de-marketing-digital',
        statusCode: 301,
      },
      {
        source: '/casos/',
        destination: '/casos-de-exito-agencia-de-marketing-digital',
        statusCode: 301,
      },
      // Preserve default Next trailing-slash 308 for every other path.
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
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
};

module.exports = nextConfig;
