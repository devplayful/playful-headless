import test from 'node:test';
import assert from 'node:assert/strict';

const { buildSitemapXml, getSitemapLocs, SITEMAP_STATIC_PATHS } = await import(
  '../utils/apex-sitemap.ts'
);

test('sitemap lists /agencia-ux-ui without a trailing slash', () => {
  const loc = 'https://playfulagency.com/agencia-ux-ui';
  assert.equal(SITEMAP_STATIC_PATHS.includes('/agencia-ux-ui'), true);
  assert.equal(getSitemapLocs().includes(loc), true);
  assert.match(buildSitemapXml(), /https:\/\/playfulagency\.com\/agencia-ux-ui</);
  assert.doesNotMatch(buildSitemapXml(), /https:\/\/playfulagency\.com\/agencia-ux-ui\//);
});
