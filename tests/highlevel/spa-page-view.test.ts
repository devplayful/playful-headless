import assert from 'node:assert/strict';
import test from 'node:test';
import { sendSpaPageView, spaPagePath } from '../../lib/analytics/spa-page-view.ts';

test('spa page path includes search when present', () => {
  assert.equal(spaPagePath('/contactar-agencia-de-marketing-digital', ''), '/contactar-agencia-de-marketing-digital');
  assert.equal(spaPagePath('/blog', 'page=2'), '/blog?page=2');
});

test('sendSpaPageView no-ops when qa=1 is in the search', () => {
  const calls: unknown[][] = [];
  const originalWindow = globalThis.window;
  const originalNav = globalThis.navigator;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { search: '?qa=1' },
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
      dataLayer: [],
    },
  });
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: { userAgent: 'Mozilla/5.0' },
  });
  try {
    sendSpaPageView('/agencia-e-commerce?qa=1');
    assert.deepEqual(calls, []);
    assert.deepEqual(window.dataLayer, []);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: originalNav,
    });
  }
});

test('prefers gtag config and does not duplicate via dataLayer', () => {
  const calls: unknown[][] = [];
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
      dataLayer: [],
    },
  });
  const previousGa = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-WH76RQWSCT';
  try {
    sendSpaPageView('/agencia-seo');
    assert.deepEqual(calls, [['config', 'G-WH76RQWSCT', { page_path: '/agencia-seo' }]]);
    assert.deepEqual(window.dataLayer, []);
  } finally {
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = previousGa;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});
