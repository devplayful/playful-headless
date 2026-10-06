import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { twitterFromOpenGraph } from '../utils/page-seo-overrides.mjs';

const files = {
  blogPost: new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  blogListing: new URL('../utils/blog-listing-query.ts', import.meta.url),
  contact: new URL('../app/contactar-agencia-de-marketing-digital/page.tsx', import.meta.url),
  privacy: new URL('../app/politica-de-privacidad/page.tsx', import.meta.url),
  caseStudy: new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
};

async function readAll() {
  const entries = await Promise.all(
    Object.entries(files).map(async ([key, url]) => [key, await readFile(url, 'utf8')]),
  );
  return Object.fromEntries(entries);
}

test('twitterFromOpenGraph copies og title, description and optional image', () => {
  assert.deepEqual(twitterFromOpenGraph('Título OG', 'Descripción OG'), {
    title: 'Título OG',
    description: 'Descripción OG',
  });
  assert.deepEqual(
    twitterFromOpenGraph('Título OG', 'Descripción OG', '/images/og-blog.jpg'),
    {
      title: 'Título OG',
      description: 'Descripción OG',
      images: ['/images/og-blog.jpg'],
    },
  );
});

test('post, caso, /blog, contactar y privacidad wire twitter from the same og values', async () => {
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
  assert.match(src.privacy, /twitterFromOpenGraph\(PRIVACY_TITLE, PRIVACY_DESCRIPTION\)/);
  assert.match(caseMeta, /twitterFromOpenGraph\(override\.title, override\.description\)/);
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
  assert.match(blogPost, /Zelle en Venezuela: cobra en tu tienda online \| Playful/);
  assert.doesNotMatch(blogPost, /\| Playful \| Playful/);
  assert.doesNotMatch(
    seoCopy,
    /override\?\.title \?\?[\s\S]*decodeHtmlEntities\(post\.title\.rendered\)\} \| Playful/,
  );
});
