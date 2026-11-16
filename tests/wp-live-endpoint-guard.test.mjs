import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('wordpress.ts usa host snapshot, no endpoint.playfulagency.com en API URL', () => {
  const src = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  assert.match(src, /WORDPRESS_API_URL = 'https:\/\/playful-headless\/wp-json'/);
  assert.doesNotMatch(src, /WORDPRESS_API_URL = 'https:\/\/endpoint\.playfulagency\.com/);
});

test('wordpress-request enruta al snapshot por defecto', () => {
  const src = readFileSync(new URL('../services/wordpress-request.mjs', import.meta.url), 'utf8');
  assert.match(src, /useWordPressLiveFetch/);
  assert.match(src, /wordpressFetchFromSnapshot/);
});

test('build blog redirects y sitemap leen data/wp-snapshot, no fetch a endpoint', () => {
  for (const file of ['../lib/blog-category-redirects.js', '../lib/blog-sitemap-lastmod.js']) {
    const src = readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(src, /wp-snapshot/);
    assert.doesNotMatch(src, /endpoint\.playfulagency\.com\/wp-json/);
  }
});

test('contact no entrega a WordPress', () => {
  const route = readFileSync(new URL('../app/api/contact/route.ts', import.meta.url), 'utf8');
  assert.match(route, /acknowledgeContactSubmission/);
  assert.doesNotMatch(route, /deliverToWordPress/);
});