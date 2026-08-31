import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HighLevelConfigurationError,
  readHighLevelConfig,
} from '../../lib/highlevel/config.ts';
import { customFieldIds } from './fixtures.ts';

test('is fail-safe and needs no credentials while disabled', () => {
  assert.deepEqual(readHighLevelConfig({ HIGHLEVEL_ENABLED: 'false' }), { enabled: false });
});

test('refuses activation without exact pipeline decisions and durable storage', () => {
  assert.throws(
    () => readHighLevelConfig({ HIGHLEVEL_ENABLED: 'true', HIGHLEVEL_TEST_MODE: 'true' }),
    HighLevelConfigurationError,
  );
});

test('refuses direct HighLevel sync while external form autocapture is unconfirmed', () => {
  assert.throws(
    () => readHighLevelConfig({
      HIGHLEVEL_ENABLED: 'true',
      HIGHLEVEL_TEST_MODE: 'true',
      HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED: 'false',
    }),
    (error) => error instanceof HighLevelConfigurationError
      && /FORM_SUBMISSIONS_DISABLED/.test(error.message),
  );
});

test('uses a short processing lease independently from the durable result TTL', () => {
  const enabled = readHighLevelConfig({
    HIGHLEVEL_ENABLED: 'true',
    HIGHLEVEL_TEST_MODE: 'true',
    HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED: 'true',
    HIGHLEVEL_LOCATION_ID: 'location',
    HIGHLEVEL_PIPELINE_ID: 'pipeline',
    HIGHLEVEL_STAGE_CONSULTA_ID: 'stage',
    HIGHLEVEL_DEFAULT_OWNER_ID: 'owner',
    HIGHLEVEL_CONTACT_TAG: 'website-inbound',
    HIGHLEVEL_SLA_HOURS: '24',
    HIGHLEVEL_IDEMPOTENCY_TTL_SECONDS: '604800',
    HIGHLEVEL_PROCESSING_LEASE_SECONDS: '30',
    HIGHLEVEL_IDEMPOTENCY_REDIS_REST_URL: 'https://redis.invalid',
    HIGHLEVEL_IDEMPOTENCY_REDIS_REST_TOKEN: 'test-only',
    HIGHLEVEL_CUSTOM_FIELD_IDS_JSON: JSON.stringify(customFieldIds),
  });

  assert.equal(enabled.enabled, true);
  if (enabled.enabled) {
    assert.equal(enabled.leaseSeconds, 30);
    assert.equal(enabled.idempotencyTtlSeconds, 604800);
  }
});

test('rejects a lease shorter than the longest two-call CRM critical section', () => {
  assert.throws(() => readHighLevelConfig({
    HIGHLEVEL_ENABLED: 'true',
    HIGHLEVEL_TEST_MODE: 'true',
    HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED: 'true',
    HIGHLEVEL_LOCATION_ID: 'location',
    HIGHLEVEL_PIPELINE_ID: 'pipeline',
    HIGHLEVEL_STAGE_CONSULTA_ID: 'stage',
    HIGHLEVEL_DEFAULT_OWNER_ID: 'owner',
    HIGHLEVEL_CONTACT_TAG: 'website-inbound',
    HIGHLEVEL_SLA_HOURS: '24',
    HIGHLEVEL_REQUEST_TIMEOUT_MS: '8000',
    HIGHLEVEL_PROCESSING_LEASE_SECONDS: '20',
    HIGHLEVEL_IDEMPOTENCY_REDIS_REST_URL: 'https://redis.invalid',
    HIGHLEVEL_IDEMPOTENCY_REDIS_REST_TOKEN: 'test-only',
    HIGHLEVEL_CUSTOM_FIELD_IDS_JSON: JSON.stringify(customFieldIds),
  }), HighLevelConfigurationError);
});

test('includes WordPress delivery and its Redis checkpoint in lease validation', () => {
  const base = {
    HIGHLEVEL_ENABLED: 'true',
    HIGHLEVEL_TEST_MODE: 'true',
    HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED: 'true',
    HIGHLEVEL_LOCATION_ID: 'location',
    HIGHLEVEL_PIPELINE_ID: 'pipeline',
    HIGHLEVEL_STAGE_CONSULTA_ID: 'stage',
    HIGHLEVEL_DEFAULT_OWNER_ID: 'owner',
    HIGHLEVEL_CONTACT_TAG: 'website-inbound',
    HIGHLEVEL_SLA_HOURS: '24',
    HIGHLEVEL_REQUEST_TIMEOUT_MS: '1000',
    HIGHLEVEL_IDEMPOTENCY_REDIS_REST_URL: 'https://redis.invalid',
    HIGHLEVEL_IDEMPOTENCY_REDIS_REST_TOKEN: 'test-only',
    HIGHLEVEL_CUSTOM_FIELD_IDS_JSON: JSON.stringify(customFieldIds),
  };

  assert.throws(() => readHighLevelConfig({
    ...base,
    HIGHLEVEL_PROCESSING_LEASE_SECONDS: '19',
  }), HighLevelConfigurationError);

  const enabled = readHighLevelConfig({
    ...base,
    HIGHLEVEL_PROCESSING_LEASE_SECONDS: '20',
  });
  assert.equal(enabled.enabled && enabled.leaseSeconds, 20);
});
