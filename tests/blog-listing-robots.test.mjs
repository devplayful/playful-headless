import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { shouldNoindexBlogListing } = await import('../utils/blog-listing-robots.ts');
const {
  buildBlogListingMetadata,
  shouldRewriteBlogListingToQueryPath,
} = await import('../utils/blog-listing-query.ts');

const listingPage = readFileSync(
  new URL('../app/(frontend)/blog/page.tsx', import.meta.url),
  'utf8',
);
const queryPage = readFileSync(
  new URL('../app/(frontend)/blog/q/page.tsx', import.meta.url),
  'utf8',
);
const listingQuery = readFileSync(
  new URL('../utils/blog-listing-query.ts', import.meta.url),
  'utf8',
);
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

const metadataFn = listingQuery.slice(
  listingQuery.indexOf('export function buildBlogListingMetadata'),
);

test('clean /blog stays indexable', () => {
  assert.equal(shouldNoindexBlogListing(undefined), false);
  assert.equal(shouldNoindexBlogListing(null), false);
  assert.equal(shouldNoindexBlogListing({}), false);
});

test('page present is noindex, including page=1', () => {
  assert.equal(shouldNoindexBlogListing({ page: '1' }), true);
  assert.equal(shouldNoindexBlogListing({ page: '2' }), true);
  assert.equal(shouldNoindexBlogListing({ page: '14' }), true);
});

test('category present is noindex even on page 1', () => {
  assert.equal(shouldNoindexBlogListing({ category: 'seo' }), true);
  assert.equal(shouldNoindexBlogListing({ page: '1', category: 'seo' }), true);
  assert.equal(shouldNoindexBlogListing({ page: '2', category: 'seo' }), true);
});

test('any other listing query is noindex', () => {
  assert.equal(shouldNoindexBlogListing({ search: 'shopify' }), true);
  assert.equal(shouldNoindexBlogListing({ utm_source: 'gsc' }), true);
});

test('invalid or negative page values still count as a query', () => {
  assert.equal(shouldNoindexBlogListing({ page: '-2' }), true);
  assert.equal(shouldNoindexBlogListing({ page: '-41', category: 'seo' }), true);
  assert.equal(shouldNoindexBlogListing({ page: '0' }), true);
  assert.equal(shouldNoindexBlogListing({ page: 'abc' }), true);
});

test('?cms=1 alone does not trigger blog listing rewrite (middleware helper)', () => {
  assert.match(middleware, /shouldRewriteBlogListingToQueryPath/);
  assert.equal(
    shouldRewriteBlogListingToQueryPath(new URLSearchParams('cms=1')),
    false,
  );
  assert.equal(
    shouldRewriteBlogListingToQueryPath(new URLSearchParams('page=2&cms=1')),
    true,
  );
  assert.equal(
    shouldRewriteBlogListingToQueryPath(new URLSearchParams('category=seo&cms=1')),
    true,
  );
});

test('/blog?cms=1 matches prod SEO: indexable + no robots noindex', () => {
  assert.equal(shouldNoindexBlogListing({ cms: '1' }), false);
  const meta = buildBlogListingMetadata({ cms: '1' });
  assert.equal(meta.robots, undefined);
  assert.equal(meta.alternates.canonical, 'https://playfulagency.com/blog');
});

test('/blog listing queries with cms=1 match prod robots', () => {
  assert.equal(shouldNoindexBlogListing({ page: '2', cms: '1' }), true);
  assert.equal(shouldNoindexBlogListing({ category: 'seo', cms: '1' }), true);
  assert.equal(buildBlogListingMetadata({ page: '2', cms: '1' }).robots?.index, false);
});

test('clean /blog listing page keeps BreadcrumbList JSON-LD (not /blog/q)', () => {
  assert.match(listingPage, /buildBlogListingBreadcrumbJsonLd/);
  assert.doesNotMatch(
    readFileSync(new URL('../app/(frontend)/blog/q/page.tsx', import.meta.url), 'utf8'),
    /buildBlogListingBreadcrumbJsonLd/,
  );
});

test('listing generateMetadata noindexes any query and keeps /blog canonical', () => {
  assert.match(listingQuery, /shouldNoindexBlogListing/);
  assert.match(queryPage, /buildBlogListingMetadata\(await searchParams\)/);
  assert.match(metadataFn, /stripCmsFromBlogListingSearchParams\(searchParams\)/);
  assert.match(metadataFn, /shouldNoindexBlogListing\(listingParams\)/);
  assert.match(metadataFn, /blogListingCanonicalUrl\(/);
  assert.match(metadataFn, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.doesNotMatch(metadataFn, /parsedPage\s*>=\s*2/);
  assert.match(listingPage, /buildBlogListingMetadata\(\)/);
  assert.doesNotMatch(listingPage, /await searchParams/);
});
