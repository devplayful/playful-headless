import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const addons = readFileSync(
  new URL('../utils/soytechno-addons.ts', import.meta.url),
  'utf8',
);
const overrides = readFileSync(
  new URL('../utils/public-case-study-overrides.ts', import.meta.url),
  'utf8',
);
const page = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const wrap = readFileSync(
  new URL('../app/casos-de-exito/[slug]/SoyTechnoAddons.tsx', import.meta.url),
  'utf8',
);
const story = readFileSync(
  new URL('../utils/soytechno-case-study.ts', import.meta.url),
  'utf8',
);

test('SEO pack v4 title, meta and H1 stay literal', () => {
  assert.match(
    addons,
    /SoyTechno: el eCommerce que entendió cómo compra Venezuela/,
  );
  assert.match(
    addons,
    /Caso tienda online Venezuela: SoyTechno con Cashea en checkout, pagos multimoneda y MRW rastreo\. Cómo compra el mercado fuera del chat informal\./,
  );
  assert.match(
    addons,
    /Crear tienda online en Venezuela cuando tu marca aún vende fuera de plataforma/,
  );
  assert.match(story, /SOYTECHNO_CASE_TITLE = SOYTECHNO_H1/);
  assert.doesNotMatch(addons, /de comprar tech por WhatsApp/);
  assert.doesNotMatch(addons, /de WhatsApp e Instagram/);
  assert.doesNotMatch(addons, /Si tu marca aún vende fuera de una tienda formal/);
  assert.doesNotMatch(addons, /eCommerce en Venezuela que paga y genera confianza/);
  assert.doesNotMatch(addons, /title: '.*Shopify/);
  assert.match(overrides, /SOYTECHNO_SEO/);
});

test('CTA, siblings, schema and Eva Cristina quote are the add-ons text', () => {
  assert.match(addons, /Agenda una reunión con Playful/);
  assert.match(addons, /https:\/\/playfulagency\.com\/reunion-playful/);
  assert.match(
    addons,
    /Si tu marca vende online en Venezuela y necesita una plataforma que resuelva pagos multimoneda/,
  );
  assert.match(
    addons,
    /Caso Jumex: canal DTC propio para un catálogo grande en Shopify/,
  );
  assert.match(
    addons,
    /Caso Odwalla: de sitio informativo a tienda DTC en Shopify/,
  );
  assert.match(addons, /'@type': 'Article'/);
  assert.match(addons, /Eva Cristina Luciani/);
  assert.match(
    addons,
    /Se ve que la página está hecha en base a los requerimientos que nosotros teníamos y más/,
  );
  assert.match(addons, /cta-illustration\.png/);
  assert.match(story, /SOYTECHNO_TESTIMONIAL/);
  assert.match(page, /<SoyTechnoAddons \/>/);
  assert.match(wrap, /SOYTECHNO_ARTICLE_JSON_LD/);
  assert.match(wrap, /SOYTECHNO_CTA\.headline/);
  assert.doesNotMatch(addons, /¡Hablemos de tu proyecto!/);
  assert.doesNotMatch(addons, /¿Tu E-commerce está listo/);
});
