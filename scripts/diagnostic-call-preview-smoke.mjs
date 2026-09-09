import assert from 'node:assert/strict';

import { DIAGNOSTIC_CALL_COPY } from '../utils/diagnostic-call-copy.mjs';

const baseUrl = process.env.DIAGNOSTIC_COPY_BASE_URL;
if (!baseUrl) {
  throw new Error('DIAGNOSTIC_COPY_BASE_URL is required, for example http://localhost:3100');
}
const origin = new URL(baseUrl).origin;

async function getPage(pathname) {
  const response = await fetch(new URL(pathname, origin));
  assert.equal(response.status, 200, `${pathname} should return 200`);
  return response.text();
}

const home = await getPage('/');
for (const text of [
  DIAGNOSTIC_CALL_COPY.title,
  DIAGNOSTIC_CALL_COPY.body,
  DIAGNOSTIC_CALL_COPY.cta,
]) {
  assert.ok(home.includes(text), `Home should include: ${text}`);
}

const contact = await getPage('/contactar-agencia-de-marketing-digital');
for (const text of Object.values(DIAGNOSTIC_CALL_COPY).filter((value) => typeof value === 'string')) {
  assert.ok(contact.includes(text), `Contact should include: ${text}`);
}
assert.ok(
  contact.includes('Al hacer clic en &quot;Enviar mensaje&quot;, aceptas nuestra Política de Privacidad'),
  'Contact should preserve the existing legal copy',
);

for (const servicePath of [
  '/agencia-e-commerce',
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
]) {
  const service = await getPage(servicePath);
  for (const text of [
    DIAGNOSTIC_CALL_COPY.title,
    DIAGNOSTIC_CALL_COPY.body,
    DIAGNOSTIC_CALL_COPY.cta,
  ]) {
    assert.ok(service.includes(text), `${servicePath} should include: ${text}`);
  }
  assert.ok(!service.includes('Agenda una Reunión'));
}

const caseStudy = await getPage('/casos-de-exito/odwalla-shopify-dtc-ecommerce');
assert.ok(caseStudy.includes(DIAGNOSTIC_CALL_COPY.cta));
assert.ok(caseStudy.includes(DIAGNOSTIC_CALL_COPY.href));

// The listing CTA is client-rendered after the WordPress request. Its canonical
// source wiring is covered by the static smoke; here we verify the route stays healthy.
await getPage('/casos-de-exito-agencia-de-marketing-digital');

console.log(`Diagnostic call preview smoke passed against ${origin}`);
