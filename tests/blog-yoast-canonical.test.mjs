import test from 'node:test';
import assert from 'node:assert/strict';

const {
  isSiteRootCanonical,
  auditBlogPostYoastCanonical,
  repairBlogPostYoastCanonical,
  extractCanonicalFromYoastHead,
} = await import('../utils/blog-yoast-canonical.ts');
const { CLOSED_BLOG_PATHS } = await import('../utils/blog-closed-paths.ts');

test('isSiteRootCanonical recognizes apex home variants', () => {
  assert.equal(isSiteRootCanonical('https://playfulagency.com/'), true);
  assert.equal(isSiteRootCanonical('https://www.playfulagency.com'), true);
  assert.equal(isSiteRootCanonical('https://endpoint.playfulagency.com/'), true);
  assert.equal(isSiteRootCanonical('https://playfulagency.com/blog/seo/a'), false);
});

test('repairBlogPostYoastCanonical fixes site-root canonical in Yoast payloads', () => {
  const post = repairBlogPostYoastCanonical({
    slug: 'ejemplo-post',
    categories: [{ slug: 'seo' }],
    yoast_head:
      '<link rel="canonical" href="https://playfulagency.com/" />\n<meta property="og:url" content="https://playfulagency.com/" />',
    yoast_head_json: {
      canonical: 'https://playfulagency.com/',
      og_url: 'https://playfulagency.com/',
    },
  });
  const expected = 'https://playfulagency.com/blog/seo/ejemplo-post';
  assert.equal(post.yoast_head_json.canonical, expected);
  assert.equal(post.yoast_head_json.og_url, expected);
  assert.match(post.yoast_head, new RegExp(`href="${expected}"`));
});

test('audit flags missing canonical when og:url is a real post (Google Grants pattern)', () => {
  const issue = auditBlogPostYoastCanonical({
    slug: 'google-grants-descubre-que-es-y-como-funciona',
    categories: [{ slug: 'pautas-digitales' }],
    yoast_head: '<meta property="og:url" content="https://playfulagency.com/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona/" />',
    yoast_head_json: {
      og_url: 'https://endpoint.playfulagency.com/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona/',
    },
  });
  assert.equal(issue?.kind, 'missing');
  assert.equal(issue?.slug, 'google-grants-descubre-que-es-y-como-funciona');
});

test('Google Grants closed path stays in the CERRAR inventory', () => {
  assert.ok(
    CLOSED_BLOG_PATHS.includes(
      '/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona',
    ),
  );
});

test('extractCanonicalFromYoastHead reads link rel=canonical', () => {
  const head = '<link rel="canonical" href="https://playfulagency.com/blog/seo/a" />';
  assert.equal(
    extractCanonicalFromYoastHead(head),
    'https://playfulagency.com/blog/seo/a',
  );
});
