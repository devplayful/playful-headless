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

test('locked SEO title, meta and H1 stay distinct and literal', () => {
  assert.match(
    addons,
    /SoyTechno: eCommerce en Venezuela que paga y genera confianza/,
  );
  assert.match(
    addons,
    /Caso SoyTechno: eCommerce D2C en Venezuela con Smart Checkout multimoneda, Cashea y logística rastreable\. Confianza y conversión donde antes mandaba el WhatsApp\./,
  );
  assert.match(
    addons,
    /export const SOYTECHNO_H1 =\n  'SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela'/,
  );
  assert.match(story, /SOYTECHNO_CASE_TITLE = SOYTECHNO_H1/);
  assert.doesNotMatch(addons, /title: '.*Shopify/);
  assert.doesNotMatch(addons, /SOYTECHNO_H1 =\n  '.*Shopify/);
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
  assert.match(story, /SOYTECHNO_TESTIMONIAL/);
  assert.match(page, /<SoyTechnoAddons \/>/);
  assert.match(wrap, /SOYTECHNO_ARTICLE_JSON_LD/);
  assert.doesNotMatch(addons, /¡Hablemos de tu proyecto!/);
});
