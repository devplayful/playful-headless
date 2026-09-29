import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  RELATED_BLOG_CARD_COUNT,
  RELATED_BLOG_FETCH_COUNT,
  excludeCurrentBlogPost,
} = await import('../lib/blog-related-posts.ts');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const apiRoute = readFileSync(
  new URL('../app/api/blog-posts/route.ts', import.meta.url),
  'utf8',
);
const relatedSection = readFileSync(
  new URL('../components/sections/BlogRelatedPostsSection.tsx', import.meta.url),
  'utf8',
);

const latest = [
  { id: 1, slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', href: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce' },
  { id: 2, slug: 'agencia-seo-internacional-en-el-2025-es-una-necesidad', href: '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad' },
  { id: 3, slug: 'cintillos-de-promocion', href: '/blog/tecnologia/cintillos-de-promocion' },
  { id: 4, slug: 'los-5-problemas-de-e-commerce', href: '/blog/mas-vistos/los-5-problemas-de-e-commerce' },
  { id: 5, slug: 'actualizar-tu-e-commerce', href: '/blog/tecnologia/actualizar-tu-e-commerce' },
  { id: 6, slug: 'crear-un-e-commerce', href: '/blog/tecnologia/crear-un-e-commerce' },
  { id: 7, slug: 'septimo-mas-reciente', href: '/blog/tecnologia/septimo-mas-reciente' },
];

test('related carousel keeps 6 cards after dropping the current post', () => {
  assert.equal(RELATED_BLOG_CARD_COUNT, 6);
  assert.equal(RELATED_BLOG_FETCH_COUNT, 7);

  const withoutZelle = excludeCurrentBlogPost(latest, {
    slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  });
  assert.deepEqual(
    withoutZelle.map((post) => post.slug),
    latest.slice(1).map((post) => post.slug),
  );
  assert.equal(withoutZelle.length, 6);
  assert.equal(
    withoutZelle.some((post) => post.slug === 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'),
    false,
  );

  const withoutId = excludeCurrentBlogPost(latest, { id: 3 });
  assert.equal(withoutId.some((post) => post.slug === 'cintillos-de-promocion'), false);
  assert.equal(withoutId.length, 6);
  assert.equal(withoutId[0].slug, 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce');
});

test('an older post that is not in the latest 7 keeps the same first 6 cards', () => {
  const related = excludeCurrentBlogPost(latest, { slug: 'ecommerce-mi-negocio-online', id: 99 });
  assert.deepEqual(
    related.map((post) => post.slug),
    latest.slice(0, 6).map((post) => post.slug),
  );
});

test('blog post page fetches one extra and filters the current slug/id', () => {
  assert.match(blogPage, /getLatestBlogPosts\(RELATED_BLOG_FETCH_COUNT\)/);
  assert.match(blogPage, /fetchLatestRelatedBlogPosts\(\)/);
  assert.match(blogPage, /excludeCurrentBlogPost\(latestRelated/);
  assert.match(blogPage, /excludeSlug=\{post\.slug\}/);
  assert.match(blogPage, /excludeId=\{post\.id\}/);
  assert.doesNotMatch(blogPage, /getLatestBlogPosts\(6\)/);
  assert.doesNotMatch(blogPage, /Cargando artículos/);
});

test('blog-posts API excludes via query and keeps six cards', () => {
  assert.match(apiRoute, /searchParams\.get\('exclude'\)/);
  assert.match(apiRoute, /RELATED_BLOG_FETCH_COUNT/);
  assert.match(apiRoute, /excludeCurrentBlogPost\(posts/);
  assert.match(relatedSection, /params\.set\('exclude'/);
  assert.match(relatedSection, /excludeCurrentBlogPost\(arr/);
  assert.match(relatedSection, /Cargando artículos…/);
});
