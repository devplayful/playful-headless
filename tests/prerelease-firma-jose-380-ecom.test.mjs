import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pre-release reminder. NOT in test:canonical so CI stays green.
 * Quitar el skip cuando José firme playful-copy #380 (redline).
 */
const {
  ECOM_INTRO_HTML_380,
  ECOM_VE_FAQ_ANSWER_HTML,
  ECOM_VE_FAQ_ANSWER_JSONLD,
  PENDIENTE_FIRMA_JOSE_380,
} = await import('../utils/ecommerce-aeo-2810.ts');
const { BLOG_SEO_380_APPENDS } = await import('../utils/blog-seo-380-appends.ts');

test(
  'prerelease: e-commerce and blog #380 copy awaits José redline',
  {
    skip:
      'PENDIENTE_FIRMA_JOSE_380 — playful-copy PR #380 SHA 11b38dc es borrador para redline de José. Quitar este skip cuando firme. El assert recuerda la marca.',
  },
  () => {
    assert.doesNotMatch(ECOM_INTRO_HTML_380, /PENDIENTE_FIRMA_JOSE_380/);
    assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_HTML, /PENDIENTE_FIRMA_JOSE_380/);
    assert.doesNotMatch(ECOM_VE_FAQ_ANSWER_JSONLD, /PENDIENTE_FIRMA_JOSE_380/);
    assert.equal(
      BLOG_SEO_380_APPENDS.every((item) => !item.replace.includes(PENDIENTE_FIRMA_JOSE_380)),
      true,
    );
    assert.notEqual(PENDIENTE_FIRMA_JOSE_380, 'PENDIENTE_FIRMA_JOSE_380');
  },
);
