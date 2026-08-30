import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ContactPipelineConfigurationError,
  readContactPipelineConfig,
} from '../../lib/contact/config.ts';

test('requires durable delivery state even while direct HighLevel sync is disabled', () => {
  assert.throws(
    () => readContactPipelineConfig({ HIGHLEVEL_ENABLED: 'false' }),
    ContactPipelineConfigurationError,
  );
});

test('uses generic contact storage settings and validates the full delivery lease', () => {
  const base = {
    CONTACT_IDEMPOTENCY_REDIS_REST_URL: 'https://redis.invalid',
    CONTACT_IDEMPOTENCY_REDIS_REST_TOKEN: 'test-token',
    CONTACT_IDEMPOTENCY_TTL_SECONDS: '604800',
  };
  assert.throws(() => readContactPipelineConfig({
    ...base,
    CONTACT_PROCESSING_LEASE_SECONDS: '19',
  }), ContactPipelineConfigurationError);

  assert.deepEqual(readContactPipelineConfig({
    ...base,
    CONTACT_PROCESSING_LEASE_SECONDS: '20',
  }), {
    idempotencyTtlSeconds: 604800,
    leaseSeconds: 20,
    redisRestUrl: 'https://redis.invalid',
    redisRestToken: 'test-token',
  });
});
