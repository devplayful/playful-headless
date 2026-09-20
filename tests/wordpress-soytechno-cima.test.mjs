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

test('SoyTechno restores the published soytechno_extended body', () => {
  assert.match(storySource, /template: 'soytechno_extended'/);
  assert.doesNotMatch(storySource, /template: 'default'/);
  assert.match(storySource, /seccion_a:/);
  assert.match(page, /isSoyTechno && st\?\.seccion_a && <SoyTechnoSectionA/);
  assert.match(page, /isSoyTechnoCaseStudySlug\(slug\) \? <SoyTechnoAddons \/>/);
});

test('editorial H2s use SEO pack v4, not form questions or leftover packs', () => {
  assert.match(
    storySource,
    /Tienda online en Venezuela: del chat informal a comprar en plataforma/,
  );
  assert.match(
    storySource,
    /Cashea y pasarela de pagos en Venezuela en el mismo checkout/,
  );
  assert.match(
    storySource,
    /MRW rastreo dentro de la compra, no después del ticket/,
  );
  assert.match(
    storySource,
    /Ecommerce Venezuela a escala: qué aguantó la plataforma en 2025/,
  );
  assert.doesNotMatch(storySource, /Cómo compra Venezuela online/);
  assert.doesNotMatch(storySource, /Pago como lo busca el mercado/);
  assert.doesNotMatch(storySource, /Envío que se puede seguir/);
  assert.doesNotMatch(storySource, /Qué pasó cuando la plataforma aguantó/);
  assert.doesNotMatch(storySource, /de comprar tech por WhatsApp/);
  assert.doesNotMatch(storySource, /de WhatsApp e Instagram/);
  assert.doesNotMatch(storySource, /Por favor mencione/);
  assert.doesNotMatch(storySource, /Datos de contacto/);
  assert.doesNotMatch(storySource, /Resumen [Ee]jecutivo/);
  assert.doesNotMatch(storySource, /¿Cuál era el panorama/);
  assert.doesNotMatch(storySource, /POSTULACIÓN PREMIOS/);
  assert.doesNotMatch(storySource, /¿Cuáles eran los objetivos de negocio medibles\?/);
  assert.doesNotMatch(storySource, /La Prueba del Éxito/);
  assert.doesNotMatch(storySource, /\(La Misión\)/);
  assert.doesNotMatch(storySource, /¿Como su idea estratégica abordó/);
  assert.doesNotMatch(storySource, /¿Cómo sabe que la estrategia funcionó\?/);
});

test('body copy is verbatim CIMA paragraphs', () => {
  assert.match(storySource, /SOYTECHNO_CASE_TITLE = SOYTECHNO_H1/);
  assert.match(
    storySource,
    /Mientras la categoría asumía que el venezolano vivía con miedo de comprar online, Soytechno asumió lo contrario/,
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
    storySource, /SoyTechno definió cinco objetivos para 2025/,
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

test('handoff assets fill SoyTechno slots beyond the listing logo', () => {
  assert.match(storySource, /url: '\/images\/logos\/soytechno\.png'/);
  assert.match(storySource, /featured_media_url: SOYTECHNO_LOGO\.url/);
  assert.match(storySource, /lifestyle-f\.jpg/);
  assert.match(storySource, /giffycanvas-01\.gif/);
  assert.match(storySource, /iphone-mockup\.gif/);
  assert.match(storySource, /mobile-screen-01\.png/);
  assert.match(storySource, /testimonial-avatar\.png/);
  assert.doesNotMatch(storySource, /imagen_izquierda: null/);
  assert.doesNotMatch(storySource, /url: 'https:\/\/endpoint\.playfulagency\.com/);
});

test('getSuccessStoryBySlug and listings serve the synthetic story', () => {
  assert.match(wordpress, /isSoyTechnoCaseStudySlug\(slug\)/);
  assert.match(wordpress, /getSoyTechnoSyntheticStory\(\) as SuccessStory/);
  assert.match(wordpress, /return appendSoyTechnoCaseStudy\(mapped\)/);
  assert.match(listing, /appendSoyTechnoCaseStudy/);
});
