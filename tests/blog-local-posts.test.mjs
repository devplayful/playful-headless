import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  GOOGLE_MERCHANT_CENTER_SLUG,
  GOOGLE_MERCHANT_CENTER_H1,
  GOOGLE_MERCHANT_CENTER_TITLE,
  GOOGLE_MERCHANT_CENTER_META,
  GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL,
  GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL,
  GOOGLE_MERCHANT_CENTER_BODY_HTML,
  GOOGLE_MERCHANT_CENTER_FAQS,
  isStagingLocalBlogEnabled,
  getStagingLocalBlogPost,
  listStagingLocalBlogStaticParams,
  blogArticleJsonLdExtras,
  blogFaqPageJsonLd,
} = await import('../lib/blog-local-posts.ts');

const { buildBlogArticleJsonLd } = await import('../lib/blog-editorial-meta.ts');

const wordpressSource = readFileSync(
  new URL('../services/wordpress.ts', import.meta.url),
  'utf8',
);
const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const sitemapSource = readFileSync(
  new URL('../utils/apex-sitemap.ts', import.meta.url),
  'utf8',
);
const listingSource = readFileSync(
  new URL('../app/blog/page.tsx', import.meta.url),
  'utf8',
);
const expectedRoutes = readFileSync(
  new URL('../config/expected-routes.json', import.meta.url),
  'utf8',
);
const relatedSource = readFileSync(
  new URL('../lib/blog-related-posts.ts', import.meta.url),
  'utf8',
);

test('staging local posts are off on production and on main', () => {
  assert.equal(isStagingLocalBlogEnabled({ VERCEL_ENV: 'production' }), false);
  assert.equal(isStagingLocalBlogEnabled({ VERCEL_GIT_COMMIT_REF: 'main' }), false);
  assert.equal(
    isStagingLocalBlogEnabled({ VERCEL_ENV: 'production', VERCEL_GIT_COMMIT_REF: 'staging' }),
    false,
  );
  assert.equal(isStagingLocalBlogEnabled({ VERCEL_GIT_COMMIT_REF: 'staging' }), true);
  assert.equal(isStagingLocalBlogEnabled({}), true);
});

test('local Merchant Center post is gated and shaped like a WP pautas-digitales article', () => {
  assert.equal(
    getStagingLocalBlogPost(GOOGLE_MERCHANT_CENTER_SLUG, { VERCEL_ENV: 'production' }),
    null,
  );
  assert.deepEqual(listStagingLocalBlogStaticParams({ VERCEL_ENV: 'production' }), []);

  const post = getStagingLocalBlogPost(GOOGLE_MERCHANT_CENTER_SLUG, {});
  assert.ok(post);
  assert.equal(post.slug, 'google-merchant-center');
  assert.equal(post.categories[0].slug, 'pautas-digitales');
  assert.equal(post.categories[0].name, 'Pautas Digitales');
  assert.equal(post.categories[0].id, 25);
  assert.equal(post.author.name, 'Stefanni Parabavidez');
  assert.equal(post.date, GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL);
  assert.equal(post.date_gmt, '2026-10-03T00:00:00.000Z');
  assert.equal(post.modified, GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL);
  assert.equal(post.modified_gmt, '2026-10-03T00:00:00.000Z');
  assert.equal(post.title.rendered, GOOGLE_MERCHANT_CENTER_H1);
  assert.deepEqual(listStagingLocalBlogStaticParams({}), [
    { slug: ['pautas-digitales', 'google-merchant-center'] },
  ]);
});

test('Merchant Center body is the signed copy: no H1 and no invented images', () => {
  const html = GOOGLE_MERCHANT_CENTER_BODY_HTML;
  assert.doesNotMatch(html, /<h1[\s>]/);
  assert.doesNotMatch(html, /<img[\s>]/);
  assert.match(
    html,
    /Google Merchant Center es la herramienta gratuita de Google donde subes el catálogo/,
  );
  assert.match(
    html,
    /<h2 id="que-es-google-merchant-center-y-en-que-se-diferencia-de-shopping-y-de-google-ads">/,
  );
  assert.match(html, /<h2 id="preguntas-frecuentes-sobre-google-merchant-center">/);
  assert.match(html, /reserva una reunión con nuestro equipo/);
  assert.equal(GOOGLE_MERCHANT_CENTER_FAQS.length, 5);
});

test('Merchant Center JSON-LD is Article with provisional dates and a FAQPage', () => {
  const extras = blogArticleJsonLdExtras(GOOGLE_MERCHANT_CENTER_SLUG);
  assert.equal(extras.type, 'Article');
  const jsonLd = buildBlogArticleJsonLd({
    headline: GOOGLE_MERCHANT_CENTER_H1,
    description: GOOGLE_MERCHANT_CENTER_META,
    datePublished: GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL,
    dateModified: GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL,
    authorName: 'Stefanni Parabavidez',
    url: 'https://playfulagency.com/blog/pautas-digitales/google-merchant-center',
    ...extras,
  });
  assert.equal(jsonLd['@type'], 'Article');
  assert.equal(jsonLd.datePublished, '2026-10-03T00:00:00.000Z');
  assert.equal(jsonLd.dateModified, '2026-10-03T00:00:00.000Z');
  assert.equal(jsonLd.headline, GOOGLE_MERCHANT_CENTER_H1);

  const faq = blogFaqPageJsonLd(GOOGLE_MERCHANT_CENTER_SLUG);
  assert.ok(faq);
  assert.equal(faq['@type'], 'FAQPage');
  assert.equal(faq.mainEntity.length, 5);
  assert.equal(faq.mainEntity[0].name, '¿Qué es Google Merchant Center?');
  assert.equal(blogFaqPageJsonLd('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'), null);
  assert.equal(
    blogArticleJsonLdExtras('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce').type,
    undefined,
  );
});

test('wordpress and the post template wire the staging-only post without listing it', () => {
  assert.match(wordpressSource, /getStagingLocalBlogPost\(slug\)/);
  assert.match(wordpressSource, /listStagingLocalBlogStaticParams\(\)/);
  assert.match(blogPage, /blogArticleJsonLdExtras\(postSlug\)/);
  assert.match(blogPage, /blogFaqPageJsonLd\(postSlug\)/);
  assert.match(blogPage, /\[GOOGLE_MERCHANT_CENTER_SLUG\]/);
  assert.match(blogPage, /h1: GOOGLE_MERCHANT_CENTER_H1/);
  assert.ok(
    blogPage.includes(GOOGLE_MERCHANT_CENTER_TITLE) ||
      blogPage.includes('GOOGLE_MERCHANT_CENTER_TITLE'),
  );
  assert.doesNotMatch(listingSource, /google-merchant-center/);
  assert.doesNotMatch(sitemapSource, /google-merchant-center/);
  assert.doesNotMatch(expectedRoutes, /google-merchant-center/);
  assert.doesNotMatch(relatedSource, /google-merchant-center/);
});
