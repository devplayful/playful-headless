import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const post = readFileSync(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
const listing = readFileSync(new URL('../app/blog/blog-listing-view.tsx', import.meta.url), 'utf8');
const related = readFileSync(
  new URL('../components/sections/BlogRelatedPostsSection.tsx', import.meta.url),
  'utf8',
);
const hub = readFileSync(new URL('../app/casos-de-exito/CaseStudiesContent.tsx', import.meta.url), 'utf8');
const caseCta = readFileSync(new URL('../app/casos-de-exito/[slug]/CasoExitoCta.tsx', import.meta.url), 'utf8');
const privacy = readFileSync(new URL('../app/politica-de-privacidad/page.tsx', import.meta.url), 'utf8');
const contact = readFileSync(
  new URL('../app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', import.meta.url),
  'utf8',
);

test('featured, listing, home cards and related set sizes to the real slot', () => {
  assert.match(post, /sizes=\{BLOG_POST_FEATURED_SIZES\}/);
  assert.doesNotMatch(post, /sizes="100vw"/);
  assert.match(listing, /sizes=\{BLOG_LISTING_HERO_SIZES\}/);
  assert.match(listing, /sizes=\{BLOG_LISTING_CARD_SIZES\}/);
  assert.match(related, /sizes=\{BLOG_CARD_SIZES\}/);
});

test('listing tapa and CTA PNGs go through next/image', () => {
  assert.match(hub, /from ["']next\/image["']/);
  assert.match(hub, /sizes=\{CASE_LISTING_CARD_SIZES\}/);
  assert.doesNotMatch(hub, /<img[\s\S]*caseStudy\.image/);
  assert.match(caseCta, /from ['"]next\/image['"]/);
  assert.match(caseCta, /sizes=\{CASE_CTA_ILLUSTRATION_SIZES\}/);
  assert.match(privacy, /from ['"]next\/image['"]/);
  assert.match(privacy, /politica-privacidad-imagen\.png/);
  assert.doesNotMatch(privacy, /<img[\s\S]*politica-privacidad-imagen/);
  assert.match(contact, /from ['"]next\/image['"]/);
  assert.doesNotMatch(contact, /<img[\s\S]*contacto-imagen/);
});
