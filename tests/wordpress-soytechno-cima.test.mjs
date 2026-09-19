import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const storySource = readFileSync(
  new URL('../utils/soytechno-case-study.ts', import.meta.url),
  'utf8',
);
const wordpress = readFileSync(
  new URL('../services/wordpress.ts', import.meta.url),
  'utf8',
);
const page = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const listing = readFileSync(
  new URL('../app/casos-de-exito-agencia-de-marketing-digital/CaseStudiesContent.tsx', import.meta.url),
  'utf8',
);
const sitemap = readFileSync(
  new URL('../utils/apex-sitemap.ts', import.meta.url),
  'utf8',
);

test('SoyTechno code override uses the José GO slug, not soytechno', () => {
  assert.match(storySource, /export const SOYTECHNO_CASE_STUDY_SLUG = 'soytechno-ecommerce-venezuela'/);
  assert.doesNotMatch(storySource, /SOYTECHNO_CASE_STUDY_SLUG = 'soytechno'/);
  assert.match(sitemap, /\/casos-de-exito\/soytechno-ecommerce-venezuela/);
  assert.doesNotMatch(sitemap, /\/casos-de-exito\/soytechno'/);
});

test('synthetic story uses soytechno_extended and leaves seccion_d empty', () => {
  assert.match(storySource, /template: 'soytechno_extended'/);
  assert.match(storySource, /seccion_a:/);
  assert.match(storySource, /seccion_b:/);
  assert.match(storySource, /seccion_c:/);
  assert.match(storySource, /seccion_e:/);
  assert.match(storySource, /seccion_f:/);
  assert.doesNotMatch(storySource, /seccion_d:/);
});

test('body copy is verbatim CIMA, including the Como quirk', () => {
  assert.match(
    storySource,
    /SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela/,
  );
  assert.match(
    storySource,
    /Mientras la categoría asumía que el venezolano vivía con miedo de comprar online, Soytechno asumió lo contrario/,
  );
  assert.match(
    storySource,
    /¿Como su idea estratégica abordó directamente el insight y el desafío planteado\?/,
  );
  assert.doesNotMatch(
    storySource,
    /¿Cómo su idea estratégica abordó directamente el insight y el desafío planteado\?/,
  );
  assert.match(
    storySource,
    /Por favor mencione cuáles fueron sus medios claves\./,
  );
  assert.match(
    storySource,
    /Tras su soft launch, SoyTechno debía consolidar su eCommerce/,
  );
  assert.match(
    storySource,
    /El venezolano no compra tecnología; la planifica\./,
  );
  assert.match(
    storySource,
    /En 2025, el eCommerce venezolano creció \+125% \(Cavecom-e\)/,
  );
  assert.match(
    storySource,
    /SoyTechno definió cinco objetivos para 2025/,
  );
  assert.match(
    storySource,
    /Con un enfoque trimestral \(Q1: Reconocimiento, Q2: Expansión, Q3: Escalabilidad, Q4: Fidelización\)/,
  );
  assert.match(
    storySource,
    /Los resultados validan la transformación del hábito de consumo\./,
  );
  assert.match(
    storySource,
    /SoyTechno arrancó diciembre de 2024 con 99\.384 usuarios activos mensuales\./,
  );
  assert.match(
    storySource,
    /La innovación fue adaptar tecnología global a la hipercomplejidad venezolana\./,
  );
  assert.match(
    storySource,
    /SoyTechno demostró que el eCommerce formal, automatizado y de alta gama es viable en Venezuela\./,
  );
});

test('images, SEO and CTA add-ons stay empty', () => {
  assert.match(storySource, /imagenbanner: false/);
  assert.doesNotMatch(storySource, /imagen_izquierda:/);
  assert.doesNotMatch(storySource, /mostrar_cta_final/);
  assert.doesNotMatch(storySource, /PUBLIC_CASE_STUDY_SEO/);
});

test('getSuccessStoryBySlug and listings serve the synthetic story', () => {
  assert.match(wordpress, /isSoyTechnoCaseStudySlug\(slug\)/);
  assert.match(wordpress, /getSoyTechnoSyntheticStory\(\) as SuccessStory/);
  assert.match(wordpress, /return appendSoyTechnoCaseStudy\(mapped\)/);
  assert.match(listing, /appendSoyTechnoCaseStudy/);
});

test('soytechno_extended page skips default fallback headings', () => {
  assert.match(page, /acf\?\.template === "soytechno_extended"/);
  assert.match(page, /\{!isSoyTechno && \(/);
  assert.match(page, /SoyTechnoSectionA/);
  assert.match(page, /SoyTechnoSectionF/);
});
