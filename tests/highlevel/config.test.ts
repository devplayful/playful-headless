import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HighLevelConfigurationError,
  readHighLevelConfig,
} from '../../lib/highlevel/config.ts';

test('is fail-safe and needs no credentials while disabled', () => {
  assert.deepEqual(readHighLevelConfig({ HIGHLEVEL_ENABLED: 'false' }), { enabled: false });
});

test('refuses activation without exact pipeline decisions and durable storage', () => {
  assert.throws(
    () => readHighLevelConfig({ HIGHLEVEL_ENABLED: 'true', HIGHLEVEL_TEST_MODE: 'true' }),
    HighLevelConfigurationError,
  );
});

