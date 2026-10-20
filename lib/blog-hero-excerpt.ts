import { decodeHtmlEntities } from './wordpress-plain-text.ts';

export const DEFAULT_EXCERPT_MAX = 200;
/** Featured / grid cards on `/blog`. */
export const BLOG_LISTING_EXCERPT_MAX = 120;
/** Home, related posts, and compact listing cards. */
export const BLOG_CARD_EXCERPT_MAX = 100;
/** Sentence terminator in the last 45% of the window counts as “near” the limit. */
const SENTENCE_NEAR_RATIO = 0.55;
const WP_AUTO_EXCERPT_TAIL = /\s*(?:\[\s*(?:…|&hellip;|\.{3}|&#8230;)\s*\]|\.{3}|…)$/;

function stripExcerptHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>?/gm, ''))
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * WP auto excerpts are generated from the start of the body. A hand-written
 * `excerpt` in REST does not share that prefix — use it whole.
 */
export function isWordPressManualExcerpt(
  excerptHtml: string | undefined | null,
  contentHtml: string | undefined | null,
): boolean {
  const excerpt = stripExcerptHtml(excerptHtml || '');
  if (!excerpt) return false;
  const content = stripExcerptHtml(contentHtml || '');
  if (!content) return false;
  const withoutAutoTail = excerpt.replace(WP_AUTO_EXCERPT_TAIL, '').trim();
  return Boolean(withoutAutoTail) && !content.startsWith(withoutAutoTail);
}

function lastNearSentenceEnd(slice: string, maxLength: number): number {
  const minIndex = Math.floor(maxLength * SENTENCE_NEAR_RATIO);
  let last = -1;
  const pattern = /[.!?]["»”']?(?=\s|$)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(slice))) {
    const end = match.index + match[0].length - 1;
    if (end >= minIndex) last = end;
  }
  return last;
}

/** Word-safe hero trim: nearby sentence end, else last whole word + `…`. Never `...`. */
export function truncateHeroExcerptAtSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const sentenceEnd = lastNearSentenceEnd(slice, maxLength);
  if (sentenceEnd >= 0) {
    return slice.slice(0, sentenceEnd + 1).trimEnd();
  }
  const lastSpace = slice.lastIndexOf(' ');
  if (lastSpace <= 0) return slice.trimEnd();
  const wordSafe = slice.slice(0, lastSpace).trimEnd();
  if (!wordSafe) return slice.trimEnd();
  if (/[.!?…]$/.test(wordSafe)) return wordSafe;
  return `${wordSafe}…`;
}

/**
 * Shared excerpt for the article H1, `/blog` cards, home, related posts
 * and Más Vistos: strip tags, keep a WP manual excerpt whole when the
 * body is available, otherwise truncate at a nearby sentence or the last
 * whole word. Never appends `...`.
 */
export function formatBlogExcerpt(
  html: string | undefined | null,
  maxLength = DEFAULT_EXCERPT_MAX,
  contentHtml?: string | null,
): string {
  if (!html) return '';
  const stripped = stripExcerptHtml(html);
  if (!stripped) return '';
  if (isWordPressManualExcerpt(html, contentHtml)) return stripped;
  const withoutAutoTail = stripped.replace(WP_AUTO_EXCERPT_TAIL, '').trim();
  if (!withoutAutoTail) return '';
  return truncateHeroExcerptAtSentence(withoutAutoTail, maxLength);
}

export const formatBlogHeroExcerpt = formatBlogExcerpt;
