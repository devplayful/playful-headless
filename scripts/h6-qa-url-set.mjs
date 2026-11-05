/**
 * Conjunto H6 de 134 URLs públicas:
 * - 124 locs de buildSitemapXml() (123 indexables + 1 post staging eshow en código)
 * - 10 rutas públicas fuera del sitemap (links, funnel, slugs WP extra, QA)
 */
import { buildSitemapXml } from '../utils/apex-sitemap.ts';

const QA_EXTRAS = [
  '/links',
  '/reunion-playful',
  '/gracias',
  '/blog/q',
  '/podcast',
  '/marketing-internacional',
  '/seo-expertos',
  '/seo-vigo',
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
  return [...set].sort((a, b) => a.localeCompare(b));
}

/** HTTP redirect codes probed without following (redirect: manual). */
export const H6_REDIRECT_STATUSES = new Set([301, 302, 307, 308]);

export function isH6RedirectStatus(status) {
  return H6_REDIRECT_STATUSES.has(status);
}

export function isVercelPreviewAuthLocation(location) {
  if (!location) return false;
  if (/_vercel_jwt/i.test(location)) return true;
  try {
    const u = new URL(location, 'https://playfulagency.com');
    return /vercel\.com/i.test(u.hostname) && /\/sso/i.test(u.pathname);
  } catch {
    return /vercel\.com\/sso/i.test(location);
  }
}

export function isVercelPreviewAuthBody(html) {
  return /Protected by Vercel Authentication|Authentication Required|vercel\.com\/login/i.test(
    html || '',
  );
}

/**
 * Classify a single manual-redirect fetch (prod or preview).
 * @returns {{ probeStatus: 'OK'|'REDIRECT'|'PREVIEW_BLOCKED', location: string|null, note: string|null }}
 */
export function classifyH6ProbeResponse(status, locationHeader, html) {
  const location = (locationHeader || '').trim() || null;
  if (isH6RedirectStatus(status)) {
    if (isVercelPreviewAuthLocation(location)) {
      return {
        probeStatus: 'PREVIEW_BLOCKED',
        location,
        note: `HTTP ${status} → ${location} (Vercel Authentication)`,
      };
    }
    return {
      probeStatus: 'REDIRECT',
      location,
      note: `HTTP ${status} → ${location || '(sin Location)'}`,
    };
  }
  if (status === 401 || status === 403 || isVercelPreviewAuthBody(html)) {
    return {
      probeStatus: 'PREVIEW_BLOCKED',
      location,
      note: `HTTP ${status}: Protected by Vercel Authentication`,
    };
  }
  return { probeStatus: 'OK', location: null, note: null };
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
  if (rootSlug === 'reunion-playful') return 'pagina-b4-payload';
  return null;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const paths = buildH6QaPaths();
  console.log(JSON.stringify({ count: paths.length, paths }, null, 2));
}
