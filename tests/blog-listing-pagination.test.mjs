import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { blogListingPath, BLOG_LISTING_CATEGORY_SLUGS } = await import('../utils/blog-url.ts');
const { blogListingCanonicalUrl } = await import('../utils/blog-listing-query.ts');

const listingPage = readFileSync(
  new URL('../app/blog/blog-listing-view.tsx', import.meta.url),
  'utf8',
);
const crawlNav = readFileSync(
  new URL('../app/blog/BlogListingCrawlNav.tsx', import.meta.url),
  'utf8',
);
const listingIndex = readFileSync(
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

const listingQuery = readFileSync(
  new URL('../utils/blog-listing-query.ts', import.meta.url),
  'utf8',
);
const metadataFn = listingQuery.slice(
  listingQuery.indexOf('export function buildBlogListingMetadata'),
);

const CRAWLABLE_QUERY_HREF = /href=\{?[`'"][^`'"]*\?(?:page|category)=/i;

test('blogListingCanonicalUrl drops page and keeps category filter', () => {
  assert.equal(blogListingCanonicalUrl({}), 'https://playfulagency.com/blog');
  assert.equal(
    blogListingCanonicalUrl({ category: 'seo' }),
    'https://playfulagency.com/blog?category=seo',
  );
  assert.equal(
    blogListingCanonicalUrl({ page: '2', category: 'seo' }),
    'https://playfulagency.com/blog?category=seo',
  );
  assert.equal(blogListingCanonicalUrl({ page: '-1' }), 'https://playfulagency.com/blog');
});

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

test('/blog listing keeps visible UI free of crawlable page= or category= hrefs', () => {
  assert.match(listingPage, /<BlogListingPagination/);
  assert.match(listingPage, /<BlogListingCrawlNav/);
  assert.doesNotMatch(listingPage, CRAWLABLE_QUERY_HREF);
  assert.doesNotMatch(listingPage, /href=\{`\/blog\?page=/);
  assert.doesNotMatch(listingPage, /href=\{`\/blog\?category=/);
  assert.doesNotMatch(listingPage, /href=["'`]\/blog\?page=/);
});

test('sr-only crawl nav exposes pagination anchors for crawlers', () => {
  assert.match(crawlNav, /className="sr-only"/);
  assert.match(crawlNav, /blogListingPath\(\{ page,/);
  assert.match(crawlNav, /from ['"]next\/link['"]/);
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

test('listing chips and the category-index 308 share the same slugs', () => {
  for (const slug of BLOG_LISTING_CATEGORY_SLUGS) {
    assert.match(categories, new RegExp(`slug: '${slug}'`));
  }
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
  assert.match(metadataFn, /shouldNoindexBlogListing\(searchParams\)/);
  assert.match(metadataFn, /blogListingCanonicalUrl\(/);
  assert.match(metadataFn, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.match(listingIndex, /buildBlogListingMetadata\(\)/);
  assert.match(listingIndex, /export const revalidate = 600/);
});
