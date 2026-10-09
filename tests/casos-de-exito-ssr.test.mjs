import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { CASE_STUDIES_HUB_H1, CASE_STUDIES_HUB_LEAD } from '../utils/case-study-hub.ts';
import { mapCaseStudyToListingCard } from '../lib/case-study-listing-card.ts';

const hubPage = readFileSync(new URL('../app/casos-de-exito/page.tsx', import.meta.url), 'utf8');
const hubContent = readFileSync(
  new URL('../app/casos-de-exito/CaseStudiesContent.tsx', import.meta.url),
  'utf8',
);
const metadataFn = hubPage.slice(hubPage.indexOf('export async function generateMetadata'));

test('hub page fetches cases on the server and keeps generateMetadata', () => {
  assert.doesNotMatch(hubPage, /^['"]use client['"]/m);
  assert.match(hubPage, /export default async function CaseStudiesPage/);
  assert.match(hubPage, /getAllCaseStudies\(\)/);
  assert.match(hubPage, /mapCaseStudyToListingCard/);
  assert.match(hubPage, /initialCaseStudies=\{initialCaseStudies\}/);
  assert.doesNotMatch(hubPage, /<Suspense/);
  assert.doesNotMatch(hubPage, /<h1[\s>]/);
  assert.match(metadataFn, /CASE_STUDIES_HUB_TITLE/);
  assert.match(metadataFn, /CASE_STUDIES_HUB_DESCRIPTION/);
  assert.match(metadataFn, /twitterFromOpenGraph\(title, description\)/);
  assert.match(metadataFn, /canonicalForPath\(CASE_STUDIES_HUB_PATH\)/);
  assert.match(metadataFn, /getPageMetadataBySlug\(CASE_STUDIES_HUB_WP_SLUG\)/);
});

test('hub still paints the existing H1; it does not add another', () => {
  const h1Matches = hubContent.match(/<h1\b/g) || [];
  assert.equal(h1Matches.length, 1);
  assert.match(
    hubContent,
    /<h1 className="text-\[50px\] lg:text-\[57px\] font-normal text-white mb-6 leading-tight">/,
  );
  assert.match(hubContent, /\{CASE_STUDIES_HUB_H1\}/);
  assert.match(hubContent, /\{CASE_STUDIES_HUB_LEAD\}/);
  assert.equal(
    CASE_STUDIES_HUB_H1,
    'Casos de éxito en ecommerce y Shopify de marcas que ya venden',
  );
  assert.match(CASE_STUDIES_HUB_LEAD, /Aquí no vas a encontrar promesas de agencia/);
  assert.match(hubContent, /initialCaseStudies/);
  assert.match(hubContent, /hasServerCaseStudies/);
  assert.match(hubContent, /useState\(Boolean\(caseStudy\.image\)\)/);
});

test('listing mapper keeps the same card fields the hub already showed', () => {
  const card = mapCaseStudyToListingCard({
    id: 86237,
    slug: 'jumex-shopify-dtc-ecommerce',
    title: { rendered: 'JUMEX y Shopify: canal DTC' },
    excerpt: { rendered: '<p>Catálogo grande en Shopify.</p>' },
    acf: {
      categoria1: 'E-commerce',
      categoria2: 'Shopify',
      badge: 'DTC',
      badge_color: 'bg-purple-600',
      button_text: 'Ver más',
      button_color: 'bg-blue-600 hover:bg-blue-700',
    },
  });

  assert.equal(card.id, 86237);
  assert.equal(card.slug, 'jumex-shopify-dtc-ecommerce');
  assert.equal(card.title, 'JUMEX y Shopify: canal DTC');
  assert.equal(card.description, 'Catálogo grande en Shopify.');
  assert.deepEqual(card.categories, ['E-commerce', 'Shopify']);
  assert.equal(card.badge, 'DTC');
  assert.equal(card.buttonText, 'Ver más');
  assert.match(card.image, /Tapa-Caso-de-exito-JUMEX/);
});
