import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  isCmsPaginasB1FromPayload,
  CMS_PAGINAS_B1_FROM_PAYLOAD_ENV,
  cmsPreviewPaginaB1Path,
  paginasB1PayloadPreviewAttrs,
} = await import('../lib/cms-paginas-b1-flag.ts');

const { politicaPrivacidadPayloadBody, PAGINAS_B1_SLUGS } = await import(
  '../cms/data/paginas-b1-payload.ts'
);

const politicaPage = readFileSync(
  new URL('../app/(frontend)/politica-de-privacidad/page.tsx', import.meta.url),
  'utf8',
);

test('CMS_PAGINAS_B1_FROM_PAYLOAD apagado por defecto', () => {
  assert.equal(isCmsPaginasB1FromPayload({}), false);
  assert.equal(isCmsPaginasB1FromPayload({ [CMS_PAGINAS_B1_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsPaginasB1FromPayload({ [CMS_PAGINAS_B1_FROM_PAYLOAD_ENV]: 'true' }), true);
});

test('Preview ?cms=1 usa ruta interna sin searchParams en la página pública', () => {
  assert.equal(
    cmsPreviewPaginaB1Path('politica-de-privacidad'),
    '/cms-pagina-b1-preview/politica-de-privacidad',
  );
});

test('data-cms-source=payload solo en Preview', () => {
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'development';
  assert.deepEqual(paginasB1PayloadPreviewAttrs(), {});
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(paginasB1PayloadPreviewAttrs(), { 'data-cms-source': 'payload' });
  process.env.VERCEL_ENV = prev;
});

test('política de privacidad sigue renderizando vista congelada cuando el flag está apagado', () => {
  assert.match(politicaPage, /PoliticaPrivacidadView/);
  assert.match(politicaPage, /isCmsPaginasB1FromPayload\(\)/);
});

test('seed B1 define un slug legal con checksum', () => {
  assert.deepEqual(PAGINAS_B1_SLUGS, ['politica-de-privacidad']);
  const body = politicaPrivacidadPayloadBody();
  assert.equal(body.slug, 'politica-de-privacidad');
  assert.equal(body.bloque, 'b1');
  assert.match(String(body.content.checksum), /^[a-f0-9]{64}$/);
});
