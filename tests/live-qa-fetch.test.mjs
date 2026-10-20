import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PLAYFUL_QA_UA,
  stripQaHref,
  stripQaSearch,
  withQaPathname,
  withQaUrl,
} from '../lib/qa/live-fetch.mjs';

test('marks live URLs with qa=1 without dropping existing query', () => {
  assert.equal(withQaPathname('/agencia-e-commerce'), '/agencia-e-commerce?qa=1');
  assert.equal(
    withQaPathname('/reunion-playful?utm_source=seo-smoke'),
    '/reunion-playful?utm_source=seo-smoke&qa=1',
  );
  assert.equal(
    withQaUrl('https://playfulagency.com/agencia-e-commerce?gclid=1'),
    'https://playfulagency.com/agencia-e-commerce?gclid=1&qa=1',
  );
  assert.equal(stripQaSearch('?utm_source=x&qa=1'), '?utm_source=x');
  assert.equal(stripQaSearch('?qa=1'), '');
  assert.equal(
    stripQaHref('https://playfulagency.com/blog/seo?qa=1'),
    'https://playfulagency.com/blog/seo',
  );
  assert.equal(PLAYFUL_QA_UA, 'PlayfulQA/1.0');
});

test('live scripts, smoke and lighthouse always send qa=1 and PlayfulQA except Lighthouse UA', () => {
  const files = [
    'scripts/seo-smoke.mjs',
    'scripts/service-booking-cta-curl.mjs',
    'scripts/about-href-curl.mjs',
    'scripts/seo-closed-href-curl.mjs',
    'scripts/blog-post-ssr-html.mjs',
    'scripts/audit-blog-yoast-canonicals.mjs',
    'scripts/lighthouse-mobile-median.mjs',
  ];
  for (const file of files) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
    assert.match(source, /live-fetch\.mjs/, `${file} must use the live QA helper`);
    assert.match(source, /withQa|liveFetch/, `${file} must attach qa=1`);
  }
  const closed = readFileSync(new URL('../scripts/seo-closed-href-curl.mjs', import.meta.url), 'utf8');
  assert.match(closed, /PLAYFUL_QA_UA/);
  assert.doesNotMatch(closed, /PlayfulAgency\/1\.0/);
  const pkg = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
  assert.doesNotMatch(pkg, /playwright/, 'no Playwright suite yet; helper is the checklist');
});
