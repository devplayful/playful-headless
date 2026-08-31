import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  DIAGNOSTIC_CALL_COPY,
  DIAGNOSTIC_CALL_ELEMENTOR_SERVICES,
  applyDiagnosticCallCopyToElementor,
} from '../utils/diagnostic-call-copy.mjs';
import {
  COMMON_SERVICE_CTA_FIXTURE,
  DESIGN_SERVICE_CTA_FIXTURE,
  NON_TARGET_CONTEXTS,
  TARGET_SERVICE_FIXTURES,
} from './fixtures/diagnostic-call-elementor.mjs';

assert.deepEqual(DIAGNOSTIC_CALL_COPY, {
  title: 'Una llamada para revisar tu e-commerce',
  body:
    'Si diriges una marca D2C que ya vende en Shopify o WooCommerce y la tienda no acompaña el ritmo del negocio, esta llamada diagnóstica es para ti. En 30 minutos revisaremos la tienda, sus puntos ciegos y los próximos pasos posibles. No es una presentación de paquetes ni una llamada para dar precios.',
  cta: 'Solicitar llamada diagnóstica',
  support:
    'Completa el formulario. Revisaremos la información antes de contactarte para coordinar la llamada.',
  durationMinutes: 30,
  href: '/contactar-agencia-de-marketing-digital',
});

assert.deepEqual(
  Object.fromEntries(
    Object.entries(DIAGNOSTIC_CALL_ELEMENTOR_SERVICES)
      .map(([slug, { pageId }]) => [slug, pageId]),
  ),
  {
    'agencia-e-commerce': 85582,
    'agencia-seo': 83510,
    'agencia-sem': 83848,
    'agencia-diseno-web': 83849,
  },
);

for (const fixture of TARGET_SERVICE_FIXTURES) {
  const transformed = applyDiagnosticCallCopyToElementor(fixture.html, fixture);
  for (const expected of [
    DIAGNOSTIC_CALL_COPY.title,
    DIAGNOSTIC_CALL_COPY.body,
    DIAGNOSTIC_CALL_COPY.cta,
    'href="/contactar-agencia-de-marketing-digital/"',
  ]) {
    assert.ok(
      transformed.includes(expected),
      `${fixture.slug} should include the complete diagnostic CTA: ${expected}`,
    );
  }
  assert.notEqual(transformed, fixture.html, `${fixture.slug} should transform`);
}

for (const context of NON_TARGET_CONTEXTS) {
  for (const fixture of TARGET_SERVICE_FIXTURES) {
    assert.equal(
      applyDiagnosticCallCopyToElementor(fixture.html, context),
      fixture.html,
      `${context.slug}/${context.pageId} must remain byte-for-byte`,
    );
  }
}

const partialFixtures = [
  {
    context: TARGET_SERVICE_FIXTURES[0],
    variants: [
      COMMON_SERVICE_CTA_FIXTURE.replace(/<h2[\s\S]*?<\/h2>/, ''),
      COMMON_SERVICE_CTA_FIXTURE.replace(/<div[\s\S]*?<\/div>/, ''),
      COMMON_SERVICE_CTA_FIXTURE.replace(/<a[\s\S]*?<\/a>/, ''),
    ],
  },
  {
    context: TARGET_SERVICE_FIXTURES[3],
    variants: [
      DESIGN_SERVICE_CTA_FIXTURE.replace(/<h2[\s\S]*?<\/h2>/, ''),
      DESIGN_SERVICE_CTA_FIXTURE.replace(/<div[\s\S]*?<\/div>/, ''),
      DESIGN_SERVICE_CTA_FIXTURE.replace(/<a[\s\S]*?<\/a>/, ''),
    ],
  },
];
for (const { context, variants } of partialFixtures) {
  for (const partial of variants) {
    assert.equal(
      applyDiagnosticCallCopyToElementor(partial, context),
      partial,
      `${context.slug} partial Elementor pattern must remain byte-for-byte`,
    );
  }
}

const targetedFiles = [
  'app/page.tsx',
  'app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx',
  'app/casos-de-exito/[slug]/CasoExitoCta.tsx',
  'app/casos-de-exito-agencia-de-marketing-digital/CaseStudiesContent.tsx',
  'components/MaterialServicesSection.tsx',
  'components/SolucionesPlayful.tsx',
  'components/ElementorPageContent.tsx',
];
const sources = await Promise.all(
  targetedFiles.map(async (file) => [file, await readFile(resolve(file), 'utf8')]),
);
const combinedSource = sources.map(([, source]) => source).join('\n');

for (const divergentCopy of [
  'Completa el formulario y cuéntanos tu idea',
  'Llena el formulario y hablemos sobre tu web',
  'Escríbenos para conversar sobre tu página web.',
  '¡Hablemos de tu proyecto!',
  '¡Quiero que conozcan mi caso!',
  'Agenda una Reunión',
]) {
  assert.ok(!combinedSource.includes(divergentCopy), `divergent CTA remains: ${divergentCopy}`);
}

for (const file of targetedFiles.filter((file) => file !== 'components/ElementorPageContent.tsx')) {
  const source = sources.find(([name]) => name === file)?.[1] ?? '';
  assert.ok(
    source.includes('DIAGNOSTIC_CALL_COPY'),
    `${file} should consume the canonical diagnostic-call copy`,
  );
}

const contactSource = sources.find(([file]) =>
  file.endsWith('ContactPageClient.tsx'))?.[1] ?? '';
assert.ok(
  contactSource.includes('Al hacer clic en "Enviar mensaje", aceptas nuestra Política de Privacidad'),
  'existing legal consent copy must remain unchanged',
);

console.log('Diagnostic call copy smoke passed');
