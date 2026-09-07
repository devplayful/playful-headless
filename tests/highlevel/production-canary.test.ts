import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  isProductionCanaryLead,
  ProductionCanaryConfigurationError,
} from '../../lib/contact/production-canary.ts';

const CANARY_EMAIL = 'canary@example.invalid';
const CANARY_HASH = createHash('sha256').update(CANARY_EMAIL).digest('hex');

function canaryEnvironment(overrides: Record<string, string | undefined> = {}) {
  return {
    VERCEL_ENV: 'production',
    CONTACT_PIPELINE_PRODUCTION_CANARY_ENABLED: 'true',
    CONTACT_E2E_CANARY_EMAIL_SHA256: CANARY_HASH,
    CONTACT_PIPELINE_ENABLED: 'false',
    WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED: 'true',
    HIGHLEVEL_ENABLED: 'true',
    HIGHLEVEL_TEST_MODE: 'false',
    HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED: 'true',
    HIGHLEVEL_CANARY_AUTOMATIONS_DISABLED: 'true',
    ...overrides,
  };
}

test('is disabled outside Production or while its flag is off', () => {
  assert.equal(isProductionCanaryLead(CANARY_EMAIL, canaryEnvironment({
    VERCEL_ENV: 'preview',
  })), false);
  assert.equal(isProductionCanaryLead(CANARY_EMAIL, canaryEnvironment({
    CONTACT_PIPELINE_PRODUCTION_CANARY_ENABLED: 'false',
  })), false);
});

test('routes only the server-side hash-matched canary email', () => {
  const env = canaryEnvironment();
  assert.equal(isProductionCanaryLead(CANARY_EMAIL.toUpperCase(), env), true);
  assert.equal(isProductionCanaryLead('other@example.invalid', env), false);
});

test('an absent or malformed hash never changes the stable route', () => {
  assert.equal(isProductionCanaryLead(CANARY_EMAIL, canaryEnvironment({
    CONTACT_E2E_CANARY_EMAIL_SHA256: '',
  })), false);
  assert.equal(isProductionCanaryLead(CANARY_EMAIL, canaryEnvironment({
    CONTACT_E2E_CANARY_EMAIL_SHA256: 'not-a-sha256',
  })), false);
});

test('a hash-matched request fails closed unless every communication guard is attested', () => {
  for (const [key, value] of [
    ['CONTACT_PIPELINE_ENABLED', 'true'],
    ['WORDPRESS_CONTACT_IDEMPOTENCY_ENABLED', 'false'],
    ['HIGHLEVEL_ENABLED', 'false'],
    ['HIGHLEVEL_TEST_MODE', 'true'],
    ['HIGHLEVEL_EXTERNAL_FORM_SUBMISSIONS_DISABLED', 'false'],
    ['HIGHLEVEL_CANARY_AUTOMATIONS_DISABLED', 'false'],
  ]) {
    assert.throws(
      () => isProductionCanaryLead(CANARY_EMAIL, canaryEnvironment({ [key]: value })),
      ProductionCanaryConfigurationError,
    );
  }
});
