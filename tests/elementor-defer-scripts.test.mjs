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
  ]);
  assert.equal(shouldDeferElementorScriptsUntilLoad('agencia-ux-ui'), false);
});

test('e-commerce defer keeps swiper and flickity on the critical path', () => {
  assert.match(source, /DEFER_UNTIL_LOAD_SCRIPT_SUFFIXES/);
  assert.doesNotMatch(source, /deferUntilLoad && document\.readyState !== 'complete'/);
  assert.match(source, /shouldDeferScript\(src, deferUntilLoad\)/);
  for (const keep of ['swiper.min.js', 'flickity.js', 'frontend.min.js', 'init.js']) {
    assert.match(source, new RegExp(keep.replace('.', '\\.')));
  }
  for (const defer of ['gsap.min.js', 'cubeportfolio.js', 'parallax-scroll.js', 'magnific.popup.js']) {
    assert.match(source, new RegExp(defer.replace('.', '\\.')));
  }
});
