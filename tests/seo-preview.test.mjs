import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { isReadOnlySeoPreview } from '../utils/seo-preview.mjs';

test('read-only SEO preview is opt-in and cannot affect production', () => {
  for (const VERCEL_ENV of ['production', 'development', undefined]) {
    for (const SEO_READ_ONLY_PREVIEW of ['true', 'false', undefined]) {
      assert.equal(isReadOnlySeoPreview({ VERCEL_ENV, SEO_READ_ONLY_PREVIEW }), false);
    }
  }
  assert.equal(isReadOnlySeoPreview({ VERCEL_ENV: 'preview' }), false);
  assert.equal(isReadOnlySeoPreview({ VERCEL_ENV: 'preview', SEO_READ_ONLY_PREVIEW: 'false' }), false);
  assert.equal(isReadOnlySeoPreview({ VERCEL_ENV: 'preview', SEO_READ_ONLY_PREVIEW: 'true' }), true);
});

test('server layout omits real analytics and CRM widgets only in read-only SEO preview', () => {
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /const readOnlySeoPreview = isReadOnlySeoPreview\(\);/);
  for (const [name, condition] of [
    ['GoogleTagManager', '!readOnlySeoPreview && gtmId && '],
    ['GoogleAnalytics', '!readOnlySeoPreview && gaId && '],
    ['ChatWidget', '!readOnlySeoPreview && '],
  ]) {
    assert.equal(layout.split(`<${name} `).length - 1, 1);
    assert.ok(layout.includes(`{${condition}<${name} `));
  }
});
