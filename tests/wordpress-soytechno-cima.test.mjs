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

test('SoyTechno is mobile-first with a desktop Figma lock from lg up', () => {
  assert.match(body, /SoyTechnoMobile/);
  assert.match(body, /className="lg:hidden"/);
  assert.match(body, /className="hidden lg:block"/);
  assert.match(body, /height=\{656\}/);
  assert.match(body, /height=\{1196\}/);
  assert.match(body, /height=\{1400\}/);
  assert.doesNotMatch(body, /x=\{-349\}/);
  assert.match(body, /mobile-screen-04\.png/);
  assert.match(body, /section-c-ipad\.png/);
  assert.doesNotMatch(body, /soytechno-section-c[\s\S]{0,400}giffycanvas-01/);
  assert.match(body, /rectangle-147-catalog\.png/);
});

test('SoyTechno mobile stack covers the Figma narrative', () => {
  const mobile = readFileSync(
    new URL('../components/soytechno/SoyTechnoMobile.tsx', import.meta.url),
    'utf8',
  );
  assert.match(mobile, /id="soytechno-m-hero"/);
  assert.match(mobile, /<h1 className=/);
  assert.match(mobile, /id="soytechno-m-desafio"/);
  assert.match(mobile, /id="soytechno-m-a"/);
  assert.match(mobile, /id="soytechno-m-b"/);
  assert.match(mobile, /id="soytechno-m-c"/);
  assert.match(mobile, /id="soytechno-m-cashea"/);
  assert.match(mobile, /id="soytechno-m-wizard"/);
  assert.match(mobile, /id="soytechno-m-logistics"/);
  assert.match(mobile, /id="soytechno-m-results"/);
  assert.match(mobile, /id="soytechno-m-phones"/);
  assert.match(mobile, /id="soytechno-m-testimonial"/);
  assert.match(mobile, /id="soytechno-m-cta"/);
  assert.match(mobile, /snap-x/);
  assert.match(mobile, /mobile-screen-04\.png/);
  assert.match(mobile, /min-h-\[48px\]/);
  assert.doesNotMatch(mobile, /100cqw/);
});
