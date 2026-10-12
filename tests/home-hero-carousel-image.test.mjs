import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const carousel = readFileSync(
  new URL('../components/CarouselResultados.tsx', import.meta.url),
  'utf8',
);

test('home hero banner uses next/image with priority and fetchPriority high', () => {
  const art = readFileSync(new URL('../components/HomeHeroArt.tsx', import.meta.url), 'utf8');
  const lottie = readFileSync(new URL('../components/HomeHeroLottie.tsx', import.meta.url), 'utf8');
  assert.match(home, /<HomeHeroArt/);
  assert.match(home, /rel="preload" as="image"/);
  assert.match(home, /homeHeroLcpHref\(\)/);
  assert.match(home, /fetchPriority="high"/);
  assert.doesNotMatch(home, /AnimatedButton/);
  assert.doesNotMatch(home, /from ['"]lottie-react['"]/);
  assert.match(art, /from ['"]next\/image['"]/);
  assert.match(art, /publicWebpIfPresent\(HOME_HERO_POSTER_PNG\)/);
  assert.match(art, /priority/);
  assert.match(art, /fetchPriority="high"/);
  assert.match(art, /sizes="\(min-width: 1024px\) 560px, 100vw"/);
  assert.match(art, /width=\{HOME_HERO_WIDTH\}/);
  assert.match(art, /height=\{HOME_HERO_HEIGHT\}/);
  assert.doesNotMatch(art, /<img[\s\S]*playful-imagen-banner/);
  assert.match(lottie, /import\('lottie-react'\)/);
  assert.match(lottie, /requestIdleCallback|addEventListener\('load'/);
  assert.match(lottie, /opacity: ready \? 1 : 0/);
});

test('case-study carousel cards use lazy next/image fill, not a raw img', () => {
  assert.match(carousel, /from ['"]next\/image['"]/);
  assert.match(carousel, /<Image[\s\S]*src=\{caseStudy\.image\}/);
  assert.match(carousel, /\bfill\b/);
  assert.match(carousel, /sizes="\(min-width: 1024px\) 360px, \(min-width: 768px\) 45vw, 90vw"/);
  assert.doesNotMatch(carousel, /<img[\s\S]*src=\{caseStudy\.image\}/);
  const card = carousel.slice(
    carousel.indexOf('export const CaseStudyCard'),
    carousel.indexOf('export default function') === -1
      ? carousel.length
      : carousel.indexOf('const CarouselResultados'),
  );
  assert.doesNotMatch(card, /priority/);
  assert.match(card, /useState\(Boolean\(caseStudy\.image\)\)/);
});
