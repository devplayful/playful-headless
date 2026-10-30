import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  isCmsPaginasB5FromPayload,
  CMS_PAGINAS_B5_FROM_PAYLOAD_ENV,
  cmsPreviewPaginaB5Path,
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
const previewNotFoundPage = readFileSync(
  new URL('../app/(frontend)/cms-pagina-b5-preview/not-found/page.tsx', import.meta.url),
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

test('Preview ?cms=1 en URL desconocida reescribe a cms-pagina-b5-preview/not-found con 404', () => {
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /isKnownPublicAppPath/);
  assert.match(middleware, /cmsPreviewPaginaB5Path\('not-found'\)/);
  assert.match(middleware, /NextResponse\.rewrite\(target, \{ status: 404 \}\)/);
  assert.equal(cmsPreviewPaginaB5Path('not-found'), '/cms-pagina-b5-preview/not-found');
});

test('not-found.tsx no importa Payload ni rutas B5 (congelado como fase1)', () => {
  assert.match(notFoundPage, /NotFoundHeaderHider/);
  assert.match(notFoundPage, /export default function NotFound/);
  assert.doesNotMatch(notFoundPage, /cms-paginas-b5|NotFoundView|Payload|paginas-b5/);
  assert.doesNotMatch(globalNotFound, /cms-paginas-b5|NotFoundView|payloadSlug/);
});

test('ruta interna preview B5 pinta NotFoundView con data-cms-source en Preview', () => {
  assert.match(previewNotFoundPage, /NotFoundView/);
  assert.match(previewNotFoundPage, /paginasB5PayloadPreviewAttrs/);
  assert.match(previewNotFoundPage, /paginaCodigoContentMatchesSeed/);
  assert.match(previewNotFoundPage, /robots: 'noindex'/);
  assert.doesNotMatch(previewNotFoundPage, /follow:\s*true/);
  assert.match(notFoundView, /Página no encontrada/);
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
