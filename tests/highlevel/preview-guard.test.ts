import assert from 'node:assert/strict';
import test from 'node:test';
import {
  previewContactSimulatorEnabled,
  previewContactSubmissionsEnabled,
} from '../../lib/contact/preview-guard.ts';

test('simulator is opt-in and cannot be enabled outside Vercel Preview', () => {
  assert.equal(previewContactSimulatorEnabled({}), false);
  assert.equal(previewContactSimulatorEnabled({
    VERCEL_ENV: 'production',
    PREVIEW_CONTACT_SIMULATOR_ENABLED: 'true',
  }), false);
  assert.equal(previewContactSimulatorEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SIMULATOR_ENABLED: 'false',
  }), false);
  assert.equal(previewContactSimulatorEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SIMULATOR_ENABLED: 'true',
  }), true);
});

test('blocks Preview submissions unless the isolated backend is explicitly enabled', () => {
  assert.equal(previewContactSubmissionsEnabled({ VERCEL_ENV: 'preview' }), false);
  assert.equal(previewContactSubmissionsEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SUBMISSIONS_ENABLED: 'false',
  }), false);
  assert.equal(previewContactSubmissionsEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SUBMISSIONS_ENABLED: 'true',
  }), false);
  assert.equal(previewContactSubmissionsEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SUBMISSIONS_ENABLED: 'true',
    PREVIEW_CONTACT_BACKEND_ISOLATED: 'true',
    HIGHLEVEL_TEST_MODE: 'true',
    WORDPRESS_API_URL: 'https://wpqa.playfulagency.com/wp-json',
  }), true);
});

test('refuses a production, malformed or non-isolated Preview endpoint', () => {
  const base = {
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SUBMISSIONS_ENABLED: 'true',
    PREVIEW_CONTACT_BACKEND_ISOLATED: 'true',
    HIGHLEVEL_TEST_MODE: 'true',
  };
  for (const wordpressUrl of [
    'https://endpoint.playfulagency.com/wp-json',
    'http://wpqa.playfulagency.com/wp-json',
    'https://wpqa.playfulagency.com:444/wp-json',
    'https://wpqa.playfulagency.com/wp-json/other',
    'not a url',
  ]) {
    assert.equal(previewContactSubmissionsEnabled({
      ...base,
      WORDPRESS_API_URL: wordpressUrl,
    }), false);
  }
});

test('does not change production or local behavior', () => {
  assert.equal(previewContactSubmissionsEnabled({ VERCEL_ENV: 'production' }), true);
  assert.equal(previewContactSubmissionsEnabled({}), true);
});
