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
  ESHOW_LISTA_FORM_MARKER,
  ESHOW_LISTA_FORM_SLOT,
  isStagingLocalBlogEnabled,
  getStagingLocalBlogPost,
  listStagingLocalBlogStaticParams,
  listStagingSitemapBlogEntries,
  blogArticleJsonLdExtras,
  blogFaqPageJsonLd,
  eshowMadrid2026DateModified,
  formatEshowActualizadoLine,
  GOOGLE_MERCHANT_CENTER_SLUG,
  GOOGLE_MERCHANT_CENTER_H1,
  GOOGLE_MERCHANT_CENTER_TITLE,
  GOOGLE_MERCHANT_CENTER_META,
  GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL,
  GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL,
  GOOGLE_MERCHANT_CENTER_BODY_HTML,
  GOOGLE_MERCHANT_CENTER_FAQS,
} = await import('../lib/blog-local-posts.ts');

const {
  ESHOW_MADRID_2026_COVERAGE_BLOCKS,
  buildEshowMadrid2026BodyHtml,
  eshowCoverageBlockId,
  sortEshowCoverageBlocks,
} = await import('../lib/eshow-madrid-2026.ts');

const { buildBlogArticleJsonLd, toIsoDateTime } = await import('../lib/blog-editorial-meta.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

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
  assert.equal(post.date_gmt, '2026-10-07T00:00:00+02:00');
  assert.equal(post.modified, eshowMadrid2026DateModified());
  assert.equal(post.title.rendered, ESHOW_MADRID_2026_H1);
  const params = listStagingLocalBlogStaticParams({});
  assert.deepEqual(
    params.find((entry) => entry.slug[1] === ESHOW_MADRID_2026_SLUG),
    { slug: ['otros', 'eshow-madrid-2026'] },
  );
  assert.deepEqual(
    params.find((entry) => entry.slug[1] === GOOGLE_MERCHANT_CENTER_SLUG),
    { slug: ['pautas-digitales', 'google-merchant-center'] },
  );
});

test('eShow body is the live copy: no H1, two official WebP captures, form marker and coverage', () => {
  const html = ESHOW_MADRID_2026_BODY_HTML;
  assert.doesNotMatch(html, /<h1[\s>]/);
  assert.match(html, /El eShow Madrid 2026 se celebra el miércoles 4/);
  assert.match(html, /<h2 id="fechas-horario-y-como-llegar-a-ifema">Fechas, horario y cómo llegar a IFEMA<\/h2>/);
  assert.match(html, /<h2 id="cobertura">Cobertura del eShow Madrid 2026<\/h2>/);
  assert.match(html, /<h2 id="sigue-el-eshow">Sigue el eShow con Playful<\/h2>/);
  assert.match(html, /<h2 id="que-trae-el-eshow-2026-si-tienes-tienda-online">/);
  assert.ok(html.includes(ESHOW_LISTA_FORM_SLOT));
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

test('coverage blocks are typed, newest first, and drive dateModified', () => {
  const initial = ESHOW_MADRID_2026_COVERAGE_BLOCKS[0];
  assert.equal(initial.datetime, '2026-10-07T00:00:00+02:00');
  assert.equal(eshowCoverageBlockId(initial), 'bloque-2026-10-07-0000');
  assert.equal(eshowMadrid2026DateModified(), '2026-10-07T00:00:00+02:00');
  assert.equal(
    formatEshowActualizadoLine('2026-11-04T11:20:00+01:00'),
    'Actualizado el 4 de noviembre de 2026 a las 11:20',
  );

  const withLive = [
    initial,
    {
      datetime: '2026-11-04T11:20:00+01:00',
      label: '4 de noviembre de 2026 · 11:20',
      html: '<p>Bloque real de prueba.</p>',
    },
  ];
  assert.equal(eshowMadrid2026DateModified(withLive), '2026-11-04T11:20:00+01:00');
  assert.equal(sortEshowCoverageBlocks(withLive)[0].datetime, '2026-11-04T11:20:00+01:00');
  const rendered = buildEshowMadrid2026BodyHtml(withLive);
  const firstId = rendered.indexOf('id="bloque-2026-11-04-1120"');
  const secondId = rendered.indexOf('id="bloque-2026-10-07-0000"');
  assert.ok(firstId > -1 && secondId > firstId);
  assert.match(rendered, /<time datetime="2026-11-04T11:20:00\+01:00">/);
  assert.match(rendered, /<time datetime="2026-10-07T00:00:00\+02:00">/);
});

test('eShow JSON-LD is Article with offset dates, about Thing and no Event', () => {
  const extras = blogArticleJsonLdExtras(ESHOW_MADRID_2026_SLUG);
  assert.equal(extras.type, 'Article');
  assert.deepEqual(extras.about, { '@type': 'Thing', name: ESHOW_MADRID_2026_ABOUT_NAME });
  const jsonLd = buildBlogArticleJsonLd({
    headline: ESHOW_MADRID_2026_H1,
    description: ESHOW_MADRID_2026_META,
    datePublished: ESHOW_MADRID_2026_DATE_PUBLISHED_PROVISIONAL,
    dateModified: eshowMadrid2026DateModified(),
    authorName: 'Playful Agency',
    url: 'https://playfulagency.com/blog/otros/eshow-madrid-2026',
    ...extras,
  });
  assert.equal(jsonLd['@type'], 'Article');
  assert.deepEqual(jsonLd.about, { '@type': 'Thing', name: 'E-SHOW Madrid 2026' });
  assert.equal(jsonLd.datePublished, '2026-10-07T00:00:00+02:00');
  assert.equal(jsonLd.dateModified, '2026-10-07T00:00:00+02:00');
  assert.equal(jsonLd.inLanguage, 'es-ES');
  assert.deepEqual(jsonLd.author, {
    '@type': 'Organization',
    name: 'Playful Agency',
    url: 'https://playfulagency.com',
  });
  assert.doesNotMatch(JSON.stringify(jsonLd), /"Event"/);
  assert.equal(toIsoDateTime('2026-10-07T00:00:00+02:00'), '2026-10-07T00:00:00+02:00');
  assert.equal(blogArticleJsonLdExtras('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce').type, undefined);
});

test('wordpress and the post template wire the staging-only post without listing it in production sitemap source', () => {
  assert.match(wordpressSource, /getStagingLocalBlogPost\(slug\)/);
  assert.match(wordpressSource, /listStagingLocalBlogStaticParams\(\)/);
  assert.match(blogPage, /blogArticleJsonLdExtras\(postSlug\)/);
  assert.match(blogPage, /\[ESHOW_MADRID_2026_SLUG\]/);
  assert.match(blogPage, /h1: ESHOW_MADRID_2026_H1/);
  assert.match(blogPage, /<EshowListaForm/);
  assert.match(blogPage, /formatEshowActualizadoLine/);
  assert.ok(blogPage.includes(ESHOW_MADRID_2026_TITLE) || blogPage.includes('ESHOW_MADRID_2026_TITLE'));
  assert.doesNotMatch(listingSource, /eshow-madrid-2026/);
  assert.doesNotMatch(sitemapSource, /SITEMAP_BLOG_PATHS = \[[^\]]*eshow-madrid-2026/s);
  assert.match(blogPage, /blogFaqPageJsonLd\(postSlug\)/);
  assert.match(blogPage, /\[GOOGLE_MERCHANT_CENTER_SLUG\]/);
  assert.match(blogPage, /h1: GOOGLE_MERCHANT_CENTER_H1/);
  assert.doesNotMatch(listingSource, /google-merchant-center/);
  assert.doesNotMatch(sitemapSource, /google-merchant-center/);
  assert.doesNotMatch(expectedRoutes, /google-merchant-center/);
  assert.doesNotMatch(relatedSource, /google-merchant-center/);
});

test('staging sitemap extras follow dateModified and stay off production', () => {
  assert.deepEqual(listStagingSitemapBlogEntries({ VERCEL_ENV: 'production' }), []);
  assert.deepEqual(listStagingSitemapBlogEntries({ VERCEL_GIT_COMMIT_REF: 'main' }), []);
  assert.deepEqual(listStagingSitemapBlogEntries({ VERCEL_GIT_COMMIT_REF: 'staging' }), [{
    loc: 'https://playfulagency.com/blog/otros/eshow-madrid-2026',
    lastmod: '2026-10-07T00:00:00+02:00',
  }]);

  const previous = process.env.VERCEL_ENV;
  const previousRef = process.env.VERCEL_GIT_COMMIT_REF;
  process.env.VERCEL_ENV = 'production';
  process.env.VERCEL_GIT_COMMIT_REF = 'main';
  try {
    assert.doesNotMatch(buildSitemapXml(), /eshow-madrid-2026/);
  } finally {
    if (previous === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previous;
    if (previousRef === undefined) delete process.env.VERCEL_GIT_COMMIT_REF;
    else process.env.VERCEL_GIT_COMMIT_REF = previousRef;
  }

  const stagingXml = buildSitemapXml();
  assert.match(
    stagingXml,
    /<loc>https:\/\/playfulagency\.com\/blog\/otros\/eshow-madrid-2026<\/loc><lastmod>2026-10-07T00:00:00\+02:00<\/lastmod>/,
  );
});

test('local Merchant Center post is gated and shaped like a WP pautas-digitales article', () => {
  assert.equal(
    getStagingLocalBlogPost(GOOGLE_MERCHANT_CENTER_SLUG, { VERCEL_ENV: 'production' }),
    null,
  );

  const post = getStagingLocalBlogPost(GOOGLE_MERCHANT_CENTER_SLUG, {});
  assert.ok(post);
  assert.equal(post.slug, 'google-merchant-center');
  assert.equal(post.categories[0].slug, 'pautas-digitales');
  assert.equal(post.categories[0].name, 'Pautas Digitales');
  assert.equal(post.categories[0].id, 25);
  assert.equal(post.author.name, 'Stefanni Parabavidez');
  assert.equal(post.date, GOOGLE_MERCHANT_CENTER_DATE_PUBLISHED_PROVISIONAL);
  assert.equal(post.modified, GOOGLE_MERCHANT_CENTER_DATE_MODIFIED_PROVISIONAL);
  assert.equal(post.title.rendered, GOOGLE_MERCHANT_CENTER_H1);
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

  const faq = blogFaqPageJsonLd(GOOGLE_MERCHANT_CENTER_SLUG);
  assert.ok(faq);
  assert.equal(faq['@type'], 'FAQPage');
  assert.equal(faq.mainEntity.length, 5);
  assert.equal(blogFaqPageJsonLd(ESHOW_MADRID_2026_SLUG), null);
});
