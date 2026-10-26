import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { withPlayfulTitleSuffix } from '../lib/blog-title-suffix.ts';
import { ESHOW_MADRID_2026_TITLE } from '../lib/eshow-madrid-2026.ts';

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
});

test('eShow Madrid 2026 SEO title is exactly one | Playful suffix', () => {
  assert.equal(
    withPlayfulTitleSuffix(ESHOW_MADRID_2026_TITLE),
    'eShow Madrid 2026: fechas, IFEMA y qué ver | Playful',
  );
  assert.doesNotMatch(
    withPlayfulTitleSuffix(ESHOW_MADRID_2026_TITLE),
    /\| Playful \| Playful/,
  );
});

test('Yoast titles that already end in | Playful stay at one suffix', () => {
  assert.equal(
    withPlayfulTitleSuffix('Premios CIMA 2026: SoyTechno, ganadores E-commerce | Playful'),
    'Premios CIMA 2026: SoyTechno, ganadores E-commerce | Playful',
  );
  assert.doesNotMatch(
    withPlayfulTitleSuffix('Premios CIMA 2026: SoyTechno, ganadores E-commerce | Playful'),
    /\| Playful \| Playful/,
  );
});

test('root layout does not apply a title template that would double the brand suffix', () => {
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(layout, /template:\s*['"`][^'"`]*%s/);
  assert.doesNotMatch(layout, /title:\s*\{[\s\S]*template/);
});

test('WordPress « - Playful Agency» suffix variants are stripped before | Playful', () => {
  assert.equal(withPlayfulTitleSuffix('Los 5 problemas de e-commerce - Playful Agency'), 'Los 5 problemas de e-commerce | Playful');
  assert.equal(withPlayfulTitleSuffix('Guía – Playful Agency'), 'Guía | Playful');
  assert.equal(withPlayfulTitleSuffix('Guía | Playful Agency'), 'Guía | Playful');
  assert.equal(withPlayfulTitleSuffix('  Guía  -  Playful Agency  '), 'Guía | Playful');
  assert.equal(withPlayfulTitleSuffix('Guía - Playful Agency | Playful'), 'Guía | Playful');
});

test('titles that already mention Playful do not get | Playful appended', () => {
  assert.equal(withPlayfulTitleSuffix('Playful en los Premios CIMA - Playful Agency'), 'Playful en los Premios CIMA');
  assert.equal(withPlayfulTitleSuffix('Así trabaja Playful'), 'Así trabaja Playful');
  assert.equal(withPlayfulTitleSuffix('Sin marca'), 'Sin marca | Playful');
});
