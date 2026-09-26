import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { describeCrmFailure } from '../../lib/contact/crm-alert.ts';
import { HighLevelApiError } from '../../lib/highlevel/client.ts';
import { AmbiguousOpportunityError } from '../../lib/highlevel/workflow.ts';

test('describes CRM failures without copying free-text or contact fields', () => {
  assert.equal(
    describeCrmFailure(new HighLevelApiError(400, 'create opportunity')),
    'HighLevel create opportunity HTTP 400',
  );
  assert.equal(
    describeCrmFailure(new HighLevelApiError(400, 'create opportunity', 'duplicate opportunity')),
    'HighLevel create opportunity HTTP 400: duplicate opportunity',
  );
  assert.equal(
    describeCrmFailure(new AmbiguousOpportunityError(2)),
    'múltiples oportunidades abiertas (2)',
  );
  assert.equal(describeCrmFailure(new TypeError('cannot read id')), 'TypeError');
});

test('the public contact API no longer asks the lead to retry a commercial registration', () => {
  const route = readFileSync(new URL('../../app/api/contact/route.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(route, /falta confirmar el registro comercial/i);
  assert.match(route, /Post-delivery CRM failures are returned as success/);
  assert.match(
    readFileSync(new URL('../../lib/contact/orchestrator.ts', import.meta.url), 'utf8'),
    /logCrmFailureAfterDelivery/,
  );
});
