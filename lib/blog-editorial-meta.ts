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
import { decodeHtmlEntities, wordpressSeoText } from './wordpress-plain-text.ts';

export { decodeHtmlEntities, wordpressSeoText };

export const DEFAULT_EDITORIAL_BYLINE = 'Equipo editorial de Playful Agency';
/** Visible / schema / meta name when the piece is signed by the content team. */
export const EDITORIAL_TEAM_NAME = 'Equipo editorial';
export const EDITORIAL_ORGANIZATION_URL = 'https://playfulagency.com';
export const EDITORIAL_AVATAR_SRC = '/images/avatar-playful.svg';
export const BLOG_AUTHOR_URL = 'https://playfulagency.com/nosotros';
export const BLOG_AUTHOR_HREF = '/nosotros';

const ARTICLE_ISO_WITH_ZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const ARTICLE_ISO_ZONELESS =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?$/;
const ARTICLE_ISO_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

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
  if (ARTICLE_ISO_DATE_ONLY.test(trimmed)) {
    return `${trimmed}T00:00:00.000Z`;
  }
  // Keep Europe/Madrid (or any numeric) offsets and Z as written. Do not fold them.
  if (ARTICLE_ISO_WITH_ZONE.test(trimmed)) {
    return trimmed;
  }
  const timestamp = Date.parse(trimmed);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : trimmed;
}

/**
 * Article timestamps (schema + meta): ISO 8601 with a timezone.
 * WordPress `*_gmt` values have no suffix — they are UTC, so we append `Z`.
 * Offsets already present (eShow `+02:00`) stay as written.
 * Date-only strings are rejected so dateModified cannot fall back to midnight.
 */
export function toArticleIsoDateTime(value: string | undefined | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || ARTICLE_ISO_DATE_ONLY.test(trimmed)) return null;
  if (ARTICLE_ISO_WITH_ZONE.test(trimmed)) return trimmed;
  if (ARTICLE_ISO_ZONELESS.test(trimmed)) return `${trimmed}Z`;
  const timestamp = Date.parse(trimmed);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

export function articleInstantsEqual(
  left: string | undefined | null,
  right: string | undefined | null,
): boolean {
  const a = toArticleIsoDateTime(left);
  const b = toArticleIsoDateTime(right);
  if (!a || !b) return false;
  return Date.parse(a) === Date.parse(b);
}

export type BlogArticleTimestamps = {
  datePublished: string;
  dateModified: string;
  hasDistinctModified: boolean;
};

/**
 * Schema/meta instants: `date_gmt` / `modified_gmt` (real WP modified),
 * never the editorial override date-only midnight.
 */
export function resolveBlogArticleTimestamps(
  dates: BlogEditorialDates = {},
): BlogArticleTimestamps {
  const datePublished =
    toArticleIsoDateTime(dates.publishedGmt)
    || toArticleIsoDateTime(dates.published);
  const dateModified =
    toArticleIsoDateTime(dates.modifiedGmt)
    || toArticleIsoDateTime(dates.modified)
    || datePublished;
  if (!datePublished || !dateModified) {
    throw new Error('Blog article timestamps require a datetime with a timezone');
  }
  return {
    datePublished,
    dateModified,
    hasDistinctModified: Date.parse(datePublished) !== Date.parse(dateModified),
  };
}

/**
 * datetime of the visible «Actualizado el …» copy.
 * Honored editorial dates (override or WP day after the cutoff) win so the
 * chip `<time>` matches the label. Schema/meta still use `dateModified`.
 */
export function resolveVisibleUpdatedDateTime(
  editorial: BlogEditorialUpdate | null,
  articleDates: BlogArticleTimestamps,
): string {
  if (editorial?.updatedAt) {
    return toArticleIsoDateTime(editorial.updatedAt) || toIsoDateTime(editorial.updatedAt);
  }
  return articleDates.dateModified;
}

export function isEditorialTeamName(name: string | undefined | null): boolean {
  const trimmed = (name || '').trim();
  return trimmed === EDITORIAL_TEAM_NAME || trimmed === DEFAULT_EDITORIAL_BYLINE;
}

/** Positive WP user id from REST (`author: 21` or `_embedded.author[0].id`). */
export function wordpressAuthorId(input: {
  author?: number | { id?: number | null } | null;
}): number | null {
  if (typeof input.author === 'number' && Number.isInteger(input.author) && input.author > 0) {
    return input.author;
  }
  if (
    input.author
    && typeof input.author === 'object'
    && typeof input.author.id === 'number'
    && Number.isInteger(input.author.id)
    && input.author.id > 0
  ) {
    return input.author.id;
  }
  return null;
}

export function resolveBlogPostAuthorName(input: {
  author?: number | { name?: string | null } | null;
  author_name?: string | null;
}): string {
  if (input.author && typeof input.author === 'object' && input.author.name?.trim()) {
    return input.author.name.trim();
  }
  if (input.author_name?.trim()) return input.author_name.trim();
  return '';
}

export type BlogArticleAuthor = {
  /** Chip copy. Combined «{Author} y Equipo editorial…» when a rewrite is honored. */
  visibleByline: string;
  /** Schema + `article:author`: WP Person, or «Equipo editorial» on local team posts. */
  entityName: string;
  schemaType: 'Person' | 'Organization';
  schemaUrl?: string;
  href?: string;
  avatarSrc?: string;
};

/**
 * Schema `author` and `article:author` read the WordPress author (Person →
 * /nosotros). Local team posts that are not in WP (eShow) use «Equipo
 * editorial» as Organization. The visible pill is unchanged.
 */
export function resolveBlogArticleAuthor(
  post: {
    author?: number | { id?: number | null; name?: string | null; url?: string | null; avatar_urls?: { [key: string]: string } } | null;
    author_name?: string | null;
  },
  editorial: BlogEditorialUpdate | null = null,
  options: { avatarSrc?: string } = {},
): BlogArticleAuthor {
  const personName = resolveBlogPostAuthorName(post);
  const fromWordPress = wordpressAuthorId(post) != null;
  const isLocalEditorial = !fromWordPress && isEditorialTeamName(personName);

  const visibleByline = isLocalEditorial
    ? EDITORIAL_TEAM_NAME
    : editorial
      ? formatCombinedByline(personName, editorial.updatedBy)
      : personName || 'Playful Agency';

  if (isLocalEditorial) {
    return {
      visibleByline,
      entityName: EDITORIAL_TEAM_NAME,
      schemaType: 'Organization',
      schemaUrl: EDITORIAL_ORGANIZATION_URL,
      avatarSrc: options.avatarSrc || EDITORIAL_AVATAR_SRC,
    };
  }

  const entityName = personName || 'Playful Agency';
  const avatarSrc = options.avatarSrc
    || (post.author && typeof post.author === 'object' ? post.author.avatar_urls?.['48'] : undefined);
  return {
    visibleByline,
    entityName,
    schemaType: 'Person',
    schemaUrl: BLOG_AUTHOR_URL,
    href: BLOG_AUTHOR_HREF,
    avatarSrc,
  };
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

/** Short Spanish month for the post-header chip: «11 oct 2026». */
export const UPDATED_AT_SHORT_MONTHS = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sept',
  'oct',
  'nov',
  'dic',
] as const;

export function formatUpdatedAtShort(value: string): string {
  const iso = toIsoDateTime(value);
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return '';
  const day = date.getUTCDate();
  const month = UPDATED_AT_SHORT_MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${month} ${year}`;
}

/** Visible last-updated chip copy: «Actualizado el 11 oct 2026». */
export function formatUpdatedByline(value: string): string {
  const short = formatUpdatedAtShort(value);
  return short ? `Actualizado el ${short}` : '';
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

export type BlogListingDateStyle = 'long' | 'slash';

/**
 * Visible date for cards/listings: honored last update (same as PR #89),
 * otherwise the publish date. `long` → «22 de abril de 2025»; `slash` → «22 / 04 / 2025».
 */
export function formatBlogListingDate(
  slug: string | undefined | null,
  dates: BlogEditorialDates = {},
  style: BlogListingDateStyle = 'long',
): string {
  const editorial = resolveBlogEditorialUpdate(slug, dates);
  const raw = editorial?.updatedAt || pickPublished(dates);
  if (!raw) return '';
  if (style === 'slash') {
    return new Date(toIsoDateTime(raw)).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    }).split('/').join(' / ');
  }
  return formatEditorialDate(raw);
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const BLOG_CATEGORY_BREADCRUMB_NAMES: Record<string, string> = {
  'e-commerce': 'E-commerce',
  'email-marketing': 'Email Marketing',
  'mas-vistos': 'Más vistos',
  otros: 'Otros',
  'pautas-digitales': 'Pautas Digitales',
  seo: 'Seo',
  tecnologia: 'Tecnologia',
};

export const BLOG_POST_BREADCRUMB_NAMES: Record<string, string> = {
  'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce': 'Zelle en Venezuela',
  'diseno-web-de-paginas-web': 'Diseño web: qué es',
  'rediseno-web': 'Rediseño web',
  'diseno-web-y-posicionamiento-seo': 'Diseño web y SEO',
  'posicionamiento-organico-vs-pago': 'Posicionamiento orgánico vs pago',
};

/** Visible author chip href: `author.url` when it already points at /nosotros. */
export function resolveBlogAuthorHref(url?: string | null): string {
  const raw = (url || '').trim();
  if (!raw) return BLOG_AUTHOR_HREF;
  try {
    const parsed = new URL(raw, 'https://playfulagency.com');
    const path = parsed.pathname.replace(/\/+$/, '') || '/';
    if (path === BLOG_AUTHOR_HREF) return BLOG_AUTHOR_HREF;
  } catch {
    if (raw.replace(/\/+$/, '') === BLOG_AUTHOR_HREF) return BLOG_AUTHOR_HREF;
  }
  return BLOG_AUTHOR_HREF;
}

export function buildBlogBreadcrumbJsonLd(input: {
  categorySlug: string;
  headline: string;
  url: string;
  slug?: string;
}): Record<string, unknown> {
  const shortName = input.slug ? BLOG_POST_BREADCRUMB_NAMES[input.slug] : undefined;
  if (shortName) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Inicio',
          item: 'https://playfulagency.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Blog',
          item: 'https://playfulagency.com/blog',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: shortName,
          item: input.url,
        },
      ],
    };
  }

  // Four-level URLs (/blog/{cat}/{slug}) must not emit a category crumb without `item`
  // (/blog/{cat} is a 308). Visible breadcrumb may still show the category chip.
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://playfulagency.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://playfulagency.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: decodeHtmlEntities(input.headline),
        item: input.url,
      },
    ],
  };
}

export function buildBlogListingBreadcrumbJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Inicio',
        item: 'https://playfulagency.com/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://playfulagency.com/blog',
      },
    ],
  };
}

export function buildBlogArticleJsonLd(input: {
  headline: string;
  description?: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorName?: string;
  url: string;
  publisherName?: string;
  publisherLogo?: string;
  type?: 'Article' | 'BlogPosting';
  about?: { '@type': 'Thing'; name: string };
  inLanguage?: string;
  authorType?: 'Person' | 'Organization';
  authorUrl?: string;
}): Record<string, unknown> {
  const canonical = input.url;
  const authorType = input.authorType || 'Person';
  return {
    '@context': 'https://schema.org',
    '@type': input.type || 'BlogPosting',
    headline: decodeHtmlEntities(input.headline),
    description: wordpressSeoText(input.description ?? ''),
    image: input.image || undefined,
    datePublished: toArticleIsoDateTime(input.datePublished) || toIsoDateTime(input.datePublished),
    dateModified: toArticleIsoDateTime(input.dateModified) || toIsoDateTime(input.dateModified),
    author: authorType === 'Organization'
      ? {
          '@type': 'Organization',
          name: input.authorName || 'Playful Agency',
          ...(input.authorUrl ? { url: input.authorUrl } : {}),
        }
      : {
          '@type': 'Person',
          name: input.authorName || 'Playful Agency',
          url: input.authorUrl || BLOG_AUTHOR_URL,
        },
    publisher: {
      '@type': 'Organization',
      name: input.publisherName || 'Playful Agency',
      logo: {
        '@type': 'ImageObject',
        url: input.publisherLogo || 'https://playfulagency.com/images/logos/playful-logo-schema.png',
      },
    },
    mainEntityOfPage: canonical,
    url: canonical,
    ...(input.about ? { about: input.about } : {}),
    ...(input.inLanguage ? { inLanguage: input.inLanguage } : {}),
  };
}
