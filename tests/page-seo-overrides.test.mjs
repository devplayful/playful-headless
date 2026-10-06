import test from 'node:test';
import assert from 'node:assert/strict';

import { readFile } from 'node:fs/promises';

import {
  PAGE_TITLE_OVERRIDES,
  applyPageTitleOverride,
  PAGE_DESCRIPTION_OVERRIDES,
  applyPageDescriptionOverride,
  twitterFromOpenGraph,
} from '../utils/page-seo-overrides.mjs';

const MARKETING_TITLE =
  'Marketing Internacional: Lleva tu negocio al mundo (sin complicaciones)';
const MARKETING_DESCRIPTION =
  'Expandirte globalmente puede parecer complicado, pero con Playful Agency es pan comido. Te ayudamos a crear estrategias de Marketing Internacional que conectan con clientes.';
const OPTION_A_ECOMMERCE_DESCRIPTION =
  'Para marcas que ya venden directo al consumidor (D2C): ordenamos tu tienda online, el posicionamiento y el diseño para que venda más. Agenda tu llamada.';
const STALE_PR64_DESCRIPTION =
  'Diseño, desarrollo y optimización de tiendas online. En Playful mejoramos el rendimiento, la experiencia de compra y el SEO de tu ecommerce.';

test('ecommerce overrides both cloned descriptions with opción A firmada', () => {
  assert.deepEqual(Object.keys(PAGE_DESCRIPTION_OVERRIDES), [
    'agencia-e-commerce',
    'agencia-diseno-web',
  ]);
  assert.equal(
    PAGE_DESCRIPTION_OVERRIDES['agencia-e-commerce'],
    OPTION_A_ECOMMERCE_DESCRIPTION,
  );
  assert.equal(OPTION_A_ECOMMERCE_DESCRIPTION.length, 152);
  const result = applyPageDescriptionOverride(
    'agencia-e-commerce',
    MARKETING_DESCRIPTION,
    MARKETING_DESCRIPTION,
  );
  assert.equal(result.description, OPTION_A_ECOMMERCE_DESCRIPTION);
  assert.equal(result.ogDescription, OPTION_A_ECOMMERCE_DESCRIPTION);
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

const AGENCIA_SEO_YOAST_TITLE =
  'Agencia SEO Playful Agency | Mejóra tu Posicionamiento';

test('hardcoded titles stay unique', () => {
  const titles = Object.values(PAGE_TITLE_OVERRIDES);
  assert.equal(Object.keys(PAGE_TITLE_OVERRIDES).length, 5);
  assert.equal(titles.length, 5);
  assert.equal(new Set(titles).size, 4);
  assert.equal(
    PAGE_TITLE_OVERRIDES['pasarela-de-pagos-venezuela'],
    PAGE_TITLE_OVERRIDES['pasarela-de-pago-ecommerce'],
  );
});

test('agencia-seo no longer uses a Yoast title override', () => {
  assert.equal(PAGE_TITLE_OVERRIDES['agencia-seo'], undefined);
  const { title, ogTitle } = applyPageTitleOverride(
    'agencia-seo',
    AGENCIA_SEO_YOAST_TITLE,
    AGENCIA_SEO_YOAST_TITLE,
  );
  assert.equal(title, AGENCIA_SEO_YOAST_TITLE);
  assert.equal(ogTitle, AGENCIA_SEO_YOAST_TITLE);
});

test('agencia-e-commerce no longer inherits the marketing-internacional title', () => {
  const { title, ogTitle } = applyPageTitleOverride(
    'agencia-e-commerce',
    MARKETING_TITLE,
    MARKETING_TITLE,
  );
  assert.equal(
    title,
    'Agencia ecommerce para venta directa | Playful Agency',
  );
  assert.equal(title.length, 53);
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

const DISENO_TITLE = 'Agencia de diseño web para tiendas online | Playful Agency';
const DISENO_DESCRIPTION =
  'Diseño de tienda online orientado a conversión para marcas que ya venden, tiendas físicas que pasan a online o proyectos desde cero. Agenda tu llamada.';

test('agencia-diseno-web overrides Yoast title and the 151-character meta', () => {
  assert.equal(PAGE_TITLE_OVERRIDES['agencia-diseno-web'], DISENO_TITLE);
  assert.equal(PAGE_DESCRIPTION_OVERRIDES['agencia-diseno-web'], DISENO_DESCRIPTION);
  assert.equal(PAGE_DESCRIPTION_OVERRIDES['agencia-diseno-web'].length, 151);
  const titles = applyPageTitleOverride(
    'agencia-diseno-web',
    'Agencia Diseño Web Personalizamos tu Web | Playful Agency',
    'Agencia Diseño Web Personalizamos tu Web | Playful Agency',
  );
  assert.equal(titles.title, DISENO_TITLE);
  assert.equal(titles.ogTitle, DISENO_TITLE);
  const desc = applyPageDescriptionOverride(
    'agencia-diseno-web',
    'Activa tu presencia en línea con una agencia diseño web que dé vida a tu marca. En Playful Agency, creamos ese sitio web.',
    'Activa tu presencia en línea con una agencia diseño web que dé vida a tu marca. En Playful Agency, creamos ese sitio web.',
  );
  assert.equal(desc.description, DISENO_DESCRIPTION);
  assert.equal(desc.ogDescription, DISENO_DESCRIPTION);
});

test('twitterFromOpenGraph mirrors the resolved og title and description', () => {
  assert.deepEqual(
    twitterFromOpenGraph('OG título de página', 'OG descripción de página'),
    {
      title: 'OG título de página',
      description: 'OG descripción de página',
    },
  );
  const ecommerce = applyPageTitleOverride(
    'agencia-e-commerce',
    MARKETING_TITLE,
    MARKETING_TITLE,
  );
  const ecommerceDesc = applyPageDescriptionOverride(
    'agencia-e-commerce',
    MARKETING_DESCRIPTION,
    MARKETING_DESCRIPTION,
  );
  assert.deepEqual(
    twitterFromOpenGraph(ecommerce.ogTitle, ecommerceDesc.ogDescription),
    {
      title: ecommerce.ogTitle,
      description: ecommerceDesc.ogDescription,
    },
  );
  const seo = applyPageTitleOverride('agencia-seo', 'Yoast title', 'Yoast OG');
  const seoDesc = applyPageDescriptionOverride('agencia-seo', 'Yoast desc', 'Yoast OG desc');
  assert.deepEqual(twitterFromOpenGraph(seo.ogTitle, seoDesc.ogDescription), {
    title: seo.ogTitle,
    description: seoDesc.ogDescription,
  });
});

test('non-blog generateMetadata wires twitter from the same og values', async () => {
  const slugPage = await readFile(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
  const shopifyPage = await readFile(new URL('../app/agencia-shopify/page.tsx', import.meta.url), 'utf8');
  const casosPage = await readFile(new URL('../app/casos-de-exito/page.tsx', import.meta.url), 'utf8');
  const nosotrosPage = await readFile(new URL('../app/nosotros/page.tsx', import.meta.url), 'utf8');
  const blogPage = await readFile(new URL('../app/blog/[...slug]/page.tsx', import.meta.url), 'utf8');

  assert.match(slugPage, /twitterFromOpenGraph\(ogTitle, ogDescription\)/);
  assert.match(shopifyPage, /twitterFromOpenGraph\(SHOPIFY_META\.title, SHOPIFY_META\.description\)/);
  assert.match(casosPage, /twitterFromOpenGraph\(title, description\)/);
  assert.match(nosotrosPage, /twitterFromOpenGraph\(title, description\)/);
  assert.doesNotMatch(blogPage, /twitterFromOpenGraph/);
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
