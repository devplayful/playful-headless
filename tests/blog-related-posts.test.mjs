import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  RELATED_BLOG_CACHE_TTL_MS,
  RELATED_BLOG_CARD_COUNT,
  RELATED_BLOG_FETCH_COUNT,
  RELATED_BLOG_FETCH_TIMEOUT_MS,
  RELATED_BLOG_FIELD_LIMIT,
  RELATED_BLOG_FIELD_NAME,
  excludeCurrentBlogPost,
  fetchWithRelatedPostsTtl,
  isRelatedPostsCacheFresh,
  parseRelatedPostIds,
  resolveRelatedBlogPosts,
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

test('blog post page fetches one extra and filters the current slug/id', () => {
  assert.match(blogPage, /getLatestBlogPosts\(RELATED_BLOG_FETCH_COUNT/);
  assert.match(blogPage, /fetchWithRelatedPostsTtl\(latestRelatedCache/);
  assert.match(blogPage, /fetchLatestRelatedBlogPosts\(\)/);
  assert.match(blogPage, /getRelatedBlogPostsForPost\(post/);
  assert.match(blogPage, /excludeCurrentBlogPost\(/);
  assert.match(blogPage, /excludeSlug=\{post\.slug\}/);
  assert.match(blogPage, /excludeId=\{post\.id\}/);
  assert.match(blogPage, /withRelatedFetchTimeout/);
  assert.match(blogPage, /RELATED_BLOG_FETCH_TIMEOUT_MS/);
  assert.match(blogPage, /catch \{/);
  assert.match(blogPage, /getBlogPosts\(page, perPage\)/);
  assert.doesNotMatch(blogPage, /getLatestBlogPosts\(6\)/);
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
  assert.match(wordpress, /getBlogPostsByIds\(missingFieldIds/);
  assert.match(wordpress, /withRelatedFetchTimeout/);
  assert.match(wordpress, /RELATED_BLOG_FETCH_TIMEOUT_MS/);
  assert.match(wordpress, /acf_format=standard/);
  assert.match(wordpress, /relatedCacheFor\(`cat:\$\{categoryId\}`\)/);
  assert.match(wordpress, /revalidate: 3600/);
  assert.match(wordpress, /status', 'publish'/);
  assert.match(plugin, /register_post_meta\('post', PLAYFUL_RELATED_META_KEY/);
  assert.match(plugin, /articulos_relacionados/);
  assert.match(plugin, /'max' => PLAYFUL_RELATED_META_MAX/);
  assert.match(plugin, /show_in_rest/);
});

test('blog-posts API excludes via query and keeps six cards', () => {
  assert.match(apiRoute, /searchParams\.get\('exclude'\)/);
  assert.match(apiRoute, /RELATED_BLOG_FETCH_COUNT/);
  assert.match(apiRoute, /excludeCurrentBlogPost\(posts/);
  assert.match(relatedSection, /params\.set\('exclude'/);
  assert.match(relatedSection, /excludeCurrentBlogPost\(arr/);
  assert.match(relatedSection, /Cargando artículos…/);
});
