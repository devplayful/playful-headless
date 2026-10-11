import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  SERVICE_LANDING_SCHEMAS,
  buildServiceLandingJsonLd,
  serializeServiceLandingJsonLd,
} from '../utils/service-landing-jsonld.ts';
import { ORGANIZATION_SCHEMA } from '../utils/organization-schema.mjs';

const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
const shopifyPage = readFileSync(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');

test('sitemap service landings share the Service + BreadcrumbList builders', () => {
  const slugs = [
    'agencia-ux-ui',
    'agencia-seo',
    'agencia-sem',
    'agencia-diseno-web',
    'agencia-e-commerce',
    'agencia-shopify',
  ];
  assert.deepEqual(Object.keys(SERVICE_LANDING_SCHEMAS).sort(), [...slugs].sort());

  for (const slug of slugs) {
    const jsonLd = buildServiceLandingJsonLd(slug, `Desc ${slug}`);
    assert.ok(jsonLd);
    assert.equal(jsonLd.service['@type'], 'Service');
    assert.equal(jsonLd.service.url, `https://playfulagency.com/${slug}`);
    assert.equal(jsonLd.service.description, `Desc ${slug}`);
    assert.deepEqual(jsonLd.service.provider['@id'], ORGANIZATION_SCHEMA['@id']);
    assert.equal(jsonLd.breadcrumb['@type'], 'BreadcrumbList');
    assert.equal(jsonLd.breadcrumb.itemListElement.length, 2);
    assert.doesNotMatch(serializeServiceLandingJsonLd(jsonLd.service), /</);
  }

  assert.equal(buildServiceLandingJsonLd('marketing-internacional'), null);
});

test('[slug] and Shopify pages emit the playful-service scripts', () => {
  assert.match(slugPage, /buildServiceLandingJsonLd/);
  assert.match(slugPage, /id="playful-service"/);
  assert.match(slugPage, /id="playful-breadcrumb"/);
  assert.match(shopifyPage, /buildServiceLandingJsonLd\('agencia-shopify'/);
  assert.match(shopifyPage, /id="playful-service"/);
  assert.match(shopifyPage, /id="playful-breadcrumb"/);
  assert.match(shopifyPage, /id="playful-faq"/);
});
