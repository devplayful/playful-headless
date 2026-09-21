import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const overrides = readFileSync(
  new URL('../utils/public-case-study-overrides.ts', import.meta.url),
  'utf8',
);
const soytechnoBody = readFileSync(
  new URL('../components/soytechno/SoyTechnoCaseStudy.tsx', import.meta.url),
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

test('SoyTechno H1, title and og:title share the signed José GO string', () => {
  assert.match(
    overrides,
    /'soytechno-ecommerce-venezuela':/,
  );
  assert.match(
    overrides,
    /SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela/,
  );
  assert.match(
    overrides,
    /Caso tienda online Venezuela: SoyTechno con Cashea en checkout, pagos multimoneda y MRW rastreo/,
  );
  assert.match(
    soytechnoBody,
    /<h1>SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela<\/h1>/,
  );
  assert.doesNotMatch(
    soytechnoBody,
    /<h1>SOYTECHNO: Transformación 100% Centrada en el Usuario<\/h1>/,
  );
  assert.doesNotMatch(overrides, /entendió cómo compra Venezuela/);
  assert.doesNotMatch(soytechnoBody, /Tienda online en Venezuela/);
});

test('SoyTechno Figma body keeps the Contento literals that PR #71 had condensed', () => {
  assert.match(soytechnoBody, /Si el usuario está en Teléfonos, los filtros muestran RAM/);
  assert.match(soytechnoBody, /lateral izquierdo en escritorio/);
  assert.match(soytechnoBody, /un detalle que casi nunca se trabaja/);
  assert.match(soytechnoBody, /consumiendo el precio vía método GET/);
  assert.match(soytechnoBody, /La carga de asesores es asíncrona/);
  assert.match(soytechnoBody, /nunca se ha tenido queja de que el producto se perdió/);
  assert.match(soytechnoBody, /<span>SoyTechno<\/span>/);
  assert.match(soytechnoBody, /href="\/reunion-playful"/);
  assert.match(soytechnoBody, /jumex-shopify-dtc-ecommerce/);
  assert.match(soytechnoBody, /odwalla-shopify-dtc-ecommerce/);
  assert.doesNotMatch(soytechnoBody, />Odwalla<\/span>/);
});

test('applyPublicCaseStudyOverrides is a pass-through so WordPress ACF is used', () => {
  assert.match(
    overrides,
    /export function applyPublicCaseStudyOverrides[\s\S]*\{\s*return story;\s*\}/,
  );
});
