import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildBlogSitemapLastmodMap } = require('../lib/blog-sitemap-lastmod.js');

const {
  SITEMAP_BLOG_PATHS,
  buildSitemapXml,
} = await import('../utils/apex-sitemap.ts');
const { isHiddenFromBlogListings } = await import('../utils/blog-closed-paths.ts');
const { isCanibalizacionOriginPath } = await import('../utils/blog-canibalizacion-redirects.ts');
const blogSitemapLastmodMap = await import('../config/blog-sitemap-lastmod.json', {
  with: { type: 'json' },
}).then((module) => module.default);

const GSC_CATEGORY_LISTING_POSTS = [
  {
    path: '/blog/email-marketing/como-promocionar-en-black-friday-implementa-estas-estrategias',
    category: 'email-marketing',
  },
  {
    path: '/blog/pautas-digitales/conoce-como-impulsar-tu-marca-online',
    category: 'pautas-digitales',
  },
  {
    path: '/blog/pautas-digitales/el-sms-marketing',
    category: 'pautas-digitales',
  },
  {
    path: '/blog/pautas-digitales/necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti',
    category: 'pautas-digitales',
  },
  {
    path: '/blog/seo/aprende-todo-sobre-el-seo',
    category: 'seo',
  },
];

const listingView = readFileSync(
  new URL('../app/(frontend)/blog/blog-listing-view.tsx', import.meta.url),
  'utf8',
);
const crawlNav = readFileSync(
  new URL('../app/(frontend)/blog/BlogListingCrawlNav.tsx', import.meta.url),
  'utf8',
);

test('1) sitemap blog posts use WordPress modified_gmt (else date_gmt) lastmod', () => {
  const openBlogPaths = SITEMAP_BLOG_PATHS.filter(
    (path) => !isHiddenFromBlogListings(path) && !isCanibalizacionOriginPath(path),
  );
  for (const path of openBlogPaths) {
    assert.equal(typeof blogSitemapLastmodMap[path], 'string', path);
    assert.doesNotMatch(blogSitemapLastmodMap[path], /^\d{4}-\d{2}-\d{2}$/, path);
  }

  const xml = buildSitemapXml();
  const aprende = GSC_CATEGORY_LISTING_POSTS.find((item) => item.path.endsWith('aprende-todo-sobre-el-seo'));
  const expected = blogSitemapLastmodMap[aprende.path];
  assert.match(
    xml,
    new RegExp(
      `<loc>https://playfulagency\\.com${aprende.path.replaceAll('/', '\\/')}<\\/loc><lastmod>${expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}<\\/lastmod>`,
    ),
  );
});

test('2) category listings expose server-rendered crawl pagination for GSC posts', () => {
  assert.match(listingView, /<BlogListingCrawlNav/);
  assert.match(crawlNav, /className="sr-only"/);
  assert.match(crawlNav, /href=\{blogListingPath/);
  for (const item of GSC_CATEGORY_LISTING_POSTS) {
    assert.match(listingView, new RegExp(`href=\\{blogPostPath\\(post\\)\\}`));
    assert.equal(SITEMAP_BLOG_PATHS.includes(item.path), true, item.path);
  }
});
