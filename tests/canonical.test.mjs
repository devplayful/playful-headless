import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { nonBlogHtmlRoutesFromManifest } from '../lib/non-blog-html-routes.mjs';
import {
  assertPageHtmlSeo,
  extractPageHtmlSeo,
} from '../utils/page-html-seo-audit.mjs';

const { canonicalForPath, toAbsoluteSiteUrl } = await import('../utils/canonical.ts');

const manifest = JSON.parse(
  await readFile(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);
const nonBlogHtmlRoutes = nonBlogHtmlRoutesFromManifest(manifest);
const canonicalTestBaseUrl = process.env.CANONICAL_TEST_BASE_URL ?? 'http://127.0.0.1:3000';

test('home canonical keeps the sitemap trailing slash', () => {
  assert.equal(canonicalForPath('/'), 'https://playfulagency.com/');
  assert.equal(canonicalForPath(''), 'https://playfulagency.com/');
});

test('interior canonicals stay without a trailing slash', () => {
  assert.equal(canonicalForPath('/nosotros'), 'https://playfulagency.com/nosotros');
  assert.equal(canonicalForPath('/agencia-shopify'), 'https://playfulagency.com/agencia-shopify');
  assert.equal(canonicalForPath('/agencia-sem'), 'https://playfulagency.com/agencia-sem');
  assert.equal(canonicalForPath('/blog/seo/aprende-todo-sobre-el-seo'), 'https://playfulagency.com/blog/seo/aprende-todo-sobre-el-seo');
});

test('non-blog expected HTML routes ship title, description, canonical, and twitter/og parity', async (t) => {
  let probe;
  try {
    probe = await fetch(new URL('/', canonicalTestBaseUrl), { redirect: 'manual' });
  } catch {
    t.skip(`CANONICAL_TEST_BASE_URL not reachable (${canonicalTestBaseUrl})`);
    return;
  }
  if (!probe.ok && probe.status !== 308) {
    t.skip(`CANONICAL_TEST_BASE_URL not reachable (${canonicalTestBaseUrl}, status ${probe.status})`);
    return;
  }

  const failures = [];
  for (const route of nonBlogHtmlRoutes) {
    const response = await fetch(new URL(route, canonicalTestBaseUrl), { redirect: 'follow' });
    assert.equal(
      response.status,
      200,
      `${route} should return 200 from ${canonicalTestBaseUrl}`,
    );
    const html = await response.text();
    const seo = extractPageHtmlSeo(html);
    const failure = assertPageHtmlSeo(route, seo);
    if (failure) failures.push(failure);
  }

  assert.equal(
    failures.length,
    0,
    failures.map((f) => `${f.route}: ${f.problems.join('; ')}`).join('\n'),
  );
});

test('toAbsoluteSiteUrl keeps remote media and prefixes site-relative assets', () => {
  assert.equal(
    toAbsoluteSiteUrl('/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png'),
    'https://playfulagency.com/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
  );
  assert.equal(
    toAbsoluteSiteUrl('https://endpoint.playfulagency.com/wp-content/uploads/zelle.jpg'),
    'https://endpoint.playfulagency.com/wp-content/uploads/zelle.jpg',
  );
  assert.equal(toAbsoluteSiteUrl(''), '');
});

test('eShow production local post is merged into /blog listings', async () => {
  const {
    ESHOW_MADRID_2026_EXCERPT,
    ESHOW_MADRID_2026_FEATURED_SRC,
    ESHOW_MADRID_2026_PATH,
    ESHOW_MADRID_2026_SLUG,
    PREMIOS_CIMA_2026_SLUG,
    PREMIOS_CIMA_2026_FEATURED_SRC,
    PREMIOS_CIMA_2026_PORTADA_SRC,
    PREMIOS_CIMA_2026_TROFEO_SRC,
    GOOGLE_MERCHANT_CENTER_SLUG,
    listProductionLocalBlogPosts,
    mergeProductionLocalBlogPosts,
    paginateBlogPosts,
  } = await import('../lib/blog-local-posts.ts');
  const wordpressSource = await readFile(
    new URL('../services/wordpress.ts', import.meta.url),
    'utf8',
  );

  const production = listProductionLocalBlogPosts({
    VERCEL_ENV: 'production',
    VERCEL_GIT_COMMIT_REF: 'main',
  });
  const eshow = production.find((post) => post.slug === ESHOW_MADRID_2026_SLUG);
  assert.ok(eshow, 'eShow must be a production local listing post');
  assert.equal(eshow.featured_media_url, ESHOW_MADRID_2026_FEATURED_SRC);
  const cima = production.find((post) => post.slug === PREMIOS_CIMA_2026_SLUG);
  assert.ok(cima, 'CIMA must be a production local listing post');
  assert.equal(cima.featured_media_url, PREMIOS_CIMA_2026_FEATURED_SRC);
  assert.equal(cima.featured_media_url, PREMIOS_CIMA_2026_PORTADA_SRC);
  assert.notEqual(cima.featured_media_url, PREMIOS_CIMA_2026_TROFEO_SRC);
  assert.match(cima.excerpt.rendered, /SoyTechno: El eCommerce/);
  assert.match(eshow.excerpt.rendered, new RegExp(ESHOW_MADRID_2026_EXCERPT.slice(0, 40)));
  assert.equal(
    production.some((post) => post.slug === GOOGLE_MERCHANT_CENTER_SLUG),
    false,
    'staging Merchant Center must stay out of production listings',
  );

  const merged = mergeProductionLocalBlogPosts(
    [{ slug: 'older-wp-post', date: '2020-01-01T00:00:00.000Z' }],
    { env: { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' } },
  );
  assert.equal(merged[0].slug, PREMIOS_CIMA_2026_SLUG);
  const listing = paginateBlogPosts(merged, 1, 10);
  assert.equal(
    listing.posts.some((post) => post.slug === ESHOW_MADRID_2026_SLUG),
    true,
    'eShow must appear on /blog page 1',
  );
  assert.equal(
    listing.posts.some((post) => post.slug === PREMIOS_CIMA_2026_SLUG),
    true,
    'CIMA must appear on /blog page 1 when it is the newest post',
  );

  const duplicate = mergeProductionLocalBlogPosts(
    [{
      slug: ESHOW_MADRID_2026_SLUG,
      date: '2026-10-07T00:00:00+02:00',
      featured_media_url: '/from-wordpress.jpg',
    }],
    { env: { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' } },
  );
  assert.equal(duplicate.filter((post) => post.slug === ESHOW_MADRID_2026_SLUG).length, 1);
  assert.equal(
    duplicate.find((post) => post.slug === ESHOW_MADRID_2026_SLUG).featured_media_url,
    '/from-wordpress.jpg',
  );

  const otros = mergeProductionLocalBlogPosts(
    [{ slug: 'otro-wp', date: '2020-01-01T00:00:00.000Z', categories: [{ slug: 'otros', id: 21 }] }],
    {
      categorySlug: 'otros',
      env: { VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'main' },
    },
  );
  assert.equal(otros.some((post) => post.slug === ESHOW_MADRID_2026_SLUG), true);
  assert.equal(otros.some((post) => post.slug === 'cashea-para-comercios'), false);

  assert.match(wordpressSource, /mergeProductionLocalBlogPosts/);
  const getBlogPostsStart = wordpressSource.indexOf('export async function getBlogPosts');
  const getLatestStart = wordpressSource.indexOf('export async function getLatestBlogPosts');
  const relatedIndexStart = wordpressSource.indexOf('async function loadBlogRelatedIndex');
  const relatedCategoryStart = wordpressSource.indexOf('export async function getRelatedBlogPostsByCategory');
  assert.match(
    wordpressSource.slice(getBlogPostsStart, getLatestStart),
    /mergeProductionLocalBlogPosts/,
  );
  assert.match(
    wordpressSource.slice(getLatestStart, relatedCategoryStart),
    /mergeProductionLocalBlogPosts/,
  );
  assert.match(
    wordpressSource.slice(relatedCategoryStart, relatedIndexStart),
    /mergeProductionLocalBlogPosts/,
  );
  assert.match(
    wordpressSource.slice(relatedIndexStart),
    /mergeProductionLocalBlogPosts/,
  );
});

test('/blog HTML lists the eShow Madrid 2026 article', async (t) => {
  let probe;
  try {
    probe = await fetch(new URL('/blog', canonicalTestBaseUrl), { redirect: 'manual' });
  } catch {
    t.skip(`CANONICAL_TEST_BASE_URL not reachable (${canonicalTestBaseUrl})`);
    return;
  }
  if (!probe.ok && probe.status !== 308) {
    t.skip(`CANONICAL_TEST_BASE_URL not reachable (${canonicalTestBaseUrl}, status ${probe.status})`);
    return;
  }

  const response = probe.status === 308
    ? await fetch(new URL('/blog', canonicalTestBaseUrl), { redirect: 'follow' })
    : probe;
  assert.equal(response.status, 200, `/blog should return 200 from ${canonicalTestBaseUrl}`);
  const html = await response.text();
  assert.match(
    html,
    /\/blog\/otros\/eshow-madrid-2026/,
    'eShow must appear in the /blog listing HTML',
  );
  assert.match(
    html,
    /\/blog\/otros\/premios-cima-2026-soytechno-playful/,
    'CIMA must appear in the /blog listing HTML',
  );
});
