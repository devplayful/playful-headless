import assert from 'node:assert/strict';
import test from 'node:test';
import { sendSpaPageView, spaPagePath } from '../../lib/analytics/spa-page-view.ts';

test('spa page path includes search when present', () => {
  assert.equal(spaPagePath('/contactar-agencia-de-marketing-digital', ''), '/contactar-agencia-de-marketing-digital');
  assert.equal(spaPagePath('/blog', 'page=2'), '/blog?page=2');
});

test('prefers gtag config and does not duplicate via dataLayer', () => {
  const calls: unknown[][] = [];
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { hostname: 'playfulagency.com' },
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

test('does not send page_view on the Vercel production alias', () => {
  const calls: unknown[][] = [];
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      location: { hostname: 'playful-headless.vercel.app' },
      gtag: (...args: unknown[]) => {
        calls.push(args);
      },
      dataLayer: [],
    },
  });
  try {
    sendSpaPageView('/agencia-seo');
    assert.deepEqual(calls, []);
    assert.deepEqual(window.dataLayer, []);
  } finally {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  }
});
