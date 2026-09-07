import assert from 'node:assert/strict';
import test from 'node:test';
import { previewContactSubmissionsEnabled } from '../../lib/contact/preview-guard.ts';

test('blocks Preview submissions unless the isolated backend is explicitly enabled', () => {
  assert.equal(previewContactSubmissionsEnabled({ VERCEL_ENV: 'preview' }), false);
  assert.equal(previewContactSubmissionsEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SUBMISSIONS_ENABLED: 'false',
  }), false);
  assert.equal(previewContactSubmissionsEnabled({
    VERCEL_ENV: 'preview',
    PREVIEW_CONTACT_SUBMISSIONS_ENABLED: 'true',
  }), true);
});

test('does not change production or local behavior', () => {
  assert.equal(previewContactSubmissionsEnabled({ VERCEL_ENV: 'production' }), true);
  assert.equal(previewContactSubmissionsEnabled({}), true);
});
