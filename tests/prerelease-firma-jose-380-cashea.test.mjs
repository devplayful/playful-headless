import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pre-release reminder. NOT in test:canonical so CI stays green.
 * Quitar el skip cuando José firme playful-copy #380 (redline).
 */
const { PENDIENTE_FIRMA_JOSE_380, CASHEA_P1_CURRENT_HTML, CASHEA_SITEF_P4_HTML } =
  await import('../lib/blog-body-overrides.ts');

test(
  'prerelease: Cashea #380 copy awaits José redline',
  {
    skip:
      'PENDIENTE_FIRMA_JOSE_380 — playful-copy PR #380 SHA 11b38dc es borrador para redline de José. Quitar este skip cuando firme. El assert recuerda la marca.',
  },
  () => {
    assert.doesNotMatch(CASHEA_P1_CURRENT_HTML, /PENDIENTE_FIRMA_JOSE_380/);
    assert.doesNotMatch(CASHEA_SITEF_P4_HTML, /PENDIENTE_FIRMA_JOSE_380/);
    assert.notEqual(PENDIENTE_FIRMA_JOSE_380, 'PENDIENTE_FIRMA_JOSE_380');
  },
);
