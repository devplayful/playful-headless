import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clearSubmissionId,
  getOrCreateSubmissionId,
  getSubmissionAttribution,
} from '../../lib/contact/client-attribution.ts';
import { ATTRIBUTION_STORAGE_FIRST, ATTRIBUTION_STORAGE_LAST } from '../../lib/contact/attribution.ts';

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

test('persists first-touch UTMs across a later page without query', () => {
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  const values = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => values.get(key) || null,
    setItem: (key: string, value: string) => { values.set(key, value); },
    removeItem: (key: string) => { values.delete(key); },
  };
  const location = {
    pathname: '/',
    search: '?utm_source=qa&utm_medium=test&gclid=QA-GCLID-TEST&fbclid=QA-FBCLID-TEST',
    hostname: 'playfulagency.com',
  };
  const windowMock = {
    location,
    localStorage,
    sessionStorage: localStorage,
  };
  Object.defineProperty(globalThis, 'window', { configurable: true, value: windowMock });
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: { referrer: 'https://www.google.com/', cookie: '' },
  });

  try {
    const first = getSubmissionAttribution();
    assert.equal(first.originalAttribution.utm_source, 'qa');
    assert.equal(first.originalAttribution.gclid, 'QA-GCLID-TEST');
    assert.ok(values.get(ATTRIBUTION_STORAGE_FIRST));
    location.pathname = '/contactar-agencia-de-marketing-digital';
    location.search = '';
    const later = getSubmissionAttribution();
    assert.equal(later.originalAttribution.utm_source, 'qa');
    assert.equal(later.recentAttribution.utm_source, 'qa');
    assert.ok(values.get(ATTRIBUTION_STORAGE_LAST));
  } finally {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    Object.defineProperty(globalThis, 'document', { configurable: true, value: originalDocument });
  }
});
