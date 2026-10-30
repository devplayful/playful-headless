/** Rutas públicas conocidas: no activar preview 404 Payload con ?cms=1. */
const EXACT_PUBLIC_PATHS = new Set([
  '/',
  '/agencia-shopify',
  '/blog',
  '/blog/q',
  '/casos-de-exito',
  '/contactar-agencia-de-marketing-digital',
  '/firma/alejandra-da-costa',
  '/gracias',
  '/links',
  '/llms-full.txt',
  '/llms.txt',
  '/manifest.webmanifest',
  '/nosotros',
  '/podcast',
  '/politica-de-privacidad',
  '/reunion-playful',
  '/robots.txt',
  '/sitemap.xml',
  '/test-blog',
  '/agencia-diseno-web',
  '/agencia-e-commerce',
  '/agencia-sem',
  '/agencia-seo',
  '/agencia-ux-ui',
  '/marketing-internacional',
  '/seo-expertos',
  '/seo-vigo',
]);

export function normalizePublicPath(pathname: string): string {
  if (!pathname || pathname === '/') return '/';
  return pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
}

export function isKnownPublicAppPath(pathname: string): boolean {
  const path = normalizePublicPath(pathname);
  if (EXACT_PUBLIC_PATHS.has(path)) return true;
  if (path.startsWith('/blog/')) return true;
  if (path.startsWith('/podcast/')) return true;
  if (path.startsWith('/casos-de-exito/')) return true;
  if (path.startsWith('/admin')) return true;
  if (path.startsWith('/api/')) return true;
  if (path.startsWith('/cms-api')) return true;
  if (path.startsWith('/cms-pagina-b5-preview')) return true;
  return false;
}
