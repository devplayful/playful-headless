import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WordPressUpstreamError,
  isTransientWordPressStatus,
  wordpressFetch,
} from '../services/wordpress-request.mjs';

function response(status, statusText = '') {
  return new Response(null, { status, statusText });
}

test('retries transient 5xx responses with bounded exponential jitter', async () => {
  const responses = [response(500, 'Internal Server Error'), response(502, 'Bad Gateway'), response(200)];
  const delays = [];
  let calls = 0;

  const result = await wordpressFetch('https://endpoint.playfulagency.com/wp-json/wp/v2/posts', {}, {
    fetchImpl: async () => responses[calls++],
    sleep: async (delay) => delays.push(delay),
    random: () => 0.5,
    baseDelayMs: 100,
    maxDelayMs: 1_000,
  });

  assert.equal(result.status, 200);
  assert.equal(calls, 3);
  assert.deepEqual(delays, [150, 250]);
});

test('retries a network failure and preserves its eventual success', async () => {
  let calls = 0;
  const result = await wordpressFetch('https://endpoint.playfulagency.com/wp-json', {}, {
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError('fetch failed');
      return response(200);
    },
    sleep: async () => {},
  });

  assert.equal(result.status, 200);
  assert.equal(calls, 2);
});

test('returns a real 404 immediately so the route can call notFound', async () => {
  let calls = 0;
  const result = await wordpressFetch('https://endpoint.playfulagency.com/wp-json/missing', {}, {
    fetchImpl: async () => {
      calls += 1;
      return response(404, 'Not Found');
    },
  });

  assert.equal(result.status, 404);
  assert.equal(calls, 1);
});

test('does not retry a non-transient client error', async () => {
  let calls = 0;

  await assert.rejects(
    wordpressFetch('https://endpoint.playfulagency.com/wp-json', {}, {
      fetchImpl: async () => {
        calls += 1;
        return response(403, 'Forbidden');
      },
    }),
    (error) => {
      assert.ok(error instanceof WordPressUpstreamError);
      assert.equal(error.status, 403);
      assert.equal(error.attempts, 1);
      return true;
    },
  );
  assert.equal(calls, 1);
});

test('propagates a transient failure after the bounded retry budget', async () => {
  let calls = 0;

  await assert.rejects(
    wordpressFetch('https://endpoint.playfulagency.com/wp-json', {}, {
      fetchImpl: async () => {
        calls += 1;
        return response(503, 'Service Unavailable');
      },
      sleep: async () => {},
      maxAttempts: 3,
    }),
    (error) => {
      assert.ok(error instanceof WordPressUpstreamError);
      assert.equal(error.status, 503);
      assert.equal(error.attempts, 3);
      return true;
    },
  );
  assert.equal(calls, 3);
});

test('does not retry an explicitly aborted request', async () => {
  let calls = 0;
  const abortError = new Error('aborted');
  abortError.name = 'AbortError';

  await assert.rejects(
    wordpressFetch('https://endpoint.playfulagency.com/wp-json', {}, {
      fetchImpl: async () => {
        calls += 1;
        throw abortError;
      },
    }),
    abortError,
  );
  assert.equal(calls, 1);
});

test('classifies only retry-safe statuses as transient', () => {
  assert.equal(isTransientWordPressStatus(408), true);
  assert.equal(isTransientWordPressStatus(429), true);
  assert.equal(isTransientWordPressStatus(500), true);
  assert.equal(isTransientWordPressStatus(599), true);
  assert.equal(isTransientWordPressStatus(404), false);
  assert.equal(isTransientWordPressStatus(400), false);
});
