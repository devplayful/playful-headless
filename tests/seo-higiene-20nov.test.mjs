import test from 'node:test';
import assert from 'node:assert/strict';

import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';
import { LANDING_CAROUSEL_SOURCE_SLUGS } from '../utils/broken-internal-hrefs.ts';
import { SEO_CRUCE_2810_REDIRECTS } from '../utils/seo-cruce-2810.ts';
import {
  CASHEA_COMERCIOS_BLOG_BODY_HTML,
  MIGRACION_SEO_ALT_BLOG_PATH,
} from '../lib/blog-body-overrides.ts';

const SEO_VIGO_PATH = '/seo-vigo';
const APEX = 'https://playfulagency.com';

const SEO_VIGO_HREFS = [
  {
    from: '/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    to: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    anchor: 'Zelle',
  },
  {
    from: '/cintillos-de-promocion',
    to: '/blog/tecnologia/cintillos-de-promocion',
    anchor: 'Cintillos',
  },
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
    from: '/premios-cima-2026-soytechno-playful',
    to: '/blog/otros/premios-cima-2026-soytechno-playful',
    anchor: 'CIMA',
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
    from: '/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    to: '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    anchor: 'SEO internacional',
  },
];

const SEO_VIGO_AUTHORS = [
  { from: '/author/arosillo', text: 'Alberto Rosillo' },
  { from: '/author/lsantamaria', text: 'Luis Santamaría' },
  { from: '/author/stefanniparabavidez', text: 'Stefanni' },
];

const ROOT_301 = [
  ['/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', `${APEX}/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce`],
  ['/cintillos-de-promocion', `${APEX}/blog/tecnologia/cintillos-de-promocion`],
  ['/que-es-una-agencia-de-sem', `${APEX}/blog/mas-vistos/que-es-una-agencia-de-sem`],
  ['/publicidad-digital-en-tu-negocio', `${APEX}/blog/pautas-digitales/publicidad-digital-en-tu-negocio`],
  ['/premios-cima-2026-soytechno-playful', `${APEX}/blog/otros/premios-cima-2026-soytechno-playful`],
  ['/los-5-problemas-de-e-commerce', `${APEX}/blog/mas-vistos/los-5-problemas-de-e-commerce`],
  ['/actualizar-tu-e-commerce', `${APEX}/blog/tecnologia/actualizar-tu-e-commerce`],
];

test('seo-vigo is on the landing carousel allowlist', () => {
  assert.equal(LANDING_CAROUSEL_SOURCE_SLUGS.includes('seo-vigo'), true);
});

test('/seo-vigo carousel hrefs resolve to live blog paths', () => {
  for (const item of SEO_VIGO_HREFS) {
    const html = `<ul class="recent-news"><li><h3><a href="${item.from}">${item.anchor}</a></h3></li></ul>`;
    const rewritten = rewriteInSitePageHrefs(html, SEO_VIGO_PATH);
    assert.doesNotMatch(rewritten, new RegExp(`href="${item.from.replaceAll('/', '\\/')}"`));
    assert.match(
      rewritten,
      new RegExp(`href="${item.to.replaceAll('/', '\\/')}">${item.anchor}</`),
    );
  }
});

test('/seo-vigo author names are plain text without /author links', () => {
  for (const item of SEO_VIGO_AUTHORS) {
    const html = `<p><a href="${item.from}">${item.text}</a></p>`;
    const rewritten = rewriteInSitePageHrefs(html, SEO_VIGO_PATH);
    assert.doesNotMatch(rewritten, new RegExp(`href="${item.from.replaceAll('/', '\\/')}"`));
    assert.match(rewritten, new RegExp(`>${item.text}<`));
    assert.doesNotMatch(rewritten, /<a\b/);
  }
});

test('seven root slugs 301 to blog URLs (agencia-seo-internacional stays on middleware inline)', () => {
  for (const [origin, dest] of ROOT_301) {
    assert.equal(SEO_CRUCE_2810_REDIRECTS[origin], dest, origin);
  }
  assert.equal(
    SEO_CRUCE_2810_REDIRECTS['/agencia-seo-internacional-en-el-2025-es-una-necesidad'],
    undefined,
  );
});

test('cashea body: migración alternativa and no pasarela links', () => {
  assert.match(CASHEA_COMERCIOS_BLOG_BODY_HTML, new RegExp(MIGRACION_SEO_ALT_BLOG_PATH.replaceAll('/', '\\/')));
  assert.doesNotMatch(
    CASHEA_COMERCIOS_BLOG_BODY_HTML,
    /href="[^"]*migracion-seo-cambiar-de-plataforma"/,
  );
  assert.doesNotMatch(CASHEA_COMERCIOS_BLOG_BODY_HTML, /pasarela-de-pagos-venezuela/);
  assert.match(CASHEA_COMERCIOS_BLOG_BODY_HTML, /pasarela de pagos en Venezuela/);
});