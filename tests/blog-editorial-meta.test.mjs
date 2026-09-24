import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const {
  BLOG_EDITORIAL_OVERRIDES,
  DEFAULT_EDITORIAL_BYLINE,
  EDITORIAL_AVATAR_SRC,
  buildBlogArticleJsonLd,
  formatEditorialDate,
  isMeaningfullyAfter,
  resolveBlogEditorialUpdate,
  toIsoDateTime,
} = await import('../lib/blog-editorial-meta.ts');
const { ZELLE_VE_BLOG_SLUG } = await import('../lib/blog-body-overrides.ts');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
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

test('WordPress modified on a later UTC day becomes the editorial chip', () => {
  const update = resolveBlogEditorialUpdate('pasarela-de-pago-ecommerce-guia', {
    published: '2021-03-01T10:00:00',
    publishedGmt: '2021-03-01T14:00:00',
    modified: '2023-11-20T08:00:00',
    modifiedGmt: '2023-11-20T12:00:00',
  });
  assert.ok(update);
  assert.equal(update.source, 'wordpress');
  assert.equal(update.updatedBy, DEFAULT_EDITORIAL_BYLINE);
  assert.equal(update.updatedAt, '2023-11-20T12:00:00.000Z');
  assert.equal(update.updatedAtLabel, '20 de noviembre de 2023');
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

test('Article JSON-LD includes dateModified and the original author', () => {
  const jsonLd = buildBlogArticleJsonLd({
    headline: 'Zelle en Venezuela',
    datePublished: ZELLE_PUBLISHED,
    dateModified: '2026-09-24T00:00:00.000Z',
    authorName: 'Stefanni Parabavidez',
    url: 'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  });
  assert.equal(jsonLd['@type'], 'Article');
  assert.equal(jsonLd.datePublished, ZELLE_PUBLISHED);
  assert.equal(jsonLd.dateModified, '2026-09-24T00:00:00.000Z');
  assert.deepEqual(jsonLd.author, { '@type': 'Person', name: 'Stefanni Parabavidez' });
  assert.doesNotMatch(JSON.stringify(jsonLd), /</);
});

test('editorial avatar is the existing Playful mark in public/', () => {
  assert.equal(EDITORIAL_AVATAR_SRC, '/images/avatar-playful.svg');
  assert.ok(existsSync(join(root, 'public', EDITORIAL_AVATAR_SRC.replace(/^\//, ''))));
});

test('blog post page wires chips, modifiedTime and Article JSON-LD', () => {
  assert.match(blogPage, /resolveBlogEditorialUpdate\(postSlug/);
  assert.match(blogPage, /modifiedTime: editorial\.updatedAt/);
  assert.match(blogPage, /buildBlogArticleJsonLd/);
  assert.match(blogPage, /type="application\/ld\+json"/);
  assert.match(blogPage, /BlogBylineChip/);
  assert.match(blogPage, /EDITORIAL_AVATAR_SRC/);
  assert.match(blogPage, /Actualizado el \$\{editorial\.updatedAtLabel\}/);
  assert.match(chipSource, /rounded-full bg-\[#440099\]/);
  assert.match(chipSource, /text-sm font-medium/);
  assert.match(chipSource, /h-6 w-6/);
  assert.match(overridesSource, /lib\/blog-editorial-meta\.ts/);
});
