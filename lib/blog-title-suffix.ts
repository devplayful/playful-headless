export const BLOG_POST_TITLE_SUFFIX = ' | Playful';

const SUFFIX_RE = /(?:\s*\|\s*Playful)+$/i;

/** Append « | Playful» once. Titles that already end with it stay as one suffix. */
export function withPlayfulTitleSuffix(title: string): string {
  const base = title.replace(SUFFIX_RE, '').trimEnd();
  return `${base}${BLOG_POST_TITLE_SUFFIX}`;
}
