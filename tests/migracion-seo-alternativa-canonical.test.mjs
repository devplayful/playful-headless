import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { canonicalForPath } = await import('../utils/canonical.ts');
const { buildSitemapXml, getSitemapLocs } = await import('../utils/apex-sitemap.ts');

const blogPage = readFileSync(
  new URL('../app/(frontend)/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

const APEX = 'https://playfulagency.com';
const path = '/blog/seo/migracion-seo-cambiar-de-plataforma-alternativa';
const loc = `${APEX}${path}`;

test('migración-seo-alternativa has own canonical, no noindex, one sitemap loc', () => {
  assert.equal(canonicalForPath(path), loc);
  assert.match(blogPage, /canonicalForPath\(\s*blogPostPath\(post\),?\s*\)/);
  assert.match(blogPage, /canonicalForPath\(MIGRACION_SEO_ALT_BLOG_PATH\)/);
  assert.match(blogPage, /postSlug === MIGRACION_SEO_ALT_BLOG_SLUG/);
  assert.doesNotMatch(blogPage, /MIGRACION_SEO_PLAN_PATH/);
  assert.doesNotMatch(blogPage, /MIGRACION_SEO_ALT_BLOG_SLUG[\s\S]{0,80}robots/);
  assert.doesNotMatch(blogPage, /index:\s*false/);
  assert.equal(getSitemapLocs().filter((item) => item === loc).length, 1);
  assert.equal(
    (
      buildSitemapXml().match(
        /<loc>https:\/\/playfulagency\.com\/blog\/seo\/migracion-seo-cambiar-de-plataforma-alternativa<\/loc>/g,
      ) || []
    ).length,
    1,
  );
});
