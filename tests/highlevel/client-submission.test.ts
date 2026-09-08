import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearSubmissionId,
  getOrCreateSubmissionId,
} from '../../lib/contact/client-attribution.ts';

test('keeps the submission id across retries and clears it only after confirmed success', () => {
  const originalWindow = globalThis.window;
  const values = new Map<string, string>();
  const sessionStorage = {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: { sessionStorage },
  });

  try {
    const first = getOrCreateSubmissionId();
    assert.equal(getOrCreateSubmissionId(), first);
    clearSubmissionId();
    assert.notEqual(getOrCreateSubmissionId(), first);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});
