import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  BLOG_AUTHOR_HREF,
  BLOG_AUTHOR_URL,
  BLOG_EDITORIAL_OVERRIDES,
  DEFAULT_EDITORIAL_BYLINE,
  EDITORIAL_ORGANIZATION_URL,
  EDITORIAL_TEAM_NAME,
  articleInstantsEqual,
  buildBlogArticleJsonLd,
  formatCombinedByline,
  resolveBlogArticleAuthor,
  resolveBlogArticleTimestamps,
  resolveBlogEditorialUpdate,
  resolveVisibleUpdatedDateTime,
  toArticleIsoDateTime,
  toIsoDateTime,
  wordpressAuthorId,
} = await import('../lib/blog-editorial-meta.ts');
const wordpressSource = readFileSync(
  new URL('../services/wordpress.ts', import.meta.url),
  'utf8',
);
const editorialSource = readFileSync(
  new URL('../lib/blog-editorial-meta.ts', import.meta.url),
  'utf8',
);
const {
  CASHEA_COMERCIOS_LOCAL_POST,
  ESHOW_MADRID_2026_AUTHOR_NAME,
  ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
  ESHOW_MADRID_2026_SLUG,
  MIGRACION_SEO_ALT_LOCAL_POST,
  blogArticleJsonLdExtras,
  eshowMadrid2026DateModified,
  getStagingLocalBlogPost,
} = await import('../lib/blog-local-posts.ts');
const { ZELLE_VE_BLOG_SLUG } = await import('../lib/blog-body-overrides.ts');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const chipSource = readFileSync(
  new URL('../components/blog/BlogBylineChip.tsx', import.meta.url),
  'utf8',
);
const metadataFn = blogPage.slice(blogPage.indexOf('export async function generateMetadata'));

const FRAMEWORKS_SLUG = 'como-elegir-el-mejor-framework-para-tu-web';
const FRAMEWORKS_DATES = {
  published: '2024-04-26T15:17:40',
  publishedGmt: '2024-04-26T19:17:40',
  modified: '2026-09-29T16:06:54',
  modifiedGmt: '2026-09-29T20:06:54',
};
const FRAMEWORKS_POST = {
  slug: FRAMEWORKS_SLUG,
  author: {
    id: 21,
    name: 'Stefanni Parabavidez',
    url: 'https://endpoint.playfulagency.com/author/stefanni/',
  },
  author_name: undefined,
  ...FRAMEWORKS_DATES,
};
const ZELLE_DATES = {
  published: '2020-06-15T14:22:00',
  publishedGmt: '2020-06-15T18:22:00',
  modified: '2020-06-15T14:22:00',
  modifiedGmt: '2020-06-15T18:22:00',
};

function articleSeo(post, slug = post.slug) {
  const dates = {
    published: post.published || post.date,
    publishedGmt: post.publishedGmt || post.date_gmt,
    modified: post.modified,
    modifiedGmt: post.modifiedGmt || post.modified_gmt,
  };
  const editorial = resolveBlogEditorialUpdate(slug, dates);
  const timestamps = resolveBlogArticleTimestamps(dates);
  const author = resolveBlogArticleAuthor(post, editorial);
  const jsonLd = buildBlogArticleJsonLd({
    headline: 'H1',
    description: 'Meta',
    datePublished: timestamps.datePublished,
    dateModified: timestamps.dateModified,
    url: 'https://playfulagency.com/blog/x',
    ...blogArticleJsonLdExtras(slug),
    authorName: author.entityName,
    authorType: author.schemaType,
    authorUrl: author.schemaUrl,
  });
  return { editorial, timestamps, author, jsonLd };
}

test('1. WP author is Person in schema and article:author; visible pill stays combined (frameworks)', () => {
  const { author, jsonLd, editorial } = articleSeo(FRAMEWORKS_POST, FRAMEWORKS_SLUG);
  assert.ok(editorial);
  assert.equal(
    author.visibleByline,
    formatCombinedByline('Stefanni Parabavidez', DEFAULT_EDITORIAL_BYLINE),
  );
  assert.equal(author.entityName, 'Stefanni Parabavidez');
  assert.equal(author.schemaType, 'Person');
  assert.equal(author.schemaUrl, BLOG_AUTHOR_URL);
  assert.equal(author.href, BLOG_AUTHOR_HREF);
  assert.deepEqual(jsonLd.author, {
    '@type': 'Person',
    name: 'Stefanni Parabavidez',
    url: BLOG_AUTHOR_URL,
  });
  assert.notEqual(author.entityName, 'Playful Agency');
  assert.equal(wordpressAuthorId(FRAMEWORKS_POST), 21);
  assert.match(author.visibleByline, /Stefanni Parabavidez/);
  assert.match(author.visibleByline, /Equipo editorial/);
});

test('1. local team posts not in WP use Equipo editorial (eShow)', () => {
  const post = getStagingLocalBlogPost(ESHOW_MADRID_2026_SLUG, {});
  assert.ok(post);
  assert.equal(wordpressAuthorId(post), null);
  const { author, jsonLd } = articleSeo(post, ESHOW_MADRID_2026_SLUG);
  assert.equal(author.visibleByline, EDITORIAL_TEAM_NAME);
  assert.equal(author.visibleByline, ESHOW_MADRID_2026_AUTHOR_NAME);
  assert.equal(author.entityName, EDITORIAL_TEAM_NAME);
  assert.equal(author.schemaType, 'Organization');
  assert.equal(author.schemaUrl, EDITORIAL_ORGANIZATION_URL);
  assert.equal(author.href, undefined);
  assert.deepEqual(jsonLd.author, {
    '@type': 'Organization',
    name: 'Equipo editorial',
    url: EDITORIAL_ORGANIZATION_URL,
  });
  assert.notEqual(jsonLd.author.name, 'Playful Agency');
});

test('1. WordPress author wins for schema/meta even when the pill adds Equipo editorial', () => {
  const author = resolveBlogArticleAuthor(
    { author: { id: 21, name: 'Stefanni Parabavidez' } },
    {
      updatedAt: '2026-09-24T00:00:00.000Z',
      updatedAtLabel: '24 de septiembre de 2026',
      updatedBy: DEFAULT_EDITORIAL_BYLINE,
      source: 'override',
    },
  );
  assert.equal(author.visibleByline, 'Stefanni Parabavidez y Equipo editorial de Playful Agency');
  assert.equal(author.entityName, 'Stefanni Parabavidez');
  assert.equal(author.schemaType, 'Person');
  assert.equal(author.schemaUrl, BLOG_AUTHOR_URL);
});

test('1. local posts signed Playful Agency (id 0) stay Person, not Equipo editorial', () => {
  for (const post of [CASHEA_COMERCIOS_LOCAL_POST, MIGRACION_SEO_ALT_LOCAL_POST]) {
    assert.equal(wordpressAuthorId(post), null);
    const { author, jsonLd } = articleSeo(post, post.slug);
    assert.equal(author.entityName, 'Playful Agency');
    assert.equal(author.schemaType, 'Person');
    assert.equal(author.schemaUrl, BLOG_AUTHOR_URL);
    assert.equal(author.visibleByline, 'Playful Agency');
    assert.equal(jsonLd.author['@type'], 'Person');
    assert.notEqual(author.entityName, EDITORIAL_TEAM_NAME);
  }
});

test('1. schema reads the WP author name, not a hardcoded slug or id map', () => {
  assert.doesNotMatch(editorialSource, /AUTHOR_BY_SLUG|authorIdToName|86152/);
  assert.match(wordpressSource, /post\._embedded\['author'\]/);
  assert.match(wordpressSource, /post\.author_name = post\.author\.name/);
  const fromWp = resolveBlogArticleAuthor({
    author: { id: 5, name: 'Un autor de WordPress' },
  });
  assert.equal(wordpressAuthorId({ author: 5 }), 5);
  assert.equal(wordpressAuthorId({ author: { id: 21, name: 'Stefanni Parabavidez' } }), 21);
  assert.equal(fromWp.entityName, 'Un autor de WordPress');
  assert.equal(fromWp.schemaType, 'Person');
  const fromNameOnly = resolveBlogArticleAuthor({
    author: 18,
    author_name: 'Nombre embebido de WP',
  });
  assert.equal(fromNameOnly.entityName, 'Nombre embebido de WP');
  assert.equal(fromNameOnly.schemaType, 'Person');
});

test('2. every post exposes publish <time datetime> and last-updated when different', () => {
  assert.match(blogPage, /<time dateTime=\{articleDates\.datePublished\}/);
  assert.match(blogPage, /resolveVisibleUpdatedDateTime\(/);
  assert.match(blogPage, /updatedDateTime=\{resolveVisibleUpdatedDateTime/);
  assert.match(chipSource, /updatedDateTime/);
  assert.match(chipSource, /<time dateTime=\{updatedDateTime\}/);

  const frameworks = articleSeo(FRAMEWORKS_POST, FRAMEWORKS_SLUG);
  assert.equal(frameworks.timestamps.hasDistinctModified, true);
  assert.equal(frameworks.timestamps.datePublished, '2024-04-26T19:17:40Z');
  assert.equal(frameworks.timestamps.dateModified, '2026-09-29T20:06:54Z');
  assert.equal(
    resolveVisibleUpdatedDateTime(frameworks.editorial, frameworks.timestamps),
    frameworks.editorial.updatedAt,
  );

  const eshow = getStagingLocalBlogPost(ESHOW_MADRID_2026_SLUG, {});
  const eshowSeo = articleSeo(eshow, ESHOW_MADRID_2026_SLUG);
  assert.equal(eshowSeo.timestamps.hasDistinctModified, false);
  assert.equal(eshowSeo.timestamps.datePublished, ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL);
  assert.equal(
    resolveVisibleUpdatedDateTime(eshowSeo.editorial, eshowSeo.timestamps),
    eshowSeo.timestamps.dateModified,
  );
});

test('3. schema and meta instants are ISO 8601 with timezone and the same instant', () => {
  const frameworks = articleSeo(FRAMEWORKS_POST, FRAMEWORKS_SLUG);
  assert.equal(frameworks.jsonLd.datePublished, frameworks.timestamps.datePublished);
  assert.equal(frameworks.jsonLd.dateModified, frameworks.timestamps.dateModified);
  assert.match(frameworks.timestamps.datePublished, /Z$|[+-]\d{2}:\d{2}$/);
  assert.match(frameworks.timestamps.dateModified, /Z$|[+-]\d{2}:\d{2}$/);
  assert.equal(articleInstantsEqual(
    frameworks.jsonLd.datePublished,
    frameworks.timestamps.datePublished,
  ), true);

  const eshow = articleSeo(
    getStagingLocalBlogPost(ESHOW_MADRID_2026_SLUG, {}),
    ESHOW_MADRID_2026_SLUG,
  );
  assert.equal(eshow.jsonLd.datePublished, '2026-10-07T00:00:00+02:00');
  assert.equal(eshow.jsonLd.dateModified, eshowMadrid2026DateModified());
  assert.equal(eshow.jsonLd.datePublished, eshow.timestamps.datePublished);
  assert.equal(eshow.jsonLd.dateModified, eshow.timestamps.dateModified);
  assert.ok(articleInstantsEqual(eshow.jsonLd.datePublished, eshow.jsonLd.dateModified));

  assert.equal(toArticleIsoDateTime('2024-04-26T19:17:40'), '2024-04-26T19:17:40Z');
  assert.equal(toArticleIsoDateTime('2026-10-07T00:00:00+02:00'), '2026-10-07T00:00:00+02:00');
  assert.equal(toArticleIsoDateTime('2026-09-24'), null);
});

test('4. dateModified is WordPress modified_gmt, never a date-only midnight fallback', () => {
  assert.equal(BLOG_EDITORIAL_OVERRIDES[ZELLE_VE_BLOG_SLUG].updatedAt, '2026-09-24');
  const zelle = articleSeo({
    slug: ZELLE_VE_BLOG_SLUG,
    author: { name: 'Stefanni Parabavidez' },
    ...ZELLE_DATES,
  }, ZELLE_VE_BLOG_SLUG);
  assert.equal(zelle.editorial?.updatedAt, '2026-09-24T00:00:00.000Z');
  assert.equal(zelle.timestamps.dateModified, '2020-06-15T18:22:00Z');
  assert.notEqual(zelle.timestamps.dateModified, zelle.editorial.updatedAt);
  assert.notEqual(zelle.jsonLd.dateModified, '2026-09-24T00:00:00.000Z');
  assert.equal(
    resolveVisibleUpdatedDateTime(zelle.editorial, zelle.timestamps),
    '2026-09-24T00:00:00.000Z',
  );
  assert.equal(zelle.jsonLd.dateModified, zelle.timestamps.dateModified);
  assert.equal(toArticleIsoDateTime('2026-09-24'), null);
  assert.equal(toIsoDateTime('2026-09-24'), '2026-09-24T00:00:00.000Z');

  const frameworks = articleSeo(FRAMEWORKS_POST, FRAMEWORKS_SLUG);
  assert.equal(frameworks.timestamps.dateModified, '2026-09-29T20:06:54Z');
  assert.doesNotMatch(frameworks.timestamps.dateModified, /T00:00:00/);

  const eshow = articleSeo(
    getStagingLocalBlogPost(ESHOW_MADRID_2026_SLUG, {}),
    ESHOW_MADRID_2026_SLUG,
  );
  assert.equal(eshow.timestamps.dateModified, '2026-10-07T00:00:00+02:00');
  assert.match(eshow.timestamps.dateModified, /\+02:00$/);
});

test('page metadata and hero wire author entity plus zoned timestamps', () => {
  assert.match(blogPage, /resolveBlogArticleAuthor\(post, editorial\)/);
  assert.match(blogPage, /resolveBlogArticleTimestamps\(editorialDates\)/);
  assert.match(metadataFn, /publishedTime: articleDates\.datePublished/);
  assert.match(metadataFn, /modifiedTime: articleDates\.dateModified/);
  assert.match(metadataFn, /authors: \[articleAuthor\.entityName\]/);
  assert.doesNotMatch(metadataFn, /post\.author_name \|\| 'Playful Agency'/);
  assert.doesNotMatch(metadataFn, /publishedTime:[\s\S]*post\.date/);
  assert.doesNotMatch(blogPage, /authorName: isEshow[\s\S]*Playful Agency/);
  assert.match(blogPage, /authorName: articleAuthor\.entityName/);
  assert.match(blogPage, /authorType: articleAuthor\.schemaType/);
  assert.match(blogPage, /name=\{bylineName\}/);
  assert.match(blogPage, /href=\{authorHref\}/);
  assert.doesNotMatch(blogPage, /formatCombinedByline\(post\.author\.name/);
});
