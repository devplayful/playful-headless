import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CASE_STUDIES_HUB_DESCRIPTION,
  CASE_STUDIES_HUB_H1,
  CASE_STUDIES_HUB_LEAD,
  CASE_STUDIES_HUB_PATH,
  CASE_STUDIES_HUB_TITLE,
  CASE_STUDIES_HUB_WP_SLUG,
} from '../utils/case-study-hub.ts';
import { canonicalForPath } from '../utils/canonical.ts';
import { buildSitemapXml } from '../utils/apex-sitemap.ts';

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const header = readFileSync(new URL('../components/HeaderClient.tsx', import.meta.url), 'utf8');
const footer = readFileSync(new URL('../components/Footer.tsx', import.meta.url), 'utf8');
const hubPage = readFileSync(new URL('../app/casos-de-exito/page.tsx', import.meta.url), 'utf8');
const hubContent = readFileSync(new URL('../app/casos-de-exito/CaseStudiesContent.tsx', import.meta.url), 'utf8');
const soytechno = readFileSync(new URL('../components/soytechno/SoyTechnoCaseStudy.tsx', import.meta.url), 'utf8');
const notFound = readFileSync(new URL('../app/not-found.tsx', import.meta.url), 'utf8');
const theme = readFileSync(new URL('../contexts/ThemeContext.tsx', import.meta.url), 'utf8');

test('hub apex path and WP metadata slug stay distinct', () => {
  assert.equal(CASE_STUDIES_HUB_PATH, '/casos-de-exito');
  assert.equal(CASE_STUDIES_HUB_WP_SLUG, 'casos-de-exito-agencia-de-marketing-digital');
  assert.equal(canonicalForPath(CASE_STUDIES_HUB_PATH), 'https://playfulagency.com/casos-de-exito');
});

test('hub SERP strings are the Contento paste 1247n70uwtz', () => {
  assert.equal(CASE_STUDIES_HUB_TITLE, 'Casos de éxito ecommerce y Shopify | Playful Agency');
  assert.equal(
    CASE_STUDIES_HUB_DESCRIPTION,
    'Casos de éxito en ecommerce y Shopify de marcas que ya venden: mira cómo implementamos tiendas DTC como Jumex y Odwalla, de catálogo a checkout.',
  );
  assert.equal(
    CASE_STUDIES_HUB_H1,
    'Casos de éxito en ecommerce y Shopify de marcas que ya venden',
  );
  assert.match(CASE_STUDIES_HUB_LEAD, /SoyTechno en curso/);
  assert.match(hubPage, /CASE_STUDIES_HUB_TITLE/);
  assert.match(hubPage, /CASE_STUDIES_HUB_DESCRIPTION/);
  assert.match(hubContent, /CASE_STUDIES_HUB_H1/);
  assert.match(hubContent, /CASE_STUDIES_HUB_LEAD/);
  assert.doesNotMatch(hubPage, /Resultados que hablan por sí solos/);
  assert.doesNotMatch(hubContent, /Resultados que hablan por sí solos/);
});

test('middleware 301s the long hub URL and /casos to /casos-de-exito', () => {
  assert.match(middleware, /'\/casos-de-exito-agencia-de-marketing-digital': '\/casos-de-exito'/);
  assert.match(middleware, /'\/casos': '\/casos-de-exito'/);
  assert.match(middleware, /'\/casos-de-exito-agencia-de-marketing-digital'/);
  assert.match(middleware, /'\/casos-de-exito-agencia-de-marketing-digital\/'/);
  assert.match(middleware, /NextResponse\.redirect\(target, 301\)/);
});

test('sitemap lists the new hub and drops the legacy path', () => {
  const sitemap = buildSitemapXml();
  assert.match(sitemap, /https:\/\/playfulagency\.com\/casos-de-exito</);
  assert.match(sitemap, /https:\/\/playfulagency\.com\/casos-de-exito\/soytechno-ecommerce-venezuela</);
  assert.doesNotMatch(sitemap, /casos-de-exito-agencia-de-marketing-digital/);
});

test('chrome, breadcrumbs and hub metadata point at /casos-de-exito', () => {
  assert.equal((header.match(/href="\/casos-de-exito"/g) || []).length, 2);
  assert.match(footer, /href="\/casos-de-exito"/);
  assert.match(notFound, /href="\/casos-de-exito"/);
  assert.match(soytechno, /href="\/casos-de-exito"/);
  assert.match(theme, /pathname === '\/casos-de-exito'/);
  assert.match(hubPage, /canonicalForPath\(CASE_STUDIES_HUB_PATH\)/);
  assert.match(hubPage, /getPageMetadataBySlug\(CASE_STUDIES_HUB_WP_SLUG\)/);
  assert.match(hubPage, /Contento hub SERP 1247n70uwtz/);
  assert.doesNotMatch(header, /casos-de-exito-agencia-de-marketing-digital/);
  assert.doesNotMatch(footer, /casos-de-exito-agencia-de-marketing-digital/);
  assert.doesNotMatch(notFound, /casos-de-exito-agencia-de-marketing-digital/);
  assert.doesNotMatch(soytechno, /casos-de-exito-agencia-de-marketing-digital/);
});
