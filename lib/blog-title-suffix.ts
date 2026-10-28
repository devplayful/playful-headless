export const BLOG_POST_TITLE_SUFFIX = ' | Playful';

const SUFFIX_RE = /(?:\s*\|\s*Playful)+$/i;
/** WordPress/Yoast brand suffix: « - Playful Agency», « – Playful Agency», « | Playful Agency». */
const AGENCY_SUFFIX_RE = /\s*[-–|]\s*Playful Agency\s*$/i;

/** Remove trailing « - Playful Agency» variants (and stray « | Playful») from a WordPress title. */
export function stripPlayfulAgencySuffix(title: string): string {
  let out = title.trim();
  let prev = '';
  while (out !== prev) {
    prev = out;
    out = out.replace(AGENCY_SUFFIX_RE, '').replace(SUFFIX_RE, '').trim();
  }
  return out;
}

/**
 * Brand the title once: strip « - Playful Agency» variants and any « | Playful»,
 * then append « | Playful» only if the remaining title does not already mention Playful.
 */
export function withPlayfulTitleSuffix(title: string): string {
  const base = stripPlayfulAgencySuffix(title);
  if (/playful/i.test(base)) return base;
  return `${base}${BLOG_POST_TITLE_SUFFIX}`;
}
