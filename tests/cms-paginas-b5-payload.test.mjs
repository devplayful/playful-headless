import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  isCmsPaginasB5FromPayload,
  CMS_PAGINAS_B5_FROM_PAYLOAD_ENV,
  CMS_PAGINAS_B5_PREVIEW_HEADER,
  paginasB5PayloadPreviewAttrs,
} = await import('../lib/cms-paginas-b5-flag.ts');

const { paginasB5SeedBodyForSlug, PAGINAS_B5_SLUGS } = await import(
  '../cms/data/paginas-b5-payload.ts'
);

const notFoundPage = readFileSync(
  new URL('../app/(frontend)/not-found.tsx', import.meta.url),
  'utf8',
);
const globalNotFound = readFileSync(
  new URL('../app/global-not-found.tsx', import.meta.url),
  'utf8',
);
const notFoundView = readFileSync(
  new URL('../components/paginas-codigo/NotFoundView.tsx', import.meta.url),
  'utf8',
);

test('CMS_PAGINAS_B5_FROM_PAYLOAD apagado por defecto', () => {
  assert.equal(isCmsPaginasB5FromPayload({}), false);
  assert.equal(isCmsPaginasB5FromPayload({ [CMS_PAGINAS_B5_FROM_PAYLOAD_ENV]: 'true' }), true);
});

test('Preview ?cms=1 en URL desconocida reescribe a _not-found con header B5', () => {
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /isKnownPublicAppPath/);
  assert.match(middleware, /CMS_PAGINAS_B5_PREVIEW_HEADER/);
  assert.match(middleware, /requestHeaders\.set\(CMS_PAGINAS_B5_PREVIEW_HEADER, 'not-found'\)/);
});

test('404 mantiene búsqueda cliente en NotFoundView', () => {
  assert.match(notFoundView, /NotFoundSearchForm/);
  assert.match(notFoundView, /NotFoundHeaderHider/);
  assert.match(notFoundPage, /NotFoundView/);
});

test('seed B5 define not-found y global-not-found', () => {
  assert.deepEqual(PAGINAS_B5_SLUGS, ['not-found', 'global-not-found']);
  for (const slug of PAGINAS_B5_SLUGS) {
    const body = paginasB5SeedBodyForSlug(slug);
    assert.equal(body.bloque, 'b5');
    assert.match(String(body.content.checksum), /^[a-f0-9]{64}$/);
  }
});

test('data-cms-source=payload solo en Preview', () => {
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(paginasB5PayloadPreviewAttrs(), { 'data-cms-source': 'payload' });
  process.env.VERCEL_ENV = prev;
});

test('global-not-found verifica slug global-not-found con flag', () => {
  assert.match(globalNotFound, /ensurePaginasB5NotFoundRender\('global-not-found'\)/);
});
