import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const overrides = readFileSync(
  new URL('../utils/public-case-study-overrides.ts', import.meta.url),
  'utf8',
);

test('Jumex and Odwalla no longer ship the PR #27 technical-scope rewrite', () => {
  assert.doesNotMatch(overrides, /JUMEX: implementación de ecommerce en Shopify/);
  assert.doesNotMatch(overrides, /ODWALLA: implementación de ecommerce en Shopify/);
  assert.doesNotMatch(overrides, /Componentes técnicos documentados/);
  assert.doesNotMatch(overrides, /sin atribuir métricas comerciales/);
  assert.doesNotMatch(overrides, /testimonialnombre: ''/);
});

test('case SEO titles match the pre-PR #27 CASO_SEO_OVERRIDES (233ea6e)', () => {
  assert.match(overrides, /Jumex Shopify DTC: canal propio para un catálogo grande/);
  assert.match(
    overrides,
    /Construimos el canal DTC de Jumex en Shopify\. Catálogo grande y pedido propio en jumexus\.com/,
  );
  assert.match(overrides, /Odwalla Shopify DTC: de sitio informativo a tienda/);
  assert.match(
    overrides,
    /Odwalla tenía web y visitas, no carrito\. En Shopify armamos el canal DTC en odwalladrinks\.com/,
  );
});

test('applyPublicCaseStudyOverrides is a pass-through so WordPress ACF is used', () => {
  assert.match(
    overrides,
    /export function applyPublicCaseStudyOverrides[\s\S]*\{\s*return story;\s*\}/,
  );
});
