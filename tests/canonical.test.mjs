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
