import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GENERATE_LEAD_FLUSH_TIMEOUT_MS,
  pushGenerateLead,
} from '../../lib/contact/analytics.ts';

function withWindow(value: unknown, run: () => Promise<void> | void) {
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value,
  });
  return Promise.resolve()
    .then(run)
    .finally(() => {
      Object.defineProperty(globalThis, 'window', {
        configurable: true,
        value: originalWindow,
      });
    });
}

test('generate_lead contains no contact PII or CRM identifiers', async () => {
  await withWindow({ dataLayer: [] }, async () => {
    const pending = pushGenerateLead('website-contact');
    const event = window.dataLayer?.[0] as Record<string, unknown>;
    assert.equal(event.event, 'generate_lead');
    assert.equal(event.form_id, 'website-contact');
    assert.equal(typeof event.eventCallback, 'function');
    assert.equal(event.eventTimeout, GENERATE_LEAD_FLUSH_TIMEOUT_MS);
    (event.eventCallback as () => void)();
    await pending;
    const serialized = JSON.stringify(window.dataLayer?.map((item) => ({
      event: item.event,
      form_id: item.form_id,
      eventTimeout: item.eventTimeout,
    })));
    for (const forbidden of ['email', 'phone', 'name', 'message', 'contactId', 'opportunityId', 'utm_']) {
      assert(!serialized.includes(forbidden));
    }
  });
});

test('resolves when GTM eventCallback fires', async () => {
  await withWindow({ dataLayer: [] }, async () => {
    let resolved = false;
    const pending = pushGenerateLead('website-contact', 200).then(() => {
      resolved = true;
    });
    const event = window.dataLayer?.[0] as { eventCallback: () => void };
    assert.equal(resolved, false);
    event.eventCallback();
    await pending;
    assert.equal(resolved, true);
  });
});

test('resolves by hard timeout when GTM never calls back', async () => {
  await withWindow({ dataLayer: [] }, async () => {
    const started = Date.now();
    await pushGenerateLead('website-contact', 25);
    assert(Date.now() - started >= 20);
    const event = window.dataLayer?.[0] as Record<string, unknown>;
    assert.equal(event.event, 'generate_lead');
    assert.equal(event.eventTimeout, 25);
  });
});

test('does not block when dataLayer is missing', async () => {
  await withWindow({}, async () => {
    const started = Date.now();
    await pushGenerateLead('website-contact', 400);
    assert(Date.now() - started < 80);
  });
});
