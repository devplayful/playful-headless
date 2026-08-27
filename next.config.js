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
  // 301s for retired WordPress paths (QA 2026-08-27).
  // Both slash variants listed so /path and /path/ permanently redirect.
  async redirects() {
    return [
      {
        source: '/servicios',
        destination: '/agencia-e-commerce',
        permanent: true,
      },
      {
        source: '/servicios/',
        destination: '/agencia-e-commerce',
        permanent: true,
      },
      {
        source: '/services',
        destination: '/agencia-e-commerce',
        permanent: true,
      },
      {
        source: '/services/',
        destination: '/agencia-e-commerce',
        permanent: true,
      },
      {
        source: '/contacto',
        destination: '/contactar-agencia-de-marketing-digital',
        permanent: true,
      },
      {
        source: '/contacto/',
        destination: '/contactar-agencia-de-marketing-digital',
        permanent: true,
      },
      {
        source: '/casos',
        destination: '/casos-de-exito-agencia-de-marketing-digital',
        permanent: true,
      },
      {
        source: '/casos/',
        destination: '/casos-de-exito-agencia-de-marketing-digital',
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
