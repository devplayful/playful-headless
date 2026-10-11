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

  const expected = {
    'agencia-e-commerce': {
      name: 'Agencia ecommerce para venta directa',
      breadcrumbName: 'Agencia e-commerce',
      serviceType: 'E-commerce',
    },
    'agencia-shopify': {
      name: 'Agencia Shopify para marcas que ya venden',
      breadcrumbName: 'Agencia Shopify',
      serviceType: 'Shopify',
    },
    'agencia-seo': { name: 'Agencia SEO', breadcrumbName: 'Agencia SEO', serviceType: 'SEO' },
    'agencia-sem': { name: 'Agencia SEM', breadcrumbName: 'Agencia SEM', serviceType: 'SEM' },
    'agencia-diseno-web': {
      name: 'Agencia diseño web',
      breadcrumbName: 'Agencia diseño web',
      serviceType: 'Web design',
    },
    'agencia-ux-ui': {
      name: 'Agencia UX/UI',
      breadcrumbName: 'Agencia UX/UI',
      serviceType: 'Diseño UX/UI',
    },
  };

  for (const slug of slugs) {
    const jsonLd = buildServiceLandingJsonLd(slug, `Desc ${slug}`);
    assert.ok(jsonLd);
    assert.equal(jsonLd.service['@type'], 'Service');
    assert.equal(jsonLd.service.url, `https://playfulagency.com/${slug}`);
    assert.equal(jsonLd.service.name, expected[slug].name);
    assert.equal(jsonLd.service.serviceType, expected[slug].serviceType);
    assert.equal(jsonLd.service.description, `Desc ${slug}`);
    assert.deepEqual(jsonLd.service.provider['@id'], ORGANIZATION_SCHEMA['@id']);
    assert.equal(jsonLd.breadcrumb['@type'], 'BreadcrumbList');
    assert.equal(jsonLd.breadcrumb.itemListElement.length, 2);
    assert.equal(jsonLd.breadcrumb.itemListElement[1].name, expected[slug].breadcrumbName);
    assert.doesNotMatch(serializeServiceLandingJsonLd(jsonLd.service), /</);
  }

  assert.equal(buildServiceLandingJsonLd('marketing-internacional'), null);
});

test('[slug] and Shopify pages emit the playful-service scripts', () => {
  assert.match(slugPage, /buildServiceLandingJsonLd/);
  assert.match(slugPage, /id="playful-service"/);
  assert.match(slugPage, /id="playful-breadcrumb"/);
  assert.match(slugPage, /id="playful-faq"/);
  assert.match(slugPage, /getServiceFaqJsonLd/);
  assert.match(shopifyPage, /buildServiceLandingJsonLd\('agencia-shopify'/);
  assert.match(shopifyPage, /id="playful-service"/);
  assert.match(shopifyPage, /id="playful-breadcrumb"/);
  assert.equal((shopifyPage.match(/id="playful-faq"/g) || []).length, 1);
});
