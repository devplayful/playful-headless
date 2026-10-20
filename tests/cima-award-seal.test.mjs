import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { buildCimaCelebrationBreakerHtml, CIMA_PREMIOS_URL } = await import('../lib/cima-breaker.ts');

const injectSource = readFileSync(
  new URL('../utils/cima-seal-elementor-inject.ts', import.meta.url),
  'utf8',
);

test('elementor inject places celebration breaker before results section', () => {
  const elementor = readFileSync(
    new URL('../components/ElementorPageContent.tsx', import.meta.url),
    'utf8',
  );
  assert.match(elementor, /injectCimaSealAgenciaEcommerce/);
  assert.match(injectSource, /elementor-element-b43f202/);
  assert.match(injectSource, /buildCimaCelebrationBreakerHtml\('ecommerce'\)/);
  const html = buildCimaCelebrationBreakerHtml('ecommerce');
  assert.match(html, /cima-breaker--celebration/);
  assert.match(html, /d3-escudo-playful-oscuro\.svg/);
  assert.match(html, new RegExp(CIMA_PREMIOS_URL.replace('.', '\\.')));
  assert.match(html, /rel="noopener"/);
  assert.match(
    html,
    /Playful Agency, agencia reconocida en los Premios CIMA 2026, categoría Plataforma de E-commerce/,
  );
});

test('home, e-commerce inject, and SoyTechno use CIMA breakers', () => {
  const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const soytechno = readFileSync(
    new URL('../components/soytechno/SoyTechnoCaseStudy.tsx', import.meta.url),
    'utf8',
  );
  const testimonials = readFileSync(
    new URL('../app/casos-de-exito/TestimonialsSection.tsx', import.meta.url),
    'utf8',
  );
  assert.match(home, /<CimaCelebrationBreaker variant="home"/);
  assert.match(soytechno, /<CimaSoytechnoRibbonBreaker/);
  assert.doesNotMatch(testimonials, /CimaAwardSeal/);
  assert.doesNotMatch(soytechno, /CimaAwardSeal/);
});

test('public sellos-cima assets exist', () => {
  for (const file of [
    'd3-escudo-playful-oscuro.svg',
    'd3-escudo-playful-oscuro-compacto.svg',
    'd3-escudo-soytechno-oscuro.svg',
    'd3-escudo-soytechno-oscuro-compacto.svg',
    'final/breaker-home-A-desktop.svg',
    'final/breaker-ecommerce-A-desktop.svg',
    'final/breaker-soytechno-C-desktop.svg',
  ]) {
    readFileSync(new URL(`../public/sellos-cima/${file}`, import.meta.url));
  }
});
