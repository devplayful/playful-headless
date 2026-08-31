import assert from 'node:assert/strict';
import test from 'node:test';
import { pushGenerateLead } from '../../lib/contact/analytics.ts';

test('generate_lead contains no contact PII or CRM identifiers', () => {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { dataLayer: [] },
  });

  try {
    pushGenerateLead('website-contact');
    assert.deepEqual(window.dataLayer, [{ event: 'generate_lead', form_id: 'website-contact' }]);
    const serialized = JSON.stringify(window.dataLayer);
    for (const forbidden of ['email', 'phone', 'name', 'message', 'contactId', 'opportunityId', 'utm_']) {
      assert(!serialized.includes(forbidden));
    }
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});

