import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const QA_CALENDAR_ID = 'AR82Tqlm75JTU8QMk5ID';
const PROD_CALENDAR_ID = 'NiVJSc7uIWJpcbq3Ppmf';

function readSource(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

test('/reunion client sources do not import QA calendar constants module', () => {
  for (const relativePath of [
    'app/(frontend)/reunion/ReunionCalendarEmbed.tsx',
    'app/(frontend)/reunion/ReunionCalificacionClient.tsx',
  ]) {
    const source = readSource(relativePath);
    assert.doesNotMatch(source, /from ['"]@\/lib\/qa-filtro\/constants['"]/);
    assert.doesNotMatch(source, /from ['"].*qa-filtro\/ghl-fields/);
    assert.doesNotMatch(source, /QA_FILTRO_CALENDAR_ID/);
    assert.doesNotMatch(source, /buildQaFiltroCalendarWidgetSrc/);
  }
  assert.match(readSource('app/(frontend)/reunion/ReunionCalendarEmbed.tsx'), /buildCalificacionCalendarWidgetSrc/);
});

function reunionAppChunks() {
  const chunksRoot = path.join(root, '.next/static/chunks/app/reunion');
  if (!existsSync(chunksRoot)) return null;
  const files = [];
  for (const name of readdirSync(chunksRoot)) {
    if (name.endsWith('.js')) files.push(path.join(chunksRoot, name));
  }
  return files;
}

test('built /reunion chunks include prod calendar id only (run `npm run build:direct` first)', (t) => {
  const chunks = reunionAppChunks();
  if (!chunks?.length) {
    t.skip('missing .next/static/chunks/app/reunion — run build:direct before this test');
    return;
  }
  const combined = chunks.map((file) => readFileSync(file, 'utf8')).join('\n');
  assert.doesNotMatch(
    combined,
    new RegExp(QA_CALENDAR_ID),
    'QA calendar id must not ship in /reunion client chunks',
  );
  assert.match(
    combined,
    new RegExp(PROD_CALENDAR_ID),
    'prod calendar id must appear in /reunion client chunks',
  );
});
