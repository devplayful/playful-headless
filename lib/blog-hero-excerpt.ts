const DEFAULT_EXCERPT_MAX = 200;

/**
 * Hero excerpt under the blog H1: strip tags, then append `...` only when
 * the text is actually truncated. Empty/whitespace excerpts render nothing.
 */
export function formatBlogHeroExcerpt(
  html: string | undefined | null,
  maxLength = DEFAULT_EXCERPT_MAX,
): string {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>?/gm, '').trim();
  if (!stripped) return '';
  if (stripped.length <= maxLength) return stripped;
  return `${stripped.substring(0, maxLength)}...`;
}
