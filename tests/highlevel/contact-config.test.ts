import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ContactPipelineConfigurationError,
  isContactPipelineEnabled,
  readContactPipelineConfig,
} from '../../lib/contact/config.ts';
import { contactDeliveryLeaseMinimumMs } from '../../lib/contact/timeouts.ts';

test('keeps the durable pipeline off by default for a Redis-free rollback', () => {
  assert.equal(isContactPipelineEnabled({}), false);
  assert.equal(isContactPipelineEnabled({ CONTACT_PIPELINE_ENABLED: 'false' }), false);
  assert.equal(isContactPipelineEnabled({ CONTACT_PIPELINE_ENABLED: 'true' }), true);
});

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
    CONTACT_PROCESSING_LEASE_SECONDS: '29',
  }), ContactPipelineConfigurationError);

  assert.deepEqual(readContactPipelineConfig({
    ...base,
    CONTACT_PROCESSING_LEASE_SECONDS: '30',
  }), {
    idempotencyTtlSeconds: 604800,
    leaseSeconds: 30,
    redisRestUrl: 'https://redis.invalid',
    redisRestToken: 'test-token',
  });
});

test('derives the idempotent protocol lease from every bounded request and backoff', () => {
  assert.equal(contactDeliveryLeaseMinimumMs(false), 30_000);
  assert.equal(contactDeliveryLeaseMinimumMs(true), 103_000);

  const base = {
    WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED: 'true',
    CONTACT_IDEMPOTENCY_REDIS_REST_URL: 'https://redis.invalid',
    CONTACT_IDEMPOTENCY_REDIS_REST_TOKEN: 'test-token',
  };
  assert.throws(() => readContactPipelineConfig({
    ...base,
    CONTACT_PROCESSING_LEASE_SECONDS: '102',
  }), (error) => error instanceof ContactPipelineConfigurationError
    && /al menos 103/.test(error.message));

  assert.equal(readContactPipelineConfig({
    ...base,
    CONTACT_PROCESSING_LEASE_SECONDS: '103',
  }).leaseSeconds, 103);
});
