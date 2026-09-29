import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  analyzeBlogPostHtml,
  analyzeCaseStudyHtml,
  blogPathsFromSitemap,
  stripScripts,
} from '../scripts/blog-post-ssr-html.mjs';

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);

test('blog post page is a server component and renders article HTML directly', () => {
  assert.doesNotMatch(blogPage, /^['"]use client['"]/m);
  assert.doesNotMatch(blogPage, /BlogPostContent|BlogLoader|Cargando artículo/);
  assert.doesNotMatch(blogPage, /ssr:\s*false/);
  assert.doesNotMatch(blogPage, /useSearchParams/);
  assert.match(blogPage, /<h1 className="sr-only">\{pageH1\}<\/h1>/);
  assert.match(blogPage, /dangerouslySetInnerHTML=\{\{ __html: contentWithIds \}\}/);
  assert.match(blogPage, /<article className="bg-white rounded-\[36px\]/);
});

test('RSC payload paragraphs do not count as initial HTML', () => {
  const html = [
    '<html><body>',
    '<h1 class="sr-only">Título real</h1>',
    '<p>Cargando artículo...</p>',
    '<script>self.__next_f.push([1,"<article><p>Párrafo uno</p><p>Párrafo dos del cuerpo</p></article>"])</script>',
    '</body></html>',
  ].join('');
  const visible = stripScripts(html);
  assert.match(visible, /Cargando artículo/);
  assert.doesNotMatch(visible, /Párrafo uno/);
  const analysis = analyzeBlogPostHtml(html);
  assert.equal(analysis.ok, false);
  assert.equal(analysis.hasLoader, true);
  assert.equal(analysis.articleParagraphs, 0);
});

test('server-rendered article with H1 and body passes', () => {
  const html = [
    '<html><body>',
    '<h1 class="sr-only">Zelle en Venezuela: Un método de pago</h1>',
    '<h2 class="text-4xl">Zelle en Venezuela: Un método de pago</h2>',
    '<article class="prose">',
    '<p>Por experiencia trabajando con ecommerce en Venezuela hay ventajas concretas.</p>',
    '<p>Zelle funciona bien como método de pago para tiendas en línea que ya venden.</p>',
    '<p>La validación se puede automatizar en el checkout sin abrir cuentas nuevas.</p>',
    '</article>',
    '</body></html>',
  ].join('');
  const analysis = analyzeBlogPostHtml(html);
  assert.equal(analysis.ok, true);
  assert.match(analysis.h1Text, /Zelle en Venezuela/);
  assert.ok(analysis.articleParagraphs >= 2);
});

test('BAILOUT placeholder in visible HTML fails', () => {
  const html = [
    '<html><body>',
    '<h1>Título</h1>',
    '<article><p>Uno del cuerpo del artículo con texto suficiente para pasar el umbral de longitud mínima del análisis.</p><p>Dos del cuerpo del artículo con más texto para completar el contenido visible.</p></article>',
    '<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>',
    '</body></html>',
  ].join('');
  const analysis = analyzeBlogPostHtml(html);
  assert.equal(analysis.ok, false);
  assert.equal(analysis.hasBailout, true);
});

test('case study control requires a real H1 and many paragraphs', () => {
  const ok = analyzeCaseStudyHtml(
    '<html><body><h1>SoyTechno</h1>' + '<p>Párrafo de caso.</p>'.repeat(12) + '</body></html>',
  );
  assert.equal(ok.ok, true);
  assert.equal(ok.h1Text, 'SoyTechno');
  const thin = analyzeCaseStudyHtml('<html><body><h1>SoyTechno</h1><p>Solo uno</p></body></html>');
  assert.equal(thin.ok, false);
});

test('sitemap loc extraction keeps only /blog/category/slug paths', () => {
  const xml = [
    '<?xml version="1.0"?><urlset>',
    '<loc>https://playfulagency.com/blog/tecnologia/actualizar-tu-e-commerce</loc>',
    '<loc>https://playfulagency.com/blog</loc>',
    '<loc>https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela</loc>',
    '<loc>https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce/</loc>',
    '</urlset>',
  ].join('');
  assert.deepEqual(blogPathsFromSitemap(xml), [
    '/blog/tecnologia/actualizar-tu-e-commerce',
    '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  ]);
});
