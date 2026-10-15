/**
 * Closed slug → {href, anchor} map for anti-cannibalization links.
 * Applied to post HTML at render (same cheerio pass as blog-service-cta).
 *
 * Rules:
 * - Wrap the exact anchor in the first third of visible body text.
 * - Never invent or rewrite phrases when the exact text is missing.
 * - Do not duplicate a landing href. If one already exists further down
 *   and the exact anchor is in the first third, move it (unwrap + wrap).
 * - Copy-locked slugs already link to the landing with a different
 *   anchor: leave that copy untouched.
 */
import * as cheerio from 'cheerio';

type CheerioRoot = ReturnType<typeof cheerio.load>;

export type BlogLandingLink = {
  href: string;
  anchor: string;
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

export const BLOG_LANDING_LINKS: Record<string, BlogLandingLink> = {
  'actualizar-tu-e-commerce': {
    href: '/agencia-e-commerce',
    anchor: 'agencia de e-commerce',
  },
  'wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo': {
    href: '/agencia-ux-ui',
    anchor: 'agencia UX/UI',
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
    anchor: 'agencia de diseño web',
  },
  'descubre-todo-lo-que-el-posicionamiento-sem-tiene-para-ti': {
    href: '/agencia-sem',
    anchor: 'agencia SEM',
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
    anchor: 'agencia de diseño web',
  },
  'los-5-problemas-de-e-commerce': {
    href: '/agencia-e-commerce',
    anchor: 'agencia de e-commerce',
  },
  'como-elegir-el-mejor-framework-para-tu-web': {
    href: '/agencia-diseno-web',
    anchor: 'agencia de diseño web',
  },
  'como-posicionar-tu-negocio-en-google-ads': {
    href: '/agencia-sem',
    anchor: 'agencia SEM',
  },
  'seo-y-sem-que-son-y-en-que-se-diferencian': {
    href: '/agencia-sem',
    anchor: 'agencia SEM',
  },
  'ecommerce-mi-negocio-online': {
    href: '/agencia-e-commerce',
    anchor: 'agencia de e-commerce',
  },
  'rediseno-web': {
    href: '/agencia-diseno-web',
    anchor: 'agencia de diseño web',
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
    anchor: 'agencia de e-commerce',
  },
  'tendencias-en-diseno-web-para-el-2022': {
    href: '/agencia-diseno-web',
    anchor: 'agencia de diseño web',
  },
};

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

export function getBlogLandingLink(postSlug: string): BlogLandingLink | null {
  return BLOG_LANDING_LINKS[postSlug] ?? null;
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
  third: number,
): { kind: 'already-linked' | 'unlinked'; item: TextNodeHit; index: number; start: number } | null {
  const target = normalizeLandingHref(link.href);
  for (const item of nodes) {
    if (item.start >= third) break;
    const index = item.text.indexOf(link.anchor);
    if (index < 0) continue;
    if (item.start + index >= third) continue;

    const anchorEl = isInsideAnchor($, item.node);
    if (anchorEl) {
      const href = normalizeLandingHref($(anchorEl).attr('href') || '');
      if (href === target) {
        return { kind: 'already-linked', item, index, start: item.start + index };
      }
      continue;
    }

    return { kind: 'unlinked', item, index, start: item.start + index };
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
): BlogLandingLinkResult | null {
  const link = getBlogLandingLink(postSlug);
  if (!link) return null;

  const { nodes, total } = visibleNodes($);
  const third = Math.floor(total / 3);
  const existing = existingLandingLinks($, link.href, nodes);
  const existingExact = existing.find((item) => item.anchor === link.anchor);
  const existingOther = existing.find((item) => item.anchor !== link.anchor);
  const ratio = (start: number) => (total > 0 ? start / total : 0);
  const firstThird = findFirstThirdExact($, link, nodes, third);

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
    const nextThird = Math.floor(next.total / 3);
    const retry = findFirstThirdExact($, link, next.nodes, nextThird);
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

/** Test helper: apply the map to an HTML fragment. */
export function applyBlogLandingLinkHtml(
  html: string,
  postSlug: string,
): { html: string; result: BlogLandingLinkResult | null } {
  const link = getBlogLandingLink(postSlug);
  if (!link) return { html, result: null };
  const $ = cheerio.load(html);
  const result = applyBlogLandingLink($, postSlug);
  return { html: $.html(), result };
}
