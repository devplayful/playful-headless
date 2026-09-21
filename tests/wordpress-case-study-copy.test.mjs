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

test('SoyTechno keeps the approved CIMA title and SEO override', () => {
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
    /title: 'SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela'/,
  );
  assert.match(soytechnoBody, /<h1>\{approvedCopy\.title\}<\/h1>/);
  assert.doesNotMatch(
    soytechnoBody,
    /<h1>SOYTECHNO: Transformación 100% Centrada en el Usuario<\/h1>/,
  );
  assert.doesNotMatch(overrides, /entendió cómo compra Venezuela/);
  assert.doesNotMatch(soytechnoBody, /Tienda online en Venezuela/);
});

test('SoyTechno editorial H2/H3 labels match the signed SEO set', () => {
  assert.match(soytechnoBody, /Panorama del eCommerce en Venezuela y el desafío de confianza/);
  assert.match(soytechnoBody, /Audiencia: quién compra tecnología online en Venezuela/);
  assert.match(soytechnoBody, /Objetivos de negocio 2025/);
  assert.match(soytechnoBody, /Cómo la estrategia respondió al insight/);
  assert.match(soytechnoBody, /Medios clave: Cashea, MRW y checkout/);
  assert.match(soytechnoBody, /Recursos, técnicas y herramientas/);
  assert.match(soytechnoBody, /Aporte al eCommerce formal en Venezuela/);
  assert.match(soytechnoBody, /Prueba de que la estrategia funcionó/);
  assert.match(soytechnoBody, /Resultados frente a los KPIs iniciales/);
  assert.doesNotMatch(soytechnoBody, /¿Como su idea estratégica abordó directamente el insight/);
  assert.doesNotMatch(soytechnoBody, /Por favor mencione cuáles fueron sus medios claves/);
});

test('SoyTechno body uses the approved CIMA case-study copy', () => {
  assert.match(soytechnoBody, /Tras su soft launch, SoyTechno debía consolidar su eCommerce/);
  assert.match(soytechnoBody, /El venezolano no compra tecnología; la planifica/);
  assert.match(soytechnoBody, /En 2025, el eCommerce venezolano creció \+125% \(Cavecom-e\)/);
  assert.match(soytechnoBody, /Con un enfoque trimestral \(Q1: Reconocimiento, Q2: Expansión/);
  assert.match(soytechnoBody, /el 44,48% de las sesiones llegó de forma directa/);
  assert.match(soytechnoBody, /SoyTechno arrancó diciembre de 2024 con 99\.384 usuarios activos mensuales/);
  assert.match(soytechnoBody, /SoyTechno demostró que el eCommerce formal, automatizado y de alta gama es viable en Venezuela/);
  assert.doesNotMatch(soytechnoBody, /consumiendo el precio vía método GET/);
  assert.doesNotMatch(soytechnoBody, /La carga de asesores es asíncrona/);
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
