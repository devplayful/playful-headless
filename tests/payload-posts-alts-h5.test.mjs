import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  CRITERION_A_EXPECTED_ALTS,
  CRITERION_A_UNIQUE_POST_COUNT,
  POST_CONTENT_ALT_OVERRIDES_H5,
  POST_CONTENT_ALT_OVERRIDE_66684_H5,
  activeH5ContentAltOverrides,
} from '../cms/data/posts-content-alt-h5.ts';
import {
  applyContentAltOverrides,
  applyAltToContentHtml,
  contentImages,
  srcMatchesFragment,
} from '../cms/lib/post-content-images.ts';
import { shouldApply66684ContentAlt } from '../lib/payload-h5-alt-check.ts';

test('criterio A: filas OK del log 23 oct (sin 410 ni destacada n=42)', () => {
  assert.equal(CRITERION_A_EXPECTED_ALTS.length, 23);
  assert.equal(CRITERION_A_UNIQUE_POST_COUNT, 19);
});

test('contentImages conserva alt literal del HTML importado', () => {
  const html =
    '<p>x</p><img src="https://endpoint.playfulagency.com/wp-content/uploads/BANNER-CTA-PLAYFUL-Te-gustaria-invertir-en-publicidad-digital.png" alt="Banner de Playful Agency: ¿te gustaría invertir en publicidad digital para tu negocio?" />';
  const imgs = contentImages(html);
  assert.equal(imgs.length, 1);
  assert.equal(
    imgs[0].alt,
    'Banner de Playful Agency: ¿te gustaría invertir en publicidad digital para tu negocio?',
  );
});

test('criterio B: overrides fijan alt en HTML e imagenesContenido por wpId + archivo', () => {
  const wpId = 68061;
  const src =
    'https://endpoint.playfulagency.com/wp-content/uploads/2023/BANNER-CTA_PLAYFUL_%C2%BFQuieres-destacar-tu-negocio-en-la-web.png';
  const html = `<img src="${src}" class="size-full">`;
  const rule = POST_CONTENT_ALT_OVERRIDES_H5[0];
  assert.equal(rule.wpId, wpId);
  const { html: outHtml, images } = applyContentAltOverrides(wpId, html, contentImages(html), POST_CONTENT_ALT_OVERRIDES_H5);
  assert.match(outHtml, new RegExp(`alt="${rule.alt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
  assert.equal(images[0].alt, rule.alt);
});

test('68030: dos imágenes distintas reciben alts de filas 20 y 21', () => {
  const wpId = 68030;
  const html = [
    '<img src="https://x/Posiciona-tu-pagina-con-contenido-optimizado-y-de-calidad.png" alt="viejo">',
    '<img src="https://x/Herramienta-SEO-3.png" alt="">',
  ].join('');
  const { images } = applyContentAltOverrides(wpId, html, contentImages(html), POST_CONTENT_ALT_OVERRIDES_H5);
  assert.equal(images[0].alt, 'Posiciona tu página con contenido optimizado y de calidad');
  assert.equal(
    images[1].alt,
    'Banner de Playful Agency: expertos en SEO para mejorar los enlaces de tu sitio web',
  );
});

test('66684 fila 33: solo entra en overrides activos con HTTP 200', () => {
  assert.equal(activeH5ContentAltOverrides(false).some((o) => o.wpId === 66684), false);
  assert.equal(activeH5ContentAltOverrides(true).some((o) => o.wpId === 66684), true);
  assert.equal(shouldApply66684ContentAlt({ url: 'https://playfulagency.com/blog/seo/7-consejos?qa=1', status: 301, checkedAt: '' }), false);
  assert.equal(shouldApply66684ContentAlt({ url: 'https://playfulagency.com/blog/seo/7-consejos?qa=1', status: 200, checkedAt: '' }), true);
});

test('import-wp aplica overrides H5 (sin 66684) tras leer content.rendered', () => {
  const source = readFileSync(new URL('../scripts/import-wp.ts', import.meta.url), 'utf8');
  assert.match(source, /applyContentAltOverrides/);
  assert.match(source, /activeH5ContentAltOverrides\(false\)/);
  assert.match(source, /contentImages/);
});

test('getBlogPostBySlug aplica alts H5 en content.rendered servido', () => {
  const source = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  assert.match(source, /applyBlogPostContentAltH5/);
});

test('criterio B: matching con proxy i0.wp.com y nombre con ¿', async () => {
  const { applyBlogPostContentAltH5ToHtml } = await import('../lib/blog-post-content-alt-h5.ts');
  const wpId = 68061;
  const html =
    '<img class="wp-image-77651" src="//i0.wp.com/crear.endpoint.playfulagency.com/wp-content/uploads/BANNER-CTA_PLAYFUL_%C2%BFQuieres-destacar-tu-negocio-en-la-web.png" alt="" />';
  const out = applyBlogPostContentAltH5ToHtml(html, wpId);
  assert.match(out, /alt="Banner de Playful Agency: ¿quieres destacar tu negocio en la web\?"/);
});

test('66717: Herramienta-SEO-2 en src i0.wp.com', async () => {
  const { applyBlogPostContentAltH5ToHtml } = await import('../lib/blog-post-content-alt-h5.ts');
  const html =
    '<img src="//i0.wp.com/crear.endpoint.playfulagency.com/wp-content/uploads/Herramienta-SEO-2.png" alt="" />';
  const out = applyBlogPostContentAltH5ToHtml(html, 66717);
  assert.match(out, /auditoría SEO/);
});

test('criterio A esperado: cada fila tiene alt no vacío y fragmento de archivo', () => {
  for (const row of CRITERION_A_EXPECTED_ALTS) {
    assert.ok(row.alt.length > 10, `fila ${row.csvRow}`);
    assert.ok(row.srcContains.length > 3, `fila ${row.csvRow}`);
    assert.ok(srcMatchesFragment(`https://cdn/${row.srcContains}`, row.srcContains));
  }
});

test('applyAltToContentHtml no altera imágenes de otro post (mismo archivo en otro wpId)', () => {
  const html = '<img src="https://x/Herramienta-SEO-3.png" alt="original">';
  const only68030 = applyContentAltOverrides(68030, html, contentImages(html), POST_CONTENT_ALT_OVERRIDES_H5);
  const only68207 = applyContentAltOverrides(68207, html, contentImages(html), POST_CONTENT_ALT_OVERRIDES_H5);
  assert.notEqual(only68030.images[0].alt, only68207.images[0].alt);
});

test('H5 preview build verify list has 22 checks (17 A + 5 B)', async () => {
  const { H5_PREVIEW_BUILD_VERIFY_COUNT } = await import('../cms/data/posts-content-alt-h5.ts');
  assert.equal(H5_PREVIEW_BUILD_VERIFY_COUNT, 22);
});

test('preview build wires h5 seed only for VERCEL_ENV=preview', async () => {
  const { shouldRunPreviewH5AltsSeed } = await import('../scripts/build-with-budget.mjs');
  assert.equal(shouldRunPreviewH5AltsSeed({ DATABASE_URL: 'postgres://x', VERCEL_ENV: 'preview' }), true);
  assert.equal(shouldRunPreviewH5AltsSeed({ DATABASE_URL: 'postgres://x', VERCEL_ENV: 'production' }), false);
  assert.equal(shouldRunPreviewH5AltsSeed({ DATABASE_URL: 'postgres://x', VERCEL_ENV: 'development' }), false);
});

test('POST_CONTENT_ALT_OVERRIDE_66684 coincide con CSV fila 33', () => {
  assert.equal(
    POST_CONTENT_ALT_OVERRIDE_66684_H5.alt,
    'Banner de Playful Agency: expertos en SEO para posicionar tu página web',
  );
});
