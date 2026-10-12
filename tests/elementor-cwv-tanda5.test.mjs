import { readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

const elementorContent = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);
const elementorScripts = readFileSync(
  new URL('../components/ElementorPageScripts.tsx', import.meta.url),
  'utf8',
);
const nextConfig = readFileSync(new URL('../next.config.js', import.meta.url), 'utf8');

const {
  optimizeUxUiGalleryLcp,
  firstUxUiGalleryLcpSrc,
  UX_UI_SLUG,
} = await import('../lib/elementor-html-optimize.ts');
const {
  ELEMENTOR_HERO_CRITICAL_CSS_SLUGS,
  shouldInlineElementorHeroCriticalCss,
} = await import('../lib/elementor-hero-critical-css.ts');
const {
  ELEMENTOR_DEFER_WP_CSS_SLUGS,
  shouldDeferElementorWpCss,
} = await import('../lib/elementor-defer-slugs.ts');

test('hero critical CSS is inlined on the four widget-LCP agency landings', () => {
  assert.deepEqual([...ELEMENTOR_HERO_CRITICAL_CSS_SLUGS].sort(), [
    'agencia-diseno-web',
    'agencia-e-commerce',
    'agencia-sem',
    'agencia-seo',
  ]);
  assert.equal(shouldInlineElementorHeroCriticalCss('agencia-sem'), true);
  assert.equal(shouldInlineElementorHeroCriticalCss('agencia-ux-ui'), false);
  assert.match(elementorContent, /playful-elementor-hero-critical/);
  assert.match(elementorContent, /ElementorDeferredWpCss/);
});

test('WP stylesheets defer on all five Elementor service landings', () => {
  assert.deepEqual([...ELEMENTOR_DEFER_WP_CSS_SLUGS].sort(), [
    'agencia-diseno-web',
    'agencia-e-commerce',
    'agencia-sem',
    'agencia-seo',
    'agencia-ux-ui',
  ]);
  assert.equal(shouldDeferElementorWpCss('agencia-ux-ui'), true);
});

test('agencia-ux-ui gallery fancy image gets preload hints without /_next/image on hero SVG', () => {
  const html =
    '<div class="master-fancy-image parallax-hover elementor-repeater-item-b3997f9">'
    + '<div class="image-wrap"><img width="437" height="417" loading="lazy" '
    + 'src="https://endpoint.playfulagency.com/wp-content/uploads/2024/11/Playful-Transforma.svg" alt="UX" /></div></div>';
  const out = optimizeUxUiGalleryLcp(html, UX_UI_SLUG);
  assert.match(out, /fetchpriority="high"/i);
  assert.doesNotMatch(out, /loading="lazy"/i);
  assert.match(out, /sizes="/);
  assert.doesNotMatch(out, /\/_next\/image/);
  assert.equal(
    firstUxUiGalleryLcpSrc(html, UX_UI_SLUG),
    'https://endpoint.playfulagency.com/wp-content/uploads/2024/11/Playful-Transforma.svg',
  );
});

test('partial script defer uses rAF carousel bootstrap and explicit deferred allowlist', () => {
  assert.match(elementorScripts, /requestAnimationFrame/);
  assert.match(elementorScripts, /DEFERRED_UNTIL_LOAD_SNIPPETS/);
  assert.match(elementorScripts, /jquery\/jquery\.min\.js/);
  for (const defer of ['frontend.min.js', 'swiper.min.js']) {
    assert.match(elementorScripts, new RegExp(defer.replace('.', '\\.')));
  }
});

test('agency and casos routes ship CDN cache headers aligned with ISR', () => {
  assert.match(nextConfig, /s-maxage=3600/);
  assert.match(nextConfig, /stale-while-revalidate=86400/);
  assert.match(nextConfig, /casos-de-exito/);
  const slugPage = readFileSync(new URL('../app/[slug]/page.tsx', import.meta.url), 'utf8');
  assert.match(slugPage, /revalidate = 3600/);
});
