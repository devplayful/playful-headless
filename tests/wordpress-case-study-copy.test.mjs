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

test('SoyTechno H1 uses CIMA casing and SERP title stays on the envelope string', () => {
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
    /Caso tienda online Venezuela: SoyTechno con Cashea en checkout, pagos multimoneda y MRW rastreo\. Cómo compra y confía el mercado fuera del chat informal/,
  );
  assert.match(
    soytechnoBody,
    /<h1>SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela<\/h1>/,
  );
  assert.doesNotMatch(
    soytechnoBody,
    /<h1>SOYTECHNO: Transformación 100% Centrada en el Usuario<\/h1>/,
  );
  assert.doesNotMatch(overrides, /entendió cómo compra Venezuela/);
  assert.doesNotMatch(soytechnoBody, /Tienda online en Venezuela/);
});

test('SoyTechno body is CIMA verbatim in the existing Figma slots', () => {
  assert.match(soytechnoBody, /cansado de la informalidad/);
  assert.match(soytechnoBody, /El Desafío y el Contexto Estratégico \(La Misión\)/);
  assert.match(soytechnoBody, /67% de compras en divisas, BNPL creciendo \+250%/);
  assert.match(soytechnoBody, /eCommerce venezolano creció \+125% \(Cavecom-e\)/);
  assert.match(soytechnoBody, /Estrategia y Ejecución \(La Solución\)/);
  assert.match(soytechnoBody, /¿Como su idea estratégica abordó directamente el insight/);
  assert.match(soytechnoBody, /primera integración nativa de Cashea/);
  assert.match(soytechnoBody, /picos de 31\.000 usuarios diarios/);
  assert.match(soytechnoBody, /816\.000 vistas en el año/);
  assert.match(soytechnoBody, /Innovación y Aporte \(Técnica y Trascendencia\)/);
  assert.match(soytechnoBody, /filtros adaptativos bajaron el rebote a 11%/);
  assert.match(soytechnoBody, /2,8 millones de usuarios activos/);
  assert.match(soytechnoBody, /tasa de conversión global del 2,57%/);
  assert.match(soytechnoBody, /99\.384 usuarios activos mensuales/);
  assert.match(soytechnoBody, /Eva Cristina Luciani/);
  assert.match(soytechnoBody, /e-Commerce Manager de Soytechno\.com/);
  assert.match(soytechnoBody, /comparador de productos/);
  assert.match(soytechnoBody, /Agenda una reunión/);
  assert.match(soytechnoBody, /<span>SoyTechno<\/span>/);
  assert.match(soytechnoBody, /href="\/reunion-playful"/);
  assert.match(soytechnoBody, /jumex-shopify-dtc-ecommerce/);
  assert.match(soytechnoBody, /odwalla-shopify-dtc-ecommerce/);
  assert.doesNotMatch(soytechnoBody, /consumiendo el precio vía método GET/);
  assert.doesNotMatch(soytechnoBody, /No tenemos que estar detrás de ustedes/);
  assert.doesNotMatch(soytechnoBody, />Odwalla<\/span>/);
});

test('applyPublicCaseStudyOverrides is a pass-through so WordPress ACF is used', () => {
  assert.match(
    overrides,
    /export function applyPublicCaseStudyOverrides[\s\S]*\{\s*return story;\s*\}/,
  );
});
