import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQaFiltroGhlContactPayload } from '../../lib/qa-filtro/ghl-payload.ts';
import { QA_GHL_FIELD_IDS } from '../../lib/qa-filtro/ghl-fields.ts';
import type { QaFiltroAnswers } from '../../lib/qa-filtro/types.ts';

const answers: QaFiltroAnswers = {
  name: 'QA Ops',
  email: 'qa-filtro-test@example.com',
  selling: 'vendo_online',
  platform: 'shopify',
  revenue: '100k_250k',
  businessType: 'marca_d2c',
  thirdParty: 'no',
  team: 'Equipo de 3 en ecommerce',
};

test('payload GHL dry-run usa campos calif_* y etiquetas', () => {
  const payload = buildQaFiltroGhlContactPayload(answers, 'calif-pendiente');
  assert.deepEqual(payload.upsertContact.tags, ['qa-interno', 'calif-pendiente']);
  const byKey = new Map(payload.upsertContact.customFields.map((f) => [f.key, f]));
  assert.equal(byKey.get('calif_vende')?.id, QA_GHL_FIELD_IDS.calif_vende);
  assert.equal(byKey.get('calif_facturacion_mensual')?.fieldValue, '100–250k USD');
  assert.equal(byKey.get('calif_equipo')?.fieldValue, 'Equipo de 3 en ecommerce');
  assert.match(payload.wouldNotSend, /oportunidades/);
});
