import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const carousel = readFileSync(
  new URL('../components/CarouselResultados.tsx', import.meta.url),
  'utf8',
);

test('home hero banner uses next/image with priority and fetchPriority high', () => {
  assert.match(home, /from ['"]next\/image['"]/);
  assert.match(home, /src="\/images\/home-hero-producto\.webp"/);
  assert.match(home, /priority/);
  assert.match(home, /fetchPriority="high"/);
  assert.match(home, /sizes="\(min-width: 1024px\) 560px, 100vw"/);
  assert.match(home, /object-contain object-\[center_20%\]/);
  assert.doesNotMatch(home, /<img[\s\S]*home-hero-producto/);
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
});
