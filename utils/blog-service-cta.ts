import * as cheerio from 'cheerio';

type CheerioRoot = ReturnType<typeof cheerio.load>;

export type BlogServiceCta = {
  href: string;
  label: string;
  mentionRe: RegExp;
};

/**
 * Post slug → service landing. Only mapped posts get the compact CTA
 * and the first-mention internal link. Canonical stays on the post.
 */
export const BLOG_SERVICE_CTAS: Record<string, BlogServiceCta> = {
  'que-es-una-agencia-de-sem': {
    href: '/agencia-sem',
    label: 'Conoce nuestro servicio de Agencia SEM',
    mentionRe: /agencia(?:\s+de)?\s+SEM/i,
  },
};

const SKIP_PARENT_TAGS = new Set(['a', 'script', 'style', 'noscript', 'code', 'pre']);

export function getBlogServiceCta(postSlug: string): BlogServiceCta | null {
  return BLOG_SERVICE_CTAS[postSlug] ?? null;
}

function normalizeHrefPath(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return '';
  try {
    const absolute = trimmed.startsWith('//')
      ? `https:${trimmed}`
      : trimmed;
    const url = absolute.startsWith('http')
      ? new URL(absolute)
      : new URL(absolute, 'https://playfulagency.com');
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return trimmed.split(/[?#]/)[0].replace(/\/+$/, '');
  }
}

function htmlAlreadyLinksToService($: CheerioRoot, href: string): boolean {
  const target = normalizeHrefPath(href);
  return $('a[href]').toArray().some((el: any) => {
    return normalizeHrefPath($(el).attr('href') || '') === target;
  });
}

/** Wrap the first unlinked service mention. No-op if a link to href already exists. */
export function linkFirstUnlinkedServiceMention(
  $: CheerioRoot,
  cta: BlogServiceCta,
): boolean {
  if (htmlAlreadyLinksToService($, cta.href)) {
    return false;
  }

  let linked = false;
  $('*').each((_i: number, el: any) => {
    if (linked) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (SKIP_PARENT_TAGS.has(tag)) return;
    if ($(el).parents('a').length > 0) return;

    $(el).contents().each((_j: number, node: any) => {
      if (linked) return false;
      if (node.type !== 'text') return;
      const text = typeof node.data === 'string' ? node.data : '';
      const match = cta.mentionRe.exec(text);
      cta.mentionRe.lastIndex = 0;
      if (!match || match.index == null) return;

      const mention = match[0];
      const before = text.slice(0, match.index);
      const after = text.slice(match.index + mention.length);
      const $tmp = $('<span></span>');
      if (before) $tmp.append(before);
      $tmp.append($('<a></a>').attr('href', cta.href).text(mention));
      if (after) $tmp.append(after);
      $(node).replaceWith($tmp.contents());
      linked = true;
      return false;
    });
  });

  return linked;
}

/** Test helper: apply mention linking for a post slug on an HTML fragment. */
export function applyBlogServiceMentionLink(html: string, postSlug: string): string {
  const cta = getBlogServiceCta(postSlug);
  if (!cta) return html;
  const $ = cheerio.load(html);
  linkFirstUnlinkedServiceMention($, cta);
  return $.html();
}
