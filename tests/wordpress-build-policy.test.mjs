import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { BUILD_BUDGET_MS } from '../scripts/build-with-budget.mjs';

const require = createRequire(import.meta.url);
const nextConfig = require('../next.config.js');

test('bounds WordPress-backed static generation and avoids nested page retries', () => {
  assert.equal(nextConfig.experimental.staticGenerationMaxConcurrency, 2);
  assert.ok(nextConfig.experimental.staticGenerationMaxConcurrency <= 2);
  assert.equal(nextConfig.experimental.staticGenerationMinPagesPerWorker, 1_000);
  assert.equal(nextConfig.experimental.staticGenerationRetryCount, 1);
  assert.equal(BUILD_BUDGET_MS, 90_000);
});
