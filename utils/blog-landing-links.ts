/**
 * Closed slug → {href, anchor} map for anti-cannibalization links
 * plus extra contextual internal links (one href per destination per post).
 * Applied to post HTML at render (same cheerio pass as blog-service-cta).
 *
 * Rules:
 * - Without `context`, wrap the exact anchor in the first third of
 *   visible body text.
 * - With `context`, match that phrase anywhere in the visible body
 *   (it may span tags) and wrap only `anchor` inside it.
 * - Matching is accent- and case-sensitive; skip text already inside <a>.
 * - Never invent or rewrite phrases when the exact text is missing.
 * - Do not duplicate a landing href. If one already exists further down
 *   and the exact anchor is in the first third, move it (unwrap + wrap).
 * - Copy-locked slugs already link to the landing with a different
 *   anchor: leave that copy untouched.
 * - `occurrence` (1-based) picks the Nth wrappable match. `context`
 *   scopes the match to a surrounding phrase and wraps only `anchor`
 *   inside it (sub-word / later-sentence cases).
 * - A slug may list several links; at most one href per destination.
 */
import * as cheerio from 'cheerio';

type CheerioRoot = ReturnType<typeof cheerio.load>;

export type BlogLandingLink = {
  href: string;
  anchor: string;
  /** 1-based wrappable match in the first third. Default 1. */
  occurrence?: number;
  /**
   * Surrounding phrase that must contain `anchor`. The wrap is only
   * `anchor`, at the Nth (`occurrence`) match of `context`. When set,
   * the search is the whole body (not only the first third).
   */
  context?: string;
};

export type BlogLandingLinksEntry = BlogLandingLink | readonly BlogLandingLink[];

export type BlogContextInternalLink = {
  n: number;
  slug: string;
  href: string;
  anchor: string;
  context: string;
};

export type BlogLandingLinkStatus =
  | 'applied'
  | 'already-existed'
  | 'anchor-absent'
  | 'anchor-different';

export type BlogLandingLinkResult = {
  status: BlogLandingLinkStatus;
  href: string;
  wantedAnchor: string;
  existingAnchor?: string;
  /** 0–1 offset of the existing landing href in visible text. */
  existingPositionRatio?: number;
  applied: boolean;
};

/**
 * 29 contextual blog→landing links. `context` is the live visible phrase
 * (CSV rows 6/9/23 had a stray space before a comma; row 5 has a NBSP
 * before "de seguir"). We match the HTML, not invented copy.
 */
export const BLOG_CONTEXT_INTERNAL_LINKS: readonly BlogContextInternalLink[] = [
  {
    n: 1,
    slug: 'diseno-web-de-paginas-web',
    href: '/agencia-e-commerce',
    anchor: 'tiendas en línea',
    context:
      'Este tipo de diseño es ideal para sitios web que requieren actualizaciones frecuentes de contenido, como blogs, tiendas en línea o sitios de noticias.',
  },
  {
    n: 2,
    slug: 'diseno-web-de-paginas-web',
    href: '/agencia-seo',
    anchor: 'Motores de Búsqueda',
    context:
      'Optimización para Motores de Búsqueda (SEO): El diseño web también implica optimizar el sitio web para mejorar su visibilidad en los motores de búsqueda.',
  },
  {
    n: 3,
    slug: 'los-5-problemas-de-e-commerce',
    href: '/agencia-seo',
    anchor: 'SEO',
    context:
      'Solución: Una estrategia integral de marketing digital que combine SEO, SEM, marketing en redes sociales y contenido de calidad puede atraer a los clientes correctos.',
  },
  {
    n: 4,
    slug: 'como-posicionar-tu-negocio-en-google-ads',
    href: '/agencia-seo',
    anchor: 'posicionamiento orgánico',
    context:
      'El posicionamiento orgánico ha sido fundamental en los últimos tiempos para los motores de búsquedas, sin embargo, utilizar herramientas para hacer publicidad cómo Google Ads, ha creado un cambio de prioridades.',
  },
  {
    n: 5,
    slug: 'como-usar-el-remarketing-para-tener-mas-clientes',
    href: '/agencia-e-commerce',
    anchor: 'tienda online',
    context:
      'Si durante el análisis de tu tienda online, no consigues el impacto deseado en el público, tienes un buen flujo de visitas que se interesan por tus productos, pero durante el camino no todos concretan su compra y no quieres perder el interés de ese cliente potencial, te comentamos que existe una forma\u00a0 de seguir llamando su atención; el Remarketing.',
  },
  {
    n: 6,
    slug: 'conoce-los-tipos-de-marketing',
    href: '/agencia-sem',
    anchor: 'campañas publicitarias',
    context:
      'El email marketing permite además personalizar el tipo de información y la estructura del mensaje, haciéndolo más atractivo y acorde a tus campañas publicitarias, para ello existen softwares donde puedes realizar el montaje de la campaña, y te brindarán un análisis de su efectividad, según el tipo de cliente.',
  },
  {
    n: 7,
    slug: 'conoce-todo-sobre-la-publicidad-en-redes-sociales',
    href: '/agencia-sem',
    anchor: 'publicidad digital',
    context:
      'Según eMarketer, se prevé que el gasto de publicidad digital, supere los 375.000 millones de dólares en el 2021.',
  },
  {
    n: 8,
    slug: 'errores-que-pueden-perjudicar-a-tu-marca-al-generar-anuncios-en-facebook',
    href: '/agencia-sem',
    anchor: 'campañas publicitarias',
    context:
      'Otro gran error que cometen las personas al diseñar sus campañas publicitarias es no adaptar el contenido de sus anuncios para dispositivos móviles.',
  },
  {
    n: 9,
    slug: 'guia-para-hacer-marketing-digital',
    href: '/agencia-seo',
    anchor: 'SEO',
    context:
      'El SEO lo conforman técnicas que están al alcance de todos, que debes aplicar para mejorar tu posición en los buscadores.',
  },
  {
    n: 10,
    slug: 'guia-para-hacer-marketing-digital',
    href: '/agencia-sem',
    anchor: 'campañas publicitarias',
    context: 'Personalización de las campañas publicitarias.',
  },
  {
    n: 11,
    slug: 'tipos-de-publicidad-online-conceptos-y-datos-curiosos',
    href: '/agencia-seo',
    anchor: 'posicionamiento orgánico',
    context:
      'El contenido audiovisual, es un excelente recurso para entretener a tu público objetivo, al tiempo que obtienes posicionamiento orgánico derivado del tráfico directo y viral, resultado de las veces que quienes lo reproducen lo comparten en sus perfiles de las redes sociales.',
  },
  {
    n: 12,
    slug: 'como-elegir-tus-palabras-claves',
    href: '/agencia-seo',
    anchor: 'posicionamiento web',
    context:
      'Si te interesa el mundo del posicionamiento web o del SEO, probablemente ya te hayas encontrado con el término “palabra clave” o “keyword” esto no es más que una fórmula utilizada por los usuarios para acceder a determinada información.',
  },
  {
    n: 13,
    slug: 'como-elegir-tus-palabras-claves',
    href: '/agencia-sem',
    anchor: 'SEM',
    context:
      'Las palabras claves son tan fundamentales que incluso en las estrategias de SEM son utilizadas.',
  },
  {
    n: 14,
    slug: 'contenido-duplicado',
    href: '/agencia-ux-ui',
    anchor: 'experiencia del usuario',
    context:
      'El contenido duplicado puede tener varios impactos negativos en el SEO y la experiencia del usuario:',
  },
  {
    n: 15,
    slug: 'ejemplos-de-marketing-de-contenido',
    href: '/agencia-ux-ui',
    anchor: 'UX',
    context:
      'Los descargables pueden ser una forma de contenido habitual si trabajas en nichos de diseño gráfico o UX.',
  },
  {
    n: 16,
    slug: 'google-y-su-inteligencia-artificial',
    href: '/agencia-ux-ui',
    anchor: 'experiencia del usuario',
    context:
      'Esta evolución no solo mejora la experiencia del usuario, sino que también abre nuevas oportunidades para las empresas que buscan optimizar su presencia en línea.',
  },
  {
    n: 17,
    slug: 'google-y-su-inteligencia-artificial',
    href: '/agencia-seo',
    anchor: 'motores de búsqueda',
    context:
      'Con el uso creciente de la inteligencia artificial (IA), Google ha redefinido la manera en que interactuamos con los motores de búsqueda, mejorando la precisión, relevancia y eficiencia de los resultados.',
  },
  {
    n: 18,
    slug: 'google-y-su-inteligencia-artificial',
    href: '/agencia-sem',
    anchor: 'SEM',
    context:
      'Somos expertos en SEM y tráfico orgánico, y estamos aquí para ayudarte a optimizar tu presencia en línea.',
  },
  {
    n: 19,
    slug: 'metadescripcion-que-es',
    href: '/agencia-sem',
    anchor: 'SEM',
    context:
      'Se obtiene de una fórmula muy básica pero que es muy importante tanto en SEO como en SEM:',
  },
  {
    n: 20,
    slug: 'optimizacion-multimedia',
    href: '/agencia-ux-ui',
    anchor: 'experiencia del usuario',
    context:
      'Los subtítulos no solo mejoran la accesibilidad y la experiencia del usuario, sino que también pueden tener un impacto positivo en el SEO al mejorar la indexación del contenido, aumentar el tiempo de permanencia en la página y amplificar el alcance del vídeo a través de diferentes audiencias y mercados.',
  },
  {
    n: 21,
    slug: 'optimizacion-multimedia',
    href: '/agencia-seo',
    anchor: 'SEO',
    context:
      'Honestamente, no es nada nuevo pero, gracias a este formato tan novedoso hacer SEO.',
  },
  {
    n: 22,
    slug: 'tendencias-seo-2020',
    href: '/agencia-ux-ui',
    anchor: 'Experiencia del Usuario',
    context:
      'Experiencia del Usuario (UX) como Factor de Ranking: Los motores de búsqueda están dando cada vez más importancia a la experiencia del usuario, ellos al determinar el ranking de las páginas web.',
  },
  {
    n: 23,
    slug: 'actualizar-tu-e-commerce',
    href: '/agencia-shopify',
    anchor: 'Shopify',
    context:
      'Considera cambiar a plataformas que estén optimizadas para el rendimiento, como Shopify o BigCommerce, que ofrecen servidores rápidos y una infraestructura escalable.',
  },
  {
    n: 24,
    slug: 'actualizar-tu-e-commerce',
    href: '/agencia-seo',
    anchor: 'SEO',
    context:
      'La velocidad de carga debe ser prioritaria si quieres mantener a tus clientes y mejorar tu SEO.',
  },
  {
    n: 25,
    slug: 'agencia-seo-internacional-en-el-2025-es-una-necesidad',
    href: '/agencia-ux-ui',
    anchor: 'experiencia del usuario',
    context:
      'Al hacer esto, te aseguras de que las personas puedan entender y conectarse mejor con tu contenido, lo que mejora la experiencia del usuario y aumenta la probabilidad de que elijan tu negocio.',
  },
  {
    n: 26,
    slug: 'agencia-seo-internacional-en-el-2025-es-una-necesidad',
    href: '/agencia-e-commerce',
    anchor: 'tienda en línea',
    context:
      'Por ejemplo, una tienda en línea que optimiza su sitio para búsquedas en diferentes idiomas y países tendrá una mejor oportunidad de captar clientes en cada región.',
  },
  {
    n: 27,
    slug: 'cintillos-de-promocion',
    href: '/agencia-ux-ui',
    anchor: 'experiencia del usuario',
    context:
      'Mejorar la experiencia del usuario: Al destacar promociones de manera visible y clara, los clientes no tienen que buscar ofertas; la información está disponible desde que aterrizan en la página.',
  },
  {
    n: 28,
    slug: 'programacion-web-que-es-como-puede-servirle-a-mi-marca',
    href: '/agencia-e-commerce',
    anchor: 'e-commerce',
    context:
      'Si lo vemos desde el punto de vista de un e-commerce, el diseño web se va encargar de la tipología, botones, imágenes, colores.',
  },
  {
    n: 29,
    slug: 'que-es-wix',
    href: '/agencia-e-commerce',
    anchor: 'tienda online',
    context:
      'Entre las ventajas que tiene este sistema de gestión de contenido es que puedes optar por un paquete gratuito, que te va a permitir realizar tu blog, sitio web o tienda online.',
  },
];

const BLOG_LANDING_LINKS_PRIMARY: Record<string, BlogLandingLink> = {
  'actualizar-tu-e-commerce': {
    href: '/agencia-e-commerce',
    anchor: 'actualizar tu e-commerce',
  },
  'wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo': {
    href: '/agencia-ux-ui',
    anchor: 'experiencia al usuario',
  },
  'agencia-seo-internacional-en-el-2025-es-una-necesidad': {
    href: '/agencia-seo',
    anchor: 'agencia SEO',
  },
  'necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti': {
    href: '/agencia-seo',
    anchor: 'agencia SEO',
  },
  'programacion-web-que-es-como-puede-servirle-a-mi-marca': {
    href: '/agencia-diseno-web',
    anchor: 'desarrollo web',
  },
  'descubre-todo-lo-que-el-posicionamiento-sem-tiene-para-ti': {
    href: '/agencia-sem',
    anchor: 'posicionamiento SEM',
  },
  'auditoria-seo-que-es-como-se-hace': {
    href: '/agencia-seo',
    anchor: 'agencia SEO',
  },
  'que-es-data-studio-de-google-y-como-funciona': {
    href: '/agencia-seo',
    anchor: 'agencia SEO',
  },
  'desarrollo-ui-ux': {
    href: '/agencia-ux-ui',
    anchor: 'agencia UX/UI',
  },
  'la-nueva-gestion-de-google-ads': {
    href: '/agencia-sem',
    anchor: 'agencia SEM',
  },
  'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce': {
    href: '/agencia-shopify',
    anchor: 'agencia Shopify',
  },
  'diseno-web-de-paginas-web': {
    href: '/agencia-diseno-web',
    anchor: 'diseño web efectivo',
  },
  'los-5-problemas-de-e-commerce': {
    href: '/agencia-e-commerce',
    anchor: 'tienda online',
  },
  'como-elegir-el-mejor-framework-para-tu-web': {
    href: '/agencia-diseno-web',
    anchor: 'desarrollo web',
  },
  'como-posicionar-tu-negocio-en-google-ads': {
    href: '/agencia-sem',
    anchor: 'publicidad en motores de búsqueda',
  },
  'seo-y-sem-que-son-y-en-que-se-diferencian': {
    href: '/agencia-sem',
    anchor: 'SEM',
    context: 'SEO y SEM',
  },
  'ecommerce-mi-negocio-online': {
    href: '/agencia-e-commerce',
    anchor: 'agencia de e-commerce',
  },
  'rediseno-web': {
    href: '/agencia-diseno-web',
    anchor: 'rediseño web',
    context: 'rediseño web es el proceso',
  },
  '6-herramientas-para-crear-informes-seo': {
    href: '/agencia-seo',
    anchor: 'agencia SEO',
  },
  'aprende-todo-sobre-el-seo': {
    href: '/agencia-seo',
    anchor: 'agencia SEO',
  },
  'crear-un-e-commerce': {
    href: '/agencia-e-commerce',
    anchor: 'tienda online',
  },
  'tendencias-en-diseno-web-para-el-2022': {
    href: '/agencia-diseno-web',
    anchor: 'tendencias en diseño web',
  },
};

function mergeLandingLinks(
  primary: Record<string, BlogLandingLink>,
  extras: readonly BlogContextInternalLink[],
): Record<string, BlogLandingLinksEntry> {
  const out: Record<string, BlogLandingLink[]> = {};
  for (const [slug, link] of Object.entries(primary)) {
    out[slug] = [link];
  }
  for (const item of extras) {
    const next: BlogLandingLink = {
      href: item.href,
      anchor: item.anchor,
      context: item.context,
    };
    const current = out[item.slug];
    if (!current) {
      out[item.slug] = [next];
      continue;
    }
    const dest = item.href.replace(/\/+$/, '') || '/';
    if (current.some((link) => (link.href.replace(/\/+$/, '') || '/') === dest)) {
      continue;
    }
    current.push(next);
  }
  const compact: Record<string, BlogLandingLinksEntry> = {};
  for (const [slug, links] of Object.entries(out)) {
    compact[slug] = links.length === 1 ? links[0] : links;
  }
  return compact;
}

export const BLOG_LANDING_LINKS: Record<string, BlogLandingLinksEntry> =
  mergeLandingLinks(BLOG_LANDING_LINKS_PRIMARY, BLOG_CONTEXT_INTERNAL_LINKS);

/** Changing these anchors would be a copy edit. Leave the existing href text. */
export const BLOG_LANDING_LINK_COPY_LOCKED_SLUGS = [
  'necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti',
  'que-es-data-studio-de-google-y-como-funciona',
  'la-nueva-gestion-de-google-ads',
  'ecommerce-mi-negocio-online',
  '6-herramientas-para-crear-informes-seo',
  'aprende-todo-sobre-el-seo',
] as const;

const COPY_LOCKED = new Set<string>(BLOG_LANDING_LINK_COPY_LOCKED_SLUGS);

const SKIP_TAGS = new Set(['script', 'style', 'noscript', 'code', 'pre']);

function isLinkList(
  entry: BlogLandingLinksEntry,
): entry is readonly BlogLandingLink[] {
  return Array.isArray(entry);
}

export function getBlogLandingLinks(postSlug: string): BlogLandingLink[] {
  const entry = BLOG_LANDING_LINKS[postSlug];
  if (!entry) return [];
  return isLinkList(entry) ? [...entry] : [entry];
}

export function getBlogLandingLink(postSlug: string): BlogLandingLink | null {
  return getBlogLandingLinks(postSlug)[0] ?? null;
}

export function normalizeLandingHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return '';
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const url = absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return trimmed.split(/[?#]/)[0].replace(/\/+$/, '') || '';
  }
}

function collapseWs(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** NBSP counts as a regular space when locating a context phrase. */
function matchableText(value: string): string {
  return value.replace(/\u00a0/g, ' ');
}

type TextNodeHit = {
  node: { type: string; data?: string };
  text: string;
  start: number;
};

function walkVisible(
  node: any,
  offset: { value: number },
  nodes: TextNodeHit[],
): void {
  if (!node) return;
  if (node.type === 'text') {
    const text = typeof node.data === 'string' ? node.data : '';
    nodes.push({ node, text, start: offset.value });
    offset.value += text.length;
    return;
  }
  if (node.type !== 'tag') {
    const kids = node.children || [];
    for (const kid of kids) walkVisible(kid, offset, nodes);
    return;
  }
  const tag = (node.name || '').toLowerCase();
  if (SKIP_TAGS.has(tag)) return;
  const kids = node.children || [];
  for (const kid of kids) walkVisible(kid, offset, nodes);
}

function visibleNodes($: CheerioRoot): { nodes: TextNodeHit[]; total: number } {
  const nodes: TextNodeHit[] = [];
  const offset = { value: 0 };
  const root = $('body')[0] || $.root()[0];
  walkVisible(root, offset, nodes);
  return { nodes, total: offset.value };
}

type ExistingLandingLink = {
  el: any;
  anchor: string;
  start: number;
};

function existingLandingLinks(
  $: CheerioRoot,
  href: string,
  nodes: TextNodeHit[],
): ExistingLandingLink[] {
  const target = normalizeLandingHref(href);
  const found: ExistingLandingLink[] = [];
  $('a[href]').each((_i: number, el: any) => {
    if (normalizeLandingHref($(el).attr('href') || '') !== target) return;
    const inner = collapseWs($(el).text());
    const startNode = $(el).contents().toArray().find((child: any) => child.type === 'text')
      || null;
    const hit = startNode
      ? nodes.find((item) => item.node === startNode)
      : undefined;
    found.push({
      el,
      anchor: inner,
      start: hit?.start ?? nodes.length,
    });
  });
  return found;
}

function isInsideAnchor($: CheerioRoot, node: any): any | null {
  const $node = $(node);
  const parent = $node.parents('a').get(0);
  return parent || null;
}

function unwrapLandingLinks($: CheerioRoot, href: string): void {
  const target = normalizeLandingHref(href);
  $('a[href]').toArray().forEach((el: any) => {
    if (normalizeLandingHref($(el).attr('href') || '') !== target) return;
    $(el).replaceWith($(el).contents());
  });
}

function findFirstThirdExact(
  $: CheerioRoot,
  link: BlogLandingLink,
  nodes: TextNodeHit[],
  limit: number,
): { kind: 'already-linked' | 'unlinked'; item: TextNodeHit; index: number; start: number } | null {
  const target = normalizeLandingHref(link.href);
  const needle = link.context || link.anchor;
  const anchorOffset = link.context ? link.context.indexOf(link.anchor) : 0;
  if (!needle || anchorOffset < 0) return null;
  const want = Math.max(1, link.occurrence ?? 1);
  const haystack = matchableText(nodes.map((item) => item.text).join(''));
  const search = matchableText(needle);
  let seen = 0;
  let from = 0;

  while (from < haystack.length) {
    const index = haystack.indexOf(search, from);
    if (index < 0) break;
    from = index + 1;
    const wrapAbs = index + anchorOffset;
    if (wrapAbs >= limit) continue;

    const item = nodes.find(
      (node) => wrapAbs >= node.start && wrapAbs < node.start + node.text.length,
    );
    if (!item) continue;
    const wrapIndex = wrapAbs - item.start;
    if (wrapIndex < 0 || wrapIndex + link.anchor.length > item.text.length) continue;
    if (
      matchableText(item.text.slice(wrapIndex, wrapIndex + link.anchor.length)) !==
      matchableText(link.anchor)
    ) {
      continue;
    }

    const anchorEl = isInsideAnchor($, item.node);
    if (anchorEl) {
      const href = normalizeLandingHref($(anchorEl).attr('href') || '');
      if (href !== target) continue;
      seen += 1;
      if (seen === want) {
        return { kind: 'already-linked', item, index: wrapIndex, start: wrapAbs };
      }
      continue;
    }

    seen += 1;
    if (seen === want) {
      return { kind: 'unlinked', item, index: wrapIndex, start: wrapAbs };
    }
  }
  return null;
}

function wrapExactHit(
  $: CheerioRoot,
  link: BlogLandingLink,
  hit: { item: TextNodeHit; index: number },
): void {
  const mention = hit.item.text.slice(hit.index, hit.index + link.anchor.length);
  const before = hit.item.text.slice(0, hit.index);
  const after = hit.item.text.slice(hit.index + link.anchor.length);
  const $tmp = $('<span></span>');
  if (before) $tmp.append(before);
  $tmp.append($('<a></a>').attr('href', link.href).text(mention));
  if (after) $tmp.append(after);
  $(hit.item.node).replaceWith($tmp.contents());
}

function resultFor(
  link: BlogLandingLink,
  status: BlogLandingLinkStatus,
  extras: Partial<BlogLandingLinkResult> = {},
): BlogLandingLinkResult {
  return {
    status,
    href: link.href,
    wantedAnchor: link.anchor,
    applied: status === 'applied',
    ...extras,
  };
}

/**
 * Mutates the cheerio document. Safe no-op when the slug is unmapped
 * or the exact first-third anchor is missing.
 */
export function applyBlogLandingLink(
  $: CheerioRoot,
  postSlug: string,
  linkOverride?: BlogLandingLink,
): BlogLandingLinkResult | null {
  const link = linkOverride ?? getBlogLandingLink(postSlug);
  if (!link) return null;

  const { nodes, total } = visibleNodes($);
  const third = Math.floor(total / 3);
  const limit = link.context ? total : third;
  const existing = existingLandingLinks($, link.href, nodes);
  const existingExact = existing.find((item) => item.anchor === link.anchor);
  const existingOther = existing.find((item) => item.anchor !== link.anchor);
  const ratio = (start: number) => (total > 0 ? start / total : 0);
  const firstThird = findFirstThirdExact($, link, nodes, limit);

  if (COPY_LOCKED.has(postSlug) && existing.length > 0) {
    const pick = existingExact || existingOther || existing[0];
    if (existingExact && existingExact.start < third) {
      return resultFor(link, 'already-existed', {
        existingAnchor: existingExact.anchor,
        existingPositionRatio: ratio(existingExact.start),
      });
    }
    return resultFor(link, 'anchor-different', {
      existingAnchor: pick.anchor,
      existingPositionRatio: ratio(pick.start),
    });
  }

  if (firstThird?.kind === 'already-linked') {
    return resultFor(link, 'already-existed', {
      existingAnchor: link.anchor,
      existingPositionRatio: ratio(firstThird.start),
    });
  }

  if (firstThird?.kind === 'unlinked') {
    unwrapLandingLinks($, link.href);
    const next = visibleNodes($);
    const nextLimit = link.context ? next.total : Math.floor(next.total / 3);
    const retry = findFirstThirdExact($, link, next.nodes, nextLimit);
    if (retry?.kind === 'unlinked') {
      wrapExactHit($, link, retry);
      return resultFor(link, 'applied');
    }
    if (retry?.kind === 'already-linked') {
      return resultFor(link, 'already-existed', {
        existingAnchor: link.anchor,
        existingPositionRatio: ratio(retry.start),
      });
    }
  }

  if (existingOther) {
    return resultFor(link, 'anchor-different', {
      existingAnchor: existingOther.anchor,
      existingPositionRatio: ratio(existingOther.start),
    });
  }
  if (existingExact) {
    return resultFor(link, 'already-existed', {
      existingAnchor: existingExact.anchor,
      existingPositionRatio: ratio(existingExact.start),
    });
  }
  return resultFor(link, 'anchor-absent');
}

/** Apply every mapped link for the slug (max one href per destination). */
export function applyBlogLandingLinks(
  $: CheerioRoot,
  postSlug: string,
): BlogLandingLinkResult[] {
  const seen = new Set<string>();
  const results: BlogLandingLinkResult[] = [];
  for (const link of getBlogLandingLinks(postSlug)) {
    const dest = normalizeLandingHref(link.href);
    if (seen.has(dest)) continue;
    const result = applyBlogLandingLink($, postSlug, link);
    if (!result) continue;
    results.push(result);
    if (
      result.applied ||
      result.status === 'already-existed' ||
      result.status === 'anchor-different'
    ) {
      seen.add(dest);
    }
  }
  return results;
}

/** Test helper: apply the map (or an explicit link) to an HTML fragment. */
export function applyBlogLandingLinkHtml(
  html: string,
  postSlug: string,
  linkOverride?: BlogLandingLink,
): {
  html: string;
  result: BlogLandingLinkResult | null;
  results: BlogLandingLinkResult[];
} {
  if (linkOverride) {
    const $ = cheerio.load(html);
    const result = applyBlogLandingLink($, postSlug, linkOverride);
    return { html: $.html(), result, results: result ? [result] : [] };
  }
  if (getBlogLandingLinks(postSlug).length === 0) {
    return { html, result: null, results: [] };
  }
  const $ = cheerio.load(html);
  const results = applyBlogLandingLinks($, postSlug);
  return { html: $.html(), result: results[0] ?? null, results };
}
