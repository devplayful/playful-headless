import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  SHOPIFY_CASE_STUDY_SLUGS,
  CASE_STUDY_SHOPIFY_HREF,
  CASE_STUDY_SHOPIFY_LABEL,
  isShopifyCaseStudySlug,
} = await import('../utils/case-study-shopify-link.ts');

const page = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const component = readFileSync(
  new URL('../app/casos-de-exito/[slug]/ShopifyServiceLink.tsx', import.meta.url),
  'utf8',
);
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

test('allowlist is only Jumex and Odwalla', () => {
  assert.deepEqual([...SHOPIFY_CASE_STUDY_SLUGS], [
    'jumex-shopify-dtc-ecommerce',
    'odwalla-shopify-dtc-ecommerce',
  ]);
  assert.equal(isShopifyCaseStudySlug('jumex-shopify-dtc-ecommerce'), true);
  assert.equal(isShopifyCaseStudySlug('odwalla-shopify-dtc-ecommerce'), true);
  assert.equal(isShopifyCaseStudySlug('policlinica-metropolitana'), false);
});

test('body CTA is Agencia Shopify → /agencia-shopify as a raw anchor', () => {
  assert.equal(CASE_STUDY_SHOPIFY_HREF, '/agencia-shopify');
  assert.equal(CASE_STUDY_SHOPIFY_LABEL, 'Agencia Shopify');
  assert.match(component, /href=\{CASE_STUDY_SHOPIFY_HREF\}/);
  assert.match(component, /\{CASE_STUDY_SHOPIFY_LABEL\}/);
  assert.doesNotMatch(component, /from 'next\/link'|from "next\/link"/);
});

test('case study page mounts the link after primerap, gated by slug', () => {
  assert.match(page, /isShopifyCaseStudySlug\(slug\) \? <ShopifyServiceLink \/> : null/);
  const primerapIdx = page.indexOf('story.acf.primerap');
  const linkIdx = page.indexOf('<ShopifyServiceLink');
  assert.ok(primerapIdx > 0 && linkIdx > primerapIdx, 'link must follow primerap');
});

test('does not add Shopify to nav, header, footer or root layout', () => {
  assert.doesNotMatch(header, /href="\/agencia-shopify"/);
  assert.doesNotMatch(footer, /href="\/agencia-shopify"/);
  assert.doesNotMatch(layout, /href="\/agencia-shopify"/);
  assert.doesNotMatch(header, /ShopifyServiceLink/);
  assert.doesNotMatch(footer, /ShopifyServiceLink/);
});
