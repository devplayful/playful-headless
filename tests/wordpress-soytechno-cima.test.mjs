import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

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
const grouped = readFileSync(
  new URL('../utils/soytechno-grouped-art.ts', import.meta.url),
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

test('SoyTechno grouped 2x PNGs are on disk', () => {
  const dir = fileURLToPath(new URL('../public/images/casos/soytechno', import.meta.url));
  for (const file of [
    'soytechno-hero-art@2x.png',
    'soytechno-desafio-art@2x.png',
    'soytechno-logistica-art@2x.png',
    'soytechno-phones-strip@2x.png',
  ]) {
    assert.equal(existsSync(path.join(dir, file)), true, file);
  }
});

test('SoyTechno wires grouped 2x exports and an HTML Block B grid', () => {
  assert.match(body, /SoyTechnoMobile/);
  assert.match(body, /className="lg:hidden"/);
  assert.match(body, /className="hidden lg:block"/);
  assert.match(grouped, /soytechno-hero-art@2x/);
  assert.match(grouped, /soytechno-desafio-art@2x/);
  assert.match(grouped, /soytechno-logistica-art@2x/);
  assert.match(grouped, /soytechno-phones-strip@2x/);
  assert.match(body, /slot="hero"/);
  assert.match(body, /slot="desafio"/);
  assert.match(body, /slot="logistica"/);
  assert.match(body, /slot="phones"/);
  assert.match(body, /object-contain/);
  assert.match(body, /\[grid-template-columns:minmax\(0,350px\)_minmax\(0,350px\)_minmax\(0,1fr\)\]/);
  assert.match(body, /w-\[120px\] h-\[120px\]/);
  assert.match(body, /w-\[340px\]/);
  assert.match(body, /max-w-\[1196px\]/);
  assert.match(body, /font-paytone-lock/);
  assert.match(body, /section-b-phone\.png/);
  assert.match(body, /#440099/);
  assert.match(body, /bg-white rounded-\[28px\]/);
  assert.match(body, /section-c-ipad\.png/);
  assert.doesNotMatch(body, /soytechno-section-c[\s\S]{0,400}giffycanvas-01/);
  assert.doesNotMatch(body, /<h3 className="font-sans font-bold/);
  assert.doesNotMatch(body, /function Abs\(/);
  assert.doesNotMatch(body, /100cqw/);
  assert.doesNotMatch(body, /pt-\[64px\]/);
});

test('SoyTechno mobile stack covers the Figma narrative', () => {
  const mobile = readFileSync(
    new URL('../components/soytechno/SoyTechnoMobile.tsx', import.meta.url),
    'utf8',
  );
  assert.match(mobile, /id="soytechno-m-hero"/);
  assert.match(mobile, /<h1 className=/);
  assert.match(mobile, /text-\[32px\] leading-\[38px\]/);
  assert.match(mobile, /text-\[28px\] leading-\[34px\]/);
  assert.match(mobile, /scroll-mt-\[88px\]/);
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
  assert.match(mobile, /w-\[78vw\]/);
  assert.match(mobile, /mobile-screen-04\.png/);
  assert.match(mobile, /min-h-\[48px\]/);
  assert.doesNotMatch(mobile, /100cqw/);
  assert.match(mobile, /font-paytone-lock/);
  assert.match(mobile, /grid-cols-2/);
  assert.match(mobile, /bg-white rounded-\[24px\]/);
  assert.match(mobile, /section-b-phone\.png/);
  assert.match(mobile, /slot="hero"/);
  assert.match(mobile, /slot="desafio"/);
  assert.match(mobile, /slot="logistica"/);
  assert.doesNotMatch(mobile, /<h3 className="font-sans font-bold/);
  assert.doesNotMatch(mobile, /space-y-12 max-w-\[720px\]/);
  assert.doesNotMatch(mobile, /left-\[8%\] top-\[32%\]/);
});
