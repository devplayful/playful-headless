import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(
  new URL('../components/ElementorPageScripts.tsx', import.meta.url),
  'utf8',
);

test('defer slug set covers the four heavy Elementor service landings', async () => {
  const { ELEMENTOR_DEFER_UNTIL_LOAD_SLUGS, shouldDeferElementorScriptsUntilLoad } = await import(
    '../lib/elementor-defer-slugs.ts'
  );
  assert.deepEqual([...ELEMENTOR_DEFER_UNTIL_LOAD_SLUGS].sort(), [
    'agencia-diseno-web',
    'agencia-e-commerce',
    'agencia-sem',
    'agencia-seo',
    'agencia-ux-ui',
  ]);
  assert.equal(shouldDeferElementorScriptsUntilLoad('agencia-ux-ui'), true);
});

test('partial defer keeps flickity path critical and defers Elementor + swiper', () => {
  assert.match(source, /CRITICAL_WHEN_DEFER_PATH_SNIPPETS/);
  assert.match(source, /DEFERRED_UNTIL_LOAD_SNIPPETS/);
  assert.doesNotMatch(source, /deferUntilLoad && document\.readyState !== 'complete'/);
  assert.match(source, /shouldDeferScript\(src, deferUntilLoad\)/);
  assert.match(source, /requestAnimationFrame/);
  for (const keep of ['jquery/jquery.min.js', 'flickity.js', 'init.js', 'masterlayer-addons-for-elementor/assets/js/core.min.js']) {
    assert.match(source, new RegExp(keep.replace(/\./g, '\\.')));
  }
  for (const defer of ['swiper.min.js', 'frontend.min.js', 'gsap.min.js', 'cubeportfolio.js']) {
    assert.match(source, new RegExp(defer.replace('.', '\\.')));
  }
});
