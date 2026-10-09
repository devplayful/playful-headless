import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  IMAGE_ALT_OVERRIDE_COUNT,
  IMAGE_ALT_OVERRIDES,
  applyImageAltOverrides,
  lookupImageAlt,
  resolveImageAlt,
  resolveMediaAlt,
} = await import('../lib/image-alt-overrides.ts');

const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);
const wordpress = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
const casePage = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const soyB = readFileSync(
  new URL('../components/soytechno/SoyTechnoSectionB.tsx', import.meta.url),
  'utf8',
);

const FUND_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/PLAYFUL-CASOS-DE-EXITO_Fundahigado.png';
const FUND_ALT =
  'Tarjeta del caso Fundahigado: 85K visitas logradas en un trimestre';
const RECTANGLE_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2022/08/Rectangle2.svg';
const PIXEL_SRC =
  'https://endpoint.playfulagency.com/wp-content/plugins/wti-like-post/images/pixel.gif';
const SEM_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Haz-Pruebas-y-%E2%80%A8Optimiza-tus-Campanas.png';
const SEM_ALT =
  'Persona con gafas, dónut y pulgar hacia arriba: prueba y optimiza tus campañas';
const OTHER_SRC =
  'https://endpoint.playfulagency.com/wp-content/uploads/2020/06/BANNER-CTA_PLAYFUL_DataStudio.png';

test('the signed map covers exactly 92 src keys', () => {
  assert.equal(IMAGE_ALT_OVERRIDE_COUNT, 92);
  assert.equal(Object.keys(IMAGE_ALT_OVERRIDES).length, 92);
});

test('replaces an existing alt when src hits the map', () => {
  const html =
    `<p>Antes</p><img class="x" src="${FUND_SRC}" alt="PLAYFUL CASOS DE EXITO_Fundahigado" width="400" /><p>Después</p>`;
  const out = applyImageAltOverrides(html);
  assert.equal(
    out,
    `<p>Antes</p><img class="x" src="${FUND_SRC}" alt="${FUND_ALT}" width="400" /><p>Después</p>`,
  );
});

test('sets decorative alt="" without touching the rest of the HTML', () => {
  const html = `<div class="wrap"><img src="${RECTANGLE_SRC}" alt="ornament"></div>`;
  const out = applyImageAltOverrides(html);
  assert.equal(out, `<div class="wrap"><img src="${RECTANGLE_SRC}" alt=""></div>`);
});

test('adds alt when the img has none, including pixel.gif', () => {
  const html = `<img src="${PIXEL_SRC}" width="1" height="1">`;
  const out = applyImageAltOverrides(html);
  assert.equal(out, `<img src="${PIXEL_SRC}" width="1" height="1" alt="">`);
});

test('removes <img src=""> and leaves neighboring markup byte-identical', () => {
  const html =
    '<li class="meta">x</li><img src="" alt="Image"><span class="text">Hola</span>';
  const out = applyImageAltOverrides(html);
  assert.equal(out, '<li class="meta">x</li><span class="text">Hola</span>');
});

test('unmapped images and non-img HTML stay byte-identical', () => {
  const html =
    `<section><h2>Título</h2><img src="${OTHER_SRC}" alt=""><p>cuerpo</p></section>`;
  assert.equal(applyImageAltOverrides(html), html);
});

test('matches WP: keys, -WxH derivatives, srcset-only tags and the U+2028 SEM file', () => {
  assert.equal(lookupImageAlt(FUND_SRC), FUND_ALT);
  assert.equal(
    lookupImageAlt(FUND_SRC.replace('.png', '-370x300.png')),
    FUND_ALT,
  );
  const srcsetHtml =
    `<img srcset="${FUND_SRC} 400w, ${FUND_SRC.replace('.png', '-150x150.png')} 150w" alt="x">`;
  assert.match(applyImageAltOverrides(srcsetHtml), new RegExp(`alt="${FUND_ALT}"`));
  assert.equal(lookupImageAlt(SEM_SRC), SEM_ALT);
  const rawLine = SEM_SRC.replace('%E2%80%A8', '\u2028');
  assert.equal(lookupImageAlt(rawLine), SEM_ALT);
});

test('resolveImageAlt uses the map and otherwise the fallback', () => {
  assert.equal(resolveImageAlt(FUND_SRC, 'fallback'), FUND_ALT);
  assert.equal(resolveImageAlt(OTHER_SRC, 'fallback'), 'fallback');
  assert.equal(
    resolveMediaAlt(
      { url: RECTANGLE_SRC, alt: 'Logo cliente' },
      'Logo cliente',
    ),
    '',
  );
});

test('the transform is idempotent', () => {
  const html =
    `<img src="${FUND_SRC}" alt="viejo"><img src="" alt="Image"><img src="${PIXEL_SRC}">`;
  const once = applyImageAltOverrides(html);
  const twice = applyImageAltOverrides(once);
  assert.equal(once, twice);
});

test('Elementor, getPageBySlug, casos and SoyTechno compose the override', () => {
  assert.match(elementor, /applyImageAltOverrides\(/);
  assert.match(wordpress, /applyImageAltOverrides\(/);
  assert.match(casePage, /resolveMediaAlt|resolveImageAlt|applyImageAltOverrides/);
  assert.match(soyB, /resolveMediaAlt/);
});
