/**
 * Slug-scoped blog rewriter for seo-y-sem-que-son-y-en-que-se-diferencian
 * (GO 28 oct 2026). Changes the live «Landing Page sobre SEO» anchor and
 * unwraps the image-only /agencia-seo link. Body HTML only.
 */

export const SEO_SEM_DIFF_SLUG = 'seo-y-sem-que-son-y-en-que-se-diferencian';

export const SEO_SEM_OLD_ANCHOR = 'Landing Page sobre SEO';
export const SEO_SEM_NEW_ANCHOR = 'posicionamiento SEO para ecommerce';
export const SEO_SEM_AGENCIA_SEO_HREF = '/agencia-seo';

const TEXT_LINK_RE =
  /(<a\b[^>]*\bhref\s*=\s*(["'])(?:https:\/\/(?:www\.)?playfulagency\.com)?\/agencia-seo\/?\2[^>]*>)\s*Landing Page sobre SEO\s*(<\/a>)/gi;

const IMAGE_ONLY_LINK_RE =
  /<a\b[^>]*\bhref\s*=\s*(["'])(?:https:\/\/(?:www\.)?playfulagency\.com)?\/agencia-seo\/?\1[^>]*>\s*(<img\b[\s\S]*?>)\s*<\/a>/gi;

export function rewriteSeoSemAgenciaSeoAnchor(html: string, slug: string): string {
  if (!html || slug !== SEO_SEM_DIFF_SLUG) return html;
  return html
    .replace(TEXT_LINK_RE, `$1${SEO_SEM_NEW_ANCHOR}$3`)
    .replace(IMAGE_ONLY_LINK_RE, '$2');
}
