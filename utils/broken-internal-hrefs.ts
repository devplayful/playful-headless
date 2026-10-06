/**
 * Reversible href rewrite for dead internal destinations in WordPress HTML.
 * Changes only the URL. Never touches anchor text. Does not edit WordPress.
 *
 * Source: playful-copy PR #182 (SHA 407d77a) — mapa de enlaces internos.
 * Out of scope: /landing-seo, unpublished landings, cannibalization origins.
 */

import { SITEMAP_BLOG_PATHS } from './apex-sitemap.ts';
import { CLOSED_BLOG_PATHS, isClosedBlogPath, normalizeBlogPath } from './blog-closed-paths.ts';

export const CONTACT_HREF = '/contactar-agencia-de-marketing-digital';
export const AGENCIA_SEO_HREF = '/agencia-seo';
export const AGENCIA_SEM_HREF = '/agencia-sem';
export const AGENCIA_DISENO_HREF = '/agencia-diseno-web';
export const AGENCIA_ECOMMERCE_HREF = '/agencia-e-commerce';

/** Do not rewrite these, even if they 404 today. */
export const SKIP_BROKEN_HREF_PATHS = Object.freeze([
  '/landing-seo',
  '/pasarela-de-pagos-venezuela',
  '/agencia-prestashop',
  '/agencia-woocommerce',
]);

const SKIP_PATH_SET = new Set(SKIP_BROKEN_HREF_PATHS);
const CLOSED_PATH_SET = new Set(CLOSED_BLOG_PATHS);

const IN_SITE_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
]);

/** Form subdomains Contenido maps to a live landing. Email/promo stay listed. */
export const DEAD_FORM_HOST_DEST = Object.freeze({
  'seo.crear.endpoint.playfulagency.com': AGENCIA_SEO_HREF,
  'auditoria-seo.crear.endpoint.playfulagency.com': AGENCIA_SEO_HREF,
});

const DEAD_FORM_HOSTS_UNMAPPED = Object.freeze([
  'emailmarketing.crear.endpoint.playfulagency.com',
  'promociones.crear.endpoint.playfulagency.com',
]);

const WP_ASSET_PREFIXES = ['/wp-content', '/wp-includes', '/wp-json', '/wp-admin'];

/** Path → dest when every source agrees (or the default before a per-slug override). */
export const BROKEN_HREF_DEFAULTS: Readonly<Record<string, string>> = Object.freeze({
  '/servicios/seo': AGENCIA_SEO_HREF,
  '/servicios/desarrollo-web': AGENCIA_DISENO_HREF,
  '/seo': '/blog/seo/aprende-todo-sobre-el-seo',
  '/tipos-de-publicidad-online': '/blog/pautas-digitales/tipos-de-publicidad-online',
  '/6-herramientas-para-crear-informes-seo': '/blog/seo/6-herramientas-para-crear-informes-seo',
  '/7-consejos-seo-para-posicionar-tu-pagina-web': '/blog/seo/7-consejos-seo-para-posicionar-tu-pagina',
  '/email-marketing-una-herramienta-que-no-puedes-dejar-de-usar-en-tu-empresa':
    '/blog/email-marketing/email-marketing-una-herramienta-que-no-puedes-dejar-de-usar-en-tu-empresa',
  '/email-marketing-efectivo-que-todas-las-empresas-deben-usar':
    '/blog/email-marketing/email-marketing-efectivo-que-todas-las-empresas-deben-usar',
  '/blog/pautas-digitales/por-que-debes-hacer-publicidad-digital-en-tu-negocio':
    '/blog/otros/por-que-debes-hacer-publicidad-digital-en-tu-negocio',
  '/por-que-debes-hacer-publicidad-digital-en-tu-negocio':
    '/blog/otros/por-que-debes-hacer-publicidad-digital-en-tu-negocio',
  '/blog/otros/que-es-un-blog': '/blog/seo/que-es-un-blog',
  '/blog/pautas-digitales/implementa-publicidad-online-en-tus-estrategias':
    '/blog/pautas-digitales/tipos-de-publicidad-online',
  '/implementa-publicidad-online-en-tus-estrategias':
    '/blog/pautas-digitales/tipos-de-publicidad-online',
  '/blog/pautas-digitales/que-es-pixel-de-facebook-y-como-te-puede-ayudar-con-tus-campanas':
    '/blog/pautas-digitales/el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas',
  '/blog/seo/blog-seo-aprende-todo-sobre-el-seo': '/blog/seo/aprende-todo-sobre-el-seo',
  '/blog/seo/optimizacion-web': '/blog/seo/consejos-para-la-optimizacion-web',
  '/blog/tecnologia/ecommerce-quiero-tener-mi-negocio-online':
    '/blog/tecnologia/ecommerce-mi-negocio-online',
  '/blog/email-marketing': '/blog?category=email-marketing',
  '/seo-y-sem-que-son-y-en-que-se-diferencian':
    '/blog/seo/seo-y-sem-que-son-y-en-que-se-diferencian',
  '/blog/email-marketing/como-hacer-un-email-marketing-eficaz-durante-la-pandemia':
    '/blog/email-marketing/estrategia-de-email-marketing',
  '/blog/tecnologia/lenguajes-de-programacion-para-que-sirve-y-cuales-son-los-mas-usados':
    '/blog/tecnologia/programacion-web-que-es-como-puede-servirle-a-mi-marca',
});

/** Per-source overrides. `null` = leave (no live dest in the map). */
export const BROKEN_HREF_BY_SOURCE: Readonly<Record<string, Readonly<Record<string, string | null>>>> = Object.freeze({
  'que-es-un-blog': { '/seo': AGENCIA_SEO_HREF },
  'ecommerce-mi-negocio-online': { '/servicios/desarrollo-web': AGENCIA_ECOMMERCE_HREF },
  'el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas': {
    '/servicios/desarrollo-web': null,
    '/servicios/pautas-digitales': null,
  },
  'como-hacer-posicionamiento-web-en-buscadores': {
    '/servicios/pautas-digitales': AGENCIA_SEM_HREF,
  },
  'el-sms-marketing': { '/servicios/pautas-digitales': null },
  'tiktok-ads-ahora-puedes-hacer-publicidad-en-tiktok': { '/servicios/pautas-digitales': null },
  'la-nueva-gestion-de-google-ads': { '/servicios/automatizacion-del-marketing': AGENCIA_SEM_HREF },
  'posicionamiento-organico-vs-pago': { '/servicios/automatizacion-del-marketing': AGENCIA_SEM_HREF },
  '6-herramientas-para-crear-informes-seo': { '/servicios/automatizacion-del-marketing': AGENCIA_SEO_HREF },
  'que-es-la-intencion-de-busqueda-y-cuales-son-sus-beneficios': {
    '/servicios/automatizacion-del-marketing': AGENCIA_SEO_HREF,
  },
  'rich-snippet-ayuda-a-optimizar-tu-web': { '/servicios/automatizacion-del-marketing': AGENCIA_SEO_HREF },
  'haz-email-marketing-como-todo-un-experto-ejemplos': {
    '/servicios/automatizacion-del-marketing': CONTACT_HREF,
  },
  'como-crear-anuncios-en-instagram': { '/servicios/automatizacion-del-marketing': CONTACT_HREF },
  'como-usar-instagram-para-expandir-tu-negocio': {
    '/servicios/automatizacion-del-marketing': CONTACT_HREF,
  },
  'conoce-como-impulsar-tu-marca-online': { '/servicios/automatizacion-del-marketing': CONTACT_HREF },
  'chatbot-inteligencia-artificial-personalizada-para-tu-activo-digital': {
    '/servicios/automatizacion-del-marketing': CONTACT_HREF,
  },
});

/**
 * Broken hrefs the map does not send to a live dest (quitar / contacto o quitar /
 * no equivalent). Render leaves them as-is.
 */
/** Source-specific leftovers: same dest is mapped on other posts. */
export const CONTEXTUAL_UNMAPPED_BROKEN_HREFS = Object.freeze([
  {
    href: '/servicios/desarrollo-web',
    slugs: ['el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas'],
    reason: 'píxel: el mapa dice quitar o contacto',
  },
  {
    href: '/servicios/pautas-digitales',
    slugs: [
      'el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas',
      'el-sms-marketing',
      'tiktok-ads-ahora-puedes-hacer-publicidad-en-tiktok',
    ],
    reason: 'sin landing de pautas; el mapa dice contacto o quitar',
  },
]);

export const UNMAPPED_BROKEN_HREFS = Object.freeze([
  { href: '/e-books/Seo-Local/Playful_Agengy_Ebook_seo_local.pdf', reason: 'ebook ausente; el mapa pide quitar' },
  { href: '/blog/otros/podcast-una-herramienta-de-contenido-para-ganar-autoridad', reason: 'sin post equivalente' },
  { href: '/como-hacer-que-se-enamoren-de-tu-marca', reason: 'sin post equivalente' },
  { href: '/blog/pautas-digitales/actualizaciones-de-instagram', reason: '410; el mapa pide quitar' },
  { href: '/blog/seo/busqueda-por-voz-que-es-y-como-afecta-al-seo', reason: '410; el mapa pide quitar' },
  { href: '/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona', reason: '410; el mapa pide quitar' },
  { href: '/blog/pautas-digitales/porque-tener-un-perfil-empresarial-en-linkedin', reason: '410; el mapa pide quitar' },
  { href: '/google-grants-descubre-que-es-y-como-funciona', reason: 'slug 410; no se revive' },
  { href: '/landing-seo', reason: 'fuera de este PR; espera a SEO' },
  { href: 'https://emailmarketing.crear.endpoint.playfulagency.com/', reason: 'formulario muerto; el mapa dice contacto o quitar' },
  { href: 'https://promociones.crear.endpoint.playfulagency.com/optin1631114756459', reason: 'formulario muerto; el mapa dice contacto o quitar' },
  { href: '/category/tecnologia', reason: 'archivo WP; sin destino vivo claro' },
  { href: '/category/mas-vistos', reason: 'archivo WP; sin destino vivo claro' },
  { href: '/author/stefanniparabavidez', reason: 'autor WP; sin destino vivo claro' },
  { href: '/author/lsantamaria', reason: 'autor WP; sin destino vivo claro' },
  { href: '/author/arosillo', reason: 'autor WP; sin destino vivo claro' },
  { href: '/caso-de-exito-pcm', reason: 'caso ausente del hub' },
  { href: '/project/bottle-mockup', reason: '410 de portafolio; sin destino vivo' },
  { href: '/project/cosmetic-mockup', reason: 'portafolio 404; sin destino vivo' },
  { href: '/project/minimalist-chair', reason: 'portafolio 404; sin destino vivo' },
  { href: '/project/ui-app-template', reason: 'portafolio 404; sin destino vivo' },
  { href: '/project/web-design', reason: 'portafolio 404; sin destino vivo' },
  { href: '/projects', reason: 'archivo de portafolio 404; sin destino vivo' },
]);

const UNMAPPED_PATH_SET = new Set(
  UNMAPPED_BROKEN_HREFS.map((item) => normalizeListedHref(item.href)),
);

export const BROKEN_STATUS_PATHS = Object.freeze([
  ...Object.keys(BROKEN_HREF_DEFAULTS),
  '/servicios/automatizacion-del-marketing',
  '/servicios/pautas-digitales',
  '/seo',
  ...UNMAPPED_BROKEN_HREFS.map((item) => {
    const parsed = parseHref(item.href);
    return parsed?.pathname || item.href;
  }),
  '/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/cintillos-de-promocion',
  '/los-5-problemas-de-e-commerce',
  '/actualizar-tu-e-commerce',
  '/crear-un-e-commerce',
  '/que-es-una-agencia-de-sem',
  '/publicidad-digital-en-tu-negocio',
]);

let liveSlugMap: Record<string, string> | null = null;

export function liveBlogPathBySlug(): Record<string, string> {
  if (liveSlugMap) return liveSlugMap;
  const out: Record<string, string> = {};
  for (const path of SITEMAP_BLOG_PATHS) {
    if (isClosedBlogPath(path)) continue;
    out[path.slice(path.lastIndexOf('/') + 1)] = path;
  }
  liveSlugMap = out;
  return out;
}

export function sourceSlugFromPath(sourcePath: string): string {
  if (!sourcePath) return '';
  const path = sourcePath.split(/[?#]/)[0].replace(/\/+$/, '');
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

type ParsedHref = {
  host: string;
  pathname: string;
  search: string;
  hash: string;
  formDest: string | undefined;
  inSite: boolean;
};

export function parseHref(href: string): ParsedHref | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();
  if (
    trimmed.startsWith('#')
    || lower.startsWith('mailto:')
    || lower.startsWith('tel:')
    || lower.startsWith('javascript:')
  ) {
    return null;
  }

  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const url = absolute.startsWith('/')
      ? new URL(absolute, 'https://playfulagency.com')
      : new URL(absolute);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.replace(/\/+$/, '') || '/';
    const formDest = DEAD_FORM_HOST_DEST[host as keyof typeof DEAD_FORM_HOST_DEST];
    return {
      host,
      pathname,
      search: url.search,
      hash: url.hash,
      formDest,
      inSite: IN_SITE_HOSTS.has(host) || Boolean(formDest) || !url.host,
    };
  } catch {
    try {
      const url = new URL(trimmed, 'https://playfulagency.com');
      const host = url.hostname.toLowerCase();
      const pathname = url.pathname.replace(/\/+$/, '') || '/';
      return {
        host,
        pathname,
        search: url.search,
        hash: url.hash,
        formDest: undefined,
        inSite: IN_SITE_HOSTS.has(host),
      };
    } catch {
      return null;
    }
  }
}

function normalizeListedHref(href: string): string {
  const parsed = parseHref(href);
  if (!parsed) return href;
  if (parsed.formDest) return parsed.host;
  if (DEAD_FORM_HOSTS_UNMAPPED.includes(parsed.host)) return parsed.host;
  return parsed.pathname;
}

function isWpAsset(pathname: string): boolean {
  return WP_ASSET_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function joinDest(dest: string, parsed: ParsedHref): string {
  if (dest.includes('?')) return `${dest}${parsed.hash}`;
  return `${dest}${parsed.search}${parsed.hash}`;
}

function isForbiddenDest(dest: string): boolean {
  const path = dest.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
  return SKIP_PATH_SET.has(path) || CLOSED_PATH_SET.has(path);
}

/**
 * Maps one href to a live in-site path when the Contenido map has a dest.
 * `sourcePath` is the page or post path (or `/${slug}`) for contextual dests.
 */
export function rewriteBrokenInternalHref(href: string, sourcePath = ''): string {
  if (typeof href !== 'string' || !href) return href;
  const parsed = parseHref(href);
  if (!parsed) return href;

  if (parsed.formDest) {
    return joinDest(parsed.formDest, parsed);
  }

  if (DEAD_FORM_HOSTS_UNMAPPED.includes(parsed.host)) return href;
  if (!parsed.inSite) return href;
  if (isWpAsset(parsed.pathname)) return href;
  if (SKIP_PATH_SET.has(parsed.pathname)) return href;

  const slug = sourceSlugFromPath(sourcePath);
  if (slug && Object.prototype.hasOwnProperty.call(BROKEN_HREF_BY_SOURCE, slug)) {
    const override = BROKEN_HREF_BY_SOURCE[slug][parsed.pathname];
    if (override === null) return href;
    if (typeof override === 'string' && !isForbiddenDest(override)) {
      return joinDest(override, parsed);
    }
  }

  const mapped = BROKEN_HREF_DEFAULTS[parsed.pathname];
  if (mapped && !isForbiddenDest(mapped)) {
    return joinDest(mapped, parsed);
  }

  const last = parsed.pathname.split('/').filter(Boolean).pop() || '';
  const live = last ? liveBlogPathBySlug()[last] : '';
  if (live && live !== parsed.pathname && !isForbiddenDest(live)) {
    const segs = parsed.pathname.split('/').filter(Boolean);
    const looksBare = segs.length === 1;
    const looksWrongBlog = segs.length === 3 && segs[0] === 'blog';
    if (looksBare || looksWrongBlog) {
      return joinDest(live, parsed);
    }
  }

  return href;
}

export function rewriteBrokenInternalHrefs(html: string, sourcePath = ''): string {
  if (typeof html !== 'string' || !html) return html;
  return html.replace(/href=(["'])([^"']+)\1/gi, (_full, quote: string, href: string) => {
    return `href=${quote}${rewriteBrokenInternalHref(href, sourcePath)}${quote}`;
  });
}

export function hrefPointsToBrokenStatus(href: string, brokenPaths: Iterable<string>): boolean {
  const parsed = parseHref(href);
  if (!parsed) return false;
  if (parsed.formDest) return false;
  if (DEAD_FORM_HOSTS_UNMAPPED.includes(parsed.host)) return true;
  const set = brokenPaths instanceof Set ? brokenPaths : new Set(brokenPaths);
  return set.has(parsed.pathname);
}

export function listedUnmappedPath(href: string, sourcePath = ''): boolean {
  if (UNMAPPED_PATH_SET.has(normalizeListedHref(href))) return true;
  const parsed = parseHref(href);
  if (!parsed) return false;
  const slug = sourceSlugFromPath(sourcePath);
  return CONTEXTUAL_UNMAPPED_BROKEN_HREFS.some(
    (item) => item.href === parsed.pathname && item.slugs.includes(slug),
  );
}

export function normalizeInternalPath(href: string): string {
  const parsed = parseHref(href);
  return parsed ? parsed.pathname : normalizeBlogPath(href);
}
