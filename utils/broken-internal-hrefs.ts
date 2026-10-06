/**
 * Reversible href rewrite for the closed SEO list (playful-copy PR #182, SHA 407d77a).
 * Changes only the URL, or unwraps the <a> when SEO says «quitar enlace».
 * Never edits WordPress. Skip every rewrite inside the #211 origin posts.
 */

import { SITEMAP_BLOG_PATHS } from './apex-sitemap.ts';
import { CLOSED_BLOG_PATHS, isClosedBlogPath, normalizeBlogPath } from './blog-closed-paths.ts';
import canibalizacionOrigins from './blog-canibalizacion-redirect-map.json' with { type: 'json' };

export const CONTACT_HREF = '/contactar-agencia-de-marketing-digital';
export const AGENCIA_SEO_HREF = '/agencia-seo';
export const AGENCIA_SEM_HREF = '/agencia-sem';
export const AGENCIA_DISENO_HREF = '/agencia-diseno-web';
export const AGENCIA_ECOMMERCE_HREF = '/agencia-e-commerce';
export const AGENCIA_UX_UI_HREF = '/agencia-ux-ui';
export const BLOG_HREF = '/blog';
export const CASOS_HREF = '/casos-de-exito';
export const PUBLICIDAD_DIGITAL_HREF = '/blog/pautas-digitales/publicidad-digital-en-tu-negocio';
export const GUIA_MARKETING_HREF = '/blog/pautas-digitales/guia-para-hacer-marketing-digital';
export const INSTAGRAM_ADS_HREF = '/blog/otros/conoce-todo-sobre-instagram-ads';

export const UNWRAP = null;

/** Posts that #211 redirects today. Do not touch anything inside them. */
export const SKIP_REWRITE_SOURCE_SLUGS = Object.freeze([
  '5-ventajas-para-obtener-clientes-con-facebook-ads',
  'por-que-debes-hacer-publicidad-digital-en-tu-negocio',
  'tipos-de-publicidad-online',
  '7-consejos-seo-para-posicionar-tu-pagina',
  'como-hacer-posicionamiento-web-en-buscadores',
  'todo-sobre-el-seo',
  'como-crear-anuncios-en-instagram',
  'como-hacer-publicidad-en-instagram-en-el-2023',
  'chatbot-inteligencia-artificial-personalizada-para-tu-activo-digital',
]);

export const LANDING_CAROUSEL_SOURCE_SLUGS = Object.freeze([
  'agencia-e-commerce',
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
]);

/** Do not invent dests for unpublished landings. */
export const SKIP_BROKEN_HREF_PATHS = Object.freeze([
  '/pasarela-de-pagos-venezuela',
  '/agencia-prestashop',
  '/agencia-woocommerce',
]);

const SKIP_SOURCE_SET = new Set(SKIP_REWRITE_SOURCE_SLUGS);
const LANDING_SOURCE_SET = new Set(LANDING_CAROUSEL_SOURCE_SLUGS);
const SKIP_PATH_SET = new Set(SKIP_BROKEN_HREF_PATHS);
const CLOSED_PATH_SET = new Set(CLOSED_BLOG_PATHS);

const IN_SITE_HOSTS = new Set([
  'endpoint.playfulagency.com',
  'old.playfulagency.com',
  'playfulagency.com',
  'www.playfulagency.com',
]);

export const DEAD_FORM_HOST_DEST = Object.freeze({
  'seo.crear.endpoint.playfulagency.com': AGENCIA_SEO_HREF,
  'auditoria-seo.crear.endpoint.playfulagency.com': AGENCIA_SEO_HREF,
  'emailmarketing.crear.endpoint.playfulagency.com': CONTACT_HREF,
  'promociones.crear.endpoint.playfulagency.com': CONTACT_HREF,
});

const WP_ASSET_PREFIXES = ['/wp-content', '/wp-includes', '/wp-json', '/wp-admin'];

const GRANTS_SLUG = 'google-grants-descubre-que-es-y-como-funciona';

/** Global dests that every non-skip source agrees on. `null` = unwrap. */
export const BROKEN_HREF_DEFAULTS: Readonly<Record<string, string | null>> = Object.freeze({
  '/landing-seo': AGENCIA_SEO_HREF,
  '/seo': AGENCIA_SEO_HREF,
  /** Post 96 banner (empty alt) and the item-6 text links. Same dest. */
  '/servicios/seo': AGENCIA_SEO_HREF,
  '/servicios/desarrollo-web': AGENCIA_DISENO_HREF,
  '/contactanos': CONTACT_HREF,
  '/blog/pautas-digitales/implementa-publicidad-online-en-tus-estrategias': PUBLICIDAD_DIGITAL_HREF,
  '/implementa-publicidad-online-en-tus-estrategias': PUBLICIDAD_DIGITAL_HREF,
  /** Posts 75 and 60 (items 15 and 23). Same dest. */
  '/blog/pautas-digitales/por-que-debes-hacer-publicidad-digital-en-tu-negocio': PUBLICIDAD_DIGITAL_HREF,
  '/blog/email-marketing/como-hacer-un-email-marketing-eficaz-durante-la-pandemia':
    '/blog/email-marketing/estrategia-de-email-marketing',
  '/blog/tecnologia/lenguajes-de-programacion-para-que-sirve-y-cuales-son-los-mas-usados':
    '/blog/tecnologia/programacion-web-que-es-como-puede-servirle-a-mi-marca',
  '/blog/seo/optimizacion-web': '/blog/seo/consejos-para-la-optimizacion-web',
  '/blog/tecnologia/ecommerce-quiero-tener-mi-negocio-online':
    '/blog/tecnologia/ecommerce-mi-negocio-online',
  '/blog/pautas-digitales/que-es-pixel-de-facebook-y-como-te-puede-ayudar-con-tus-campanas':
    '/blog/pautas-digitales/el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas',
  '/blog/seo/blog-seo-aprende-todo-sobre-el-seo': '/blog/seo/aprende-todo-sobre-el-seo',
  '/6-herramientas-para-crear-informes-seo': '/blog/seo/6-herramientas-para-crear-informes-seo',
  '/blog/otros/que-es-un-blog': '/blog/seo/que-es-un-blog',
  '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads': INSTAGRAM_ADS_HREF,
  '/otros/conoce-todo-sobre-instagram-ads': INSTAGRAM_ADS_HREF,
  '/blog/otros/bad-bunny-como-marca-la-potencia-del-marketing-musical':
    '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
  '/blog/otros/ecosistema-digital-de-tu-marca': '/blog/mas-vistos/ecosistema-digital-de-tu-marca',
  '/blog/otros/quiero-ver-mi-negocio-en-google-maps':
    '/blog/mas-vistos/quiero-ver-mi-negocio-en-google-maps',
  '/blog/otros/todo-lo-que-debes-saber-para-ganar-dinero-con-tiktok':
    '/blog/mas-vistos/todo-lo-que-debes-saber-para-ganar-dinero-con-tiktok',
  '/blog/otros/wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo':
    '/blog/mas-vistos/wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo',
  '/blog/pautas-digitales/como-promocionar-en-black-friday-implementa-estas-estrategias':
    '/blog/email-marketing/como-promocionar-en-black-friday-implementa-estas-estrategias',
  '/blog/pautas-digitales/cual-es-la-mejor-hora-para-publicar-en-tiktok':
    '/blog/mas-vistos/cual-es-la-mejor-hora-para-publicar-en-tiktok',
  '/e-books/Seo-Local/Playful_Agengy_Ebook_seo_local.pdf': UNWRAP,
  '/blog/otros/podcast-una-herramienta-de-contenido-para-ganar-autoridad': UNWRAP,
  '/como-hacer-que-se-enamoren-de-tu-marca': UNWRAP,
  '/blog/pautas-digitales/actualizaciones-de-instagram': UNWRAP,
  '/blog/seo/busqueda-por-voz-que-es-y-como-afecta-al-seo': UNWRAP,
  '/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona': UNWRAP,
  '/google-grants-descubre-que-es-y-como-funciona': UNWRAP,
  '/blog/pautas-digitales/porque-tener-un-perfil-empresarial-en-linkedin': UNWRAP,
  '/seo-internacional': UNWRAP,
});

type SourceDest = string | null;

/** Per-source overrides. `null` = unwrap and leave the text. */
export const BROKEN_HREF_BY_SOURCE: Readonly<Record<string, Readonly<Record<string, SourceDest>>>> = Object.freeze({
  'la-nueva-gestion-de-google-ads': {
    '/servicios/automatizacion-del-marketing': AGENCIA_SEM_HREF,
  },
  'posicionamiento-organico-vs-pago': {
    '/servicios/automatizacion-del-marketing': AGENCIA_SEM_HREF,
  },
  /** Post 81: the only matching href is the banner image (item 8). */
  '6-herramientas-para-crear-informes-seo': {
    '/servicios/automatizacion-del-marketing': AGENCIA_SEO_HREF,
  },
  /** Post 124: the only matching href is the CTA banner (item 8). */
  'que-es-la-intencion-de-busqueda-y-cuales-son-sus-beneficios': {
    '/servicios/automatizacion-del-marketing': AGENCIA_SEO_HREF,
  },
  'rich-snippet-ayuda-a-optimizar-tu-web': {
    '/servicios/automatizacion-del-marketing': AGENCIA_SEO_HREF,
  },
  'haz-email-marketing-como-todo-un-experto-ejemplos': {
    '/servicios/automatizacion-del-marketing': CONTACT_HREF,
  },
  'como-usar-instagram-para-expandir-tu-negocio': {
    '/servicios/automatizacion-del-marketing': CONTACT_HREF,
  },
  'conoce-como-impulsar-tu-marca-online': {
    '/servicios/automatizacion-del-marketing': CONTACT_HREF,
  },
  'desarrollo-de-aplicaciones-web': {
    '/servicios/desarrollo-web': AGENCIA_DISENO_HREF,
  },
  'diseno-web-y-posicionamiento-seo': {
    '/servicios/desarrollo-web': AGENCIA_DISENO_HREF,
  },
  'web-app-y-app-nativa-cual-es-la-mejor-opcion': {
    '/servicios/desarrollo-web': AGENCIA_DISENO_HREF,
  },
  'desarrollo-ui-ux': {
    '/servicios/desarrollo-web': AGENCIA_UX_UI_HREF,
  },
  'ecommerce-mi-negocio-online': {
    '/servicios/desarrollo-web': AGENCIA_ECOMMERCE_HREF,
  },
  'el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas': {
    '/servicios/desarrollo-web': UNWRAP,
    '/servicios/pautas-digitales': CONTACT_HREF,
  },
  'el-sms-marketing': {
    '/servicios/pautas-digitales': CONTACT_HREF,
  },
  'tiktok-ads-ahora-puedes-hacer-publicidad-en-tiktok': {
    '/servicios/pautas-digitales': CONTACT_HREF,
  },
  'que-son-los-buyer-persona-y-como-se-determinan': {
    '/email-marketing-una-herramienta-que-no-puedes-dejar-de-usar-en-tu-empresa': GUIA_MARKETING_HREF,
    '/7-consejos-seo-para-posicionar-tu-pagina-web': UNWRAP,
  },
  'ecosistema-digital-de-tu-marca': {
    '/blog/email-marketing': '/blog/email-marketing/estrategia-de-email-marketing',
  },
});

const TOC_SELF_PATHS = new Set([
  '/tipos-de-publicidad-online',
  '/blog/pautas-digitales/tipos-de-publicidad-online',
  '/blog/pautas-digitales/publicidad-digital-en-tu-negocio',
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
  for (const [origin, dest] of Object.entries(canibalizacionOrigins)) {
    const slug = origin.slice(origin.lastIndexOf('/') + 1);
    try {
      out[slug] = new URL(dest).pathname.replace(/\/+$/, '') || '/';
    } catch {
      out[slug] = dest;
    }
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

export function isSkipRewriteSource(sourcePath: string): boolean {
  return SKIP_SOURCE_SET.has(sourceSlugFromPath(sourcePath));
}

export function isLandingCarouselSource(sourcePath: string): boolean {
  return LANDING_SOURCE_SET.has(sourceSlugFromPath(sourcePath));
}

export function normalizeAnchorText(inner: string): string {
  return inner
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
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

function isWpAsset(pathname: string): boolean {
  return WP_ASSET_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function joinDest(dest: string, parsed: ParsedHref): string {
  if (dest.includes('?')) return `${dest}${parsed.hash}`;
  return `${dest}${parsed.search}${parsed.hash}`;
}

function isGrantsPath(pathname: string): boolean {
  return pathname === `/${GRANTS_SLUG}` || pathname.endsWith(`/${GRANTS_SLUG}`);
}

function landingCarouselDest(pathname: string): string | undefined {
  if (isGrantsPath(pathname) || pathname.startsWith('/category/') || pathname.startsWith('/author/')) {
    return BLOG_HREF;
  }
  if (pathname === '/projects' || pathname.startsWith('/project/') || pathname === '/caso-de-exito-pcm') {
    return CASOS_HREF;
  }
  const segs = pathname.split('/').filter(Boolean);
  if (segs.length !== 1) return undefined;
  return liveBlogPathBySlug()[segs[0]];
}

function toc114Dest(pathname: string, inner: string): string | null | undefined {
  if (!TOC_SELF_PATHS.has(pathname)) return undefined;
  const anchor = normalizeAnchorText(inner);
  if (anchor === 'publicidad') return UNWRAP;
  if (anchor === 'Las estrategias de Marketing Digital') return GUIA_MARKETING_HREF;
  return undefined;
}

export type HrefDecision = {
  href: string;
  unwrap: boolean;
};

/**
 * Maps one href when the closed SEO list has a dest.
 * Pass `inner` for the 114 TOC anchors. `unwrap` means drop the <a> and keep the text.
 */
export function decideBrokenInternalHref(
  href: string,
  sourcePath = '',
  inner = '',
): HrefDecision {
  if (typeof href !== 'string' || !href) return { href, unwrap: false };
  if (isSkipRewriteSource(sourcePath)) return { href, unwrap: false };

  const parsed = parseHref(href);
  if (!parsed) return { href, unwrap: false };
  if (SKIP_PATH_SET.has(parsed.pathname)) return { href, unwrap: false };
  if (isWpAsset(parsed.pathname)) return { href, unwrap: false };

  if (parsed.formDest) {
    return { href: joinDest(parsed.formDest, parsed), unwrap: false };
  }

  if (!parsed.inSite) return { href, unwrap: false };

  const slug = sourceSlugFromPath(sourcePath);

  if (slug === 'publicidad-digital-en-tu-negocio') {
    const toc = toc114Dest(parsed.pathname, inner);
    if (toc === UNWRAP) return { href, unwrap: true };
    if (typeof toc === 'string') return { href: joinDest(toc, parsed), unwrap: false };
  }

  if (slug && Object.prototype.hasOwnProperty.call(BROKEN_HREF_BY_SOURCE, slug)) {
    if (Object.prototype.hasOwnProperty.call(BROKEN_HREF_BY_SOURCE[slug], parsed.pathname)) {
      const override = BROKEN_HREF_BY_SOURCE[slug][parsed.pathname];
      if (override === UNWRAP) return { href, unwrap: true };
      if (typeof override === 'string') return { href: joinDest(override, parsed), unwrap: false };
    }
  }

  if (isLandingCarouselSource(sourcePath)) {
    const landing = landingCarouselDest(parsed.pathname);
    if (landing) return { href: joinDest(landing, parsed), unwrap: false };
  }

  if (Object.prototype.hasOwnProperty.call(BROKEN_HREF_DEFAULTS, parsed.pathname)) {
    const mapped = BROKEN_HREF_DEFAULTS[parsed.pathname];
    if (mapped === UNWRAP) return { href, unwrap: true };
    if (typeof mapped === 'string') return { href: joinDest(mapped, parsed), unwrap: false };
  }

  return { href, unwrap: false };
}

export function rewriteBrokenInternalHref(href: string, sourcePath = '', inner = ''): string {
  const decision = decideBrokenInternalHref(href, sourcePath, inner);
  return decision.unwrap ? href : decision.href;
}

const ANCHOR_RE = /<a(\s[^>]*?)?href=(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi;

export function rewriteBrokenInternalAnchors(
  html: string,
  sourcePath: string,
  remapHref: (href: string) => string = (href) => href,
): string {
  if (typeof html !== 'string' || !html) return html;
  return html.replace(ANCHOR_RE, (full, pre = '', quote: string, href: string, post = '', inner: string) => {
    const remapped = remapHref(href);
    const decision = decideBrokenInternalHref(remapped, sourcePath, inner);
    if (decision.unwrap) return inner;
    if (decision.href === href) return full;
    return `<a${pre}href=${quote}${decision.href}${quote}${post}>${inner}</a>`;
  });
}

export function normalizeInternalPath(href: string): string {
  const parsed = parseHref(href);
  return parsed ? parsed.pathname : normalizeBlogPath(href);
}

export function listedClosedPath(pathname: string): boolean {
  return CLOSED_PATH_SET.has(normalizeBlogPath(pathname));
}
