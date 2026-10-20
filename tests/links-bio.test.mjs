import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

import { CONTACT_HREF } from '../utils/booking.ts';
import {
  SITEMAP_STATIC_PATHS,
  getSitemapLocs,
  getSitemapPaths,
  buildSitemapXml,
} from '../utils/apex-sitemap.ts';
import {
  LINKS_BIO_ENTRIES,
  LINKS_BIO_FALLBACK_THUMB,
  LINKS_BIO_UTM,
  buildLinksBioHref,
  linksBioArticleSlug,
} from '../lib/links-bio.ts';
import {
  LINKS_BIO_DESTINATION_COVERS,
  resolveLocalLinksBioThumbnail,
} from '../lib/links-bio-thumbs.ts';
import { CASOS_DE_EXITO_FEATURED_TAPAS } from '../lib/case-study-listing-image.ts';
import {
  BLOG_COVER_OVERRIDES,
  resolveBlogCoverAlt,
} from '../lib/blog-cover-image.ts';
import { publicWebpIfPresent } from '../lib/public-webp-src.ts';
import {
  LINKS_BIO_FEATURED_SIZES,
  LINKS_BIO_THUMB_SIZES,
} from '../lib/blog-image-sizes.ts';

const APEX = 'https://playfulagency.com';
const page = readFileSync(new URL('../app/links/page.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/links/layout.tsx', import.meta.url), 'utf8');
const chat = readFileSync(new URL('../components/ChatWidget.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const entriesSource = readFileSync(new URL('../lib/links-bio.ts', import.meta.url), 'utf8');
const thumbsSource = readFileSync(new URL('../lib/links-bio-thumbs.ts', import.meta.url), 'utf8');
const CLIENT_NAME = /jumex|odwalla|soytechno|mercantil|venemergencia|aitheras|fundahigado/i;

test('bio buttons stay in one array, Cashea can be prepended later', () => {
  assert.deepEqual(
    LINKS_BIO_ENTRIES.map((entry) => [entry.label, entry.path]),
    [
      ['Cómo integrar Zelle en tu tienda', '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'],
      ['Casos de éxito', '/casos-de-exito'],
      ['Agencia e-commerce', '/agencia-e-commerce'],
      ['Agencia Shopify', '/agencia-shopify'],
      ['Contacto', CONTACT_HREF],
    ],
  );
  assert.equal(CONTACT_HREF, '/contactar-agencia-de-marketing-digital');
  assert.match(entriesSource, /Cashea: add first/);
  assert.doesNotMatch(page, /reunion-playful/);
  assert.doesNotMatch(entriesSource, /reunion-playful/);
});

test('each bio href carries the Instagram campaign query', () => {
  assert.equal(LINKS_BIO_UTM, '?utm_source=instagram&utm_medium=social&utm_campaign=bio');
  for (const entry of LINKS_BIO_ENTRIES) {
    assert.equal(buildLinksBioHref(entry.path), `${entry.path}${LINKS_BIO_UTM}`);
  }
});

test('/links is noindex and stays out of the sitemap', () => {
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/links'), false);
  assert.equal(getSitemapPaths().includes('/links'), false);
  assert.equal(getSitemapLocs().includes(`${APEX}/links`), false);
  assert.doesNotMatch(buildSitemapXml(), /playfulagency\.com\/links</);
});

test('/links copy and chrome have no client names', () => {
  assert.doesNotMatch(page, CLIENT_NAME);
  assert.doesNotMatch(layout, CLIENT_NAME);
  assert.doesNotMatch(entriesSource, CLIENT_NAME);
  for (const entry of LINKS_BIO_ENTRIES) {
    assert.doesNotMatch(entry.label, CLIENT_NAME);
    assert.doesNotMatch(entry.path, CLIENT_NAME);
  }
});

test('header, footer and chat stay off /links after hooks', () => {
  for (const [name, source] of [['header', header], ['footer', footer]]) {
    const themeAt = source.lastIndexOf('useTheme()');
    const skipAt = source.indexOf("pathname === '/links'");
    assert(themeAt > 0 && skipAt > themeAt, `${name} must skip /links after hooks`);
  }
  const skipAt = chat.indexOf("pathname === '/links'");
  const loadAt = chat.indexOf('attachChatWidgetDeferredLoad(load)');
  assert.match(chat, /window\.location\.pathname\.replace/);
  assert(skipAt > 0 && loadAt > skipAt);
});

test('blog article slugs come from /blog/{category}/{slug}', () => {
  assert.equal(
    linksBioArticleSlug('/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  );
  assert.equal(linksBioArticleSlug('/casos-de-exito'), null);
  assert.equal(linksBioArticleSlug('/agencia-e-commerce'), null);
  assert.equal(linksBioArticleSlug('/blog/tecnologia'), null);
  assert.equal(linksBioArticleSlug('/contactar-agencia-de-marketing-digital'), null);
});

test('article thumbs use the same blog cover; other links use destination covers', () => {
  const zelle = LINKS_BIO_ENTRIES[0];
  const zelleSlug = 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';
  const zelleThumb = resolveLocalLinksBioThumbnail(zelle);
  assert.ok(zelleThumb);
  assert.equal(zelleThumb.isFallback, false);
  assert.equal(zelleThumb.objectFit, 'cover');
  assert.equal(
    zelleThumb.src,
    publicWebpIfPresent(BLOG_COVER_OVERRIDES[zelleSlug]),
  );
  assert.equal(zelleThumb.alt, resolveBlogCoverAlt(zelleSlug, ''));

  const casos = resolveLocalLinksBioThumbnail(LINKS_BIO_ENTRIES[1]);
  assert.ok(casos);
  assert.equal(casos.isFallback, false);
  assert.notEqual(casos.src, LINKS_BIO_FALLBACK_THUMB);
  assert.deepEqual(casos.collage, Object.values(CASOS_DE_EXITO_FEATURED_TAPAS));
  assert.equal(casos.collage?.length, 3);

  for (const entry of LINKS_BIO_ENTRIES.slice(2)) {
    const thumb = resolveLocalLinksBioThumbnail(entry);
    assert.ok(thumb);
    assert.equal(thumb.isFallback, false);
    assert.notEqual(thumb.src, LINKS_BIO_FALLBACK_THUMB);
    assert.equal(thumb.src, LINKS_BIO_DESTINATION_COVERS[entry.path].src);
  }
  assert.equal(LINKS_BIO_FALLBACK_THUMB, '/images/logos/playful-logov.svg');
  assert.match(thumbsSource, /contacto-imagen\.png/);
  assert.match(thumbsSource, /agencia-shopify\/hero-/);
  assert.match(thumbsSource, /agencia-e-commerce\.jpg/);
  assert.equal(
    resolveLocalLinksBioThumbnail({
      label: 'Sin portada local',
      path: '/blog/tecnologia/slug-sin-override-de-portada',
    }),
    null,
  );
});

test('/links renders a featured cover card plus destination thumbs with real sizes', () => {
  assert.match(page, /from ['"]next\/image['"]/);
  assert.match(page, /sizes=\{LINKS_BIO_FEATURED_SIZES\}/);
  assert.match(page, /sizes=\{LINKS_BIO_THUMB_SIZES\}/);
  assert.match(page, /aspect-\[16\/10\]/);
  assert.match(page, /h-20 w-20 shrink-0/);
  assert.match(page, /rounded-2xl/);
  assert.match(page, /object-cover object-center/);
  assert.match(page, /resolveLinksBioThumbnails/);
  assert.match(page, /bg-\[#E9D7FF\]/);
  assert.match(page, /background\.webp/);
  assert.doesNotMatch(page, /<header/);
  assert.doesNotMatch(page, /playful-boton w-full/);
  assert.equal(
    LINKS_BIO_FEATURED_SIZES,
    '(max-width: 639px) calc(100vw - 2.5rem), 448px',
  );
  assert.equal(LINKS_BIO_THUMB_SIZES, '(max-width: 639px) 80px, 96px');
  assert.match(thumbsSource, /getBlogPostBySlug/);
  assert.match(thumbsSource, /featured_media_url/);
  assert.match(thumbsSource, /BLOG_COVER_FALLBACK/);
});
