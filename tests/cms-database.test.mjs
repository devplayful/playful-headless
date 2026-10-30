import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tsSource = readFileSync(new URL('../lib/cms-database.ts', import.meta.url), 'utf8');
const jsSource = readFileSync(new URL('../lib/cms-database.mjs', import.meta.url), 'utf8');
const payloadConfig = readFileSync(new URL('../payload.config.ts', import.meta.url), 'utf8');
const buildScript = readFileSync(new URL('../scripts/build-with-budget.mjs', import.meta.url), 'utf8');

const {
  hasDatabaseUrl,
  hasRuntimeDatabase,
  getPayloadConnectionString,
  shouldRunPreviewMigrate,
  shouldRunPreviewPaginasB1Seed,
} = await import('../lib/cms-database.mjs');

test('DATABASE_URL is required for preview migrate; production never migrates', () => {
  assert.equal(shouldRunPreviewMigrate({}), false);
  assert.equal(shouldRunPreviewMigrate({ DATABASE_URL: '' }), false);
  assert.equal(shouldRunPreviewMigrate({ DATABASE_URL: '  ' }), false);
  assert.equal(
    shouldRunPreviewMigrate({ DATABASE_URL: 'postgres://example', VERCEL_ENV: 'production' }),
    false,
  );
  assert.equal(
    shouldRunPreviewMigrate({ DATABASE_URL: 'postgres://example', VERCEL_ENV: 'preview' }),
    true,
  );
  assert.equal(
    shouldRunPreviewMigrate({ DATABASE_URL: 'postgres://example', VERCEL_ENV: 'development' }),
    true,
  );
  assert.equal(shouldRunPreviewMigrate({ POSTGRES_URL: 'postgres://example' }), false);
  assert.equal(shouldRunPreviewMigrate({ DATABASE_URI: 'postgres://example' }), false);
});

test('Preview seed paginas B1 solo en VERCEL_ENV=preview con DATABASE_URL', () => {
  assert.equal(shouldRunPreviewPaginasB1Seed({}), false);
  assert.equal(
    shouldRunPreviewPaginasB1Seed({ DATABASE_URL: 'postgres://example', VERCEL_ENV: 'production' }),
    false,
  );
  assert.equal(
    shouldRunPreviewPaginasB1Seed({ DATABASE_URL: 'postgres://example', VERCEL_ENV: 'preview' }),
    true,
  );
});

test('runtime prefers DATABASE_URL; migrate prefers UNPOOLED without leaking aliases', () => {
  assert.equal(hasDatabaseUrl({}), false);
  assert.equal(hasDatabaseUrl({ DATABASE_URL: 'postgres://pooled' }), true);
  assert.equal(hasRuntimeDatabase({ POSTGRES_URL: 'postgres://alias' }), true);
  assert.equal(hasRuntimeDatabase({ DATABASE_URI: 'postgres://local' }), true);
  assert.equal(
    getPayloadConnectionString({
      DATABASE_URL: 'postgres://pooled',
      DATABASE_URL_UNPOOLED: 'postgres://direct',
    }),
    'postgres://pooled',
  );
  assert.equal(
    getPayloadConnectionString({
      PAYLOAD_MIGRATING: 'true',
      DATABASE_URL: 'postgres://pooled',
      DATABASE_URL_UNPOOLED: 'postgres://direct',
    }),
    'postgres://direct',
  );
  assert.equal(
    getPayloadConnectionString({
      PAYLOAD_MIGRATING: 'true',
      DATABASE_URL: 'postgres://pooled',
    }),
    'postgres://pooled',
  );
});

test('payload adapter and preview build wire DATABASE_URL without printing secrets', () => {
  assert.match(payloadConfig, /getPayloadConnectionString/);
  assert.match(payloadConfig, /migrationDir/);
  assert.match(payloadConfig, /disableCreateDatabase: true/);
  assert.match(buildScript, /runPayloadPreviewMigrate/);
  assert.match(buildScript, /runPayloadPreviewSeedPaginasB1/);
  assert.match(buildScript, /PAYLOAD_MIGRATING/);
  assert.match(tsSource, /DATABASE_URL_UNPOOLED/);
  assert.match(jsSource, /DATABASE_URL_UNPOOLED/);
  assert.equal(tsSource.includes('console.log'), false);
  assert.equal(jsSource.includes('console.log'), false);
});

test('initial Payload migration creates CMS and payload_* tables', () => {
  const index = readFileSync(new URL('../cms/migrations/index.ts', import.meta.url), 'utf8');
  const initial = readFileSync(
    new URL('../cms/migrations/20261028_195833_initial.ts', import.meta.url),
    'utf8',
  );
  assert.match(index, /20261028_195833_initial/);
  assert.match(index, /20261030_120000_paginas_codigo/);
  for (const table of [
    'posts',
    'paginas',
    'casos',
    'autores',
    'categorias',
    'medios',
    'usuarios',
    'payload_migrations',
  ]) {
    assert.match(initial, new RegExp(`CREATE TABLE "${table}"`));
  }
});
