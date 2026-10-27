import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  applyElementorA11y,
  descriptiveAltFromSrc,
  ensureMissingImgAlt,
  labelEmptyLinks,
} from '../lib/elementor-a11y-html.ts';

const elementor = readFileSync(
  new URL('../components/ElementorPageContent.tsx', import.meta.url),
  'utf8',
);

test('Elementor page content runs the a11y pass after alt overrides', () => {
  assert.match(elementor, /applyElementorA11y\(/);
  assert.match(elementor, /applyImageAltOverrides\(/);
  const a11yAt = elementor.indexOf('applyElementorA11y(');
  const altAt = elementor.indexOf('applyImageAltOverrides(');
  assert.ok(a11yAt !== -1 && altAt !== -1 && a11yAt < altAt);
});

test('descriptiveAltFromSrc turns filenames into readable alt and blanks decorative srcs', () => {
  assert.equal(
    descriptiveAltFromSrc('https://endpoint.playfulagency.com/wp-content/uploads/2024/09/Haz-Pruebas-y-Optimiza-tus-Campanas.png'),
    'Haz Pruebas y Optimiza tus Campanas',
  );
  assert.equal(
    descriptiveAltFromSrc('https://endpoint.playfulagency.com/wp-content/plugins/wti-like-post/images/pixel.gif'),
    '',
  );
  assert.equal(descriptiveAltFromSrc('data:image/gif;base64,xx'), '');
});

test('ensureMissingImgAlt adds alt only when the attribute is absent', () => {
  const missing = '<p>x</p><img src="/images/foo-bar.png" width="10"><p>y</p>';
  assert.equal(
    ensureMissingImgAlt(missing),
    '<p>x</p><img src="/images/foo-bar.png" width="10" alt="foo bar"><p>y</p>',
  );
  const present = '<img src="/images/foo-bar.png" alt="Ya existe">';
  assert.equal(ensureMissingImgAlt(present), present);
  const empty = '<img src="/images/foo-bar.png" alt="">';
  assert.equal(ensureMissingImgAlt(empty), empty);
});

test('labelEmptyLinks names icon-only anchors and leaves text links alone', () => {
  const icon = '<a href="https://www.instagram.com/somosplayful"><i class="fab fa-instagram"></i></a>';
  assert.equal(
    labelEmptyLinks(icon),
    '<a href="https://www.instagram.com/somosplayful" aria-label="somosplayful"><i class="fab fa-instagram"></i></a>',
  );
  const named = '<a href="/agencia-seo">SEO</a>';
  assert.equal(labelEmptyLinks(named), named);
  const titled = '<a href="/x" title="Caso SoyTechno"></a>';
  assert.equal(
    labelEmptyLinks(titled),
    '<a href="/x" title="Caso SoyTechno" aria-label="Caso SoyTechno"></a>',
  );
});

test('strips aria-selected from Elementor tab titles that are role=button', () => {
  const html =
    '<div id="elementor-tab-title-1551" class="elementor-tab-title" role="button" aria-controls="x" aria-expanded="false" aria-selected="false">FAQ</div>';
  assert.equal(
    applyElementorA11y(html),
    '<div id="elementor-tab-title-1551" class="elementor-tab-title" role="button" aria-controls="x" aria-expanded="false">FAQ</div>',
  );
});

test('applyElementorA11y is idempotent on mixed markup', () => {
  const html = '<a href="/blog/seo/auditoria-seo-que-es-como-se-hace"><img src="/images/audit-cover.png"></a>';
  const once = applyElementorA11y(html);
  assert.equal(applyElementorA11y(once), once);
  assert.match(once, /alt="audit cover"/);
  assert.match(once, /aria-label="audit cover"/);
});
