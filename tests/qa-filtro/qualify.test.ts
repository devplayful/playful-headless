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
    revenueOnline: '50k_100k',
    revenueOtherChannels: 'under_10k',
    businessType: 'marca_d2c',
    thirdParty: 'no',
    team: '',
    ...overrides,
  };
}

test('rechaza aún no vendo, ambos canales <10k y revendedor/agencia', () => {
  assert.equal(evaluateQaFiltro(base({ selling: 'aun_no_vendo' })).outcome, 'rejected');
  assert.equal(
    evaluateQaFiltro(base({ revenueOnline: 'under_10k', revenueOtherChannels: 'under_10k' })).outcome,
    'rejected',
  );
  assert.equal(evaluateQaFiltro(base({ businessType: 'revendedor' })).outcome, 'rejected');
  assert.equal(evaluateQaFiltro(base({ businessType: 'agencia' })).califTag, 'calif-no');
});

test('caso límite: ambos canales bajo 50k con al menos uno en 10–50k u otros canales sí', () => {
  assert.equal(
    evaluateQaFiltro(base({
      revenueOnline: '10k_50k',
      revenueOtherChannels: 'under_10k',
      thirdParty: 'no',
    })).outcome,
    'review',
  );
  assert.equal(
    evaluateQaFiltro(base({ revenueOnline: '50k_100k', thirdParty: 'si' })).outcome,
    'review',
  );
});

test('solicitud pendiente (calendario) con algún canal >= 50k USD/mes', () => {
  const result = evaluateQaFiltro(base({
    revenueOnline: '100k_250k',
    revenueOtherChannels: 'under_10k',
    thirdParty: 'no',
  }));
  assert.equal(result.outcome, 'qualified');
  assert.equal(result.califTag, 'calif-pendiente');
});

test('etiquetas calif por resultado: pendiente, límite y no pasa', () => {
  assert.equal(
    evaluateQaFiltro(base({
      revenueOnline: '50k_100k',
      revenueOtherChannels: 'under_10k',
      thirdParty: 'no',
    })).califTag,
    'calif-pendiente',
  );
  assert.equal(
    evaluateQaFiltro(base({
      revenueOnline: '10k_50k',
      revenueOtherChannels: 'under_10k',
      thirdParty: 'no',
    })).califTag,
    'calif-limite',
  );
  assert.equal(
    evaluateQaFiltro(base({
      revenueOnline: 'under_10k',
      revenueOtherChannels: 'under_10k',
      thirdParty: 'no',
    })).califTag,
    'calif-no',
  );
  assert.equal(
    evaluateQaFiltro(base({
      revenueOnline: '50k_100k',
      revenueOtherChannels: 'under_10k',
      thirdParty: 'si',
    })).califTag,
    'calif-limite',
  );
});

test('prod guard solo preview', () => {
  assert.equal(qaFiltroRouteEnabled({ VERCEL_ENV: 'production' }), false);
  assert.equal(qaFiltroRouteEnabled({ VERCEL_ENV: 'preview' }), true);
});
