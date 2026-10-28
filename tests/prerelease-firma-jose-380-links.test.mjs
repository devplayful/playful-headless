import test from 'node:test';
import assert from 'node:assert/strict';

/**
 * Pre-release reminder. NOT in test:canonical so CI stays green.
 * Quitar el skip cuando José firme playful-copy #380 (redline).
 */
const { LINKS_BIO_ENTRIES, PENDIENTE_FIRMA_JOSE_380 } = await import('../lib/links-bio.ts');

test(
  'prerelease: Cashea /links label from #380 awaits José redline',
  {
    skip:
      'PENDIENTE_FIRMA_JOSE_380 — playful-copy PR #380 SHA d4844d5 es borrador para redline de José. Quitar este skip cuando firme. El assert recuerda la marca.',
  },
  () => {
    const cashea = LINKS_BIO_ENTRIES.find(
      (entry) => entry.path === '/blog/tecnologia/cashea-para-comercios',
    );
    assert.equal(cashea.label, 'Cuotas con Cashea para comercios');
    assert.notEqual(PENDIENTE_FIRMA_JOSE_380, 'PENDIENTE_FIRMA_JOSE_380');
  },
);
