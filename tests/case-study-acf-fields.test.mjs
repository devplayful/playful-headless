import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  asRenderableHtml,
  headingsMatch,
  normalizeCaseStudyAcf,
  stripTrailingResultBleed,
} = await import('../utils/case-study-acf-fields.ts');

const page = readFileSync(
  new URL('../app/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);

const jumexTitle =
  'JUMEX y Shopify:  La Creación del Canal Directo (DTC) para un Portafolio Global';
const jumexAcf = {
  primerap:
    'Playful Agency, junto a Magnolia, transformó la estrategia digital de Jumex implementando un eCommerce en Shopify capaz de escalar su enorme portafolio al modelo DTC, centralizando operaciones complejas y soportando ventas de alta intensidad',
  primerh2: 'El desafío de Jumex: Pasar del Marketplace al DTC Propio',
  primerah3desarrollo: 'Diseño UX para el Consumidor Final',
  primerapdesarrollo:
    'Optimizamos la experiencia de usuario (UX) para que la compra de cualquier producto Jumex fuera clara y rápida, mejorando la confianza y reduciendo el abandono de productos en el carrito de compra',
  segundah3desarrollo: 'Arquitectura de Producto Inteligente',
  segundapdesarrollo:
    'Estructuramos el catálogo para manejar eficientemente la complejidad de Jumex. Optimizamos las galerías de imágenes y las variantes de producto para que el cliente siempre encuentre lo que busca, de forma clara y visual',
  resultado1: 'Creación de un Nuevo Canal de Ingresos',
  resultadop1:
    'Jumex logró establecer su canal DTC, abriendo una fuente de ingresos controlada y rentable, libre de las comisiones de marketplaces',
  resultado2: 'Control Total sobre Datos y Clientes',
  resultadop2:
    'La marca Jumex ahora es dueña de la información de sus clientes, permitiendo estrategias de marketing y fidelización mucho más efectivas',
  imagenbanner: { url: 'https://endpoint.playfulagency.com/wp-content/uploads/jumex.jpg' },
};

const odwallaTitle =
  'ODWALLA:\u2028De Marca Pionera a un gran jugador en el Direct To Consumer';
const odwallaAcf = {
  primerh2: 'ODWALLA: De Marca Pionera a un gran jugador en el Direct To Consumer',
  primerah3desarrollo: 'Estructura de Shopify Optimizada (Colecciones y Variantes)',
  primerapdesarrollo:
    'Potenciamos Shopify para manejar la personalización y la complejidad de los productos Odwalla. Implementamos variantes de producto y una clara creación de colecciones que permiten una navegación intuitiva y una mejor experiencia de compra',
  segundah3desarrollo: 'Estructura de Shopify Optimizada (Colecciones y Variantes)',
  segundapdesarrollo:
    'Potenciamos Shopify para manejar la personalización y la complejidad de los productos Odwalla. Implementamos variantes de producto y una clara creación de colecciones que permiten una navegación intuitiva y una mejor experiencia de compra',
  tercerh3desarrollo: 'Optimización de Velocidad y SEO Técnico',
  tercerapdesarrollo:
    'Reconstruimos la arquitectura para priorizar la velocidad de carga, esencial para la conversión. Además, ajustamos la estructura para potenciar el Posicionamiento SEO, enfocándonos en palabras clave de cola larga',
  resultado1: 'Aumento en la Tasa de Conversión (TC)',
  resultadop1:
    'El checkout funcional y la velocidad se tradujeron directamente en un incremento en los pedidos completados de Odwalla. Posicionamiento SEO Consolidado: Logramos que el sitio web de Odwalla se posicione consistentemente en el tercer puesto de búsquedas clave, atrayendo tráfico de alta calidad',
  resultado2: 'Posicionamiento SEO Consolidado',
  resultadop2:
    'Logramos que el sitio web de Odwalla se posicione consistentemente en el tercer puesto de búsquedas clave, atrayendo tráfico de alta calidad',
  resultado3: 'Capacidad de Venta Directa',
  resultadop3:
    ' La marca Odwalla dejó de depender exclusivamente de marketplaces y ahora controla su relación con el cliente y los márgenes de venta',
};

test('page parses ACF through normalizeCaseStudyAcf and no longer dumps desarrollo JSON', () => {
  assert.match(page, /normalizeCaseStudyAcf\(rawStory\.acf, rawStory\.title\?\.rendered\)/);
  assert.doesNotMatch(page, /JSON\.stringify\(\{[\s\S]*primerapdesarrollo/);
  assert.doesNotMatch(page, /primerh2 \|\| 'El Desafío'/);
});

test('asRenderableHtml parses a single-field JSON string and discards multi-key dumps', () => {
  assert.equal(
    asRenderableHtml(
      '{"primerapdesarrollo":"Optimizamos la experiencia de usuario (UX)"}',
      'primerapdesarrollo',
    ),
    'Optimizamos la experiencia de usuario (UX)',
  );
  assert.equal(
    asRenderableHtml(
      '{&quot;primerapdesarrollo&quot;:&quot;Texto&quot;,&quot;tercerh3desarrollo&quot;:&quot;Otro&quot;}',
      'primerapdesarrollo',
    ),
    'Texto',
  );
  assert.equal(
    asRenderableHtml({
      primerapdesarrollo: 'Optimizamos la experiencia',
      tercerh3desarrollo: '',
      tercerapdesarrollo: '',
    }, 'primerapdesarrollo'),
    'Optimizamos la experiencia',
  );
  assert.equal(
    asRenderableHtml({
      primerapdesarrollo: 'Uno',
      tercerapdesarrollo: 'Dos',
    }),
    '',
  );
  assert.equal(asRenderableHtml('{not-json'), '');
  assert.equal(asRenderableHtml('Párrafo aprobado de WordPress'), 'Párrafo aprobado de WordPress');
});

test('Odwalla drops the H1-as-H2, the repeated Shopify block and the SEO bleed in result 1', () => {
  const acf = normalizeCaseStudyAcf(odwallaAcf, odwallaTitle);
  assert.equal(acf.primerh2, '');
  assert.equal(
    acf.primerah3desarrollo,
    'Estructura de Shopify Optimizada (Colecciones y Variantes)',
  );
  assert.equal(acf.segundah3desarrollo, '');
  assert.equal(acf.segundapdesarrollo, '');
  assert.equal(acf.tercerh3desarrollo, 'Optimización de Velocidad y SEO Técnico');
  assert.equal(
    acf.resultadop1,
    'El checkout funcional y la velocidad se tradujeron directamente en un incremento en los pedidos completados de Odwalla.',
  );
  assert.equal(acf.resultado2, 'Posicionamiento SEO Consolidado');
  assert.match(acf.resultadop2, /tercer puesto de búsquedas clave/);
  assert.doesNotMatch(acf.resultadop1, /Posicionamiento SEO Consolidado/);
});

test('Jumex approved headings and results stay intact', () => {
  const acf = normalizeCaseStudyAcf(jumexAcf, jumexTitle);
  assert.equal(acf.primerh2, jumexAcf.primerh2);
  assert.equal(acf.primerah3desarrollo, jumexAcf.primerah3desarrollo);
  assert.equal(acf.segundah3desarrollo, jumexAcf.segundah3desarrollo);
  assert.equal(acf.resultadop1, jumexAcf.resultadop1);
  assert.deepEqual(acf.imagenbanner, jumexAcf.imagenbanner);
});

test('headingsMatch ignores line-separator and extra spaces', () => {
  assert.equal(
    headingsMatch(
      'ODWALLA:\u2028De Marca Pionera a un gran jugador en el Direct To Consumer',
      'ODWALLA: De Marca Pionera a un gran jugador en el Direct To Consumer',
    ),
    true,
  );
  assert.equal(headingsMatch('El desafío de Jumex', jumexTitle), false);
});

test('stripTrailingResultBleed only cuts the leaked next-result suffix', () => {
  const cleaned = stripTrailingResultBleed(
    'Pedido propio. Posicionamiento SEO Consolidado: Logramos el tercer puesto',
    'Posicionamiento SEO Consolidado',
    'Logramos el tercer puesto',
  );
  assert.equal(cleaned, 'Pedido propio.');
  assert.equal(
    stripTrailingResultBleed('Texto propio sin fuga', 'Otro título', 'Otro cuerpo'),
    'Texto propio sin fuga',
  );
});
