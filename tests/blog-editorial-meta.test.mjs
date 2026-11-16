import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  BLOG_EDITORIAL_OVERRIDES,
  DEFAULT_EDITORIAL_BYLINE,
  EDITORIAL_AVATAR_SRC,
  WP_MODIFIED_HONOR_ON_OR_AFTER,
  buildBlogArticleJsonLd,
  buildBlogBreadcrumbJsonLd,
  buildBlogListingBreadcrumbJsonLd,
  decodeHtmlEntities,
  formatCombinedByline,
  formatEditorialDate,
  formatBlogListingDate,
  formatUpdatedAtShort,
  formatUpdatedByline,
  isMeaningfullyAfter,
  resolveBlogAuthorHref,
  resolveBlogEditorialUpdate,
  serializeJsonLd,
  toIsoDateTime,
  wordpressSeoText,
  BLOG_AUTHOR_HREF,
} = await import('../lib/blog-editorial-meta.ts');
const {
  BLOG_CARD_EXCERPT_MAX,
  BLOG_LISTING_EXCERPT_MAX,
  formatBlogExcerpt,
  formatBlogHeroExcerpt,
} = await import('../lib/blog-hero-excerpt.ts');
const plainText = await import('../lib/wordpress-plain-text.ts');
const { ZELLE_VE_BLOG_SLUG } = await import('../lib/blog-body-overrides.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogPage = readFileSync(
  new URL('../app/(frontend)/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const chipSource = readFileSync(
  new URL('../components/blog/BlogBylineChip.tsx', import.meta.url),
  'utf8',
);
const overridesSource = readFileSync(
  new URL('../lib/blog-body-overrides.ts', import.meta.url),
  'utf8',
);

const ZELLE_PUBLISHED = '2020-06-15T14:22:00';

test('Zelle rewrite is seeded with 2026-09-24 and default editorial byline', () => {
  assert.equal(ZELLE_VE_BLOG_SLUG, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
  assert.equal(BLOG_EDITORIAL_OVERRIDES[ZELLE_VE_BLOG_SLUG].updatedAt, '2026-09-24');
  assert.equal(BLOG_EDITORIAL_OVERRIDES[ZELLE_VE_BLOG_SLUG].updatedBy, undefined);
  assert.equal(DEFAULT_EDITORIAL_BYLINE, 'Equipo editorial de Playful Agency');

  const update = resolveBlogEditorialUpdate(ZELLE_VE_BLOG_SLUG, {
    published: ZELLE_PUBLISHED,
    modified: ZELLE_PUBLISHED,
  });
  assert.ok(update);
  assert.equal(update.source, 'override');
  assert.equal(update.updatedBy, DEFAULT_EDITORIAL_BYLINE);
  assert.equal(update.updatedAt, '2026-09-24T00:00:00.000Z');
  assert.equal(update.updatedAtLabel, '24 de septiembre de 2026');
});

test('override updatedAt wins over a later WordPress modified date', () => {
  const update = resolveBlogEditorialUpdate(ZELLE_VE_BLOG_SLUG, {
    published: ZELLE_PUBLISHED,
    modified: '2024-01-10T09:00:00',
    modifiedGmt: '2024-01-10T13:00:00',
  });
  assert.equal(update?.source, 'override');
  assert.equal(update?.updatedAt, '2026-09-24T00:00:00.000Z');
});

test('unknown slugs stay unchanged when WP modified equals or is the same day as published', () => {
  assert.equal(
    resolveBlogEditorialUpdate('cintillos-de-promocion', {
      published: '2021-03-01T10:00:00',
      modified: '2021-03-01T10:00:00',
    }),
    null,
  );
  assert.equal(
    resolveBlogEditorialUpdate('actualizar-tu-e-commerce', {
      published: '2021-03-01T10:00:00',
      modified: '2021-03-01T22:15:00',
    }),
    null,
  );
  assert.equal(resolveBlogEditorialUpdate('cintillos-de-promocion', {}), null);
  assert.equal(resolveBlogEditorialUpdate(undefined, { modified: '2024-01-01' }), null);
});

test('historical WordPress modified before the honor date is treated as CMS noise', () => {
  assert.equal(WP_MODIFIED_HONOR_ON_OR_AFTER, '2026-09-24');
  assert.equal(
    resolveBlogEditorialUpdate('cintillos-de-promocion', {
      published: '2024-10-01T10:00:00',
      modified: '2024-11-05T08:00:00',
      modifiedGmt: '2024-11-05T12:00:00',
    }),
    null,
  );
  assert.equal(
    resolveBlogEditorialUpdate('actualizar-tu-e-commerce', {
      published: '2024-09-16T10:00:00',
      modified: '2026-01-07T18:57:36',
    }),
    null,
  );
});

test('WordPress modified on or after the honor date becomes the editorial chip', () => {
  const update = resolveBlogEditorialUpdate('pasarela-de-pago-ecommerce-guia', {
    published: '2021-03-01T10:00:00',
    publishedGmt: '2021-03-01T14:00:00',
    modified: '2026-09-25T08:00:00',
    modifiedGmt: '2026-09-25T12:00:00',
  });
  assert.ok(update);
  assert.equal(update.source, 'wordpress');
  assert.equal(update.updatedBy, DEFAULT_EDITORIAL_BYLINE);
  assert.equal(update.updatedAt, '2026-09-25T12:00:00.000Z');
  assert.equal(update.updatedAtLabel, '25 de septiembre de 2026');
});

test('same-day or earlier modified is not a real update', () => {
  assert.equal(isMeaningfullyAfter('2021-03-01T22:00:00', '2021-03-01T10:00:00'), false);
  assert.equal(isMeaningfullyAfter('2021-03-01', '2021-03-01'), false);
  assert.equal(isMeaningfullyAfter('2021-02-28', '2021-03-01'), false);
  assert.equal(isMeaningfullyAfter('2021-03-02', '2021-03-01'), true);
  assert.equal(
    resolveBlogEditorialUpdate('cualquier-slug', {
      published: '2021-03-02T01:00:00Z',
      modified: '2021-03-01T23:00:00Z',
    }),
    null,
  );
});

test('override on the publish day is suppressed', () => {
  assert.equal(
    resolveBlogEditorialUpdate(ZELLE_VE_BLOG_SLUG, {
      published: '2026-09-24T18:00:00Z',
    }),
    null,
  );
});

test('custom updatedBy is kept when provided', () => {
  const original = BLOG_EDITORIAL_OVERRIDES['slug-de-prueba-editorial'];
  BLOG_EDITORIAL_OVERRIDES['slug-de-prueba-editorial'] = {
    updatedAt: '2026-01-15',
    updatedBy: 'Mesa de contenidos',
  };
  try {
    const update = resolveBlogEditorialUpdate('slug-de-prueba-editorial', {
      published: '2022-01-01',
    });
    assert.equal(update?.updatedBy, 'Mesa de contenidos');
    assert.equal(update?.source, 'override');
  } finally {
    if (original) {
      BLOG_EDITORIAL_OVERRIDES['slug-de-prueba-editorial'] = original;
    } else {
      delete BLOG_EDITORIAL_OVERRIDES['slug-de-prueba-editorial'];
    }
  }
});

test('date helpers normalize date-only ISO and format Spanish UTC labels', () => {
  assert.equal(toIsoDateTime('2026-09-24'), '2026-09-24T00:00:00.000Z');
  assert.equal(formatEditorialDate('2026-09-24'), '24 de septiembre de 2026');
  assert.equal(formatEditorialDate('2023-11-20T12:00:00.000Z'), '20 de noviembre de 2023');
});

test('BlogPosting JSON-LD includes description, image, publisher and canonical', () => {
  const url =
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';
  const jsonLd = buildBlogArticleJsonLd({
    headline: 'Zelle en Venezuela: Un método de pago',
    description: 'Integra Zelle como método de pago en tu tienda online en Venezuela.',
    image: 'https://playfulagency.com/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
    datePublished: ZELLE_PUBLISHED,
    dateModified: '2026-09-24T00:00:00.000Z',
    authorName: 'Stefanni Parabavidez',
    url,
    publisherName: 'Playful Agency',
    publisherLogo: 'https://playfulagency.com/images/logos/playful-logo-schema.png',
  });
  assert.equal(jsonLd['@type'], 'BlogPosting');
  assert.equal(jsonLd.headline, 'Zelle en Venezuela: Un método de pago');
  assert.equal(jsonLd.description, 'Integra Zelle como método de pago en tu tienda online en Venezuela.');
  assert.equal(
    jsonLd.image,
    'https://playfulagency.com/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png',
  );
  assert.equal(jsonLd.datePublished, '2020-06-15T14:22:00Z');
  assert.equal(jsonLd.dateModified, '2026-09-24T00:00:00.000Z');
  assert.deepEqual(jsonLd.author, {
    '@type': 'Person',
    name: 'Stefanni Parabavidez',
    url: 'https://playfulagency.com/nosotros',
  });
  assert.deepEqual(jsonLd.publisher, {
    '@type': 'Organization',
    name: 'Playful Agency',
    logo: {
      '@type': 'ImageObject',
      url: 'https://playfulagency.com/images/logos/playful-logo-schema.png',
    },
  });
  assert.equal(jsonLd.mainEntityOfPage, url);
  assert.equal(jsonLd.url, url);
  assert.doesNotMatch(serializeJsonLd(jsonLd), /</);
});

test('blog BreadcrumbList omits category without item URL (Inicio > Blog > Post)', () => {
  const url =
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';
  const crumbs = buildBlogBreadcrumbJsonLd({
    categorySlug: 'tecnologia',
    headline: 'Zelle en Venezuela: Un método de pago',
    url,
  });
  assert.equal(crumbs['@type'], 'BreadcrumbList');
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[1].name, 'Blog');
  assert.equal(crumbs.itemListElement[2].name, 'Zelle en Venezuela: Un método de pago');
  assert.equal(crumbs.itemListElement[2].item, url);
  assert.equal(crumbs.itemListElement[2].position, 3);
  assert.equal(buildBlogListingBreadcrumbJsonLd().itemListElement.length, 2);
});

test('eShow and other 4-level posts use 3-level BreadcrumbList JSON-LD', () => {
  const url = 'https://playfulagency.com/blog/otros/eshow-madrid-2026';
  const crumbs = buildBlogBreadcrumbJsonLd({
    categorySlug: 'otros',
    headline: 'eShow Madrid 2026: guía para marcas',
    url,
    slug: 'eshow-madrid-2026',
  });
  assert.equal(crumbs.itemListElement.length, 3);
  assert.deepEqual(crumbs.itemListElement.map((item) => item.name), [
    'Inicio',
    'Blog',
    'eShow Madrid 2026: guía para marcas',
  ]);
  assert.equal(crumbs.itemListElement[2].item, url);
  assert.doesNotMatch(JSON.stringify(crumbs), /"position":\s*4/);
});

test('listed AEO posts use a 3-level BreadcrumbList with the short name', () => {
  const url =
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';
  const crumbs = buildBlogBreadcrumbJsonLd({
    categorySlug: 'tecnologia',
    headline: 'Zelle en Venezuela: Un método de pago',
    url,
    slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  });
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[1].name, 'Blog');
  assert.equal(crumbs.itemListElement[2].name, 'Zelle en Venezuela');
  assert.equal(crumbs.itemListElement[2].item, url);
});

test('JSON-LD headline decodes WordPress entities to match the H1', () => {
  const jsonLd = buildBlogArticleJsonLd({
    headline: 'SEO &#8211; guía &amp; checklist',
    description: '¿Cuáles son sus ventajas? y&#8230; si realmente puede.\n',
    datePublished: ZELLE_PUBLISHED,
    dateModified: ZELLE_PUBLISHED,
    url: 'https://playfulagency.com/blog/seo/ejemplo',
  });
  assert.equal(jsonLd.headline, 'SEO – guía & checklist');
  assert.equal(jsonLd.description, '¿Cuáles son sus ventajas? y… si realmente puede.');
  assert.equal(decodeHtmlEntities('&#x2013;'), '–');
});

test('wordpressSeoText decodes WP entities once and trims descriptions', () => {
  assert.equal(plainText.decodeHtmlEntities, decodeHtmlEntities);
  assert.equal(plainText.wordpressSeoText, wordpressSeoText);
  assert.equal(decodeHtmlEntities('y&#8230;'), 'y…');
  assert.equal(decodeHtmlEntities('y&amp;#8230;'), 'y&#8230;');
  assert.equal(decodeHtmlEntities('H&amp;M'), 'H&M');
  assert.equal(decodeHtmlEntities('&amp;amp;'), '&amp;');
  assert.equal(
    wordpressSeoText(
      '<p>¿Quieres conocer que es una ecommerce? ¿Cuáles son sus ventajas? y&#8230; si realmente puede ser una alternativa para tu negocio.</p>\n',
      { stripTags: true, maxLength: 160 },
    ),
    '¿Quieres conocer que es una ecommerce? ¿Cuáles son sus ventajas? y… si realmente puede ser una alternativa para tu negocio.',
  );
  assert.equal(wordpressSeoText('texto con salto\n'), 'texto con salto');
  assert.doesNotMatch(wordpressSeoText('H&amp;M y más'), /&amp;/);
});

test('blog post SEO fields reuse wordpressSeoText for title, meta, OG, Twitter and JSON-LD', () => {
  assert.match(blogPage, /from '@\/lib\/wordpress-plain-text'/);
  assert.match(blogPage, /function blogPostSeoCopy/);
  assert.match(blogPage, /decodeHtmlEntities\(post\.title\.rendered\)/);
  assert.match(blogPage, /yoastTitle \?\? decodeHtmlEntities\(post\.title\.rendered\)/);
  assert.match(blogPage, /yoastDescription \?\? post\.excerpt\?\.rendered/);
  const metadataFn = blogPage.slice(blogPage.indexOf('export async function generateMetadata'));
  assert.match(metadataFn, /blogPostSeoCopy\(post, postSlug\)/);
  assert.match(metadataFn, /openGraph:\s*\{[\s\S]*title,[\s\S]*description,/);
  assert.match(blogPage, /description: metaDescription/);
});

test('combined byline joins author and editorial with y', () => {
  assert.equal(
    formatCombinedByline('Stefanni Parabavidez'),
    'Stefanni Parabavidez y Equipo editorial de Playful Agency',
  );
  assert.equal(
    formatCombinedByline('Stefanni Parabavidez', DEFAULT_EDITORIAL_BYLINE),
    'Stefanni Parabavidez y Equipo editorial de Playful Agency',
  );
  assert.equal(formatCombinedByline('  ', 'Equipo editorial de Playful Agency'), DEFAULT_EDITORIAL_BYLINE);
});

test('hero excerpt omits empty text and only adds ellipsis when truncated', () => {
  assert.equal(formatBlogHeroExcerpt(''), '');
  assert.equal(formatBlogHeroExcerpt('<p></p>'), '');
  assert.equal(formatBlogHeroExcerpt('   <p>  </p>  '), '');
  assert.equal(formatBlogHeroExcerpt('<p>Texto corto.</p>'), 'Texto corto.');
  assert.equal(formatBlogHeroExcerpt('Exactamente veinte.'.padEnd(200, 'x')), 'Exactamente veinte.'.padEnd(200, 'x'));
  const long = 'a'.repeat(201);
  assert.equal(formatBlogHeroExcerpt(`<p>${long}</p>`), 'a'.repeat(200));
  assert.doesNotMatch(formatBlogHeroExcerpt('<p>Hola</p>'), /\.\.\.$/);
});

test('hero excerpt keeps WP manual copy whole and otherwise cuts on a word', () => {
  const cima =
    'El caso «SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela» se llevó el premio de su categoría en la cuarta edición del certamen, celebrada el 19 de octubre de 2026 en el Hotel Eurobuilding de Caracas, Salón Plaza Real, a las 5:00 pm.';
  const cimaBody =
    '¿Qué son los Premios CIMA 2026? Los Premios CIMA 2026 son la cuarta edición de un certamen venezolano.';
  assert.ok(cima.length > 200);
  assert.equal(formatBlogHeroExcerpt(`<p>${cima}</p>`, 200, `<p>${cimaBody}</p>`), cima);
  const autoCut = formatBlogHeroExcerpt(`<p>${cima}</p>`);
  assert.match(autoCut, /en el Hotel…$/);
  assert.doesNotMatch(autoCut, /Eurobui/);
  assert.doesNotMatch(autoCut, /\.\.\./);
  const earlyStop = `Hi. ${'palabra '.repeat(40)}`;
  const truncated = formatBlogHeroExcerpt(`<p>${earlyStop}</p>`, 200);
  assert.notEqual(truncated, 'Hi.');
  assert.match(truncated, /…$/);
  const nearSentence = `${'palabra '.repeat(22)}Fin de frase. y sobra texto extra para pasar el límite de caracteres.`;
  assert.match(formatBlogHeroExcerpt(`<p>${nearSentence}</p>`, 200), /Fin de frase\.$/);
});

test('listing, home, related and más vistos share formatBlogExcerpt and cut on a word', () => {
  const cima =
    'El caso «SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela» se llevó el premio de su categoría en la cuarta edición del certamen, celebrada el 19 de octubre de 2026 en el Hotel Eurobuilding de Caracas, Salón Plaza Real, a las 5:00 pm.';
  assert.equal(BLOG_LISTING_EXCERPT_MAX, 120);
  assert.equal(BLOG_CARD_EXCERPT_MAX, 100);
  const featured = formatBlogExcerpt(`<p>${cima}</p>`, BLOG_LISTING_EXCERPT_MAX);
  assert.match(featured, /en la…$/);
  assert.doesNotMatch(featured, /cua/);
  assert.doesNotMatch(featured, /\.\.\./);
  const card = formatBlogExcerpt(`<p>${cima}</p>`, BLOG_CARD_EXCERPT_MAX);
  assert.match(card, /premio de…$/);
  assert.doesNotMatch(card, /\.\.\./);
  assert.doesNotMatch(
    formatBlogExcerpt('<p>Texto corto que WordPress corta [...]</p>', 120),
    /\.\.\.|\[\s*…\s*\]/,
  );

  const listingPage = readFileSync(new URL('../app/(frontend)/blog/blog-listing-view.tsx', import.meta.url), 'utf8');
  const mostViewed = readFileSync(
    new URL('../components/blog/MostViewedArticles.tsx', import.meta.url),
    'utf8',
  );
  const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../app/(frontend)/page.tsx', import.meta.url), 'utf8');
  const relatedSection = readFileSync(
    new URL('../components/sections/BlogRelatedPostsSection.tsx', import.meta.url),
    'utf8',
  );
  assert.match(listingPage, /formatBlogExcerpt\(posts\[0\]\.excerpt\.rendered, BLOG_LISTING_EXCERPT_MAX\)/);
  assert.match(listingPage, /formatBlogExcerpt\(post\.excerpt\.rendered, BLOG_LISTING_EXCERPT_MAX\)/);
  assert.doesNotMatch(listingPage, /substring\(0,\s*120\)/);
  assert.doesNotMatch(listingPage, /\+ ['"]\.\.\.['"]/);
  assert.match(mostViewed, /formatBlogExcerpt\(post\.excerpt\?\.rendered, BLOG_CARD_EXCERPT_MAX\)/);
  assert.match(wordpress, /function toRelatedBlogCard[\s\S]*formatBlogExcerpt\(post\.excerpt\?\.rendered, BLOG_CARD_EXCERPT_MAX\)/);
  assert.match(wordpress, /function toRelatedIndexPost[\s\S]*formatBlogExcerpt\(post\.excerpt\?\.rendered, BLOG_CARD_EXCERPT_MAX\)/);
  assert.match(home, /getLatestBlogPosts\(6\)/);
  assert.match(relatedSection, /\{post\.excerpt\}/);
});

test('editorial avatar asset remains available but is not the byline face', () => {
  assert.equal(EDITORIAL_AVATAR_SRC, '/images/avatar-playful.svg');
  assert.ok(existsSync(join(root, 'public', EDITORIAL_AVATAR_SRC.replace(/^\//, ''))));
});

test('listing cards use honored update or publication, long and slash formats', () => {
  const zelleDates = { published: '2025-04-22T23:28:54', modified: '2025-04-22T23:28:54' };
  assert.equal(
    formatBlogListingDate(ZELLE_VE_BLOG_SLUG, zelleDates),
    '24 de septiembre de 2026',
  );
  assert.equal(
    formatBlogListingDate(ZELLE_VE_BLOG_SLUG, zelleDates, 'slash'),
    '24 / 09 / 2026',
  );
  assert.equal(
    formatBlogListingDate('como-elegir-el-mejor-framework-para-tu-web', {
      published: '2024-04-26T19:17:40',
      modified: '2024-11-05T22:09:53',
    }),
    '26 de abril de 2024',
  );
  assert.equal(
    formatBlogListingDate(
      'como-elegir-el-mejor-framework-para-tu-web',
      {
        published: '2024-04-26T19:17:40',
        modified: '2024-11-05T22:09:53',
      },
      'slash',
    ),
    '26 / 04 / 2024',
  );
});

test('blog listing surfaces and latest-posts cards wire formatBlogListingDate', () => {
  const listingPage = readFileSync(new URL('../app/(frontend)/blog/blog-listing-view.tsx', import.meta.url), 'utf8');
  const mostViewed = readFileSync(
    new URL('../components/blog/MostViewedArticles.tsx', import.meta.url),
    'utf8',
  );
  const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  assert.match(listingPage, /formatBlogListingDate\(posts\[0\]\.slug/);
  assert.match(listingPage, /formatBlogListingDate\(post\.slug/);
  assert.doesNotMatch(listingPage, /formatDate\(posts\[0\]\.date\)/);
  assert.match(mostViewed, /formatBlogListingDate\(post\.slug/);
  assert.doesNotMatch(mostViewed, /formatDate\(post\.date\)/);
  assert.match(wordpress, /function toRelatedBlogCard[\s\S]*formatBlogListingDate\(\s*post\.slug/);
  assert.match(wordpress, /'slash'/);
});

test('updated byline uses short Spanish month without a new design', () => {
  assert.equal(formatUpdatedAtShort('2026-10-11'), '11 oct 2026');
  assert.equal(formatUpdatedByline('2026-10-11'), 'Actualizado el 11 oct 2026');
  assert.equal(formatUpdatedAtShort('2026-09-24T00:00:00.000Z'), '24 sept 2026');
  assert.equal(resolveBlogAuthorHref('https://playfulagency.com/nosotros'), BLOG_AUTHOR_HREF);
  assert.equal(resolveBlogAuthorHref('https://playfulagency.com/nosotros/'), BLOG_AUTHOR_HREF);
  assert.equal(resolveBlogAuthorHref('/nosotros'), BLOG_AUTHOR_HREF);
  assert.equal(resolveBlogAuthorHref(''), BLOG_AUTHOR_HREF);
  assert.equal(resolveBlogAuthorHref('https://endpoint.playfulagency.com/author/jose/'), BLOG_AUTHOR_HREF);
});

test('blog post page wires one combined chip under H1 and Article JSON-LD', () => {
  assert.match(blogPage, /resolveBlogEditorialUpdate\(postSlug/);
  assert.match(blogPage, /modifiedTime: articleDates\.dateModified/);
  assert.match(blogPage, /buildBlogArticleJsonLd/);
  assert.match(blogPage, /type="application\/ld\+json"/);
  assert.match(blogPage, /serializeJsonLd\(articleJsonLd\)/);
  assert.doesNotMatch(blogPage, /articleJsonLd \?/);
  assert.match(blogPage, /<BlogRelatedPostsSection/);
  assert.match(blogPage, /posts=\{relatedPosts\}/);
  assert.match(blogPage, /excludeSlug=\{post\.slug\}/);
  assert.match(blogPage, /getRelatedBlogPostsForPost\(post/);
  assert.match(blogPage, /excludeCurrentBlogPost\(/);
  assert.doesNotMatch(blogPage, /getLatestBlogPosts/);
  assert.match(blogPage, /resolveBlogArticleAuthor\(post, editorial\)/);
  assert.match(blogPage, /formatDate\(post\.date\)/);
  assert.doesNotMatch(blogPage, /actualizado el \{editorial\.updatedAtLabel\}/);
  assert.match(blogPage, /formatUpdatedByline\(/);
  assert.match(blogPage, /href=\{authorHref\}/);
  assert.match(blogPage, /updatedLabel=\{updatedByline\}/);
  assert.match(blogPage, /updatedDateTime=/);
  assert.doesNotMatch(blogPage, /visibleDateLabel/);
  assert.match(blogPage, /formatBlogHeroExcerpt\(post\.excerpt\?\.rendered/);
  assert.equal((blogPage.match(/<BlogBylineChip/g) || []).length, 1);
  assert.match(blogPage, /avatarSrc=\{articleAuthor\.avatarSrc\}/);
  assert.match(blogPage, /p-5 md:p-\[60px\]/);
  assert.doesNotMatch(blogPage, /detail=/);
  assert.doesNotMatch(blogPage, /Actualizado el \$\{editorial\.updatedAtLabel\}/);
  assert.doesNotMatch(blogPage, /substring\(0, 200\) \+ '\.\.\.'/);
  assert.match(chipSource, /rounded-full bg-\[#440099\]/);
  assert.match(chipSource, /text-xs font-medium sm:text-sm/);
  assert.match(chipSource, /h-6 w-6/);
  assert.match(chipSource, /flex-col/);
  assert.match(chipSource, /sm:flex-row/);
  assert.match(chipSource, /whitespace-nowrap/);
  assert.match(chipSource, /unoptimized/);
  assert.match(chipSource, /href/);
  assert.match(chipSource, /updatedLabel/);
  assert.match(chipSource, /updatedDateTime/);
  assert.doesNotMatch(chipSource, /detail/);
  assert.match(overridesSource, /lib\/blog-editorial-meta\.ts/);
  const titleIdx = blogPage.indexOf('text-4xl md:text-5xl lg:text-6xl');
  const chipIdx = blogPage.indexOf('<BlogBylineChip');
  const excerptIdx = blogPage.indexOf('excerptText ?');
  assert.ok(titleIdx !== -1 && chipIdx !== -1 && excerptIdx !== -1);
  assert.ok(titleIdx < chipIdx && chipIdx < excerptIdx);
});
