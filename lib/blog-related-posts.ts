/** Visible carousel keeps this many cards after dropping the current post. */
export const RELATED_BLOG_CARD_COUNT = 6;
/** Fetch one extra so filtering the current slug/id still fills the carousel. */
export const RELATED_BLOG_FETCH_COUNT = RELATED_BLOG_CARD_COUNT + 1;
/** Manual ACF / post-meta field contributes at most this many IDs, in field order. */
export const RELATED_BLOG_FIELD_LIMIT = 3;
/** REST key on `acf` and `meta` (see wordpress-related-posts.php). */
export const RELATED_BLOG_FIELD_NAME = 'articulos_relacionados';
/** Aligns with getLatestBlogPosts `revalidate: 3600` so runtime does not pin stale latest-7. */
export const RELATED_BLOG_CACHE_TTL_MS = 3600 * 1000;
/** Soft deadline for field / category / latest related fetches. The post page must not 500. */
export const RELATED_BLOG_FETCH_TIMEOUT_MS = 4000;
/**
 * WP `per_page` for the category related fetch. Small on purpose (no `_embed`):
 * 20 still beats the old 47+embed (~1.5 MB) and leaves room for closed paths
 * plus multi-category posts whose primary slug is not the URL category.
 */
export const RELATED_BLOG_CATEGORY_FETCH_PER_PAGE = 20;
/** Keep this many category cards after the closed-path filter. */
export const RELATED_BLOG_CATEGORY_PER_PAGE = RELATED_BLOG_FETCH_COUNT;
/** Next Data Cache TTL for the lite category fetch. Empty/timeout must not stick for 3600s. */
export const RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS = 60;
/** REST `_fields` for the shared related index and lite cards. No `_embed`, no Yoast, no content. */
export const RELATED_BLOG_POST_FIELDS =
  'id,date,date_gmt,modified,modified_gmt,slug,title,excerpt,featured_media,categories,status';
/**
 * Listing cards (/blog, latest, by-id). Same as the related index plus `author`
 * so the hub can print the byline without pulling `content` or Yoast.
 */
export const BLOG_LISTING_POST_FIELDS = `${RELATED_BLOG_POST_FIELDS},author`;
/** generateStaticParams only needs the slug and the category ids. */
export const BLOG_STATIC_PARAMS_FIELDS = 'id,slug,categories';
/**
 * Single-article payload. `content` lives here only. `_links` is required for
 * `_embed=wp:featuredmedia,wp:term,author` to materialize `_embedded`.
 */
export const BLOG_ARTICLE_POST_FIELDS =
  'id,date,date_gmt,modified,modified_gmt,slug,title,content,excerpt,featured_media,categories,author,acf,meta,_links,_embedded';
/** Media lookup used by listings instead of embedding every image size. */
export const BLOG_MEDIA_FIELDS = 'id,source_url,alt_text';
/** Author lookup used by listings instead of embedding avatar maps. */
export const BLOG_AUTHOR_FIELDS = 'id,name,slug';
/**
 * Next cannot cache REST bodies over 2 MB. Measured listing+embed-media at
 * 100 posts is ~0.53 MB; 1.5 MB is the hard ceiling we paginate against.
 */
export const WP_FETCH_CACHE_CEILING_BYTES = 2 * 1024 * 1024;
export const WP_FETCH_SAFE_BODY_BYTES = 1_500_000;
/** Shared index lives in Next Data Cache this long. Related pages read it; they do not refetch WP. */
export const RELATED_BLOG_INDEX_REVALIDATE_SECONDS = 21_600;
/** WP REST max per_page. Two pages of `_fields`-only posts stay ~54 KB each. */
export const RELATED_BLOG_INDEX_PER_PAGE = 100;
/** Latest-N overscan after dropping closed paths. Was +40 with full `_embed` (~2.1 MB). */
export const BLOG_LATEST_OVERSCAN = 8;
export const RELATED_INDEX_UNAVAILABLE = 'RELATED_INDEX_UNAVAILABLE';

export type RelatedPostsCacheEntry<T> = {
  promise: Promise<T>;
  fetchedAt: number;
};

export type RelatedPostsCacheState<T> = {
  current: RelatedPostsCacheEntry<T> | null;
};

export function isRelatedPostsCacheFresh<T>(
  entry: RelatedPostsCacheEntry<T> | null,
  nowMs: number,
  ttlMs = RELATED_BLOG_CACHE_TTL_MS,
): entry is RelatedPostsCacheEntry<T> {
  return Boolean(entry && nowMs - entry.fetchedAt < ttlMs);
}

/**
 * Prefer the category that matches the URL slug (multi-category posts),
 * then the first numeric / object id. Used so /blog/pautas-digitales/…
 * does not resolve to mas-vistos when both IDs are on the post.
 */
export function pickRelatedCategoryId(
  categories: Array<{ id?: number; slug?: string | null } | number> | undefined,
  preferredSlug?: string | null,
): number | undefined {
  const list = categories ?? [];
  const slug = (preferredSlug || '').trim();
  if (slug) {
    for (const category of list) {
      if (
        category
        && typeof category === 'object'
        && category.slug === slug
        && typeof category.id === 'number'
        && Number.isInteger(category.id)
        && category.id > 0
      ) {
        return category.id;
      }
    }
  }
  const first = list[0];
  if (typeof first === 'number' && Number.isInteger(first) && first > 0) return first;
  if (
    first
    && typeof first === 'object'
    && typeof first.id === 'number'
    && Number.isInteger(first.id)
    && first.id > 0
  ) {
    return first.id;
  }
  return undefined;
}

/** Successful non-empty payloads only. Timeout fallback `[]` must not pin the cache. */
export function shouldCacheRelatedPostsResult<T>(result: T): boolean {
  if (Array.isArray(result)) return result.length > 0;
  if (result instanceof Map) return result.size > 0;
  return result != null;
}

/**
 * Reuse one in-flight/resolved related fetch until TTL elapses.
 * Failed promises and empty arrays are dropped so the next call retries.
 * Run a related-posts fetch with AbortController (~4s). Timeouts and throws
 * resolve to `fallback` so the article page never dies on WordPress slowness.
 */
export async function withRelatedFetchTimeout<T>(
  load: (signal: AbortSignal) => Promise<T>,
  fallback: T,
  timeoutMs = RELATED_BLOG_FETCH_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(
      new DOMException(`Related posts fetch exceeded ${timeoutMs}ms`, 'TimeoutError'),
    );
  }, timeoutMs);
  try {
    return await Promise.race([
      load(controller.signal),
      new Promise<T>((_, reject) => {
        const onAbort = () => reject(controller.signal.reason ?? new Error('related-timeout'));
        if (controller.signal.aborted) {
          onAbort();
          return;
        }
        controller.signal.addEventListener('abort', onAbort, { once: true });
      }),
    ]);
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

export function fetchWithRelatedPostsTtl<T>(
  state: RelatedPostsCacheState<T>,
  load: () => Promise<T>,
  now: () => number = Date.now,
  ttlMs = RELATED_BLOG_CACHE_TTL_MS,
): Promise<T> {
  if (isRelatedPostsCacheFresh(state.current, now(), ttlMs)) {
    return state.current.promise;
  }
  const fetchedAt = now();
  const promise = load()
    .then((result) => {
      if (!shouldCacheRelatedPostsResult(result) && state.current?.promise === promise) {
        state.current = null;
      }
      return result;
    })
    .catch((error) => {
      if (state.current?.promise === promise) {
        state.current = null;
      }
      throw error;
    });
  state.current = { promise, fetchedAt };
  return promise;
}

export type RelatedBlogPostIdentity = {
  slug?: string | null;
  id?: number | string | null;
  href?: string | null;
};

function normalizeSlug(value: string | null | undefined): string {
  return (value || '').trim();
}

function normalizeId(value: number | string | null | undefined): string {
  if (value == null || value === '') return '';
  return String(value);
}

function hrefSlug(href: string | null | undefined): string {
  if (!href) return '';
  try {
    const path = new URL(href, 'https://playfulagency.com').pathname.replace(/\/$/, '');
    const parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  } catch {
    return '';
  }
}

function isCurrentPost<T extends RelatedBlogPostIdentity>(
  post: T,
  current: RelatedBlogPostIdentity,
): boolean {
  const slug = normalizeSlug(current.slug) || hrefSlug(current.href);
  const id = normalizeId(current.id);
  if (slug && (normalizeSlug(post.slug) === slug || hrefSlug(post.href) === slug)) {
    return true;
  }
  if (id && normalizeId(post.id) === id) {
    return true;
  }
  return false;
}

/**
 * Drop the current post (slug or id) and keep the latest `limit` cards.
 * Caller should request `RELATED_BLOG_FETCH_COUNT` so a self-hit still yields 6.
 */
export function excludeCurrentBlogPost<T extends RelatedBlogPostIdentity>(
  posts: T[],
  current: RelatedBlogPostIdentity,
  limit = RELATED_BLOG_CARD_COUNT,
): T[] {
  return posts.filter((post) => !isCurrentPost(post, current)).slice(0, limit);
}

function coerceRelatedPostId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    const id = Number(value.trim());
    return id > 0 ? id : null;
  }
  if (value && typeof value === 'object') {
    const record = value as { id?: unknown; ID?: unknown };
    return coerceRelatedPostId(record.id ?? record.ID);
  }
  return null;
}

function readRelatedFieldValue(source: unknown): unknown {
  if (source == null) return undefined;
  if (Array.isArray(source) || typeof source === 'number' || typeof source === 'string') {
    return source;
  }
  if (typeof source !== 'object') return undefined;

  const record = source as Record<string, unknown>;
  if (record[RELATED_BLOG_FIELD_NAME] !== undefined) {
    return record[RELATED_BLOG_FIELD_NAME];
  }

  const acf = record.acf;
  if (acf && typeof acf === 'object' && !Array.isArray(acf)) {
    const fromAcf = (acf as Record<string, unknown>)[RELATED_BLOG_FIELD_NAME];
    if (fromAcf !== undefined) return fromAcf;
  }

  const meta = record.meta;
  if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
    const fromMeta = (meta as Record<string, unknown>)[RELATED_BLOG_FIELD_NAME];
    if (fromMeta !== undefined) return fromMeta;
  }

  return undefined;
}

/**
 * Read up to 3 related post IDs from ACF, `meta`, or a raw list.
 * Missing field / `acf: []` (current WP) returns [] so the fallback can run.
 */
export function parseRelatedPostIds(source: unknown): number[] {
  const raw = readRelatedFieldValue(source);
  if (raw == null || raw === '' || raw === false) return [];

  const values = Array.isArray(raw) ? raw : [raw];
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const value of values) {
    const id = coerceRelatedPostId(value);
    if (id == null || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
    if (ids.length >= RELATED_BLOG_FIELD_LIMIT) break;
  }
  return ids;
}

export type RelatedBlogCandidate = RelatedBlogPostIdentity & {
  status?: string | null;
};

function isPublishedCandidate<T extends RelatedBlogCandidate>(
  post: T,
  isUsable?: (post: T) => boolean,
): boolean {
  if (isUsable && !isUsable(post)) return false;
  if (post.status && post.status !== 'publish') return false;
  return true;
}

function identityKeys(post: RelatedBlogPostIdentity): string[] {
  const keys = [
    normalizeId(post.id),
    normalizeSlug(post.slug),
    hrefSlug(post.href),
  ].filter(Boolean);
  return Array.from(new Set(keys));
}

export type ResolveRelatedBlogPostsInput<T extends RelatedBlogCandidate> = {
  current: RelatedBlogPostIdentity;
  fieldIds?: Array<number | string | null | undefined>;
  postsById?: Map<number, T> | Record<string, T | undefined>;
  sameCategory?: T[];
  latest?: T[];
  limit?: number;
  fieldLimit?: number;
  isUsable?: (post: T) => boolean;
};

function postFromId<T extends RelatedBlogCandidate>(
  postsById: ResolveRelatedBlogPostsInput<T>['postsById'],
  id: number,
): T | undefined {
  if (!postsById) return undefined;
  if (postsById instanceof Map) return postsById.get(id);
  return postsById[id] ?? postsById[String(id)];
}

/**
 * Field IDs (order, max 3) → same category → latest.
 * Skips the current post, unpublished rows, missing IDs, and duplicates.
 */
export function resolveRelatedBlogPosts<T extends RelatedBlogCandidate>(
  input: ResolveRelatedBlogPostsInput<T>,
): T[] {
  const limit = input.limit ?? RELATED_BLOG_CARD_COUNT;
  const fieldLimit = input.fieldLimit ?? RELATED_BLOG_FIELD_LIMIT;
  const seen = new Set<string>();
  const result: T[] = [];

  const remember = (post: RelatedBlogPostIdentity) => {
    for (const key of identityKeys(post)) seen.add(key);
  };

  const tryAdd = (post: T | undefined) => {
    if (!post || result.length >= limit) return;
    if (isCurrentPost(post, input.current)) return;
    if (!isPublishedCandidate(post, input.isUsable)) return;
    const keys = identityKeys(post);
    if (keys.length === 0 || keys.some((key) => seen.has(key))) return;
    remember(post);
    result.push(post);
  };

  const fieldIds = parseRelatedPostIds(input.fieldIds ?? []).slice(0, fieldLimit);
  remember(input.current);
  for (const id of fieldIds) {
    tryAdd(postFromId(input.postsById, id));
  }

  for (const post of input.sameCategory ?? []) {
    tryAdd(post);
  }

  for (const post of input.latest ?? []) {
    tryAdd(post);
  }

  return result;
}

export type RelatedIndexTerm = {
  id: number;
  slug: string;
  name: string;
};

export type RelatedIndexPost = RelatedBlogCandidate & {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateGmt?: string;
  modified?: string;
  modifiedGmt?: string;
  featuredMediaId?: number;
  featuredMediaUrl?: string;
  categoryIds: number[];
  categorySlug: string;
  categoryName: string;
  href: string;
};

export type RelatedBlogIndex = {
  posts: RelatedIndexPost[];
  terms: RelatedIndexTerm[];
  fetchedAt: number;
};

export type LastKnownGoodState<T> = {
  value: T | null;
};

export function isUsableRelatedIndex(
  index: RelatedBlogIndex | null | undefined,
): index is RelatedBlogIndex {
  return Boolean(index && Array.isArray(index.posts) && index.posts.length > 0);
}

/**
 * Keep the last non-empty index. A timeout or `[]` must not overwrite it.
 */
export function adoptLastKnownGood<T>(
  state: LastKnownGoodState<T>,
  next: T | null | undefined,
  isUsable: (value: T) => boolean,
): T | null {
  if (next != null && isUsable(next)) {
    state.value = next;
    return next;
  }
  return state.value;
}

export class RelatedIndexUnavailableError extends Error {
  constructor(message = RELATED_INDEX_UNAVAILABLE) {
    super(message);
    this.name = 'RelatedIndexUnavailableError';
  }
}

export type EmptyRelatedBehavior = 'hide' | 'throw';

/**
 * Empty related during ISR must throw so Next keeps the previous HTML.
 * Build / first cold / `next dev` hide the block instead of 500.
 */
export function emptyRelatedBehavior(
  options: { phase?: string | null; nodeEnv?: string | null } = {},
): EmptyRelatedBehavior {
  const phase = options.phase ?? process.env.NEXT_PHASE ?? '';
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? '';
  if (phase === 'phase-production-build' || phase === 'phase-export') return 'hide';
  if (nodeEnv !== 'production') return 'hide';
  return 'throw';
}

function termBySlug(terms: RelatedIndexTerm[], slug: string): RelatedIndexTerm | undefined {
  const wanted = slug.trim();
  if (!wanted) return undefined;
  return terms.find((term) => term.slug === wanted);
}

function timestampMs(value: string | undefined): number {
  if (!value) return 0;
  const ms = Date.parse(value);
  return Number.isFinite(ms) ? ms : 0;
}

function sortByDateDesc(left: RelatedIndexPost, right: RelatedIndexPost): number {
  return timestampMs(right.dateGmt || right.date) - timestampMs(left.dateGmt || left.date);
}

function belongsToCategorySlug(
  post: RelatedIndexPost,
  categorySlug: string,
  categoryId?: number,
): boolean {
  const slug = categorySlug.trim();
  if (categoryId && post.categoryIds.includes(categoryId)) return true;
  if (slug && (post.categorySlug === slug || post.href.startsWith(`/blog/${slug}/`))) {
    return true;
  }
  return false;
}

/**
 * Field IDs → same URL-category (primary slug first) → latest.
 * Always published, never the current post, capped at 6.
 */
export function selectRelatedFromIndex(
  index: RelatedBlogIndex,
  input: {
    current: RelatedBlogPostIdentity;
    fieldIds?: Array<number | string | null | undefined>;
    categorySlug?: string | null;
    isUsable?: (post: RelatedIndexPost) => boolean;
    limit?: number;
  },
): RelatedIndexPost[] {
  const published = index.posts.filter((post) => isPublishedCandidate(post, input.isUsable));
  const postsById = new Map(published.map((post) => [post.id, post]));
  const categorySlug = (input.categorySlug || '').trim();
  const categoryId = termBySlug(index.terms, categorySlug)?.id
    ?? pickRelatedCategoryId(
      published.flatMap((post) => {
        if (post.categorySlug !== categorySlug) return [];
        return post.categoryIds.map((id) => ({ id, slug: post.categorySlug }));
      }),
      categorySlug,
    );

  const sameCategory = published
    .filter((post) => belongsToCategorySlug(post, categorySlug, categoryId))
    .sort((left, right) => {
      const leftPrimary = left.categorySlug === categorySlug ? 0 : 1;
      const rightPrimary = right.categorySlug === categorySlug ? 0 : 1;
      if (leftPrimary !== rightPrimary) return leftPrimary - rightPrimary;
      return sortByDateDesc(left, right);
    });
  const latest = published.slice().sort(sortByDateDesc);

  return resolveRelatedBlogPosts({
    current: input.current,
    fieldIds: input.fieldIds,
    postsById,
    sameCategory,
    latest,
    limit: input.limit ?? RELATED_BLOG_CARD_COUNT,
    isUsable: input.isUsable,
  });
}
