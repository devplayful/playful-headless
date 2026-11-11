/**
 * Conjunto H6 de 134 URLs públicas:
 * - 118 locs de buildSitemapXml() (builder repo)
 * - 9 rutas públicas fuera del sitemap (QA extras)
 * - 7 orígenes del cruce SEO blog (301; fuera del sitemap tras H7)
 * Ver docs/payload/h6-qa-134.md (118 + 9 + 7 = 134).
 */
import { buildSitemapXml } from '../utils/apex-sitemap.ts';
import seoCruce2810Redirects from '../utils/seo-cruce-2810-redirect-map.json' with { type: 'json' };

const SEO_CRUCE_BLOG_QA_PATHS = Object.keys(seoCruce2810Redirects).filter((p) =>
  p.startsWith('/blog/'),
);

const QA_EXTRAS = [
  '/links',
  '/reunion-playful',
  '/gracias',
  '/blog/q',
  '/podcast',
  '/marketing-internacional',
  '/seo-expertos',
  '/firma/alejandra-da-costa',
  '/test-blog',
];

export function buildH6QaPaths() {
  const xml = buildSitemapXml();
  const fromSitemap = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
    const u = new URL(m[1]);
    return u.pathname === '/' ? '/' : u.pathname.replace(/\/+$/, '') || '/';
  });
  const set = new Set(fromSitemap);
  for (const p of QA_EXTRAS) set.add(p);
  for (const p of SEO_CRUCE_BLOG_QA_PATHS) set.add(p);
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function cmsPreviewRewriteExpected(path) {
  if (path === '/') return 'home-payload-preview';
  if (path === '/casos-de-exito') return 'casos-hub-payload';
  if (path.startsWith('/casos-de-exito/')) {
    const slug = path.slice('/casos-de-exito/'.length);
    const publicSlugs = new Set([
      'soytechno-ecommerce-venezuela',
      'jumex-shopify-dtc-ecommerce',
      'odwalla-shopify-dtc-ecommerce',
    ]);
    if (publicSlugs.has(slug)) return 'caso-payload';
  }
  const rootSlug = path.startsWith('/') && path.indexOf('/', 1) === -1 ? path.slice(1) : '';
  const servicios = new Set([
    'agencia-seo',
    'agencia-sem',
    'agencia-diseno-web',
    'agencia-e-commerce',
    'agencia-ux-ui',
    'agencia-shopify',
  ]);
  if (servicios.has(rootSlug)) return 'servicio-payload';
  if (rootSlug === 'politica-de-privacidad') return 'pagina-b1-payload';
  if (rootSlug === 'contactar-agencia-de-marketing-digital') return 'pagina-b4-payload';
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const paths = buildH6QaPaths();
  console.log(JSON.stringify({ count: paths.length, paths }, null, 2));
}
