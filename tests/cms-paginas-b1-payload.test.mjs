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

const previewPage = readFileSync(
  new URL('../app/(frontend)/cms-pagina-b1-preview/[slug]/page.tsx', import.meta.url),
  'utf8',
);

const politicaMetadataHelper = readFileSync(
  new URL('../lib/paginas-codigo/politica-privacidad-metadata.ts', import.meta.url),
  'utf8',
);

const { POLITICA_PRIVACIDAD_SEO } = await import('../cms/data/paginas-b1-payload.ts');
const { canonicalForPath } = await import('../utils/canonical.ts');

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
  assert.equal(
    body.yoast.canonical,
    'https://playfulagency.com/politica-de-privacidad',
  );
});

test('metadatos públicos de política (canonical URL pública, no preview)', () => {
  const publicCanonical = canonicalForPath('/politica-de-privacidad');
  assert.equal(POLITICA_PRIVACIDAD_SEO.title, 'Política de Privacidad | Playful Agency');
  assert.equal(
    POLITICA_PRIVACIDAD_SEO.description,
    'Conoce cómo protegemos tu información personal en Playful Agency. Política de privacidad actualizada.',
  );
  assert.equal(publicCanonical, 'https://playfulagency.com/politica-de-privacidad');
  assert.match(politicaMetadataHelper, /buildPoliticaPrivacidadMetadata/);
  assert.match(politicaMetadataHelper, /canonicalForPath\(POLITICA_PRIVACIDAD_PUBLIC_PATH\)/);
  assert.match(politicaMetadataHelper, /twitterFromOpenGraph\(ogTitle, ogDescription\)/);
});

test('Preview B1 exporta generateMetadata reutilizando el helper de política', () => {
  assert.match(previewPage, /export async function generateMetadata/);
  assert.match(previewPage, /generatePoliticaPrivacidadMetadata/);
  assert.match(politicaPage, /generatePoliticaPrivacidadMetadata/);
  assert.doesNotMatch(previewPage, /cms-pagina-b1-preview.*canonical/i);
});
