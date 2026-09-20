import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const storySource = readFileSync(
  new URL('../utils/soytechno-case-study.ts', import.meta.url),
  'utf8',
);
const page = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const figma = readFileSync(
  new URL('../utils/soytechno-figma-copy.ts', import.meta.url),
  'utf8',
);
const body = readFileSync(
  new URL('../components/soytechno/SoyTechnoFigmaBody.tsx', import.meta.url),
  'utf8',
);
const sitemap = readFileSync(
  new URL('../utils/apex-sitemap.ts', import.meta.url),
  'utf8',
);

test('SoyTechno code override uses the José GO slug', () => {
  assert.match(storySource, /export const SOYTECHNO_CASE_STUDY_SLUG = 'soytechno-ecommerce-venezuela'/);
  assert.match(sitemap, /\/casos-de-exito\/soytechno-ecommerce-venezuela/);
});

test('SoyTechno detail renders the literal Figma body, not Jumex or CIMA', () => {
  assert.match(page, /return <SoyTechnoFigmaBody \/>;/);
  assert.match(body, /SoyTechnoFigmaBody/);
  assert.match(figma, /SOYTECHNO: Transformación 100% Centrada en el Usuario/);
  assert.match(figma, /El Desafío UX\/UI: De un Catálogo Inusable a una Navegación Intuitiva/);
  assert.match(figma, /¿Tu E-commerce está listo para el nivel de un Web App\?/);
  assert.match(figma, /Eva Luciani/);
  assert.doesNotMatch(figma, /Tras su soft launch/);
  assert.doesNotMatch(figma, /Tienda online en Venezuela: del chat informal/);
  assert.doesNotMatch(figma, /de comprar tech por WhatsApp/);
  assert.doesNotMatch(body, /SoyTechnoSectionA/);
});
