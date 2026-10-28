import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

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
  LINKS_BIO_UTM_CAMPAIGN,
  LINKS_BIO_UTM_MEDIUM,
  LINKS_BIO_UTM_SOURCE,
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
const propagator = readFileSync(
  new URL('../components/BookingQueryPropagator.tsx', import.meta.url),
  'utf8',
);
const entriesSource = readFileSync(new URL('../lib/links-bio.ts', import.meta.url), 'utf8');
const thumbsSource = readFileSync(new URL('../lib/links-bio-thumbs.ts', import.meta.url), 'utf8');
const CLIENT_NAME = /jumex|odwalla|soytechno|mercantil|venemergencia|aitheras|fundahigado/i;

const EXPECTED_BUTTONS = [
  ['Reserva tu llamada diagnóstica', '/reunion-playful', 'btn-llamada'],
  ['Cuotas con Cashea en WooCommerce', '/blog/tecnologia/cashea-para-comercios', 'btn-cashea'],
  [
    'Cobra con Zelle en tu tienda',
    '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    'btn-zelle',
  ],
  ['Casos', '/casos-de-exito', 'btn-casos'],
  ['Nuestra web', '/', 'btn-web'],
];

function entryByPath(path) {
  return LINKS_BIO_ENTRIES.find((entry) => entry.path === path);
}

test('bio buttons stay in the brief order with exact labels and paths', () => {
  assert.deepEqual(
    LINKS_BIO_ENTRIES.map((entry) => [entry.label, entry.path, entry.utmContent]),
    EXPECTED_BUTTONS,
  );
  assert.equal(LINKS_BIO_ENTRIES.length, 5);
  assert.doesNotMatch(page, /wa\.me|whatsapp|Escríbenos por WhatsApp/i);
  assert.doesNotMatch(entriesSource, /wa\.me|584121234567/i);
  assert.match(entriesSource, /WhatsApp fuera hasta que haya número oficial en la web/);
});

test('Nuestra web goes to home with the same UTM; Cashea is untouched', () => {
  const web = entryByPath('/');
  const cashea = entryByPath('/blog/tecnologia/cashea-para-comercios');
  assert.equal(web.label, 'Nuestra web');
  assert.equal(web.utmContent, 'btn-web');
  assert.equal(
    buildLinksBioHref(web),
    '/?utm_source=ig&utm_medium=social&utm_campaign=links&utm_content=btn-web',
  );
  assert.equal(cashea.label, 'Cuotas con Cashea en WooCommerce');
  assert.equal(cashea.path, '/blog/tecnologia/cashea-para-comercios');
  assert.equal(cashea.utmContent, 'btn-cashea');
  assert.equal(
    buildLinksBioHref(cashea),
    '/blog/tecnologia/cashea-para-comercios?utm_source=ig&utm_medium=social&utm_campaign=links&utm_content=btn-cashea',
  );
});

test('each bio href carries the fixed ig/links campaign and its own utm_content', () => {
  assert.equal(LINKS_BIO_UTM_SOURCE, 'ig');
  assert.equal(LINKS_BIO_UTM_MEDIUM, 'social');
  assert.equal(LINKS_BIO_UTM_CAMPAIGN, 'links');
  assert.equal(LINKS_BIO_UTM, '?utm_source=ig&utm_medium=social&utm_campaign=links');
  assert.doesNotMatch(LINKS_BIO_UTM, /utm_source=instagram|utm_campaign=bio/);
  for (const [label, path, utmContent] of EXPECTED_BUTTONS) {
    const href = buildLinksBioHref({ path, utmContent });
    assert.equal(
      href,
      `${path}?utm_source=ig&utm_medium=social&utm_campaign=links&utm_content=${utmContent}`,
      label,
    );
    assert.doesNotMatch(href, /utm_source=instagram|utm_campaign=bio/);
  }
  assert.match(page, /buildLinksBioHref\(featured\)/);
  assert.match(page, /buildLinksBioHref\(entry\)/);
  assert.match(page, /data-links-fixed-href/);
});

test('/links is noindex and stays out of the sitemap', () => {
  assert.match(layout, /index:\s*false/);
  assert.match(layout, /follow:\s*false/);
  assert.match(layout, /Enlaces \| Playful Agency/);
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

test('BookingQueryPropagator does not rewrite /links hrefs', () => {
  const skipAt = propagator.indexOf("pathname === '/links'");
  const applyAt = propagator.indexOf('anchor.setAttribute');
  assert(skipAt > 0 && applyAt > skipAt);
  assert.match(propagator, /data-links-fixed-href/);
});

test('blog article slugs come from /blog/{category}/{slug}', () => {
  assert.equal(
    linksBioArticleSlug('/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  );
  assert.equal(
    linksBioArticleSlug('/blog/tecnologia/cashea-para-comercios'),
    'cashea-para-comercios',
  );
  assert.equal(linksBioArticleSlug('/casos-de-exito'), null);
  assert.equal(linksBioArticleSlug('/agencia-e-commerce'), null);
  assert.equal(linksBioArticleSlug('/'), null);
  assert.equal(linksBioArticleSlug('/reunion-playful'), null);
  assert.equal(linksBioArticleSlug('/blog/tecnologia'), null);
  assert.equal(linksBioArticleSlug('/contactar-agencia-de-marketing-digital'), null);
});

test('article thumbs use the same blog cover; other links use destination covers', () => {
  const zelle = entryByPath(
    '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  );
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

  const cashea = resolveLocalLinksBioThumbnail(
    entryByPath('/blog/tecnologia/cashea-para-comercios'),
  );
  assert.equal(cashea, null);

  const casos = resolveLocalLinksBioThumbnail(entryByPath('/casos-de-exito'));
  assert.ok(casos);
  assert.equal(casos.isFallback, false);
  assert.notEqual(casos.src, LINKS_BIO_FALLBACK_THUMB);
  assert.deepEqual(casos.collage, Object.values(CASOS_DE_EXITO_FEATURED_TAPAS));
  assert.equal(casos.collage?.length, 3);

  for (const path of ['/reunion-playful', '/']) {
    const thumb = resolveLocalLinksBioThumbnail(entryByPath(path));
    assert.ok(thumb);
    assert.equal(thumb.isFallback, false);
    assert.notEqual(thumb.src, LINKS_BIO_FALLBACK_THUMB);
    assert.equal(thumb.src, LINKS_BIO_DESTINATION_COVERS[path].src);
  }
  assert.equal(LINKS_BIO_FALLBACK_THUMB, '/images/logos/playful-logov.svg');
  assert.match(thumbsSource, /\/images\/og\/home\.jpg/);
  assert.equal(
    resolveLocalLinksBioThumbnail({
      label: 'Sin portada local',
      path: '/blog/tecnologia/slug-sin-override-de-portada',
      utmContent: 'btn-test',
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
