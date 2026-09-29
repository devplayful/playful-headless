import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  CASHEA_COMERCIOS_BLOG_SLUG,
  blogBodyForSlug,
} = await import('../lib/blog-body-overrides.ts');
const {
  CASHEA_COMERCIOS_BLOG_PATH,
  CASHEA_COMERCIOS_LOCAL_POST,
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

test('Cashea is a Next-owned local post on the signed tecnologia path', () => {
  assert.equal(CASHEA_COMERCIOS_BLOG_SLUG, 'cashea-para-comercios');
  assert.equal(CASHEA_COMERCIOS_BLOG_PATH, '/blog/tecnologia/cashea-para-comercios');
  assert.equal(CASHEA_COMERCIOS_LOCAL_POST.slug, CASHEA_COMERCIOS_BLOG_SLUG);
  assert.equal(CASHEA_COMERCIOS_LOCAL_POST.categories?.[0]?.slug, 'tecnologia');
  assert.deepEqual(localBlogStaticParams(), [
    { slug: ['tecnologia', 'cashea-para-comercios'] },
    { slug: ['seo', 'migracion-seo-cambiar-de-plataforma-alternativa'] },
  ]);
  assert.equal(localBlogPostBySlug('cashea-para-comercios')?.id, 900001);
  assert.equal(localBlogPostBySlug('zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'), null);
});

test('blog route resolves Cashea from the local post list before WordPress', () => {
  assert.equal(
    CASHEA_COMERCIOS_LOCAL_POST.title.rendered,
    'Cashea para comercios: cómo ofrecer cuotas en tu tienda online',
  );
  assert.match(wordpress, /const local = localBlogPostBySlug\(slug\);/);
  assert.match(wordpress, /if \(local\) return local;/);
  assert.match(blogPage, /localBlogStaticParams\(\)/);
});

test('Cashea body override is what the post page will render', () => {
  const html = blogBodyForSlug('cashea-para-comercios');
  assert.match(html, /Playful es una agencia de integración de ecommerce/);
  assert.match(html, /No\. La afiliación es un trámite entre tu empresa y Cashea/);
});

test('sitemap and expected-routes include Cashea and omit the blocked migración blog', () => {
  const sitemap = buildSitemapXml();
  assert.match(
    sitemap,
    /https:\/\/playfulagency\.com\/blog\/tecnologia\/cashea-para-comercios</,
  );
  assert.doesNotMatch(sitemap, /migracion-seo-cambiar-de-plataforma/);
  const blogRoutes = expectedRoutes.governedConcreteRoutes['/blog/[...slug]'];
  assert.ok(blogRoutes.includes('/blog/tecnologia/cashea-para-comercios'));
  assert.ok(!blogRoutes.includes('/blog/seo/migracion-seo-cambiar-de-plataforma'));
});
