import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { isCmsServiciosFromPayload, CMS_SERVICIOS_FROM_PAYLOAD_ENV, PAYLOAD_SERVICIO_SLUGS } =
  await import('../lib/cms-servicios-flag.ts');
const { agenciaShopifyPayloadBlocks } = await import('../cms/data/agencia-shopify-payload.ts');
const slugPage = readFileSync(
  new URL('../app/(frontend)/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const shopifyPage = readFileSync(
  new URL('../app/(frontend)/agencia-shopify/page.tsx', import.meta.url),
  'utf8',
);
const previewPage = readFileSync(
  new URL('../app/(frontend)/__preview_cms_servicio/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const seed = readFileSync(new URL('../scripts/seed-servicios.ts', import.meta.url), 'utf8');

test('CMS_SERVICIOS_FROM_PAYLOAD is off by default and covers six service slugs', () => {
  assert.equal(isCmsServiciosFromPayload({}), false);
  assert.equal(isCmsServiciosFromPayload({ [CMS_SERVICIOS_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsServiciosFromPayload({ [CMS_SERVICIOS_FROM_PAYLOAD_ENV]: 'true' }), true);
  assert.equal(PAYLOAD_SERVICIO_SLUGS.length, 6);
  assert.deepEqual(PAYLOAD_SERVICIO_SLUGS.includes('agencia-shopify'), true);
});

test('Preview opt-in ?cms=1 enables Payload render without touching Production', async () => {
  const { parseCmsPreviewQuery, shouldRenderServiciosFromPayload } = await import(
    '../lib/cms-servicios-flag.ts'
  );
  assert.equal(shouldRenderServiciosFromPayload(true, { VERCEL_ENV: 'production' }), false);
  assert.equal(shouldRenderServiciosFromPayload(true, { VERCEL_ENV: 'preview' }), true);
  assert.equal(parseCmsPreviewQuery({ cms: '1' }), true);
  assert.equal(parseCmsPreviewQuery({ cms: '0' }), false);
});

test('Preview opt-in ?cms=1 rewrites to internal Payload route without dynamizing [slug]', () => {
  assert.match(middlewareSource, /searchParams\.get\('cms'\) === '1'/);
  assert.match(middlewareSource, /cmsPreviewServicioPath/);
  assert.match(previewPage, /renderFromPayload: true/);
  assert.match(previewPage, /ServicioPayloadRenderer/);
  assert.doesNotMatch(slugPage, /searchParams/);
});

test('slug and shopify pages gate Payload behind CMS_SERVICIOS_FROM_PAYLOAD only', () => {
  assert.match(slugPage, /shouldRenderServiciosFromPayload\(false\)/);
  assert.match(slugPage, /findServicioBySlug\(slug, \{ renderFromPayload: true \}\)/);
  assert.match(shopifyPage, /shouldRenderServiciosFromPayload\(false\)/);
  assert.match(shopifyPage, /findServicioBySlug\('agencia-shopify'/);
  assert.doesNotMatch(shopifyPage, /searchParams/);
});

test('shopify seed blocks mirror copy.ts sections without inventing copy', () => {
  const blocks = agenciaShopifyPayloadBlocks();
  const types = blocks.map((b) => b.blockType);
  assert.ok(types.includes('hero'));
  assert.ok(types.includes('tarjetas'));
  assert.ok(types.includes('faq'));
  assert.ok(types.includes('cta'));
  assert.match(seed, /fetchServicioPageBySlug/);
  assert.match(seed, /agenciaShopifyPayloadData/);
});
