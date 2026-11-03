import assert from 'node:assert/strict';
import test from 'node:test';
import { qaFiltroRouteEnabled } from '../../lib/qa-filtro/constants.ts';
import { evaluateQaFiltro } from '../../lib/qa-filtro/qualify.ts';
import type { QaFiltroAnswers } from '../../lib/qa-filtro/types.ts';

function base(overrides: Partial<QaFiltroAnswers> = {}): QaFiltroAnswers {
  return {
    name: 'QA Test',
    email: 'qa@example.com',
    selling: 'vendo_online',
    platform: 'shopify',
    revenue: '50k_100k',
    businessType: 'marca_d2c',
    thirdParty: 'no',
    team: '',
    ...overrides,
  };
}

test('rechaza aún no vendo, bajo facturación y revendedor/agencia', () => {
  assert.equal(evaluateQaFiltro(base({ selling: 'aun_no_vendo' })).outcome, 'rejected');
  assert.equal(evaluateQaFiltro(base({ revenue: 'under_10k' })).outcome, 'rejected');
  assert.equal(evaluateQaFiltro(base({ businessType: 'revendedor' })).outcome, 'rejected');
  assert.equal(evaluateQaFiltro(base({ businessType: 'agencia' })).califTag, 'calif-no');
});

test('caso límite: 10–50k con terceros o facturación en blanco', () => {
  assert.equal(
    evaluateQaFiltro(base({ revenue: '10k_50k', thirdParty: 'si' })).outcome,
    'review',
  );
  assert.equal(evaluateQaFiltro(base({ revenue: '' })).outcome, 'review');
});

test('califica con facturación >= 10k y marca D2C sin terceros conflictivos', () => {
  const result = evaluateQaFiltro(base({ revenue: '100k_250k', thirdParty: 'no' }));
  assert.equal(result.outcome, 'qualified');
  assert.equal(result.califTag, 'calif-pendiente');
});

test('prod guard solo preview', () => {
  assert.equal(qaFiltroRouteEnabled({ VERCEL_ENV: 'production' }), false);
  assert.equal(qaFiltroRouteEnabled({ VERCEL_ENV: 'preview' }), true);
});
