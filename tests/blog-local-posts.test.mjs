import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const {
  ESHOW_MADRID_2026_SLUG,
  ESHOW_MADRID_2026_H1,
  ESHOW_MADRID_2026_TITLE,
  ESHOW_MADRID_2026_META,
  ESHOW_MADRID_2026_ABOUT_NAME,
  ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
  ESHOW_MADRID_2026_BODY_HTML,
  ESHOW_MADRID_2026_CABECERA_SRC,
  ESHOW_MADRID_2026_PROGRAMA_SRC,
  ESHOW_MADRID_2026_CABECERA_ALT,
  ESHOW_MADRID_2026_PROGRAMA_ALT,
  ESHOW_MADRID_2026_IMAGE_WIDTH,
  ESHOW_MADRID_2026_IMAGE_HEIGHT,
  isStagingLocalBlogEnabled,
  getStagingLocalBlogPost,
  listStagingLocalBlogStaticParams,
  blogArticleJsonLdExtras,
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

function publicPath(src) {
  return fileURLToPath(new URL(`../public${src}`, import.meta.url));
}

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

test('local eShow post is gated and shaped like a WP otros article', () => {
  assert.equal(getStagingLocalBlogPost(ESHOW_MADRID_2026_SLUG, { VERCEL_ENV: 'production' }), null);
  assert.deepEqual(listStagingLocalBlogStaticParams({ VERCEL_ENV: 'production' }), []);

  const post = getStagingLocalBlogPost(ESHOW_MADRID_2026_SLUG, {});
  assert.ok(post);
  assert.equal(post.slug, 'eshow-madrid-2026');
  assert.equal(post.categories[0].slug, 'otros');
  assert.equal(post.categories[0].name, 'Otros');
  assert.equal(post.author.name, 'Stefanni Parabavidez');
  assert.equal(post.date, ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL);
  assert.equal(post.date_gmt, '2026-10-07T00:00:00.000Z');
  assert.equal(post.title.rendered, ESHOW_MADRID_2026_H1);
  assert.deepEqual(listStagingLocalBlogStaticParams({}), [
    { slug: ['otros', 'eshow-madrid-2026'] },
  ]);
});

test('eShow body is the signed copy: no H1, two official WebP captures', () => {
  const html = ESHOW_MADRID_2026_BODY_HTML;
  assert.doesNotMatch(html, /<h1[\s>]/);
  assert.match(html, /El eShow Madrid 2026 se celebra el miércoles 4/);
  assert.match(html, /<h2 id="fechas-horario-y-como-llegar-a-ifema">Fechas, horario y cómo llegar a IFEMA<\/h2>/);
  assert.match(html, /<h2 id="que-ver-si-tienes-tienda-villages-pagos-cro-y-catalogo">/);
  const images = [...html.matchAll(/<img ([^>]+)\/>/g)].map((match) => match[1]);
  assert.equal(images.length, 2);
  assert.match(images[0], new RegExp(`src="${ESHOW_MADRID_2026_CABECERA_SRC}"`));
  assert.match(images[0], new RegExp(`alt="${ESHOW_MADRID_2026_CABECERA_ALT}"`));
  assert.match(images[0], new RegExp(`width="${ESHOW_MADRID_2026_IMAGE_WIDTH}"`));
  assert.match(images[0], new RegExp(`height="${ESHOW_MADRID_2026_IMAGE_HEIGHT}"`));
  assert.match(images[1], new RegExp(`src="${ESHOW_MADRID_2026_PROGRAMA_SRC}"`));
  assert.match(images[1], new RegExp(`alt="${ESHOW_MADRID_2026_PROGRAMA_ALT}"`));
  assert.ok(existsSync(publicPath(ESHOW_MADRID_2026_CABECERA_SRC)));
  assert.ok(existsSync(publicPath(ESHOW_MADRID_2026_PROGRAMA_SRC)));
});

test('eShow JSON-LD is Article with about Thing and no Event node', () => {
  const extras = blogArticleJsonLdExtras(ESHOW_MADRID_2026_SLUG);
  assert.equal(extras.type, 'Article');
  assert.deepEqual(extras.about, { '@type': 'Thing', name: ESHOW_MADRID_2026_ABOUT_NAME });
  const jsonLd = buildBlogArticleJsonLd({
    headline: ESHOW_MADRID_2026_H1,
    description: ESHOW_MADRID_2026_META,
    datePublished: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    dateModified: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    authorName: 'Stefanni Parabavidez',
    url: 'https://playfulagency.com/blog/otros/eshow-madrid-2026',
    ...extras,
  });
  assert.equal(jsonLd['@type'], 'Article');
  assert.deepEqual(jsonLd.about, { '@type': 'Thing', name: 'E-SHOW Madrid 2026' });
  assert.equal(jsonLd.datePublished, '2026-10-07T00:00:00.000Z');
  assert.doesNotMatch(JSON.stringify(jsonLd), /"Event"/);
  assert.equal(blogArticleJsonLdExtras('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce').type, undefined);
});

test('wordpress and the post template wire the staging-only post without listing it', () => {
  assert.match(wordpressSource, /getStagingLocalBlogPost\(slug\)/);
  assert.match(wordpressSource, /listStagingLocalBlogStaticParams\(\)/);
  assert.match(blogPage, /blogArticleJsonLdExtras\(postSlug\)/);
  assert.match(blogPage, /\[ESHOW_MADRID_2026_SLUG\]/);
  assert.match(blogPage, /h1: ESHOW_MADRID_2026_H1/);
  assert.ok(blogPage.includes(ESHOW_MADRID_2026_TITLE) || blogPage.includes('ESHOW_MADRID_2026_TITLE'));
  assert.doesNotMatch(listingSource, /eshow-madrid-2026/);
  assert.doesNotMatch(sitemapSource, /eshow-madrid-2026/);
});
