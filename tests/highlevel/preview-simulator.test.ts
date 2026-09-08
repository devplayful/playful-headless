import assert from 'node:assert/strict';
import test from 'node:test';
import { simulatePreviewContact } from '../../lib/contact/preview-simulator.ts';
import { lead } from './fixtures.ts';

test('Preview simulator returns deterministic, non-sensitive evidence for a priority lead', () => {
  const first = simulatePreviewContact(lead);
  const replay = simulatePreviewContact(lead);

  assert.deepEqual(replay, first);
  assert.deepEqual(first, {
    version: 'preview-contact-simulator-v1',
    submissionRef: 'db8055e0e0307d5a',
    gate: 'simulated-validated',
    email: 'suppressed',
    highLevel: {
      contact: 'simulated-upsert',
      opportunity: 'simulated-consulta',
      nextAction: 'simulated-sla-task',
    },
    qualificationLevel: 'priority',
    storage: 'none',
    externalRequests: false,
  });

  const response = JSON.stringify(first);
  for (const pii of [lead.name, lead.email, lead.phone, lead.business, lead.message]) {
    assert.equal(response.includes(pii), false);
  }
});

test('Preview simulator does not simulate an opportunity for a non-priority lead', () => {
  const evidence = simulatePreviewContact({
    ...lead,
    qualification: { ...lead.qualification, monthlyRevenue: '50k_100k' },
  });

  assert.equal(evidence.qualificationLevel, 'review');
  assert.equal(evidence.highLevel.contact, 'simulated-upsert');
  assert.equal(evidence.highLevel.opportunity, 'not-created');
  assert.equal(evidence.highLevel.nextAction, 'not-created');
});
