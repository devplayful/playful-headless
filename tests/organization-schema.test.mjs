import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ORGANIZATION_JSON_LD,
  ORGANIZATION_LOGO_URL,
  ORGANIZATION_SAME_AS,
  ORGANIZATION_SCHEMA,
  WEBSITE_JSON_LD,
  WEBSITE_SCHEMA,
} from '../utils/organization-schema.mjs';

test('organization includes verified sameAs, contactPoint and areaServed', () => {
  assert.deepEqual(Object.keys(ORGANIZATION_SCHEMA).sort(), [
    '@context',
    '@id',
    '@type',
    'areaServed',
    'contactPoint',
    'logo',
    'name',
    'sameAs',
    'url',
  ].sort());
  assert.equal(ORGANIZATION_SCHEMA['@type'], 'Organization');
  assert.equal(ORGANIZATION_SCHEMA.name, 'Playful Agency');
  assert.deepEqual(ORGANIZATION_SCHEMA.sameAs, ORGANIZATION_SAME_AS);
  assert.equal(ORGANIZATION_SAME_AS.length, 4);
  assert.deepEqual(ORGANIZATION_SCHEMA.logo, {
    '@type': 'ImageObject',
    url: ORGANIZATION_LOGO_URL,
  });
  assert.equal(ORGANIZATION_SCHEMA.contactPoint.length, 2);
  assert.equal(ORGANIZATION_SCHEMA.contactPoint[0].url, 'https://playfulagency.com/reunion-playful');
  assert.equal(
    ORGANIZATION_SCHEMA.contactPoint[1].url,
    'https://playfulagency.com/contactar-agencia-de-marketing-digital',
  );
  assert.deepEqual(
    ORGANIZATION_SCHEMA.areaServed.map((item) => item.name),
    ['Venezuela', 'Spain', 'Mexico'],
  );
  assert.doesNotMatch(ORGANIZATION_JSON_LD, /Shopify Partner|clutch|sortlist|goodfirms|linkedin\.com\/in\//i);
});

test('identity remains canonical across preview and production', () => {
  assert.equal(ORGANIZATION_SCHEMA['@context'], 'https://schema.org');
  assert.equal(ORGANIZATION_SCHEMA.url, 'https://playfulagency.com/');
  assert.equal(ORGANIZATION_SCHEMA['@id'], `${ORGANIZATION_SCHEMA.url}#organization`);
  assert.equal(new URL(ORGANIZATION_LOGO_URL).origin, new URL(ORGANIZATION_SCHEMA.url).origin);
});

test('serialized script is valid JSON and cannot contain HTML terminators', () => {
  assert.deepEqual(JSON.parse(ORGANIZATION_JSON_LD), ORGANIZATION_SCHEMA);
  assert.doesNotMatch(ORGANIZATION_JSON_LD, /</);
});

test('logo is a raster PNG of the header logo, at least 112 px', () => {
  const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
  assert.ok(header.includes('/images/logos/playful-logov.svg'));
  const path = new URL(ORGANIZATION_LOGO_URL).pathname;
  assert.match(path, /\.png$/);
  const png = readFileSync(new URL(`../public${path}`, import.meta.url));
  assert.equal(png.subarray(1, 4).toString('ascii'), 'PNG');
  const width = png.readUInt32BE(16);
  const height = png.readUInt32BE(20);
  assert.ok(width >= 112 && height >= 112, `${width}x${height}`);
});

test('root layout emits the organization script once for every page', () => {
  const layout = readFileSync(new URL('../app/(frontend)/layout.tsx', import.meta.url), 'utf8');
  const home = readFileSync(new URL('../app/(frontend)/page.tsx', import.meta.url), 'utf8');
  assert.equal((layout.match(/id="playful-organization"/g) || []).length, 1);
  assert.match(layout, /type="application\/ld\+json"/);
  assert.match(layout, /__html: ORGANIZATION_JSON_LD/);
  assert.doesNotMatch(home, /id="playful-organization"/);
  assert.match(home, /rel="canonical" href=\{HOME_CANONICAL\}/);
  assert.doesNotMatch(home, /^["']use client["']/);
});

test('home emits WebSite JSON-LD next to the global Organization', () => {
  const home = readFileSync(new URL('../app/(frontend)/page.tsx', import.meta.url), 'utf8');
  assert.equal(WEBSITE_SCHEMA['@type'], 'WebSite');
  assert.equal(WEBSITE_SCHEMA['@id'], 'https://playfulagency.com/#website');
  assert.equal(WEBSITE_SCHEMA.url, ORGANIZATION_SCHEMA.url);
  assert.deepEqual(WEBSITE_SCHEMA.publisher, { '@id': ORGANIZATION_SCHEMA['@id'] });
  assert.deepEqual(JSON.parse(WEBSITE_JSON_LD), WEBSITE_SCHEMA);
  assert.doesNotMatch(WEBSITE_JSON_LD, /</);
  assert.equal((home.match(/id="playful-website"/g) || []).length, 1);
  assert.match(home, /__html: WEBSITE_JSON_LD/);
});

test('root layout keeps chat and gates analytics to production', () => {
  const layout = readFileSync(new URL('../app/(frontend)/layout.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(layout, /seo-preview|readOnlySeoPreview|isReadOnlySeoPreview/);
  assert.match(layout, /<ChatWidget \/>/);
  assert.match(layout, /widgets\.leadconnectorhq\.com/);
  assert.match(layout, /productionAnalyticsIds/);
  assert.match(layout, /\{gtmId && <GoogleTagManager gtmId=\{gtmId\} \/>\}/);
  assert.match(layout, /\{gaId && <GoogleAnalytics gaId=\{gaId\} \/>\}/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GTM_ID/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
});
