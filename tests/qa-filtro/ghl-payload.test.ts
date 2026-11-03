import assert from 'node:assert/strict';
import test from 'node:test';
import { buildQaFiltroGhlContactPayload } from '../../lib/qa-filtro/ghl-payload.ts';
import {
  QA_GHL_FIELD_IDS,
  QA_GHL_REVENUE_PAYLOAD_VALUES,
  QA_GHL_REVENUE_VALUES,
} from '../../lib/qa-filtro/ghl-fields.ts';
import { QA_REVENUE_OPTIONS } from '../../lib/qa-filtro/types.ts';
import type { QaFiltroAnswers } from '../../lib/qa-filtro/types.ts';

const EXPECTED_REVENUE_PAYLOAD_STRINGS = [
  '<10k USD',
  '10–50k USD',
  '50–100k USD',
  '100–250k USD',
  '>250k USD',
] as const;

const answers: QaFiltroAnswers = {
  name: 'QA Ops',
  email: 'qa-filtro-test@example.com',
  selling: 'vendo_online',
  platform: 'shopify',
  revenueOnline: '100k_250k',
  revenueOtherChannels: '10k_50k',
  businessType: 'marca_d2c',
  thirdParty: 'no',
  team: 'Equipo de 3 en ecommerce',
};

test('valores de facturación GHL coinciden byte a byte con las cinco opciones', () => {
  assert.deepEqual(QA_GHL_REVENUE_PAYLOAD_VALUES, EXPECTED_REVENUE_PAYLOAD_STRINGS);
  for (const option of QA_REVENUE_OPTIONS) {
    const value = QA_GHL_REVENUE_VALUES[option];
    assert.ok(EXPECTED_REVENUE_PAYLOAD_STRINGS.includes(value as typeof EXPECTED_REVENUE_PAYLOAD_STRINGS[number]));
    if (value.includes('–')) {
      assert.equal(value.charCodeAt(value.indexOf('–')), 0x2013);
    }
  }
});

test('payload GHL dry-run usa campos calif_* y etiquetas', () => {
  const payload = buildQaFiltroGhlContactPayload(answers, 'calif-pendiente');
  assert.deepEqual(payload.upsertContact.tags, ['qa-interno', 'calif-pendiente']);
  const byKey = new Map(payload.upsertContact.customFields.map((f) => [f.key, f]));
  assert.equal(byKey.get('calif_vende')?.id, QA_GHL_FIELD_IDS.calif_vende);
  assert.equal(byKey.get('contact.calif_facturacion_online')?.id, QA_GHL_FIELD_IDS.calif_facturacion_online);
  assert.equal(byKey.get('contact.calif_facturacion_online')?.fieldValue, '100–250k USD');
  assert.equal(byKey.get('contact.calif_facturacion_otros_canales')?.fieldValue, '10–50k USD');
  assert.equal(byKey.get('calif_otros_canales')?.fieldValue, 'no');
  assert.equal(byKey.get('calif_equipo')?.fieldValue, 'Equipo de 3 en ecommerce');
  assert.match(payload.wouldNotSend, /oportunidades/);
});

test('calif_otros_canales envía sí/no en minúscula', () => {
  const payloadSi = buildQaFiltroGhlContactPayload({ ...answers, thirdParty: 'si' }, 'calif-pendiente');
  const byKeySi = new Map(payloadSi.upsertContact.customFields.map((f) => [f.key, f]));
  assert.equal(byKeySi.get('calif_otros_canales')?.fieldValue, 'sí');
});
