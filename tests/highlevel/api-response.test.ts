import assert from 'node:assert/strict';
import test from 'node:test';
import { pendingConfirmationResponse } from '../../lib/contact/api-response.ts';

test('ambiguous delivery returns neutral 202 without generate_lead or retry instruction', () => {
  const response = pendingConfirmationResponse(false);

  assert.equal(response.status, 202);
  assert.equal(response.body.success, false);
  assert.equal(response.body.pendingConfirmation, true);
  assert.equal(response.body.analytics.generateLead, false);
  assert.match(response.body.message, /aún no está confirmada/i);
  assert.match(response.body.message, /no la envíes de nuevo/i);
  assert.doesNotMatch(response.body.message, /enviad[oa] con éxito/i);
});
