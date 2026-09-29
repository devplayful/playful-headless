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
 * 12 still beats the old 47+embed (~1.5 MB) and leaves room for closed paths
 * in the newest window of pautas-digitales.
 */
export const RELATED_BLOG_CATEGORY_FETCH_PER_PAGE = 12;
/** Keep this many category cards after the closed-path filter. */
export const RELATED_BLOG_CATEGORY_PER_PAGE = RELATED_BLOG_FETCH_COUNT;
/** Next Data Cache TTL for the lite category fetch. Empty/timeout must not stick for 3600s. */
export const RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS = 60;
/** REST `_fields` for related cards. No `_embed`, no Yoast, no content. */
export const RELATED_BLOG_POST_FIELDS =
  'id,date,date_gmt,modified,modified_gmt,slug,title,excerpt,featured_media,categories,status';

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
