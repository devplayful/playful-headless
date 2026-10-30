import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const {
  isCmsPaginasB4FromPayload,
  CMS_PAGINAS_B4_FROM_PAYLOAD_ENV,
  cmsPreviewPaginaB4Path,
  paginasB4PayloadPreviewAttrs,
} = await import('../lib/cms-paginas-b4-flag.ts');

const { paginasB4SeedBodyForSlug, PAGINAS_B4_SLUGS } = await import(
  '../cms/data/paginas-b4-payload.ts'
);

const previewPage = readFileSync(
  new URL('../app/(frontend)/cms-pagina-b4-preview/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const contactPage = readFileSync(
  new URL('../app/(frontend)/contactar-agencia-de-marketing-digital/page.tsx', import.meta.url),
  'utf8',
);
const contactClient = readFileSync(
  new URL('../app/(frontend)/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', import.meta.url),
  'utf8',
);
const reunionPage = readFileSync(
  new URL('../app/(frontend)/reunion-playful/page.tsx', import.meta.url),
  'utf8',
);
const reunionRedirect = readFileSync(
  new URL('../app/(frontend)/reunion-playful/ReunionPlayfulRedirect.tsx', import.meta.url),
  'utf8',
);

test('CMS_PAGINAS_B4_FROM_PAYLOAD apagado por defecto', () => {
  assert.equal(isCmsPaginasB4FromPayload({}), false);
  assert.equal(isCmsPaginasB4FromPayload({ [CMS_PAGINAS_B4_FROM_PAYLOAD_ENV]: 'true' }), true);
});

test('Preview ?cms=1 reescribe slugs B4 a cms-pagina-b4-preview', () => {
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /isPaginasB4Slug\(slug\)/);
  assert.match(middleware, /cmsPreviewPaginaB4Path\(slug\)/);
  assert.equal(
    cmsPreviewPaginaB4Path('contactar-agencia-de-marketing-digital'),
    '/cms-pagina-b4-preview/contactar-agencia-de-marketing-digital',
  );
});

test('páginas públicas B4 sin diff respecto a fase1', () => {
  const paths = [
    'app/(frontend)/contactar-agencia-de-marketing-digital/page.tsx',
    'app/(frontend)/contactar-agencia-de-marketing-digital/ContactPageClient.tsx',
    'app/(frontend)/reunion-playful/page.tsx',
    'app/(frontend)/reunion-playful/ReunionPlayfulRedirect.tsx',
  ];
  for (const file of paths) {
    const diff = execSync(`git diff origin/cursor/cms-payload-fase1 -- "${file}"`, {
      encoding: 'utf8',
    }).trim();
    assert.equal(diff, '', `${file} debe ser idéntico a fase1`);
  }
});

test('preview B4 reutiliza clientes de prod y solo añade data-cms-source', () => {
  assert.match(previewPage, /export const dynamic = 'force-dynamic'/);
  assert.doesNotMatch(previewPage, /generateStaticParams/);
  assert.match(previewPage, /ContactPageClient/);
  assert.match(previewPage, /ReunionPlayfulRedirect/);
  assert.match(previewPage, /paginasB4PayloadPreviewAttrs/);
  assert.match(previewPage, /generateContactoMetadata/);
  assert.match(previewPage, /generateReunionPlayfulMetadata/);
  assert.doesNotMatch(contactPage, /cms-paginas-b4|paginas-b4/);
  assert.doesNotMatch(contactClient, /cms-paginas-b4|paginas-b4/);
  assert.doesNotMatch(reunionPage, /cms-paginas-b4|paginas-b4/);
  assert.doesNotMatch(reunionRedirect, /cms-paginas-b4|paginas-b4/);
});

test('seed B4 define contacto y reunión', () => {
  assert.deepEqual(PAGINAS_B4_SLUGS, [
    'contactar-agencia-de-marketing-digital',
    'reunion-playful',
  ]);
  for (const slug of PAGINAS_B4_SLUGS) {
    const body = paginasB4SeedBodyForSlug(slug);
    assert.equal(body.bloque, 'b4');
    assert.match(String(body.content.checksum), /^[a-f0-9]{64}$/);
  }
});

test('data-cms-source=payload solo en Preview', () => {
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(paginasB4PayloadPreviewAttrs(), { 'data-cms-source': 'payload' });
  process.env.VERCEL_ENV = prev;
});
