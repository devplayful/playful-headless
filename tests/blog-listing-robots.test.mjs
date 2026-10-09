import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { shouldNoindexBlogListing } = await import('../utils/blog-listing-robots.ts');

const listingPage = readFileSync(
  new URL('../app/blog/page.tsx', import.meta.url),
  'utf8',
);
const queryPage = readFileSync(
  new URL('../app/blog/q/page.tsx', import.meta.url),
  'utf8',
);
const listingQuery = readFileSync(
  new URL('../utils/blog-listing-query.ts', import.meta.url),
  'utf8',
);

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

test('listing generateMetadata noindexes any query and keeps /blog canonical', () => {
  assert.match(listingQuery, /shouldNoindexBlogListing/);
  assert.match(queryPage, /buildBlogListingMetadata\(await searchParams\)/);
  assert.match(metadataFn, /shouldNoindexBlogListing\(searchParams\)/);
  assert.match(metadataFn, /canonicalForPath\('\/blog'\)/);
  assert.match(metadataFn, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.doesNotMatch(metadataFn, /parsedPage\s*>=\s*2/);
  assert.match(listingPage, /buildBlogListingMetadata\(\)/);
  assert.doesNotMatch(listingPage, /await searchParams/);
});
