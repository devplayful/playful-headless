/**
 * Short links that no longer resolve to the episode's topic.
 * One of them 301s into an adult video site and then 404s.
 * The anchor text stays; only the href is removed.
 */
const HIJACKED_PODCAST_HREFS = new Set([
  'https://bit.ly/3cMK03N',
]);

function hrefFromAttrs(attrs: string): string {
  return /href\s*=\s*(["'])(.*?)\1/i.exec(attrs)?.[2] || '';
}

function normalizeHref(href: string): string {
  const trimmed = href.trim();
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    url.hash = '';
    url.search = '';
    return url.toString().replace(/\/$/, '');
  } catch {
    return trimmed.replace(/\/$/, '');
  }
}

export function stripHijackedPodcastAnchors(html: string): string {
  if (!html) return html;
  return html.replace(/<a\b([^>]*?)>([\s\S]*?)<\/a>/gi, (full, attrs: string, inner: string) => {
    const href = normalizeHref(hrefFromAttrs(attrs));
    if (HIJACKED_PODCAST_HREFS.has(href)) return inner;
    return full;
  });
}
