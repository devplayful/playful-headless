import test from 'node:test';
import assert from 'node:assert/strict';
import { rewriteStringUrls } from '../lib/wp-snapshot/rewrite-media-urls.mjs';

test('rewriteStringUrls maps apex /wp-content/uploads to /wp-media', () => {
  const inHtml =
    '<img src="https://playfulagency.com/wp-content/uploads/2022/03/undraw_search_re_x5gq.svg">';
  const out = rewriteStringUrls(inHtml);
  assert.match(out, /\/wp-media\/wp-content\/uploads\/2022\/03\/undraw_search_re_x5gq\.svg/);
  assert.doesNotMatch(out, /playfulagency\.com\/wp-content/);
});

test('rewriteStringUrls maps relative plugin paths to /wp-static', () => {
  const inHtml = '<img class="wti-pixel" src="/wp-content/plugins/wti-like-post/images/pixel.gif">';
  const out = rewriteStringUrls(inHtml);
  assert.match(out, /\/wp-static\/wp-content\/plugins\/wti-like-post\/images\/pixel\.gif/);
});

test('rewriteStringUrls maps crear.playfulagency.com uploads to /wp-media', () => {
  const inHtml =
    '<img src="https://crear.playfulagency.com/wp-content/uploads/2020/08/Herramienta-SEO-2.png">';
  const out = rewriteStringUrls(inHtml);
  assert.match(out, /\/wp-media\/wp-content\/uploads\/2020\/08\/Herramienta-SEO-2\.png/);
  assert.doesNotMatch(out, /crear\.playfulagency\.com/);
});