import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { evaluateQaFiltro } from '../../lib/qa-filtro/qualify.ts';
import type { QaFiltroAnswers } from '../../lib/qa-filtro/types.ts';

const routeSource = readFileSync(
  new URL('../../app/api/calificacion/route.ts', import.meta.url),
  'utf8',
);
const syncSource = readFileSync(
  new URL('../../lib/calificacion/sync-to-ghl.ts', import.meta.url),
  'utf8',
);

test('/api/calificacion no importa syncWebsiteLeadToHighLevel ni oportunidades', () => {
  assert.doesNotMatch(routeSource, /syncWebsiteLeadToHighLevel/);
  assert.doesNotMatch(routeSource, /createOpportunity/);
  assert.doesNotMatch(routeSource, /findOpenOpportunities/);
  assert.doesNotMatch(syncSource, /createOpportunity/);
  assert.doesNotMatch(syncSource, /createTask/);
  assert.doesNotMatch(syncSource, /addContactTags/);
  assert.doesNotMatch(syncSource, /fit:/);
});

test('tags por resultado en servidor (sin qa-interno)', () => {
  const qualified: QaFiltroAnswers = {
    name: 'A',
    email: 'a@example.com',
    selling: 'vendo_online',
    platform: 'shopify',
    revenueOnline: '50k_100k',
    revenueOtherChannels: 'under_10k',
    businessType: 'marca_d2c',
    thirdParty: 'no',
    team: '',
  };
  assert.equal(evaluateQaFiltro(qualified).califTag, 'calif-pendiente');

  const review: QaFiltroAnswers = {
    ...qualified,
    revenueOnline: '10k_50k',
    revenueOtherChannels: '10k_50k',
  };
  assert.equal(evaluateQaFiltro(review).califTag, 'calif-limite');

  const rejected: QaFiltroAnswers = {
    ...qualified,
    selling: 'aun_no_vendo',
  };
  assert.equal(evaluateQaFiltro(rejected).califTag, 'calif-no');
});
