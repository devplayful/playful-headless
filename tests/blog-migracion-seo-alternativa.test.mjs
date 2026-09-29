import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  MIGRACION_SEO_ALT_BLOG_SLUG,
  MIGRACION_SEO_ALT_BLOG_PATH,
  MIGRACION_SEO_PLAN_PATH,
  MIGRACION_SEO_ALT_BLOG_BODY_HTML,
  blogBodyForSlug,
} = await import('../lib/blog-body-overrides.ts');
const {
  MIGRACION_SEO_ALT_LOCAL_POST,
  localBlogPostBySlug,
  localBlogStaticParams,
} = await import('../lib/blog-local-posts.ts');
const { buildSitemapXml } = await import('../utils/apex-sitemap.ts');

const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);
const wordpress = readFileSync(
  new URL('../services/wordpress.ts', import.meta.url),
  'utf8',
);
const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

test('migración alternativa is a Next-owned local post on a distinct seo path', () => {
  assert.equal(MIGRACION_SEO_ALT_BLOG_SLUG, 'migracion-seo-cambiar-de-plataforma-alternativa');
  assert.equal(MIGRACION_SEO_ALT_BLOG_PATH, '/blog/seo/migracion-seo-cambiar-de-plataforma-alternativa');
  assert.equal(MIGRACION_SEO_PLAN_PATH, '/blog/seo/migracion-seo-cambiar-de-plataforma');
  assert.equal(MIGRACION_SEO_ALT_LOCAL_POST.slug, MIGRACION_SEO_ALT_BLOG_SLUG);
  assert.equal(MIGRACION_SEO_ALT_LOCAL_POST.categories?.[0]?.slug, 'seo');
  assert.deepEqual(localBlogStaticParams(), [
    { slug: ['tecnologia', 'cashea-para-comercios'] },
    { slug: ['seo', 'migracion-seo-cambiar-de-plataforma-alternativa'] },
  ]);
  assert.equal(localBlogPostBySlug('migracion-seo-cambiar-de-plataforma-alternativa')?.id, 900002);
  assert.equal(localBlogPostBySlug('migracion-seo-cambiar-de-plataforma'), null);
});

test('blog route resolves the alternativa from the local post list before WordPress', () => {
  assert.equal(
    MIGRACION_SEO_ALT_LOCAL_POST.title.rendered,
    'Cómo hacer una migración SEO al cambiar de plataforma de tienda online',
  );
  assert.match(wordpress, /const local = localBlogPostBySlug\(slug\);/);
  assert.match(wordpress, /if \(local\) return local;/);
  assert.match(blogPage, /localBlogStaticParams\(\)/);
  assert.match(blogPage, /MIGRACION_SEO_PLAN_PATH/);
  assert.match(blogPage, /robots: \{ index: false, follow: true \}/);
});

test('alternativa body is the signed copy, with widget CTA and no prospect names', () => {
  const html = blogBodyForSlug(MIGRACION_SEO_ALT_BLOG_SLUG);
  assert.match(html, /Si tu tienda online ya aparece en Google/);
  assert.match(html, /ejemplo ilustrativo, con una tienda inventada que deja Shopify/);
  assert.match(
    html,
    /<h2 id="ejemplo-ilustrativo-una-tienda-online-venezolana-que-deja-shopify">Ejemplo ilustrativo: una tienda online venezolana que deja Shopify<\/h2>/,
  );
  assert.match(html, /https:\/\/api\.playfulagency\.com\/widget\/bookings\/reunion-playful/);
  assert.doesNotMatch(html, /PrimeShoes/i);
  assert.doesNotMatch(html, /calzado/i);
  assert.doesNotMatch(html, /Elizana/i);
  assert.doesNotMatch(html, /Erika/i);
  assert.doesNotMatch(html, /\bAldo\b/);
  assert.doesNotMatch(html, /Samsung/i);
  assert.doesNotMatch(html, /Dragontec/i);
  assert.doesNotMatch(html, /\[MAYÚSCULAS\]/);
  assert.doesNotMatch(html, /PENDIENTE/);
  assert.doesNotMatch(html, /TODO/);
  const h2s = [...MIGRACION_SEO_ALT_BLOG_BODY_HTML.matchAll(/<h2 id="([^"]+)">/g)];
  assert.equal(h2s.length, 8);
});

test('sitemap omits both the plan slug and the alternativa; expected-routes only lists the alternativa', () => {
  const sitemap = buildSitemapXml();
  assert.doesNotMatch(sitemap, /migracion-seo-cambiar-de-plataforma/);
  const blogRoutes = expectedRoutes.governedConcreteRoutes['/blog/[...slug]'];
  assert.ok(blogRoutes.includes('/blog/seo/migracion-seo-cambiar-de-plataforma-alternativa'));
  assert.ok(!blogRoutes.includes('/blog/seo/migracion-seo-cambiar-de-plataforma'));
});
