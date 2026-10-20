import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import {
  isPlayfulQaUserAgent,
  isQaSearch,
  isQaTraffic,
  PLAYFUL_QA_UA,
} from '../lib/analytics/qa-traffic.ts';

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

test('tag snippets skip gtag config and GTM when qa=1 or PlayfulQA/1.0', () => {
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
  assert.match(ga, /qa=1/);
  assert.match(ga, /PlayfulQA/);
  assert.match(gtm, /qa=1/);
  assert.match(gtm, /PlayfulQA/);
});
