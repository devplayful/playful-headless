import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  isCmsPaginasB3FromPayload,
  CMS_PAGINAS_B3_FROM_PAYLOAD_ENV,
  cmsPreviewPaginaB3Path,
  paginasB3PayloadPreviewAttrs,
} = await import('../lib/cms-paginas-b3-flag.ts');

const { nosotrosPayloadBody, PAGINAS_B3_SLUGS, NOSOTROS_SEO } = await import(
  '../cms/data/paginas-b3-payload.ts'
);

const nosotrosPage = readFileSync(
  new URL('../app/(frontend)/nosotros/page.tsx', import.meta.url),
  'utf8',
);

const previewPage = readFileSync(
  new URL('../app/(frontend)/cms-pagina-b3-preview/[slug]/page.tsx', import.meta.url),
  'utf8',
);

const nosotrosMetadataHelper = readFileSync(
  new URL('../lib/paginas-codigo/nosotros-metadata.ts', import.meta.url),
  'utf8',
);

const { canonicalForPath } = await import('../utils/canonical.ts');

test('CMS_PAGINAS_B3_FROM_PAYLOAD apagado por defecto', () => {
  assert.equal(isCmsPaginasB3FromPayload({}), false);
  assert.equal(isCmsPaginasB3FromPayload({ [CMS_PAGINAS_B3_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsPaginasB3FromPayload({ [CMS_PAGINAS_B3_FROM_PAYLOAD_ENV]: 'true' }), true);
});

test('Preview ?cms=1 usa ruta interna /cms-pagina-b3-preview/nosotros', () => {
  assert.equal(cmsPreviewPaginaB3Path('nosotros'), '/cms-pagina-b3-preview/nosotros');
});

test('data-cms-source=payload solo en Preview', () => {
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'development';
  assert.deepEqual(paginasB3PayloadPreviewAttrs(), {});
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(paginasB3PayloadPreviewAttrs(), { 'data-cms-source': 'payload' });
  process.env.VERCEL_ENV = prev;
});

test('nosotros mantiene EquipoSection en WordPress con flag apagado', () => {
  assert.match(nosotrosPage, /EquipoSection/);
  assert.match(nosotrosPage, /isCmsPaginasB3FromPayload\(\)/);
  assert.match(nosotrosPage, /NosotrosView/);
});

test('seed B3 define nosotros con checksum', () => {
  assert.deepEqual(PAGINAS_B3_SLUGS, ['nosotros']);
  const body = nosotrosPayloadBody();
  assert.equal(body.bloque, 'b3');
  assert.match(String(body.content.checksum), /^[a-f0-9]{64}$/);
  assert.equal(body.yoast.canonical, 'https://playfulagency.com/nosotros');
});

test('metadatos nosotros (canonical público, patrón H6)', () => {
  assert.equal(NOSOTROS_SEO.title, 'Agencia ecommerce Playful | Nosotros');
  assert.equal(canonicalForPath('/nosotros'), 'https://playfulagency.com/nosotros');
  assert.match(nosotrosMetadataHelper, /buildNosotrosMetadata/);
  assert.match(previewPage, /generateNosotrosMetadata/);
  assert.match(nosotrosPage, /generateNosotrosMetadata/);
});

test('middleware Preview ?cms=1 reescribe nosotros', () => {
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /isPaginasB3Slug/);
  assert.match(middleware, /x-cms-paginas-b3-preview/);
});
