import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  isCmsHomeFromPayload,
  CMS_HOME_FROM_PAYLOAD_ENV,
  shouldRenderHomeFromPayload,
  homePayloadPreviewAttrs,
  CMS_PREVIEW_HOME_PATH,
} = await import('../lib/cms-home-flag.ts');

const buildScript = readFileSync(new URL('../scripts/build-with-budget.mjs', import.meta.url), 'utf8');
const seedSource = readFileSync(new URL('../scripts/seed-home.ts', import.meta.url), 'utf8');
const payloadConfig = readFileSync(new URL('../payload.config.ts', import.meta.url), 'utf8');
const migrationIndex = readFileSync(new URL('../cms/migrations/index.ts', import.meta.url), 'utf8');

test('CMS_HOME_FROM_PAYLOAD apagado por defecto', () => {
  assert.equal(isCmsHomeFromPayload({ [CMS_HOME_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsHomeFromPayload({}), false);
  assert.equal(isCmsHomeFromPayload({ [CMS_HOME_FROM_PAYLOAD_ENV]: 'true' }), true);
});

test('Preview ?cms=1 solo con VERCEL_ENV=preview', () => {
  assert.equal(
    shouldRenderHomeFromPayload(true, { VERCEL_ENV: 'preview', CMS_HOME_FROM_PAYLOAD_ENV: 'false' }),
    true,
  );
  assert.equal(
    shouldRenderHomeFromPayload(true, { VERCEL_ENV: 'production', CMS_HOME_FROM_PAYLOAD_ENV: 'false' }),
    false,
  );
});

test('data-cms-source payload solo en preview', () => {
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = 'preview';
  assert.deepEqual(homePayloadPreviewAttrs(), { 'data-cms-source': 'payload' });
  process.env.VERCEL_ENV = 'production';
  assert.deepEqual(homePayloadPreviewAttrs(), {});
  process.env.VERCEL_ENV = prev;
});

test('build preview ejecuta migrate + seed home con logs HOME-CMS', () => {
  assert.match(buildScript, /runPayloadPreviewHomeSeed/);
  assert.match(buildScript, /summarizePreviewHomeSeedOutput/);
  assert.match(seedSource, /\[HOME-CMS\]/);
  assert.match(seedSource, /resumen:/);
});

test('colección home registrada y migración 20261030_100000_home', () => {
  assert.match(payloadConfig, /Home/);
  assert.match(migrationIndex, /20261030_100000_home/);
  assert.equal(CMS_PREVIEW_HOME_PATH, '/cms-home-preview');
});
