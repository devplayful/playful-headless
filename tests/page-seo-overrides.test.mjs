import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PAGE_TITLE_OVERRIDES,
  applyPageTitleOverride,
  PAGE_DESCRIPTION_OVERRIDES,
  applyPageDescriptionOverride,
} from '../utils/page-seo-overrides.mjs';

const MARKETING_TITLE =
  'Marketing Internacional: Lleva tu negocio al mundo (sin complicaciones)';
const MARKETING_DESCRIPTION =
  'Expandirte globalmente puede parecer complicado, pero con Playful Agency es pan comido. Te ayudamos a crear estrategias de Marketing Internacional que conectan con clientes.';
const CONTENTO_ECOMMERCE_DESCRIPTION =
  'Agencia e-Commerce para marcas D2C que ya venden y quieren crecer con margen. Ordenamos e implementamos tu catálogo en Shopify o WooCommerce. Agenda tu llamada diagnóstica.';
const STALE_PR64_DESCRIPTION =
  'Diseño, desarrollo y optimización de tiendas online. En Playful mejoramos el rendimiento, la experiencia de compra y el SEO de tu ecommerce.';

test('ecommerce overrides both cloned descriptions with Contento canonical copy', () => {
  assert.deepEqual(Object.keys(PAGE_DESCRIPTION_OVERRIDES), ['agencia-e-commerce']);
  assert.equal(
    PAGE_DESCRIPTION_OVERRIDES['agencia-e-commerce'],
    CONTENTO_ECOMMERCE_DESCRIPTION,
  );
  const result = applyPageDescriptionOverride(
    'agencia-e-commerce',
    MARKETING_DESCRIPTION,
    MARKETING_DESCRIPTION,
  );
  assert.equal(result.description, CONTENTO_ECOMMERCE_DESCRIPTION);
  assert.equal(result.ogDescription, CONTENTO_ECOMMERCE_DESCRIPTION);
  assert.doesNotMatch(result.description, /Marketing Internacional/i);
  assert.doesNotMatch(result.description, /tiendas online/);
  assert.notEqual(result.description, STALE_PR64_DESCRIPTION);
});

test('description overrides preserve other slugs and original Open Graph fallback', () => {
  for (const slug of ['marketing-internacional', 'agencia-seo', 'agencia-sem', 'constructor', '__proto__']) {
    assert.deepEqual(applyPageDescriptionOverride(slug, 'Original', 'Social'), {
      description: 'Original',
      ogDescription: 'Social',
    });
    assert.deepEqual(applyPageDescriptionOverride(slug, 'Original', ''), {
      description: 'Original',
      ogDescription: 'Original',
    });
  }
});

const SHARED_PAGOS_TITLE =
  'Pagos Online para E-commerce | Haz tu Integración con Playful Agency';

const AGENCIA_SEO_TITLE =
  'Agencia SEO Playful Agency | Mejora tu Posicionamiento';
const AGENCIA_SEO_YOAST_TITLE =
  'Agencia SEO Playful Agency | Mejóra tu Posicionamiento';

test('hardcoded titles stay unique', () => {
  const titles = Object.values(PAGE_TITLE_OVERRIDES);
  assert.equal(titles.length, 4);
  assert.equal(new Set(titles).size, titles.length);
});

test('agencia-seo drops the erroneous accent on Mejora', () => {
  const { title, ogTitle } = applyPageTitleOverride(
    'agencia-seo',
    AGENCIA_SEO_YOAST_TITLE,
    AGENCIA_SEO_YOAST_TITLE,
  );
  assert.equal(title, AGENCIA_SEO_TITLE);
  assert.equal(ogTitle, AGENCIA_SEO_TITLE);
  assert.doesNotMatch(title, /Mejóra/);
});

test('agencia-e-commerce no longer inherits the marketing-internacional title', () => {
  const { title, ogTitle } = applyPageTitleOverride(
    'agencia-e-commerce',
    MARKETING_TITLE,
    MARKETING_TITLE,
  );
  assert.equal(
    title,
    'Tu Agencia e-Commerce para Resultados Reales | Playful Agency',
  );
  assert.equal(ogTitle, title);
  assert.doesNotMatch(title, /Marketing Internacional/i);
  assert.equal(PAGE_TITLE_OVERRIDES['marketing-internacional'], undefined);
});

test('marketing-internacional keeps its Yoast title', () => {
  const { title, ogTitle } = applyPageTitleOverride(
    'marketing-internacional',
    MARKETING_TITLE,
    MARKETING_TITLE,
  );
  assert.equal(title, MARKETING_TITLE);
  assert.equal(ogTitle, MARKETING_TITLE);
});

test('pagos-online and pasarela no longer share one title', () => {
  const pagos = applyPageTitleOverride(
    'pagos-online-ecommerce',
    SHARED_PAGOS_TITLE,
    SHARED_PAGOS_TITLE,
  );
  const pasarela = applyPageTitleOverride(
    'pasarela-de-pago-ecommerce',
    SHARED_PAGOS_TITLE,
    SHARED_PAGOS_TITLE,
  );
  assert.notEqual(pagos.title, pasarela.title);
  assert.match(pagos.title, /Pagos Online/i);
  assert.doesNotMatch(pagos.title, /Pasarela/i);
  assert.match(pasarela.title, /Pasarela de Pago/i);
  assert.doesNotMatch(pasarela.title, /Pagos Online/i);
  assert.equal(pagos.ogTitle, pagos.title);
  assert.equal(pasarela.ogTitle, pasarela.title);
});
