import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  PUBLIC_CASE_STUDIES,
  SOYTECHNO_CASE_SLUG,
  mergePublicCaseStudies,
} = await import('../lib/public-case-studies.ts');
const {
  CASOS_DE_EXITO_FEATURED_TAPAS,
  featuredTapaForSlug,
  resolveCaseStudyListingImage,
} = await import('../lib/case-study-listing-image.ts');

const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const listing = readFileSync(
  new URL('../app/casos-de-exito/CaseStudiesContent.tsx', import.meta.url),
  'utf8',
);
const header = readFileSync(new URL('../components/Header.tsx', import.meta.url), 'utf8');

const jumex = {
  id: 86237,
  slug: 'jumex-shopify-dtc-ecommerce',
  title: { rendered: 'JUMEX y Shopify: canal DTC' },
};
const odwalla = {
  id: 86235,
  slug: 'odwalla-shopify-dtc-ecommerce',
  title: { rendered: 'ODWALLA: DTC' },
};

test('SoyTechno is a public/synthetic case with nav-friendly title and listing tapa', () => {
  const soytechno = PUBLIC_CASE_STUDIES.find((item) => item.slug === SOYTECHNO_CASE_SLUG);
  assert.ok(soytechno);
  assert.equal(soytechno.slug, 'soytechno-ecommerce-venezuela');
  assert.match(soytechno.title.rendered, /^SoyTechno:/);
  assert.equal(soytechno.title.rendered.split(':')[0].trim(), 'SoyTechno');
  assert.match(soytechno.excerpt.rendered, /Cashea/);
  assert.equal(soytechno.acf.categoria1, 'E-commerce');
  assert.equal(
    soytechno.featured_media_url,
    '/images/casos/soytechno/images/lifestyle-f.jpg',
  );
  assert.equal(
    CASOS_DE_EXITO_FEATURED_TAPAS['soytechno-ecommerce-venezuela'],
    '/images/casos/soytechno/images/lifestyle-f.jpg',
  );
  assert.equal(
    featuredTapaForSlug('soytechno-ecommerce-venezuela'),
    '/images/casos/soytechno/images/lifestyle-f.jpg',
  );
});

test('mergePublicCaseStudies prepends SoyTechno and keeps Jumex then Odwalla', () => {
  const merged = mergePublicCaseStudies([jumex, odwalla]);
  assert.deepEqual(
    merged.map((item) => item.slug),
    [
      'soytechno-ecommerce-venezuela',
      'jumex-shopify-dtc-ecommerce',
      'odwalla-shopify-dtc-ecommerce',
    ],
  );
});

test('mergePublicCaseStudies deduplicates by slug and prefers the WordPress row', () => {
  const fromWp = {
    id: 99999,
    slug: SOYTECHNO_CASE_SLUG,
    title: { rendered: 'SoyTechno: publicado en WordPress' },
  };
  const merged = mergePublicCaseStudies([jumex, fromWp]);
  const soytechno = merged.find((item) => item.slug === SOYTECHNO_CASE_SLUG);
  assert.equal(merged.filter((item) => item.slug === SOYTECHNO_CASE_SLUG).length, 1);
  assert.equal(soytechno.id, 99999);
  assert.equal(soytechno.title.rendered, 'SoyTechno: publicado en WordPress');
});

test('mergePublicCaseStudies still yields SoyTechno when WordPress is empty', () => {
  const merged = mergePublicCaseStudies([]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].slug, SOYTECHNO_CASE_SLUG);
});

test('listing image resolver falls back to the SoyTechno tapa by slug', () => {
  assert.equal(
    resolveCaseStudyListingImage({ slug: 'soytechno-ecommerce-venezuela' }),
    '/images/casos/soytechno/images/lifestyle-f.jpg',
  );
});

test('nav and listing consume the shared merge helper', () => {
  assert.match(wordpress, /mergePublicCaseStudies\(published\)/);
  assert.match(wordpress, /export async function getAllCaseStudies/);
  assert.match(header, /getAllCaseStudies\(\)/);
  assert.match(listing, /mergePublicCaseStudies\(/);
});
