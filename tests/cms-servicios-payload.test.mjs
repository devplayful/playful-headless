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
const seed = readFileSync(new URL('../scripts/seed-servicios.ts', import.meta.url), 'utf8');

test('CMS_SERVICIOS_FROM_PAYLOAD is off by default and covers six service slugs', () => {
  assert.equal(isCmsServiciosFromPayload({}), false);
  assert.equal(isCmsServiciosFromPayload({ [CMS_SERVICIOS_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsServiciosFromPayload({ [CMS_SERVICIOS_FROM_PAYLOAD_ENV]: 'true' }), true);
  assert.equal(PAYLOAD_SERVICIO_SLUGS.length, 6);
  assert.deepEqual(PAYLOAD_SERVICIO_SLUGS.includes('agencia-shopify'), true);
});

test('slug and shopify pages gate Payload behind the flag', () => {
  assert.match(slugPage, /isCmsServiciosFromPayload\(\)/);
  assert.match(slugPage, /findServicioBySlug\(slug\)/);
  assert.match(slugPage, /ServicioPayloadRenderer/);
  assert.match(shopifyPage, /isCmsServiciosFromPayload\(\)/);
  assert.match(shopifyPage, /findServicioBySlug\('agencia-shopify'\)/);
});

test('shopify seed blocks mirror copy.ts sections without inventing copy', () => {
  const blocks = agenciaShopifyPayloadBlocks();
  const types = blocks.map((b) => b.blockType);
  assert.ok(types.includes('hero'));
  assert.ok(types.includes('tarjetas'));
  assert.ok(types.includes('faq'));
  assert.ok(types.includes('cta'));
  assert.match(seed, /getPageBySlug/);
  assert.match(seed, /agenciaShopifyPayloadData/);
});
