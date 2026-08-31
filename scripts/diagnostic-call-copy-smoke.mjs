import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import {
  DIAGNOSTIC_CALL_COPY,
  applyDiagnosticCallCopyToElementor,
} from '../utils/diagnostic-call-copy.mjs';

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

const legacyServiceCta = [
  '<h2 class="main-heading">¡Es Hora de actuar y cambiar tu futuro digital! (sin necesidad de magia negra)</h2>',
  '<div class="sub-heading">No esperes más para dar el siguiente paso. tu próxima gran campaña comienza con una conversación.</div>',
  '<a href="/contactar-agencia-de-marketing-digital/"><span class="text">¡Contáctanos y empieza ya!</span></a>',
].join('');
const transformedServiceCta = applyDiagnosticCallCopyToElementor(legacyServiceCta);

for (const expected of [
  DIAGNOSTIC_CALL_COPY.title,
  DIAGNOSTIC_CALL_COPY.body,
  DIAGNOSTIC_CALL_COPY.cta,
  'href="/contactar-agencia-de-marketing-digital/"',
]) {
  assert.ok(transformedServiceCta.includes(expected), `service CTA should include: ${expected}`);
}
assert.ok(!transformedServiceCta.includes('Agenda una Reunión'));
assert.ok(!transformedServiceCta.includes('Dejar de Perder Dinero'));

const legacyDesignCta = [
  '<h2 class="main-heading">¡Conectemos y comencemos a trabajar!</h2>',
  '<div class="sub-heading">Ya sea que tengas preguntas, ideas o simplemente quieras conocer más sobre cómo podemos ayudarte a mejorar tu presencia en línea, estamos aquí para escucharte.<br>\n',
  'No esperes más: tu próxima gran campaña comienza con una conversación.</div>',
  '<a href="/contactar-agencia-de-marketing-digital/"><span class="text">¡Hablemos!</span></a>',
].join('');
const untouchedDesignCta = applyDiagnosticCallCopyToElementor(legacyDesignCta, 12345);
assert.equal(untouchedDesignCta, legacyDesignCta, 'unrelated WordPress pages must stay untouched');

const transformedDesignCta = applyDiagnosticCallCopyToElementor(legacyDesignCta, 83849);
for (const expected of [
  DIAGNOSTIC_CALL_COPY.title,
  DIAGNOSTIC_CALL_COPY.body,
  DIAGNOSTIC_CALL_COPY.cta,
  'href="/contactar-agencia-de-marketing-digital/"',
]) {
  assert.ok(transformedDesignCta.includes(expected), `design CTA should include: ${expected}`);
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
