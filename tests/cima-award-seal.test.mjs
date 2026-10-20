import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { cimaSealSrc, cimaSealDisplayHeight, CIMA_SEAL_ASSETS, buildCimaSealPictureHtml } =
  await import('../lib/cima-award-seal.ts');

const injectSource = readFileSync(
  new URL('../utils/cima-seal-elementor-inject.ts', import.meta.url),
  'utf8',
);

test('cima seal picks compact asset below 200px width', () => {
  assert.equal(
    cimaSealSrc('agency', 199),
    CIMA_SEAL_ASSETS.agency.compact,
  );
  assert.equal(
    cimaSealSrc('agency', 200),
    CIMA_SEAL_ASSETS.agency.full,
  );
  assert.equal(cimaSealDisplayHeight(220), 275);
});

test('elementor inject is wired for agencia-e-commerce client carousel', () => {
  const elementor = readFileSync(
    new URL('../components/ElementorPageContent.tsx', import.meta.url),
    'utf8',
  );
  assert.match(elementor, /injectCimaSealAgenciaEcommerce/);
  assert.match(injectSource, /data-id="d0fefa4"/);
  assert.match(injectSource, /buildCimaSealPictureHtml\('agency'\)/);
  const html = buildCimaSealPictureHtml('agency');
  assert.match(html, /playful-cima-award-seal/);
  assert.match(html, /d3-escudo-playful-oscuro/);
  assert.match(html, /Premios CIMA 2026, ganadores en Plataforma de E-commerce/);
});

test('home testimonials and SoyTechno case study render CimaAwardSeal', () => {
  const testimonials = readFileSync(
    new URL('../app/casos-de-exito/TestimonialsSection.tsx', import.meta.url),
    'utf8',
  );
  const soytechno = readFileSync(
    new URL('../components/soytechno/SoyTechnoCaseStudy.tsx', import.meta.url),
    'utf8',
  );
  const sealComponent = readFileSync(
    new URL('../components/CimaAwardSeal.tsx', import.meta.url),
    'utf8',
  );
  assert.match(testimonials, /<CimaAwardSeal variant="agency"/);
  assert.match(soytechno, /<CimaAwardSeal variant="soytechno"/);
  assert.match(sealComponent, /<picture>/);
});

test('public sellos-cima SVG assets exist', () => {
  for (const file of [
    'd3-escudo-playful-oscuro.svg',
    'd3-escudo-playful-oscuro-compacto.svg',
    'd3-escudo-soytechno-oscuro.svg',
    'd3-escudo-soytechno-oscuro-compacto.svg',
  ]) {
    readFileSync(new URL(`../public/sellos-cima/${file}`, import.meta.url));
  }
});
