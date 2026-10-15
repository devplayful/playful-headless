import test from 'node:test';
import assert from 'node:assert/strict';

const {
  SITEMAP_STATIC_PATHS,
  SITEMAP_UNPUBLISHED_PATHS,
  getSitemapUnpublishedPaths,
  getSitemapLocs,
  getSitemapPaths,
  buildSitemapXml,
} = await import('../utils/apex-sitemap.ts');

const APEX = 'https://playfulagency.com';
const CATALOG = [
  '/agencia-prestashop',
  '/agencia-woocommerce',
  '/pasarela-de-pagos-venezuela',
  '/shopify-precios',
];

function assertHiddenFromSitemap(env) {
  const paths = getSitemapPaths(env);
  const locs = getSitemapLocs(env);
  const xml = buildSitemapXml(env);
  for (const path of CATALOG) {
    assert.equal(paths.includes(path), false, path);
    assert.equal(locs.includes(`${APEX}${path}`), false, path);
    assert.doesNotMatch(
      xml,
      new RegExp(`${APEX.replaceAll('/', '\\/')}${path.replaceAll('/', '\\/')}<`),
    );
  }
}

function assertPresentWhenInStatic(env) {
  const paths = getSitemapPaths(env);
  const locs = getSitemapLocs(env);
  const xml = buildSitemapXml(env);
  for (const path of CATALOG) {
    const expected = SITEMAP_STATIC_PATHS.includes(path);
    assert.equal(paths.includes(path), expected, path);
    assert.equal(locs.includes(`${APEX}${path}`), expected, path);
    if (expected) {
      assert.match(
        xml,
        new RegExp(`${APEX.replaceAll('/', '\\/')}${path.replaceAll('/', '\\/')}<`),
      );
    } else {
      assert.doesNotMatch(
        xml,
        new RegExp(`${APEX.replaceAll('/', '\\/')}${path.replaceAll('/', '\\/')}<`),
      );
    }
  }
}

test('unpublished catalog is the four production 404 landings', () => {
  assert.deepEqual([...SITEMAP_UNPUBLISHED_PATHS], CATALOG);
});

test('hidden unpublished landings follow the env list, not a hard STATIC_PATHS cut', () => {
  const hidden = new Set(getSitemapUnpublishedPaths());
  const paths = getSitemapPaths();
  const locs = getSitemapLocs();
  const xml = buildSitemapXml();

  for (const path of SITEMAP_UNPUBLISHED_PATHS) {
    if (hidden.has(path)) {
      assert.equal(paths.includes(path), false, path);
      assert.equal(locs.includes(`${APEX}${path}`), false, path);
      assert.doesNotMatch(
        xml,
        new RegExp(`${APEX.replaceAll('/', '\\/')}${path.replaceAll('/', '\\/')}<`),
      );
      continue;
    }
    const expected = SITEMAP_STATIC_PATHS.includes(path);
    assert.equal(paths.includes(path), expected, path);
    assert.equal(locs.includes(`${APEX}${path}`), expected, path);
  }
});

test('main and production hide the unpublished landings', () => {
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({ VERCEL_GIT_COMMIT_REF: 'main' })],
    CATALOG,
  );
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({ GITHUB_BASE_REF: 'main' })],
    CATALOG,
  );
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'main',
    })],
    CATALOG,
  );
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({ VERCEL_ENV: 'production' })],
    CATALOG,
  );
  assertHiddenFromSitemap({ VERCEL_GIT_COMMIT_REF: 'main' });
});

test('staging keeps the unpublished landings when they live in STATIC_PATHS', () => {
  assert.deepEqual([...getSitemapUnpublishedPaths({})], []);
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({ VERCEL_GIT_COMMIT_REF: 'staging' })],
    [],
  );
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_REF: 'staging',
    })],
    [],
  );
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({ GITHUB_BASE_REF: 'staging' })],
    [],
  );
  assert.deepEqual(
    [...getSitemapUnpublishedPaths({ GITHUB_REF_NAME: 'staging' })],
    [],
  );
  assertPresentWhenInStatic({ VERCEL_GIT_COMMIT_REF: 'staging' });
  assertPresentWhenInStatic({});
});
