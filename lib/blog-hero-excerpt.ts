const DEFAULT_EXCERPT_MAX = 200;

/** Cut at the last sentence end (`.`) still inside `maxLength`, else hard trim without `...`. */
export function truncateHeroExcerptAtSentence(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const slice = text.slice(0, maxLength);
  const lastStop = slice.lastIndexOf('.');
  if (lastStop >= 0) return slice.slice(0, lastStop + 1).trimEnd();
  return slice.trimEnd();
}

/**
 * Hero excerpt under the blog H1: strip tags, then truncate at the last full
 * stop inside the limit. Empty/whitespace excerpts render nothing.
 */
export function formatBlogHeroExcerpt(
  html: string | undefined | null,
  maxLength = DEFAULT_EXCERPT_MAX,
): string {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>?/gm, '').trim();
  if (!stripped) return '';
  return truncateHeroExcerptAtSentence(stripped, maxLength);
}
