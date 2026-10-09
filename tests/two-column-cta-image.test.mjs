import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(
  new URL('../components/ui/TwoColumnCtaSection.tsx', import.meta.url),
  'utf8',
);

test('closing CTA image uses next/image with sizes, not a raw PNG img', () => {
  assert.match(source, /from ['"]next\/image['"]/);
  assert.match(source, /<Image[\s\S]*src=\{imageUrl\}/);
  assert.match(source, /sizes=\{CTA_ILLUSTRATION_SIZES\}/);
  assert.doesNotMatch(source, /<img[\s\S]*src=\{imageUrl\}/);
  assert.doesNotMatch(source, /priority/);
});
