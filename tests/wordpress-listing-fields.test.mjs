import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const blogPage = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');

function functionSlice(name) {
  const exported = wordpress.indexOf(`export async function ${name}`);
  const local = wordpress.indexOf(`async function ${name}`);
  const start = exported === -1 ? local : exported;
  assert.notEqual(start, -1, `missing ${name}`);
  const next = wordpress.indexOf('\nexport ', start + 1);
  return next === -1 ? wordpress.slice(start) : wordpress.slice(start, next);
}

test('listing and params fetches use _fields and never a full _embed', () => {
  const listing = functionSlice('getBlogPosts');
  const latest = functionSlice('getLatestBlogPosts');
  const byIds = functionSlice('getBlogPostsByIds');
  const params = functionSlice('getBlogStaticParams') + functionSlice('loadBlogStaticParamsPage');
  const article = functionSlice('getBlogPostBySlug');

  assert.match(listing, /BLOG_LISTING_POST_FIELDS/);
  assert.match(listing, /hydrateListingPosts/);
  assert.doesNotMatch(listing, /_embed=/);
  assert.doesNotMatch(listing, /searchParams\.(append|set)\('_embed'/);

  assert.match(latest, /BLOG_LISTING_POST_FIELDS/);
  assert.match(latest, /BLOG_LATEST_OVERSCAN/);
  assert.doesNotMatch(latest, /_embed=/);
  assert.doesNotMatch(latest, /searchParams\.(append|set)\('_embed'/);

  assert.match(byIds, /BLOG_LISTING_POST_FIELDS/);
  assert.doesNotMatch(byIds, /_embed=/);
  assert.doesNotMatch(byIds, /searchParams\.(append|set)\('_embed'/);

  assert.match(params, /BLOG_STATIC_PARAMS_FIELDS/);
  assert.doesNotMatch(params, /_embed=/);
  assert.match(blogPage, /getBlogStaticParams\(\)/);

  assert.match(article, /BLOG_ARTICLE_POST_FIELDS/);
  assert.match(article, /_embed=wp:featuredmedia,wp:term,author/);
});
