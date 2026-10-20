import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  SITEMAP_PODCAST_PATHS,
  SITEMAP_STATIC_PATHS,
  getSitemapLocs,
  getSitemapPaths,
  buildSitemapXml,
} = await import('../utils/apex-sitemap.ts');

const APEX = 'https://playfulagency.com';
const TARGET = '/podcast/lo-que-hacemos-impacta-diseno-ux-en-el-seo';

const episodeLayout = readFileSync(
  new URL('../app/podcast/[slug]/layout.tsx', import.meta.url),
  'utf8',
);
const hubLayout = readFileSync(
  new URL('../app/podcast/layout.tsx', import.meta.url),
  'utf8',
);

test('published podcast episodes are in the sitemap without trailing slashes', () => {
  assert.equal(SITEMAP_PODCAST_PATHS.includes(TARGET), true);
  assert.equal(SITEMAP_STATIC_PATHS.includes('/podcast'), false);

  const paths = getSitemapPaths();
  const locs = getSitemapLocs();
  const xml = buildSitemapXml();

  assert.equal(paths.includes('/podcast'), false);
  assert.equal(locs.includes(`${APEX}/podcast`), false);
  assert.doesNotMatch(xml, /playfulagency\.com\/podcast</);

  for (const path of SITEMAP_PODCAST_PATHS) {
    const loc = `${APEX}${path}`;
    assert.equal(paths.includes(path), true, path);
    assert.equal(locs.includes(loc), true, loc);
    assert.match(xml, new RegExp(`${loc.replaceAll('/', '\\/')}<`));
    assert.doesNotMatch(xml, new RegExp(`${loc.replaceAll('/', '\\/')}\\/`));
  }

  assert.equal(SITEMAP_PODCAST_PATHS.length, 18);
});

test('episode metadata overrides hub noindex so sitemap URLs stay indexable', () => {
  assert.match(hubLayout, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.match(episodeLayout, /robots:\s*\{\s*index:\s*true,\s*follow:\s*true\s*\}/);
});
