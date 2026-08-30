import assert from 'node:assert/strict';
import test from 'node:test';
import { ContactDeliveryError, deliverToWordPress } from '../../lib/contact/delivery.ts';
import { lead } from './fixtures.ts';

function configuredEnvironment() {
  const previous = {
    url: process.env.WORDPRESS_API_URL,
    token: process.env.WORDPRESS_CONTACT_TOKEN,
  };
  process.env.WORDPRESS_API_URL = 'https://wordpress.invalid/wp-json';
  process.env.WORDPRESS_CONTACT_TOKEN = 'test-token';
  return () => {
    if (previous.url === undefined) delete process.env.WORDPRESS_API_URL;
    else process.env.WORDPRESS_API_URL = previous.url;
    if (previous.token === undefined) delete process.env.WORDPRESS_CONTACT_TOKEN;
    else process.env.WORDPRESS_CONTACT_TOKEN = previous.token;
  };
}

test('sends a stable submission receipt key to WordPress', async () => {
  const restore = configuredEnvironment();
  try {
    let request: RequestInit | undefined;
    await deliverToWordPress(lead, {
      fetchImpl: async (_input, init) => {
        request = init;
        return new Response(null, { status: 200 });
      },
    });

    const headers = new Headers(request?.headers);
    assert.equal(headers.get('X-Playful-Submission-Id'), lead.submissionId);
    assert.equal(JSON.parse(String(request?.body)).submission_id, lead.submissionId);
  } finally {
    restore();
  }
});

test('recovers a lost success response by retrying the same idempotent submission', async () => {
  const restore = configuredEnvironment();
  try {
    const ids: string[] = [];
    const delays: number[] = [];
    let calls = 0;

    await deliverToWordPress(lead, {
      idempotentRetriesEnabled: true,
      fetchImpl: async (_input, init) => {
        calls += 1;
        ids.push(new Headers(init?.headers).get('X-Playful-Submission-Id') || '');
        if (calls === 1) {
          const error = new Error('response lost after WordPress completed the request');
          error.name = 'TimeoutError';
          throw error;
        }
        return new Response(JSON.stringify({ success: true, replayed: true }), { status: 200 });
      },
      sleep: async (delay) => { delays.push(delay); },
    });

    assert.equal(calls, 2);
    assert.deepEqual(ids, [lead.submissionId, lead.submissionId]);
    assert.deepEqual(delays, [500]);
  } finally {
    restore();
  }
});

test('waits for an in-progress duplicate and then accepts its completed receipt', async () => {
  const restore = configuredEnvironment();
  try {
    let calls = 0;
    await deliverToWordPress(lead, {
      idempotentRetriesEnabled: true,
      fetchImpl: async () => {
        calls += 1;
        return calls === 1
          ? new Response(null, { status: 409 })
          : new Response(null, { status: 200 });
      },
      sleep: async () => {},
    });
    assert.equal(calls, 2);
  } finally {
    restore();
  }
});

test('does not retry an ambiguous write until WordPress idempotency is explicitly enabled', async () => {
  const restore = configuredEnvironment();
  try {
    let calls = 0;
    await assert.rejects(
      deliverToWordPress(lead, {
        idempotentRetriesEnabled: false,
        fetchImpl: async () => {
          calls += 1;
          const error = new Error('timeout');
          error.name = 'TimeoutError';
          throw error;
        },
      }),
      (error) => error instanceof ContactDeliveryError && error.status === 504,
    );
    assert.equal(calls, 1);
  } finally {
    restore();
  }
});
