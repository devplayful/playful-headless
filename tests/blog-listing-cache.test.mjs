import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  BLOG_LISTING_REVALIDATE_SECONDS,
  isBareBlogListingPath,
  parseBlogListingSearchParams,
} = await import('../utils/blog-listing-query.ts');

const listingPage = readFileSync(new URL('../app/blog/page.tsx', import.meta.url), 'utf8');
const queryPage = readFileSync(new URL('../app/blog/q/page.tsx', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);
const related = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const booking = readFileSync(new URL('../utils/booking-attribution.ts', import.meta.url), 'utf8');

test('clean /blog is ISR at 300s and does not read searchParams', () => {
  assert.equal(BLOG_LISTING_REVALIDATE_SECONDS, 300);
  assert.match(listingPage, /export const revalidate = 300/);
  assert.match(listingPage, /currentPage=\{1\}/);
  assert.doesNotMatch(listingPage, /searchParams/);
  assert.doesNotMatch(listingPage, /cookies\(/);
  assert.doesNotMatch(listingPage, /headers\(/);
});

test('query listing stays dynamic so pagination and filters keep working', () => {
  assert.match(queryPage, /export const dynamic = 'force-dynamic'/);
  assert.match(queryPage, /parseBlogListingSearchParams\(await searchParams\)/);
  assert.match(queryPage, /parsed\.invalidPage/);
  assert.match(queryPage, /searchQuery=\{parsed\.searchQuery\}/);
});

test('parseBlogListingSearchParams keeps page, category and search', () => {
  assert.deepEqual(parseBlogListingSearchParams(undefined), {
    page: 1,
    category: '',
    searchQuery: '',
    invalidPage: false,
  });
  assert.deepEqual(parseBlogListingSearchParams({ page: '2', category: 'seo', search: 'shopify' }), {
    page: 2,
    category: 'seo',
    searchQuery: 'shopify',
    invalidPage: false,
  });
  assert.equal(parseBlogListingSearchParams({ page: 'abc' }).invalidPage, true);
  assert.equal(parseBlogListingSearchParams({ page: '0' }).invalidPage, true);
});

test('middleware rewrites /blog queries without touching /reunion-playful no-store', () => {
  assert.match(middleware, /path === '\/blog\/q'/);
  assert.match(middleware, /NextResponse\.rewrite\(target\)/);
  assert.match(middleware, /target\.pathname = '\/blog\/q'/);
  assert.match(middleware, /Cache-Control': 'private, no-store'/);
  assert.match(middleware, /path === '\/reunion-playful'/);
  assert.doesNotMatch(middleware, /shouldCaptureAttributionPath\('\/blog'\)/);
  assert.match(middleware, /attachAttributionCookies\(request, NextResponse\.rewrite/);
});

test('bare /blog is the cacheable listing; queries are not', () => {
  assert.equal(isBareBlogListingPath('/blog', ''), true);
  assert.equal(isBareBlogListingPath('/blog/', ''), true);
  assert.equal(isBareBlogListingPath('/blog', '?'), true);
  assert.equal(isBareBlogListingPath('/blog', '?page=2'), false);
  assert.equal(isBareBlogListingPath('/blog', '?gclid=1'), false);
  assert.equal(isBareBlogListingPath('/reunion-playful', ''), false);
});

test('related-posts fetch cache and booking hop stay on their own files', () => {
  assert.match(related, /RELATED_BLOG_CATEGORY_REVALIDATE_SECONDS|revalidate: 3600/);
  assert.match(
    related,
    /export async function getBlogPosts[\s\S]*revalidate: 300/,
  );
  assert.match(booking, /reunion-playful/);
  assert.ok(expectedRoutes.sourceRoutes.includes('/blog/q'));
});
