import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const categoryRedirects = require('../utils/blog-category-redirect-map.json');
const canibalizacionOrigins = require('../utils/blog-canibalizacion-redirect-map.json');
const seoServiceRedirects = require('../utils/seo-service-redirect-map.json');
const { mergeCanibalizacionIntoPermanent301 } = await import(
  '../utils/blog-canibalizacion-redirects.ts'
);

const DEST = '/contactar-agencia-de-marketing-digital';
const permanent301 = mergeCanibalizacionIntoPermanent301(
  {
    '/servicios': '/agencia-e-commerce',
    '/services': '/agencia-e-commerce',
    '/contacto': DEST,
    '/contactar': DEST,
    '/contactanos': DEST,
    ...seoServiceRedirects,
    ...canibalizacionOrigins,
  },
  categoryRedirects,
);

test('PERMANENT_301 incluye /contactar junto a /contacto', () => {
  assert.equal(permanent301['/contactar'], DEST);
  assert.equal(permanent301['/contacto'], DEST);
});

test('middleware matcher y mapa incluyen /contactar', () => {
  const src = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(src, /['"]\/contactar['"]: '\/contactar-agencia-de-marketing-digital'/);
  assert.match(src, /['"]\/contactar['"],[\s\S]*['"]\/contactar\/['"],/);
});