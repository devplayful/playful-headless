import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';
import { LANDING_CAROUSEL_SOURCE_SLUGS } from '../utils/broken-internal-hrefs.ts';
import { PAGE_TITLE_OVERRIDES, PAGE_DESCRIPTION_OVERRIDES } from '../utils/page-seo-overrides.mjs';
import {
  AGENCIA_UX_UI_PATH,
  AGENCIA_UX_UI_SERVICE,
  AGENCIA_UX_UI_SLUG,
  buildAgenciaUxUiJsonLd,
  serializeServiceLandingJsonLd,
} from '../utils/service-landing-jsonld.ts';
import { ORGANIZATION_SCHEMA } from '../utils/organization-schema.mjs';

const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');

const UX_UI_RELATED = [
  {
    from: '/que-es-una-agencia-de-sem',
    to: '/blog/mas-vistos/que-es-una-agencia-de-sem',
    anchor: 'SEM',
  },
  {
    from: '/publicidad-digital-en-tu-negocio',
    to: '/blog/pautas-digitales/publicidad-digital-en-tu-negocio',
    anchor: 'publicidad',
  },
  {
    from: '/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    to: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    anchor: 'Zelle',
  },
  {
    from: '/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    to: '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    anchor: 'SEO internacional',
  },
  {
    from: '/cintillos-de-promocion',
    to: '/blog/tecnologia/cintillos-de-promocion',
    anchor: 'Cintillos',
  },
  {
    from: '/los-5-problemas-de-e-commerce',
    to: '/blog/mas-vistos/los-5-problemas-de-e-commerce',
    anchor: 'problemas',
  },
  {
    from: '/actualizar-tu-e-commerce',
    to: '/blog/tecnologia/actualizar-tu-e-commerce',
    anchor: 'actualizar',
  },
  {
    from: '/crear-un-e-commerce',
    to: '/blog/tecnologia/crear-un-e-commerce',
    anchor: 'crear',
  },
  {
    from: '/author/stefanniparabavidez',
    to: '/blog',
    anchor: 'Stefanni',
  },
];

test('ux-ui is on the landing carousel allowlist so related short slugs unwrap to 200 URLs', () => {
  assert.equal(LANDING_CAROUSEL_SOURCE_SLUGS.includes('agencia-ux-ui'), true);
});

test('/agencia-ux-ui related hrefs resolve to the live blog path without changing the anchor', () => {
  for (const item of UX_UI_RELATED) {
    const html = `<ul class="recent-news"><li><h3><a href="${item.from}">${item.anchor}</a></h3></li></ul>`;
    const rewritten = rewriteInSitePageHrefs(html, AGENCIA_UX_UI_PATH);
    assert.match(rewritten, /recent-news/);
    assert.doesNotMatch(rewritten, new RegExp(`href="${item.from.replaceAll('/', '\\/')}"`));
    assert.match(
      rewritten,
      new RegExp(`href="${item.to.replaceAll('/', '\\/')}">${item.anchor}</`),
    );
  }
});

test('Service and BreadcrumbList JSON-LD follow the shopify script pattern', () => {
  const description =
    '¿Buscas una agencia UX UI que se tome en serio la experiencia de usuario?';
  const { service, breadcrumb } = buildAgenciaUxUiJsonLd(description);

  assert.equal(service['@type'], 'Service');
  assert.equal(service.name, 'Agencia UX/UI');
  assert.equal(service.serviceType, 'Diseño UX/UI');
  assert.equal(service.url, 'https://playfulagency.com/agencia-ux-ui');
  assert.equal(service.description, description);
  assert.deepEqual(service.provider, {
    '@type': 'Organization',
    '@id': ORGANIZATION_SCHEMA['@id'],
    name: ORGANIZATION_SCHEMA.name,
    url: ORGANIZATION_SCHEMA.url,
  });

  assert.equal(breadcrumb['@type'], 'BreadcrumbList');
  assert.deepEqual(breadcrumb.itemListElement, [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Inicio',
      item: 'https://playfulagency.com/',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: AGENCIA_UX_UI_SERVICE.name,
      item: 'https://playfulagency.com/agencia-ux-ui',
    },
  ]);

  assert.doesNotMatch(serializeServiceLandingJsonLd(service), /</);
  assert.doesNotMatch(serializeServiceLandingJsonLd(breadcrumb), /</);
});

test('[slug] page emits both JSON-LD scripts only for /agencia-ux-ui', () => {
  assert.match(slugPage, /id="playful-service"/);
  assert.match(slugPage, /id="playful-breadcrumb"/);
  assert.match(slugPage, /type="application\/ld\+json"/);
  assert.match(slugPage, /buildAgenciaUxUiJsonLd/);
  assert.match(slugPage, /serializeServiceLandingJsonLd\(uxUiJsonLd\.service\)/);
  assert.match(slugPage, /serializeServiceLandingJsonLd\(uxUiJsonLd\.breadcrumb\)/);
  assert.match(slugPage, new RegExp(`slug === ${AGENCIA_UX_UI_SLUG}|slug === AGENCIA_UX_UI_SLUG`));
  assert.doesNotMatch(slugPage, /^["']use client["']/);
});

test('ux-ui technical SEO does not add title or description overrides', () => {
  assert.equal(Object.hasOwn(PAGE_TITLE_OVERRIDES, 'agencia-ux-ui'), false);
  assert.equal(Object.hasOwn(PAGE_DESCRIPTION_OVERRIDES, 'agencia-ux-ui'), false);
});
