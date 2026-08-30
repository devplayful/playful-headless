import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextConfig = require('../next.config.js');

test('serializes WordPress-backed static generation and avoids nested page retries', () => {
  assert.equal(nextConfig.experimental.staticGenerationMaxConcurrency, 1);
  assert.equal(nextConfig.experimental.staticGenerationMinPagesPerWorker, 1_000);
  assert.equal(nextConfig.experimental.staticGenerationRetryCount, 1);
});
