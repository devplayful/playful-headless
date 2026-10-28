import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Corre en CI. Mientras playful-copy #380 no tenga redline de José,
 * los asserts de la marca fallan a propósito y bloquean el merge.
 */
const {
  ECOM_INTRO_HTML_380,
  ECOM_VE_FAQ_ANSWER_HTML,
  ECOM_VE_FAQ_ANSWER_JSONLD,
  PENDIENTE_FIRMA_JOSE_380,
  rewriteEcommerceAeo2810,
} = await import('../utils/ecommerce-aeo-2810.ts');
const { BLOG_SEO_380_APPENDS } = await import('../utils/blog-seo-380-appends.ts');

test('prerelease: /agencia-e-commerce #380 copy is in and must not ship unsigned', () => {
  const rewritten = rewriteEcommerceAeo2810(
    `${typeof ECOM_INTRO_HTML_380 === 'string' ? ECOM_INTRO_HTML_380 : ''}`,
  );
  assert.match(rewritten, /SoyTechno/);
  assert.doesNotMatch(rewritten, /COPY SIN FIRMAR/);
  assert.doesNotMatch(ECOM_INTRO_HTML_380, /COPY SIN FIRMAR/);
  assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_HTML, /COPY SIN FIRMAR/);
  assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_JSONLD, /COPY SIN FIRMAR/);
  assert.doesNotMatch(ECOM_INTRO_HTML_380, /PENDIENTE_FIRMA_JOSE_380/);
  assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_HTML, /PENDIENTE_FIRMA_JOSE_380/);
  assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_JSONLD, /PENDIENTE_FIRMA_JOSE_380/);
  assert.equal(
    BLOG_SEO_380_APPENDS.every((item) => !item.replace.includes(PENDIENTE_FIRMA_JOSE_380)),
    true,
  );
  assert.notEqual(PENDIENTE_FIRMA_JOSE_380, 'PENDIENTE_FIRMA_JOSE_380');
});
