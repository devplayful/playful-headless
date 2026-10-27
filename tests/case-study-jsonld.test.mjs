import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildCaseStudyArticleJsonLd,
  buildCaseStudyBreadcrumbJsonLd,
  buildCaseStudiesHubBreadcrumbJsonLd,
} from '../utils/case-study-jsonld.ts';
import { serializeServiceLandingJsonLd } from '../utils/service-landing-jsonld.ts';
import { ORGANIZATION_SCHEMA } from '../utils/organization-schema.mjs';

const casePage = readFileSync(new URL('../app/(frontend)/casos-de-exito/[slug]/page.tsx', import.meta.url), 'utf8');
const hubPage = readFileSync(new URL('../app/(frontend)/casos-de-exito/page.tsx', import.meta.url), 'utf8');
const casoCta = readFileSync(new URL('../app/(frontend)/casos-de-exito/[slug]/CasoExitoCta.tsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../app/(frontend)/page.tsx', import.meta.url), 'utf8');
const blogPost = readFileSync(new URL('../app/(frontend)/blog/[...slug]/page.tsx', import.meta.url), 'utf8');
const blogListing = readFileSync(new URL('../app/(frontend)/blog/blog-listing-view.tsx', import.meta.url), 'utf8');
const nosotros = readFileSync(new URL('../app/(frontend)/nosotros/page.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');

test('case studies emit Article + BreadcrumbList without inventing CaseStudy', () => {
  const article = buildCaseStudyArticleJsonLd({
    headline: 'Jumex Shopify DTC: canal propio para un catálogo grande',
    description: 'Construimos el canal DTC de Jumex en Shopify.',
    path: '/casos-de-exito/jumex-shopify-dtc-ecommerce',
    image: 'https://playfulagency.com/images/og/casos-de-exito-jumex.jpg',
  });
  assert.equal(article['@type'], 'Article');
  assert.equal(article.articleSection, 'Caso de éxito');
  assert.equal(article.url, 'https://playfulagency.com/casos-de-exito/jumex-shopify-dtc-ecommerce');
  assert.deepEqual(article.publisher['@id'], ORGANIZATION_SCHEMA['@id']);

  const crumbs = buildCaseStudyBreadcrumbJsonLd({
    name: article.headline,
    path: '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  });
  assert.equal(crumbs['@type'], 'BreadcrumbList');
  assert.equal(crumbs.itemListElement.length, 3);
  assert.equal(crumbs.itemListElement[1].item, 'https://playfulagency.com/casos-de-exito');
  assert.equal(crumbs.itemListElement[2].name, 'Jumex Shopify DTC');
  assert.equal(
    buildCaseStudyBreadcrumbJsonLd({
      name: 'ignored',
      path: '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
    }).itemListElement[2].name,
    'Odwalla Shopify DTC',
  );
  assert.equal(
    buildCaseStudyBreadcrumbJsonLd({
      name: 'ignored',
      path: '/casos-de-exito/soytechno-ecommerce-venezuela',
    }).itemListElement[2].name,
    'SoyTechno Venezuela',
  );

  const hub = buildCaseStudiesHubBreadcrumbJsonLd();
  assert.equal(hub.itemListElement.length, 2);
  assert.doesNotMatch(serializeServiceLandingJsonLd(article), /</);
});

test('case, hub and blog pages wire the JSON-LD scripts', () => {
  assert.match(casePage, /id="playful-article"/);
  assert.match(casePage, /id="playful-breadcrumb"/);
  assert.match(casePage, /buildCaseStudyArticleJsonLd/);
  assert.match(hubPage, /buildCaseStudiesHubBreadcrumbJsonLd/);
  assert.match(blogPost, /buildBlogBreadcrumbJsonLd/);
  assert.match(blogPost, /id="playful-article"/);
});

test('existing body CTAs point at /reunion-playful without touching header Contáctanos', () => {
  assert.match(casoCta, /SERVICE_BOOKING_HREF/);
  assert.doesNotMatch(casoCta, /href="\/contactar-agencia-de-marketing-digital"/);
  assert.match(home, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(blogPost, /buttonLink=\{CONTACT_HREF\}/);
  assert.doesNotMatch(blogPost, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(blogListing, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(nosotros, /buttonLink=\{SERVICE_BOOKING_HREF\}/);
  assert.match(nosotros, /id="playful-breadcrumb"/);
  assert.match(nosotros, /buildBreadcrumbListJsonLd/);
  assert.match(header, /href="\/contactar-agencia-de-marketing-digital"/);
  assert.match(header, /aria-expanded=\{isCasesOpen\}/);
  assert.match(header, /aria-expanded=\{isServicesOpen\}/);
});
