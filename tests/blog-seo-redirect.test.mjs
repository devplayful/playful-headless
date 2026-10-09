import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildBlogCategoryRedirects } = require('../lib/blog-category-redirects');
const categoryRedirects = JSON.parse(
  readFileSync(new URL('../utils/blog-category-redirect-map.json', import.meta.url), 'utf8'),
);
const { blogSeoRedirectDecision } = await import('../utils/amp-junk-query.ts');
const { BLOG_LISTING_CATEGORY_SLUGS } = await import('../utils/blog-url.ts');

const BAD_BUNNY_ALIAS = '/blog/otros/bad-bunny-como-marca-la-potencia-del-marketing-musical';
const BAD_BUNNY_CANONICAL = '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical';

function decide(pathWithQuery, map = categoryRedirects) {
  const url = new URL(pathWithQuery, 'https://playfulagency.com');
  return blogSeoRedirectDecision(url.pathname, url.searchParams, map);
}

test('committed map still aliases otros → mas-vistos for bad-bunny', () => {
  assert.equal(categoryRedirects[BAD_BUNNY_ALIAS], BAD_BUNNY_CANONICAL);
});

test('category + noamp is one hop to the clean canonical path', () => {
  assert.deepEqual(decide(`${BAD_BUNNY_ALIAS}?noamp=mobile`), {
    type: 'redirect',
    pathname: BAD_BUNNY_CANONICAL,
    search: '',
    status: 308,
  });
});

test('category + amp junk + utm is one hop that keeps utm', () => {
  const decision = decide(`${BAD_BUNNY_ALIAS}?noamp=mobile&utm_source=x&utm_medium=cpc`);
  assert.equal(decision.type, 'redirect');
  assert.equal(decision.status, 308);
  assert.equal(decision.pathname, BAD_BUNNY_CANONICAL);
  assert.equal(decision.search, '?utm_source=x&utm_medium=cpc');
  assert.doesNotMatch(decision.search, /noamp|amp=/i);
});

test('junk only still 301-strips without changing path', () => {
  assert.deepEqual(decide(`${BAD_BUNNY_CANONICAL}?noamp=mobile`), {
    type: 'redirect',
    pathname: BAD_BUNNY_CANONICAL,
    search: '',
    status: 301,
  });
});

test('category only still 308-preserves remaining query', () => {
  assert.deepEqual(decide(`${BAD_BUNNY_ALIAS}?utm_source=seo-smoke`), {
    type: 'redirect',
    pathname: BAD_BUNNY_CANONICAL,
    search: '?utm_source=seo-smoke',
    status: 308,
  });
});

test('no category change and no junk → next()', () => {
  assert.deepEqual(decide(`${BAD_BUNNY_CANONICAL}?utm_source=x`), { type: 'next' });
  assert.deepEqual(decide('/blog?page=2'), { type: 'next' });
  assert.deepEqual(decide('/agencia-sem?noamp=mobile'), { type: 'next' });
});

test('blog category indexes 308 once to /blog?category=, with or without a trailing slash', () => {
  assert.deepEqual([...BLOG_LISTING_CATEGORY_SLUGS], [
    'e-commerce',
    'email-marketing',
    'mas-vistos',
    'otros',
    'pautas-digitales',
    'seo',
    'tecnologia',
  ]);
  for (const slug of BLOG_LISTING_CATEGORY_SLUGS) {
    assert.deepEqual(decide(`/blog/${slug}`), {
      type: 'redirect',
      pathname: '/blog',
      search: `?category=${slug}`,
      status: 308,
    });
    assert.deepEqual(decide(`/blog/${slug}/`), {
      type: 'redirect',
      pathname: '/blog',
      search: `?category=${slug}`,
      status: 308,
    });
  }
});

test('category index + AMP junk is still one hop to the listing query', () => {
  assert.deepEqual(decide('/blog/seo/?amp=1&utm_source=gsc'), {
    type: 'redirect',
    pathname: '/blog',
    search: '?utm_source=gsc&category=seo',
    status: 308,
  });
});

test('category index redirect does not touch /blog/{category}/{post}', () => {
  assert.deepEqual(
    decide('/blog/seo/que-es-un-blog'),
    { type: 'next' },
  );
  assert.deepEqual(
    decide('/blog/q'),
    { type: 'next' },
  );
});

test('builder still emits secondary-category aliases', () => {
  assert.deepEqual(buildBlogCategoryRedirects([{
    slug: 'sample-post',
    _embedded: {
      'wp:term': [[
        { taxonomy: 'category', slug: 'primary' },
        { taxonomy: 'category', slug: 'secondary' },
      ]],
    },
  }]), [{
    source: '/blog/secondary/sample-post',
    destination: '/blog/primary/sample-post',
    permanent: true,
  }]);
});
