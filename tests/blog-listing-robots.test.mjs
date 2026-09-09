import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { shouldNoindexBlogListing } = await import('../utils/blog-listing-robots.ts');

const listingPage = readFileSync(
  new URL('../app/blog/page.tsx', import.meta.url),
  'utf8',
);

const metadataFn = listingPage.slice(
  listingPage.indexOf('export async function generateMetadata'),
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
  assert.match(listingPage, /shouldNoindexBlogListing/);
  assert.match(metadataFn, /shouldNoindexBlogListing\(resolved\)/);
  assert.match(metadataFn, /canonicalForPath\('\/blog'\)/);
  assert.match(metadataFn, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.doesNotMatch(metadataFn, /parsedPage\s*>=\s*2/);
});
