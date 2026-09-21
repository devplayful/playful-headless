import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const addons = readFileSync(
  new URL('../utils/soytechno-addons.ts', import.meta.url),
  'utf8',
);
const figma = readFileSync(
  new URL('../utils/soytechno-figma-copy.ts', import.meta.url),
  'utf8',
);

test('document title follows the Figma hero, not SEO v3/v4 packs', () => {
  assert.match(addons, /SOYTECHNO: Transformación 100% Centrada en el Usuario/);
  assert.doesNotMatch(addons, /el eCommerce que entendió cómo compra Venezuela/);
  assert.doesNotMatch(addons, /de comprar tech por WhatsApp/);
  assert.doesNotMatch(figma, /Cashea y pasarela de pagos en Venezuela en el mismo checkout/);
});
