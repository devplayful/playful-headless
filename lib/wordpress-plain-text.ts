/**
 * One-pass WordPress entity decode for SEO strings (title, meta, OG,
 * Twitter, JSON-LD). Does not recurse: `&amp;#8230;` becomes `&#8230;`,
 * never `…`. Legitimate `&` from a single `&amp;` stays `&`.
 */

const HTML_NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  quot: '"',
  apos: "'",
  lt: '<',
  gt: '>',
  nbsp: ' ',
};

/** Decode numeric/named HTML entities exactly once. */
export function decodeHtmlEntities(value: string | undefined | null): string {
  if (!value) return '';
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const code =
        entity[1].toLowerCase() === 'x'
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCharCode(code) : match;
    }
    return HTML_NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

export type WordpressSeoTextOptions = {
  /** Strip HTML tags before decoding (WP excerpts). */
  stripTags?: boolean;
  /** Clip the still-encoded string (keeps current meta length). */
  maxLength?: number;
  /** Default true. */
  trim?: boolean;
};

/**
 * Prepare WordPress title/excerpt/description for `<title>`, meta
 * description, og:title/og:description, twitter:title/twitter:description
 * and JSON-LD headline/description.
 */
export function wordpressSeoText(
  value: string | undefined | null,
  options: WordpressSeoTextOptions = {},
): string {
  let text = value ?? '';
  if (options.stripTags) {
    text = text.replace(/<[^>]*>?/gm, '');
  }
  if (options.maxLength != null) {
    text = text.substring(0, options.maxLength);
  }
  text = decodeHtmlEntities(text);
  return options.trim === false ? text : text.trim();
}
