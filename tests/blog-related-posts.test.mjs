import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  RELATED_BLOG_CACHE_TTL_MS,
  RELATED_BLOG_CARD_COUNT,
  RELATED_BLOG_CATEGORY_FETCH_PER_PAGE,
  RELATED_BLOG_CATEGORY_PER_PAGE,
  RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS,
  RELATED_BLOG_FETCH_COUNT,
  RELATED_BLOG_FETCH_TIMEOUT_MS,
  RELATED_BLOG_FIELD_LIMIT,
  RELATED_BLOG_FIELD_NAME,
  BLOG_ARTICLE_POST_FIELDS,
  BLOG_LATEST_OVERSCAN,
  BLOG_LISTING_POST_FIELDS,
  BLOG_STATIC_PARAMS_FIELDS,
  RELATED_BLOG_INDEX_PER_PAGE,
  RELATED_BLOG_INDEX_REVALIDATE_SECONDS,
  RELATED_BLOG_POST_FIELDS,
  RELATED_INDEX_UNAVAILABLE,
  RelatedIndexUnavailableError,
  adoptLastKnownGood,
  emptyRelatedBehavior,
  excludeCurrentBlogPost,
  fetchWithRelatedPostsTtl,
  isRelatedPostsCacheFresh,
  isUsableRelatedIndex,
  parseRelatedPostIds,
  pickRelatedCategoryId,
  resolveRelatedBlogPosts,
  selectRelatedFromIndex,
  shouldCacheRelatedPostsResult,
  withRelatedFetchTimeout,
} = await import('../lib/blog-related-posts.ts');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const apiRoute = readFileSync(
  new URL('../app/api/blog-posts/route.ts', import.meta.url),
  'utf8',
);
const relatedSection = readFileSync(
  new URL('../components/sections/BlogRelatedPostsSection.tsx', import.meta.url),
  'utf8',
);

const latest = [
  { id: 1, slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', href: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce' },
  { id: 2, slug: 'agencia-seo-internacional-en-el-2025-es-una-necesidad', href: '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad' },
  { id: 3, slug: 'cintillos-de-promocion', href: '/blog/tecnologia/cintillos-de-promocion' },
  { id: 4, slug: 'los-5-problemas-de-e-commerce', href: '/blog/mas-vistos/los-5-problemas-de-e-commerce' },
  { id: 5, slug: 'actualizar-tu-e-commerce', href: '/blog/tecnologia/actualizar-tu-e-commerce' },
  { id: 6, slug: 'crear-un-e-commerce', href: '/blog/tecnologia/crear-un-e-commerce' },
  { id: 7, slug: 'septimo-mas-reciente', href: '/blog/tecnologia/septimo-mas-reciente' },
];

test('related carousel keeps 6 cards after dropping the current post', () => {
  assert.equal(RELATED_BLOG_CARD_COUNT, 6);
  assert.equal(RELATED_BLOG_FETCH_COUNT, 7);

  const withoutZelle = excludeCurrentBlogPost(latest, {
    slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  });
  assert.deepEqual(
    withoutZelle.map((post) => post.slug),
    latest.slice(1).map((post) => post.slug),
  );
  assert.equal(withoutZelle.length, 6);
  assert.equal(
    withoutZelle.some((post) => post.slug === 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    false,
  );

  const withoutId = excludeCurrentBlogPost(latest, { id: 3 });
  assert.equal(withoutId.some((post) => post.slug === 'cintillos-de-promocion'), false);
  assert.equal(withoutId.length, 6);
  assert.equal(withoutId[0].slug, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
});

test('an older post that is not in the latest 7 keeps the same first 6 cards', () => {
  const related = excludeCurrentBlogPost(latest, { slug: 'ecommerce-mi-negocio-online', id: 99 });
  assert.deepEqual(
    related.map((post) => post.slug),
    latest.slice(0, 6).map((post) => post.slug),
  );
});

test('related-posts process cache expires after 3600s and retries after failure', async () => {
  assert.equal(RELATED_BLOG_CACHE_TTL_MS, 3600 * 1000);
  assert.equal(isRelatedPostsCacheFresh({ promise: Promise.resolve([]), fetchedAt: 0 }, 3599_999), true);
  assert.equal(isRelatedPostsCacheFresh({ promise: Promise.resolve([]), fetchedAt: 0 }, 3600_000), false);

  let now = 1_000;
  let loads = 0;
  const state = { current: null };
  const load = async () => {
    loads += 1;
    return [`batch-${loads}`];
  };

  const first = await fetchWithRelatedPostsTtl(state, load, () => now);
  const second = await fetchWithRelatedPostsTtl(state, load, () => now + 3599_999);
  assert.deepEqual(first, ['batch-1']);
  assert.deepEqual(second, ['batch-1']);
  assert.equal(loads, 1);

  const third = await fetchWithRelatedPostsTtl(state, load, () => now + 3600_000);
  assert.deepEqual(third, ['batch-2']);
  assert.equal(loads, 2);

  const failing = { current: null };
  let attempts = 0;
  await assert.rejects(
    () =>
      fetchWithRelatedPostsTtl(
        failing,
        async () => {
          attempts += 1;
          throw new Error('wp-down');
        },
        () => now,
      ),
    /wp-down/,
  );
  assert.equal(failing.current, null);
  await assert.rejects(
    () =>
      fetchWithRelatedPostsTtl(
        failing,
        async () => {
          attempts += 1;
          throw new Error('wp-down');
        },
        () => now,
      ),
    /wp-down/,
  );
  assert.equal(attempts, 2);
});

test('empty related results are not cached so a timeout fallback retries', async () => {
  assert.equal(shouldCacheRelatedPostsResult([]), false);
  assert.equal(shouldCacheRelatedPostsResult(new Map()), false);
  assert.equal(shouldCacheRelatedPostsResult([{ id: 1 }]), true);

  let now = 5_000;
  let loads = 0;
  const state = { current: null };
  const first = await fetchWithRelatedPostsTtl(state, async () => {
    loads += 1;
    return [];
  }, () => now);
  assert.deepEqual(first, []);
  assert.equal(state.current, null);
  assert.equal(loads, 1);

  const second = await fetchWithRelatedPostsTtl(state, async () => {
    loads += 1;
    return [{ slug: 'pautas-ok' }];
  }, () => now + 10);
  assert.deepEqual(second, [{ slug: 'pautas-ok' }]);
  assert.equal(loads, 2);
  assert.equal(state.current == null, false);
});

test('pickRelatedCategoryId prefers the URL slug on multi-category posts', () => {
  const categories = [
    { id: 51, slug: 'mas-vistos', name: 'Más vistos' },
    { id: 25, slug: 'pautas-digitales', name: 'Pautas Digitales' },
  ];
  assert.equal(pickRelatedCategoryId(categories, 'pautas-digitales'), 25);
  assert.equal(pickRelatedCategoryId(categories, 'mas-vistos'), 51);
  assert.equal(pickRelatedCategoryId(categories), 51);
  assert.equal(pickRelatedCategoryId([25, 51], 'pautas-digitales'), 25);
  assert.equal(pickRelatedCategoryId(undefined, 'pautas-digitales'), undefined);
});

test('blog post page resolves related from the shared index, not a live WP fetch', () => {
  assert.match(blogPage, /getRelatedBlogPostsForPost\(post/);
  assert.match(blogPage, /categorySlug: category/);
  assert.match(blogPage, /excludeCurrentBlogPost\(/);
  assert.match(blogPage, /excludeSlug=\{post\.slug\}/);
  assert.match(blogPage, /excludeId=\{post\.id\}/);
  assert.match(blogPage, /emptyRelatedBehavior\(\)/);
  assert.match(blogPage, /RelatedIndexUnavailableError/);
  assert.match(blogPage, /relatedPosts\.length > 0/);
  assert.match(blogPage, /getBlogStaticParams\(\)/);
  assert.doesNotMatch(blogPage, /getBlogPosts\(page, perPage\)/);
  assert.doesNotMatch(blogPage, /getLatestBlogPosts/);
  assert.doesNotMatch(blogPage, /fetchLatestRelatedBlogPosts/);
  assert.doesNotMatch(blogPage, /Cargando artículos/);
});

const catalog = [
  { id: 10, slug: 'manual-uno', href: '/blog/seo/manual-uno', status: 'publish' },
  { id: 20, slug: 'manual-dos', href: '/blog/seo/manual-dos', status: 'publish' },
  { id: 30, slug: 'manual-tres', href: '/blog/seo/manual-tres', status: 'publish' },
  { id: 40, slug: 'manual-cuatro-ignorado', href: '/blog/seo/manual-cuatro-ignorado', status: 'publish' },
  { id: 50, slug: 'draft-id', href: '/blog/seo/draft-id', status: 'draft' },
  { id: 101, slug: 'cat-alpha', href: '/blog/seo/cat-alpha', status: 'publish' },
  { id: 102, slug: 'cat-beta', href: '/blog/seo/cat-beta', status: 'publish' },
  { id: 103, slug: 'cat-gamma', href: '/blog/seo/cat-gamma', status: 'publish' },
  { id: 201, slug: 'latest-one', href: '/blog/tecnologia/latest-one', status: 'publish' },
  { id: 202, slug: 'latest-two', href: '/blog/tecnologia/latest-two', status: 'publish' },
  { id: 203, slug: 'latest-three', href: '/blog/tecnologia/latest-three', status: 'publish' },
  { id: 204, slug: 'latest-four', href: '/blog/tecnologia/latest-four', status: 'publish' },
  { id: 205, slug: 'latest-five', href: '/blog/tecnologia/latest-five', status: 'publish' },
  { id: 206, slug: 'latest-six', href: '/blog/tecnologia/latest-six', status: 'publish' },
];
const postsById = new Map(catalog.map((post) => [post.id, post]));
const sameCategory = catalog.filter((post) => post.id >= 101 && post.id <= 103);
const latestPool = catalog.filter((post) => post.id >= 201);

test('resolver uses the field IDs in order and caps at 3', () => {
  assert.equal(RELATED_BLOG_FIELD_LIMIT, 3);
  assert.equal(RELATED_BLOG_FIELD_NAME, 'articulos_relacionados');

  const related = resolveRelatedBlogPosts({
    current: { id: 99, slug: 'current-post' },
    fieldIds: [10, 20, 30, 40],
    postsById,
    sameCategory,
    latest: latestPool,
  });
  assert.deepEqual(
    related.slice(0, 3).map((post) => post.slug),
    ['manual-uno', 'manual-dos', 'manual-tres'],
  );
  assert.equal(related.some((post) => post.slug === 'manual-cuatro-ignorado'), false);
  assert.equal(related.length, 6);
});

test('resolver fills a partial field from the same category then latest', () => {
  const related = resolveRelatedBlogPosts({
    current: { id: 99, slug: 'current-post' },
    fieldIds: [20],
    postsById,
    sameCategory,
    latest: latestPool,
  });
  assert.deepEqual(
    related.map((post) => post.slug),
    ['manual-dos', 'cat-alpha', 'cat-beta', 'cat-gamma', 'latest-one', 'latest-two'],
  );
});

test('resolver falls back to category then latest when the field is empty or missing', () => {
  const emptyField = resolveRelatedBlogPosts({
    current: { id: 99, slug: 'current-post' },
    fieldIds: [],
    postsById,
    sameCategory,
    latest: latestPool,
  });
  assert.deepEqual(
    emptyField.map((post) => post.slug),
    ['cat-alpha', 'cat-beta', 'cat-gamma', 'latest-one', 'latest-two', 'latest-three'],
  );

  const missingField = resolveRelatedBlogPosts({
    current: { id: 99, slug: 'current-post' },
    postsById,
    sameCategory,
    latest: latestPool,
  });
  assert.deepEqual(missingField.map((post) => post.slug), emptyField.map((post) => post.slug));
});

test('resolver skips a field ID that is missing from the published map', () => {
  const related = resolveRelatedBlogPosts({
    current: { id: 99, slug: 'current-post' },
    fieldIds: [99999, 20],
    postsById,
    sameCategory,
    latest: latestPool,
  });
  assert.equal(related[0].slug, 'manual-dos');
  assert.equal(related.some((post) => post.id === 99999), false);
});

test('resolver skips unpublished IDs, the current post, and duplicates', () => {
  const related = resolveRelatedBlogPosts({
    current: { id: 10, slug: 'manual-uno' },
    fieldIds: [10, 50, 20],
    postsById,
    sameCategory,
    latest: latestPool,
  });
  assert.equal(related.some((post) => post.id === 10 || post.slug === 'manual-uno'), false);
  assert.equal(related.some((post) => post.id === 50), false);
  assert.equal(related[0].slug, 'manual-dos');
  assert.deepEqual(
    related.slice(1, 4).map((post) => post.slug),
    ['cat-alpha', 'cat-beta', 'cat-gamma'],
  );
  assert.equal(related.length, 6);
  assert.equal(new Set(related.map((post) => post.id)).size, related.length);
});

test('parseRelatedPostIds reads acf/meta and ignores the current empty ACF array', () => {
  assert.deepEqual(
    parseRelatedPostIds({ acf: { articulos_relacionados: [10, '20', { id: 30 }, 40] } }),
    [10, 20, 30],
  );
  assert.deepEqual(
    parseRelatedPostIds({ meta: { articulos_relacionados: [{ ID: 7 }, 8] } }),
    [7, 8],
  );
  assert.deepEqual(parseRelatedPostIds({ acf: [] }), []);
  assert.deepEqual(parseRelatedPostIds({ meta: { _acf_changed: false } }), []);
  assert.deepEqual(parseRelatedPostIds(undefined), []);
  assert.deepEqual(parseRelatedPostIds(null), []);
  assert.deepEqual(parseRelatedPostIds('basura'), []);
  assert.deepEqual(parseRelatedPostIds('12abc'), []);
  assert.deepEqual(parseRelatedPostIds({ acf: { articulos_relacionados: 'no-es-un-id' } }), []);
  assert.deepEqual(
    parseRelatedPostIds({ acf: { articulos_relacionados: [null, '', 'foo', -3, 0, 2.5, '  '] } }),
    [],
  );
});

test('withRelatedFetchTimeout returns fallback on timeout and thrown errors', async () => {
  assert.equal(RELATED_BLOG_FETCH_TIMEOUT_MS, 4000);

  const ok = await withRelatedFetchTimeout(async () => ['manual'], ['fallback']);
  assert.deepEqual(ok, ['manual']);

  const timedOut = await withRelatedFetchTimeout(
    async (signal) => new Promise((_, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason), { once: true });
    }),
    ['fallback'],
    20,
  );
  assert.deepEqual(timedOut, ['fallback']);

  const failed = await withRelatedFetchTimeout(
    async () => {
      throw new Error('wp-down');
    },
    ['fallback'],
  );
  assert.deepEqual(failed, ['fallback']);
});

test('wordpress related fetch keeps 3600s revalidate and reads articulos_relacionados', () => {
  const wordpress = readFileSync(
    new URL('../services/wordpress.ts', import.meta.url),
    'utf8',
  );
  const plugin = readFileSync(
    new URL('../wordpress-related-posts.php', import.meta.url),
    'utf8',
  );
  assert.match(wordpress, /parseRelatedPostIds\(post\)/);
  assert.match(wordpress, /getBlogRelatedIndex\(/);
  assert.match(wordpress, /selectRelatedFromIndex\(/);
  assert.match(wordpress, /withRelatedFetchTimeout/);
  assert.match(wordpress, /RELATED_BLOG_FETCH_TIMEOUT_MS/);
  assert.match(wordpress, /acf_format=standard/);
  assert.match(wordpress, /revalidate: 3600/);
  assert.match(wordpress, /status', 'publish'/);
  assert.match(plugin, /register_post_meta\('post', PLAYFUL_RELATED_META_KEY/);
  assert.match(plugin, /articulos_relacionados/);
  assert.match(plugin, /'max' => PLAYFUL_RELATED_META_MAX/);
  assert.match(plugin, /show_in_rest/);
});

test('shared related index is lite, long-lived and last-known-good', () => {
  const wordpress = readFileSync(
    new URL('../services/wordpress.ts', import.meta.url),
    'utf8',
  );
  assert.equal(RELATED_BLOG_INDEX_PER_PAGE, 100);
  assert.equal(RELATED_BLOG_INDEX_REVALIDATE_SECONDS, 21_600);
  assert.match(RELATED_BLOG_POST_FIELDS, /^id,date/);
  assert.doesNotMatch(RELATED_BLOG_POST_FIELDS, /content|yoast|_links|_embed/);
  assert.match(BLOG_LISTING_POST_FIELDS, /author/);
  assert.doesNotMatch(BLOG_LISTING_POST_FIELDS, /content|yoast|_embed/);
  assert.equal(BLOG_STATIC_PARAMS_FIELDS, 'id,slug,categories');
  assert.match(BLOG_ARTICLE_POST_FIELDS, /content/);
  assert.match(BLOG_ARTICLE_POST_FIELDS, /acf/);
  assert.equal(BLOG_LATEST_OVERSCAN, 8);
  assert.match(wordpress, /RELATED_BLOG_INDEX_REVALIDATE_SECONDS/);
  assert.match(wordpress, /RELATED_BLOG_INDEX_PER_PAGE/);
  assert.match(wordpress, /RELATED_BLOG_POST_FIELDS/);
  assert.match(wordpress, /adoptLastKnownGood\(/);
  assert.match(wordpress, /isUsableRelatedIndex\(/);
  const indexStart = wordpress.indexOf('async function loadBlogRelatedIndex');
  const indexEnd = wordpress.indexOf('export async function getRelatedBlogPostsForPost');
  assert.ok(indexStart >= 0 && indexEnd > indexStart);
  const indexLoader = wordpress.slice(indexStart, indexEnd);
  assert.doesNotMatch(indexLoader, /_embed/);
  assert.match(indexLoader, /_fields/);
  assert.match(indexLoader, /orderby/);
  assert.match(indexLoader, /status/);
  const resolveStart = wordpress.indexOf('export async function getRelatedBlogPostsForPost');
  const resolveFn = wordpress.slice(resolveStart, resolveStart + 1200);
  assert.match(resolveFn, /selectRelatedFromIndex/);
  assert.doesNotMatch(resolveFn, /getRelatedBlogPostsByCategory/);
  assert.doesNotMatch(resolveFn, /getBlogPostsByIds/);
  assert.equal(RELATED_BLOG_CATEGORY_FETCH_PER_PAGE, 20);
  assert.equal(RELATED_BLOG_CATEGORY_PER_PAGE, 7);
  assert.equal(RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS, 60);
});

test('blog-posts API excludes via query and keeps six cards', () => {
  assert.match(apiRoute, /searchParams\.get\('exclude'\)/);
  assert.match(apiRoute, /RELATED_BLOG_FETCH_COUNT/);
  assert.match(apiRoute, /excludeCurrentBlogPost\(posts/);
  assert.match(relatedSection, /params\.set\('exclude'/);
  assert.match(relatedSection, /excludeCurrentBlogPost\(arr/);
  assert.match(relatedSection, /Cargando artículos…/);
  assert.match(relatedSection, /posts\.length === 0/);
  assert.match(relatedSection, /return null/);
});

function indexPost(partial) {
  return {
    title: partial.slug,
    excerpt: '',
    date: '2026-01-01T00:00:00.000Z',
    categoryIds: [],
    categorySlug: 'tecnologia',
    categoryName: 'Tecnología',
    href: `/blog/tecnologia/${partial.slug}`,
    status: 'publish',
    ...partial,
  };
}

test('selectRelatedFromIndex prefers field IDs, then URL category, then latest', () => {
  const index = {
    fetchedAt: 1,
    terms: [
      { id: 25, slug: 'pautas-digitales', name: 'Pautas Digitales' },
      { id: 51, slug: 'mas-vistos', name: 'Más vistos' },
      { id: 10, slug: 'tecnologia', name: 'Tecnología' },
    ],
    posts: [
      indexPost({
        id: 1,
        slug: 'manual-pautas',
        categoryIds: [25],
        categorySlug: 'pautas-digitales',
        href: '/blog/pautas-digitales/manual-pautas',
        date: '2026-01-10T00:00:00.000Z',
      }),
      indexPost({
        id: 2,
        slug: 'pautas-reciente',
        categoryIds: [25],
        categorySlug: 'pautas-digitales',
        href: '/blog/pautas-digitales/pautas-reciente',
        date: '2026-02-01T00:00:00.000Z',
      }),
      indexPost({
        id: 3,
        slug: 'pautas-viejo',
        categoryIds: [25],
        categorySlug: 'pautas-digitales',
        href: '/blog/pautas-digitales/pautas-viejo',
        date: '2025-01-01T00:00:00.000Z',
      }),
      indexPost({
        id: 4,
        slug: 'mixto-mas-vistos',
        categoryIds: [51, 25],
        categorySlug: 'mas-vistos',
        href: '/blog/mas-vistos/mixto-mas-vistos',
        date: '2026-03-01T00:00:00.000Z',
      }),
      indexPost({
        id: 5,
        slug: 'tech-latest',
        categoryIds: [10],
        date: '2026-04-01T00:00:00.000Z',
      }),
      indexPost({
        id: 6,
        slug: 'tech-two',
        categoryIds: [10],
        date: '2026-03-15T00:00:00.000Z',
      }),
      indexPost({
        id: 7,
        slug: 'tech-three',
        categoryIds: [10],
        date: '2026-03-10T00:00:00.000Z',
      }),
      indexPost({
        id: 99,
        slug: 'current-pautas',
        categoryIds: [25],
        categorySlug: 'pautas-digitales',
        href: '/blog/pautas-digitales/current-pautas',
        date: '2026-05-01T00:00:00.000Z',
      }),
    ],
  };

  const related = selectRelatedFromIndex(index, {
    current: { id: 99, slug: 'current-pautas' },
    fieldIds: [1],
    categorySlug: 'pautas-digitales',
  });
  assert.equal(related[0].slug, 'manual-pautas');
  assert.deepEqual(
    related.slice(1, 4).map((post) => post.slug),
    ['pautas-reciente', 'pautas-viejo', 'mixto-mas-vistos'],
  );
  assert.equal(related.some((post) => post.slug === 'current-pautas'), false);
  assert.equal(related.length, 6);
  assert.equal(
    related.filter((post) => post.categoryIds.includes(25) || post.categorySlug === 'pautas-digitales').length,
    4,
  );
});

test('last-known-good index ignores empty refreshes and empty related hides or throws', () => {
  const good = { posts: [indexPost({ id: 1, slug: 'ok' })], terms: [], fetchedAt: 1 };
  const state = { value: null };
  assert.equal(isUsableRelatedIndex(null), false);
  assert.equal(isUsableRelatedIndex({ posts: [], terms: [], fetchedAt: 1 }), false);
  assert.equal(adoptLastKnownGood(state, good, isUsableRelatedIndex)?.posts[0].slug, 'ok');
  assert.equal(adoptLastKnownGood(state, { posts: [], terms: [], fetchedAt: 2 }, isUsableRelatedIndex)?.posts[0].slug, 'ok');
  assert.equal(adoptLastKnownGood(state, null, isUsableRelatedIndex)?.posts[0].slug, 'ok');
  assert.equal(emptyRelatedBehavior({ phase: 'phase-production-build', nodeEnv: 'production' }), 'hide');
  assert.equal(emptyRelatedBehavior({ phase: '', nodeEnv: 'development' }), 'hide');
  assert.equal(emptyRelatedBehavior({ phase: '', nodeEnv: 'production' }), 'throw');
  assert.equal(new RelatedIndexUnavailableError().message, RELATED_INDEX_UNAVAILABLE);
});
