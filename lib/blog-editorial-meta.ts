/**
 * Editorial “last updated” byline for blog posts.
 *
 * Contento rewrites usually live in Next (`lib/blog-body-overrides.ts`) and
 * WordPress is often left untouched. To mark a rewrite:
 *
 *   1. Keep the original WP author (do not change it).
 *   2. Add the slug here with `updatedAt` (ISO `YYYY-MM-DD` or full datetime).
 *   3. Optionally set `updatedBy` — default is «Equipo editorial de Playful Agency».
 *
 * The post header then uses one combined byline
 * («{Author} y Equipo editorial de Playful Agency») and puts
 * «actualizado el …» in the date • category row.
 *
 * Posts without an override still pick up WordPress `modified` / `modified_gmt`
 * when that timestamp is a later UTC calendar day than publish *and* falls on
 * or after `WP_MODIFIED_HONOR_ON_OR_AFTER` (avoids historical Yoast/bulk
 * noise). Same-day WP saves do not show an update.
 */
export const DEFAULT_EDITORIAL_BYLINE = 'Equipo editorial de Playful Agency';
export const EDITORIAL_AVATAR_SRC = '/images/avatar-playful.svg';

/** `{AuthorName} y Equipo editorial de Playful Agency` — single chip copy. */
export function formatCombinedByline(
  authorName: string | undefined | null,
  editorialName: string = DEFAULT_EDITORIAL_BYLINE,
): string {
  const author = (authorName || '').trim();
  const editorial = editorialName.trim() || DEFAULT_EDITORIAL_BYLINE;
  if (!author) return editorial;
  return `${author} y ${editorial}`;
}

/**
 * WordPress `modified` is dirty: Yoast, tapas and bulk saves bump it on
 * almost every post. Auto-honor only dates on/after this UTC day so
 * historical CMS noise does not light up chips. A later WP edit still
 * works without adding an override.
 */
export const WP_MODIFIED_HONOR_ON_OR_AFTER = '2026-09-24';

export type BlogEditorialOverride = {
  /** ISO date (`YYYY-MM-DD`) or full datetime. Marks a Contento rewrite shipped in Next. */
  updatedAt: string;
  /** Defaults to «Equipo editorial de Playful Agency». */
  updatedBy?: string;
};

export const BLOG_EDITORIAL_OVERRIDES: Record<string, BlogEditorialOverride> = {
  // Same slug as ZELLE_VE_BLOG_SLUG in blog-body-overrides.ts
  'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce': {
    updatedAt: '2026-09-24',
  },
};

export type BlogEditorialUpdateSource = 'override' | 'wordpress';

export type BlogEditorialUpdate = {
  updatedAt: string;
  updatedAtLabel: string;
  updatedBy: string;
  source: BlogEditorialUpdateSource;
};

export type BlogEditorialDates = {
  published?: string | null;
  publishedGmt?: string | null;
  modified?: string | null;
  modifiedGmt?: string | null;
};

function utcDay(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const timestamp = Date.parse(trimmed);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10);
}

/** True when `candidate` is a later UTC calendar day than `published`. */
export function isMeaningfullyAfter(
  candidate: string | undefined | null,
  published: string | undefined | null,
): boolean {
  const later = utcDay(candidate);
  const earlier = utcDay(published);
  return Boolean(later && earlier && later > earlier);
}

export function toIsoDateTime(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  const timestamp = Date.parse(trimmed);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : trimmed;
}

export function formatEditorialDate(value: string): string {
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value.trim())
    ? `${value.trim()}T00:00:00.000Z`
    : value;
  return new Date(iso).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function pickPublished(dates: BlogEditorialDates): string | null {
  return dates.publishedGmt || dates.published || null;
}

function pickModified(dates: BlogEditorialDates): string | null {
  return dates.modifiedGmt || dates.modified || null;
}

function toUpdate(
  rawDate: string,
  updatedBy: string,
  source: BlogEditorialUpdateSource,
): BlogEditorialUpdate {
  return {
    updatedAt: toIsoDateTime(rawDate),
    updatedAtLabel: formatEditorialDate(rawDate),
    updatedBy,
    source,
  };
}

/**
 * Resolve whether a post has a real editorial update for the combined byline
 * and the «actualizado el …» date row. Override `updatedAt` wins; otherwise
 * WP `modified` when it is a later day on/after the honor cutoff.
 */
export function resolveBlogEditorialUpdate(
  slug: string | undefined | null,
  dates: BlogEditorialDates = {},
): BlogEditorialUpdate | null {
  const published = pickPublished(dates);
  const override = slug ? BLOG_EDITORIAL_OVERRIDES[slug] : undefined;

  if (override?.updatedAt) {
    if (published && !isMeaningfullyAfter(override.updatedAt, published)) {
      return null;
    }
    return toUpdate(
      override.updatedAt,
      override.updatedBy?.trim() || DEFAULT_EDITORIAL_BYLINE,
      'override',
    );
  }

  const modified = pickModified(dates);
  if (!modified || !published || !isMeaningfullyAfter(modified, published)) {
    return null;
  }

  const modifiedDay = utcDay(modified);
  if (!modifiedDay || modifiedDay < WP_MODIFIED_HONOR_ON_OR_AFTER) {
    return null;
  }

  return toUpdate(modified, DEFAULT_EDITORIAL_BYLINE, 'wordpress');
}

export function buildBlogArticleJsonLd(input: {
  headline: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
  url?: string;
}): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: {
      '@type': 'Person',
      name: input.authorName || 'Playful Agency',
    },
    ...(input.url ? { url: input.url } : {}),
  };
}
