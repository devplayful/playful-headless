import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../components/ElementorPageContent.module.css', import.meta.url), 'utf8');

test('elementor page wrapper clips horizontal overflow from carousels', () => {
  assert.match(css, /\.page\s*\{[^}]*overflow-x:\s*clip/s);
});
