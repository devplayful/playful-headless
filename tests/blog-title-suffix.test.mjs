import test from 'node:test';
import assert from 'node:assert/strict';

import { withPlayfulTitleSuffix } from '../lib/blog-title-suffix.ts';

test('withPlayfulTitleSuffix is idempotent for WordPress titles that already end in | Playful', () => {
  assert.equal(withPlayfulTitleSuffix('Guía de catálogo'), 'Guía de catálogo | Playful');
  assert.equal(
    withPlayfulTitleSuffix('Guía de catálogo | Playful'),
    'Guía de catálogo | Playful',
  );
  assert.equal(
    withPlayfulTitleSuffix('Guía de catálogo | Playful | Playful'),
    'Guía de catálogo | Playful',
  );
  assert.equal(
    withPlayfulTitleSuffix('Cintillos de promoción en ecommerce | Playful'),
    'Cintillos de promoción en ecommerce | Playful',
  );
  assert.notEqual(
    withPlayfulTitleSuffix('Guía | Playful Agency'),
    'Guía | Playful Agency',
  );
  assert.equal(
    withPlayfulTitleSuffix('Guía | Playful Agency'),
    'Guía | Playful Agency | Playful',
  );
});
