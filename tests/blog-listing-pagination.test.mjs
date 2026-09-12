import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { blogListingPath } = await import('../utils/blog-url.ts');

const listingPage = readFileSync(
  new URL('../app/blog/page.tsx', import.meta.url),
  'utf8',
);
const pagination = readFileSync(
  new URL('../app/blog/BlogListingPagination.tsx', import.meta.url),
  'utf8',
);
const categories = readFileSync(
  new URL('../app/blog/BlogCategories.tsx', import.meta.url),
  'utf8',
);

const metadataFn = listingPage.slice(
  listingPage.indexOf('export async function generateMetadata'),
);

const CRAWLABLE_QUERY_HREF = /href=\{?[`'"][^`'"]*\?(?:page|category)=/i;

test('blogListingPath omits page=1 and empty category', () => {
  assert.equal(blogListingPath(), '/blog');
  assert.equal(blogListingPath({}), '/blog');
  assert.equal(blogListingPath({ page: 1 }), '/blog');
  assert.equal(blogListingPath({ page: 0 }), '/blog');
  assert.equal(blogListingPath({ page: -1 }), '/blog');
  assert.equal(blogListingPath({ category: '' }), '/blog');
});

test('blogListingPath keeps page>1 and category only for client navigation', () => {
  assert.equal(blogListingPath({ page: 2 }), '/blog?page=2');
  assert.equal(blogListingPath({ page: 14 }), '/blog?page=14');
  assert.equal(blogListingPath({ category: 'tecnologia' }), '/blog?category=tecnologia');
  assert.equal(
    blogListingPath({ page: 2, category: 'seo' }),
    '/blog?page=2&category=seo',
  );
  assert.equal(blogListingPath({ page: 1, category: 'seo' }), '/blog?category=seo');
});

test('/blog listing does not emit crawlable hrefs with page= or category=', () => {
  assert.match(listingPage, /<BlogListingPagination/);
  assert.doesNotMatch(listingPage, CRAWLABLE_QUERY_HREF);
  assert.doesNotMatch(listingPage, /href=\{`\/blog\?page=/);
  assert.doesNotMatch(listingPage, /href=\{`\/blog\?category=/);
  assert.doesNotMatch(listingPage, /href=["'`]\/blog\?page=/);
});

test('pagination component navigates with buttons, not indexable hrefs', () => {
  assert.match(pagination, /['"]use client['"]/);
  assert.match(pagination, /blogListingPath/);
  assert.match(pagination, /router\.push\(blogListingPath/);
  assert.match(pagination, /<button/);
  assert.match(pagination, /aria-label="Página anterior"/);
  assert.match(pagination, /aria-label="Página siguiente"/);
  assert.doesNotMatch(pagination, CRAWLABLE_QUERY_HREF);
  assert.doesNotMatch(pagination, /from ['"]next\/link['"]/);
  assert.doesNotMatch(pagination, /<Link/);
});

test('category UI has no crawlable ?category= hrefs', () => {
  assert.match(categories, /blogListingPath\(\{\s*category:/);
  assert.match(categories, /href="\/blog"/);
  assert.doesNotMatch(categories, CRAWLABLE_QUERY_HREF);
  assert.doesNotMatch(categories, /href=\{`\/blog\$\{cat\.slug \? `\?category=/);
  assert.doesNotMatch(categories, /href=["'`]\/blog\?category=/);
});

test('clean /blog generateMetadata title and robots stay unchanged', () => {
  assert.match(metadataFn, /title:\s*'Blog - Playful Agency'/);
  assert.match(
    metadataFn,
    /description:\s*'Descubre las últimas noticias y consejos sobre marketing digital en nuestro blog\.'/,
  );
  assert.match(metadataFn, /shouldNoindexBlogListing\(resolved\)/);
  assert.match(metadataFn, /canonicalForPath\('\/blog'\)/);
  assert.match(metadataFn, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
});
