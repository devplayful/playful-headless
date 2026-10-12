import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);
const spa = readFileSync(
  new URL('../components/AnalyticsSpaPageView.tsx', import.meta.url),
  'utf8',
);
const booking = readFileSync(
  new URL('../components/BookingQueryPropagator.tsx', import.meta.url),
  'utf8',
);
const blogPosts = readFileSync(new URL('../components/BlogPosts.tsx', import.meta.url), 'utf8');
const byline = readFileSync(
  new URL('../components/blog/BlogBylineChip.tsx', import.meta.url),
  'utf8',
);

test('agencia-seo elementor LCP preloads the hero with high fetch priority', () => {
  assert.match(elementor, /rel="preload" as="image"/);
  assert.match(elementor, /fetchPriority="high"/);
  assert.match(elementor, /fetchpriority="high"/i);
  assert.match(elementor, /markFirstHeroImagePriority/);
  assert.match(elementor, /optimizeElementorLcpHero/);
  assert.match(elementor, /optimizeElementorLcpHero/);
  assert.match(elementor, /firstOptimizableHeroSrc/);
});

test('SPA and booking helpers avoid useSearchParams so layout does not CSR-bailout', () => {
  assert.doesNotMatch(spa, /useSearchParams/);
  assert.match(spa, /window\.location\.search/);
  assert.doesNotMatch(booking, /useSearchParams/);
  assert.match(booking, /window\.location\.search/);
});

test('wordpress listing avatars and cards use next/image', () => {
  assert.match(blogPosts, /from ["']next\/image["']/);
  assert.match(blogPosts, /<Image[\s\S]*fill/);
  assert.doesNotMatch(blogPosts, /<img[\s\S]*post\.imageUrl/);
  assert.match(byline, /from ['"]next\/image['"]/);
  assert.doesNotMatch(byline, /<img[\s\S]*avatarSrc/);
});
