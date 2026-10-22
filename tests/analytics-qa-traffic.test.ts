import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  isPlayfulQaUserAgent,
  isQaSearch,
  isQaTraffic,
  PLAYFUL_QA_UA,
} from '../lib/analytics/qa-traffic.ts';
import { sendSpaPageView } from '../lib/analytics/spa-page-view.ts';

test('qa=1 and PlayfulQA/1.0 are QA traffic; qa=10 is not', () => {
  assert.equal(isQaSearch('?qa=1'), true);
  assert.equal(isQaSearch('?utm_source=ads&qa=1'), true);
  assert.equal(isQaSearch('?qa=10'), false);
  assert.equal(isQaSearch(''), false);
  assert.equal(isPlayfulQaUserAgent(PLAYFUL_QA_UA), true);
  assert.equal(isPlayfulQaUserAgent('Mozilla/5.0 (X11; Linux x86_64) Chrome/128'), false);
  assert.equal(isQaTraffic({ search: '?qa=1', userAgent: 'Chrome' }), true);
  assert.equal(isQaTraffic({ search: '', userAgent: PLAYFUL_QA_UA }), true);
  assert.equal(isQaTraffic({ search: '', userAgent: 'Chrome' }), false);
});

test('QA: gtag config marks traffic_type=internal; GTM (Ads/Meta) still skipped', () => {
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
  assert.match(ga, /qa=1/);
  assert.match(ga, /PlayfulQA/);
  assert.match(gtm, /qa=1/);
  assert.match(gtm, /PlayfulQA/);
  assert.match(ga, /createElement\('script'\)/);
  assert.match(ga, /document\.head\.appendChild\(s\)/);
  assert.doesNotMatch(ga, /<Script[\s\S]*?\ssrc=\{`https:\/\/www\.googletagmanager\.com\/gtag\/js/);
  assert.match(gtm, /w\.__playfulQa=1;return;/);
  assert.match(ga, /if\(qa\)\{window\.__playfulQa=1;\}/);
  assert.doesNotMatch(ga, /__playfulQa=1;return;/);
  assert.match(ga, /if\(qa\)\{cfg\.traffic_type='internal';\}/);
  assert.match(ga, /gtag\('config', '\$\{gaId\}', cfg\)/);
});

test('sendSpaPageView sends QA page_view with traffic_type=internal', () => {
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
    assert.equal(calls.length, 1);
    assert.equal((calls[0][2] as Record<string, unknown>).traffic_type, 'internal');
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
