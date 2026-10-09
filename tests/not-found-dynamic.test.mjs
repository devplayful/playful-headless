import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const casePage = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

test('dynamic generateMetadata calls notFound() on a miss so the H1 ships in HTML', () => {
  const slugMeta = slugPage.slice(slugPage.indexOf('export async function generateMetadata'));
  const blogMeta = blogPage.slice(blogPage.indexOf('export async function generateMetadata'));
  const caseMeta = casePage.slice(casePage.indexOf('export async function generateMetadata'));

  assert.match(slugPage, /export const dynamicParams = false/);
  assert.match(blogPage, /export const dynamicParams = false/);

  assert.match(slugMeta, /getPageBySlug\(slug\)/);
  assert.match(slugMeta, /if \(!page\) \{\s*notFound\(\);/s);
  assert.doesNotMatch(slugMeta, /Artículo no encontrado/);

  assert.match(blogMeta, /if \(!post \|\| getPrimaryCategorySlug\(post\) !== slug\[0\]\)/);
  assert.match(blogMeta, /notFound\(\);/);
  assert.doesNotMatch(blogMeta, /Artículo no encontrado/);

  assert.match(caseMeta, /getSuccessStoryBySlug\(slug\)/);
  assert.match(caseMeta, /if \(!story\) \{\s*notFound\(\);/s);

  assert.match(middleware, /PUBLIC_CASE_STUDY_SLUGS/);
  assert.match(middleware, /pathname = '\/_not-found'/);
});
