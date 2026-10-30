import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { twitterFromOpenGraph } from '../utils/page-seo-overrides.mjs';

const files = {
  blogPost: new URL('../app/(frontend)/blog/[...slug]/page.tsx', import.meta.url),
  blogListing: new URL('../utils/blog-listing-query.ts', import.meta.url),
  contact: new URL('../app/(frontend)/contactar-agencia-de-marketing-digital/page.tsx', import.meta.url),
  privacy: new URL('../app/(frontend)/politica-de-privacidad/page.tsx', import.meta.url),
  privacyMeta: new URL('../lib/paginas-codigo/politica-privacidad-metadata.ts', import.meta.url),
  caseStudy: new URL('../app/(frontend)/casos-de-exito/[slug]/page.tsx', import.meta.url),
  links: new URL('../app/(frontend)/links/layout.tsx', import.meta.url),
};

async function readAll() {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, url]) => [key, await readFile(url, 'utf8')]),
  );
  return Object.fromEntries(entries);
}

test('twitterFromOpenGraph copies og title, description and optional image', () => {
  assert.deepEqual(twitterFromOpenGraph('Título OG', 'Descripción OG'), {
    card: 'summary_large_image',
    title: 'Título OG',
    description: 'Descripción OG',
  });
  assert.deepEqual(
    twitterFromOpenGraph('Título OG', 'Descripción OG', '/images/og-blog.jpg'),
    {
      card: 'summary_large_image',
      title: 'Título OG',
      description: 'Descripción OG',
      images: ['/images/og-blog.jpg'],
    },
  );
});

test('post, caso, /blog, contactar, privacidad y /links wire twitter from the same og values', async () => {
  const src = await readAll();
  const blogMeta = src.blogPost.slice(src.blogPost.indexOf('export async function generateMetadata'));
  const listingMeta = src.blogListing.slice(
    src.blogListing.indexOf('export function buildBlogListingMetadata'),
  );
  const caseMeta = src.caseStudy.slice(src.caseStudy.indexOf('export async function generateMetadata'));

  assert.match(blogMeta, /twitterFromOpenGraph\(title, description\)/);
  assert.match(blogMeta, /images:\s*\[imageUrl\]/);
  assert.match(listingMeta, /twitterFromOpenGraph\(\s*'Blog - Playful Agency'/);
  assert.match(src.contact, /twitterFromOpenGraph\(CONTACT_TITLE, CONTACT_DESCRIPTION\)/);
  assert.match(src.privacy, /generatePoliticaPrivacidadMetadata/);
  assert.match(
    await readFile(files.privacyMeta, 'utf8'),
    /twitterFromOpenGraph\(ogTitle, ogDescription\)/,
  );
  assert.match(src.links, /pageSocialMetadata\(/);
  assert.match(src.links, /index:\s*false/);
  assert.match(caseMeta, /pageSocialMetadata\(/);
  assert.match(caseMeta, /title: override\.title/);
  assert.match(caseMeta, /description: override\.description/);
});

test('blog post title suffix is | Playful and never doubles or keeps the old suffix', async () => {
  const { blogPost } = await readAll();
  const seoCopy = blogPost.slice(
    blogPost.indexOf('function blogPostSeoCopy'),
    blogPost.indexOf('const BLOG_SEO_OVERRIDES'),
  );

  assert.match(seoCopy, /withPlayfulTitleSuffix\(/);
  assert.match(blogPost, /from '@\/lib\/blog-title-suffix'/);
  assert.doesNotMatch(blogPost, /\| Blog - Playful Agency/);
  assert.match(blogPost, /Cintillos de promoción en ecommerce \| Playful/);
  assert.match(blogPost, /Zelle en Venezuela: cómo cobrar en tu tienda \| Playful/);
  assert.doesNotMatch(blogPost, /\| Playful \| Playful/);
  assert.doesNotMatch(
    seoCopy,
    /override\?\.title \?\?[\s\S]*decodeHtmlEntities\(post\.title\.rendered\)\} \| Playful/,
  );
});
