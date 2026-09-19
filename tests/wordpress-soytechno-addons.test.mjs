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

test('recommendation A SEO and H1 stay distinct and literal', () => {
  assert.match(
    addons,
    /SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela/,
  );
  assert.match(
    story,
    /SoyTechno: El eCommerce que entendió cómo paga y confía Venezuela/,
  );
  assert.match(
    addons,
    /Caso de éxito: SoyTechno consolidó un eCommerce D2C en Venezuela con Smart Checkout multimoneda, integración Cashea y 2,8 millones de usuarios activos en 2025\./,
  );
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
