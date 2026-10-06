import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  analyzeBlogPostHtml,
  analyzeBlogPostJsonLd,
  analyzeBlogRelatedPosts,
  analyzeCaseStudyHtml,
  blogPathsFromSitemap,
  compareSeoHead,
  extractSeoHead,
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
  assert.match(blogPage, /<BlogRelatedPostsSection/);
  assert.match(blogPage, /posts=\{relatedPosts\}/);
  assert.match(blogPage, /excludeSlug=\{post\.slug\}/);
  assert.match(blogPage, /excludeId=\{post\.id\}/);
  assert.match(blogPage, /getRelatedBlogPostsForPost\(post/);
  assert.match(blogPage, /excludeCurrentBlogPost\(/);
  assert.doesNotMatch(blogPage, /getLatestBlogPosts/);
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

test('layout BAILOUT next to a full article does not fail the SEO check', () => {
  const html = [
    '<html><body>',
    '<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>',
    '<h1 class="sr-only">Título real del artículo de ecommerce</h1>',
    '<article><p>Uno del cuerpo del artículo con texto suficiente para pasar el umbral de longitud mínima del análisis de SEO que exige al menos doscientos caracteres visibles en el HTML inicial.</p><p>Dos del cuerpo del artículo con más texto para completar el contenido visible y confirmar que el crawler ve párrafos reales fuera del payload RSC.</p></article>',
    '</body></html>',
  ].join('');
  const analysis = analyzeBlogPostHtml(html);
  assert.equal(analysis.ok, true);
  assert.equal(analysis.hasBailout, true);
});

test('BAILOUT with no article body still fails', () => {
  const html = [
    '<html><body>',
    '<h1 class="sr-only">Título</h1>',
    '<p>Cargando artículo...</p>',
    '<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>',
    '</body></html>',
  ].join('');
  const analysis = analyzeBlogPostHtml(html);
  assert.equal(analysis.ok, false);
  assert.equal(analysis.hasLoader, true);
  assert.equal(analysis.articleMissing, true);
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

test('JSON-LD BlogPosting must be unique, valid and aligned with H1/meta/OG', () => {
  const canonical =
    'https://playfulagency.com/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce';
  const h1 = 'Zelle en Venezuela: Un método de pago que puedes integrar en tu tienda en línea';
  const description =
    'Integra Zelle como método de pago en tu tienda online en Venezuela y automatiza la validación. Playful conecta tu checkout; no abrimos ni creamos cuentas Zelle.';
  const image = 'https://playfulagency.com/images/blog/12-zelle-venezuela-magnific-JN0rWQjOq4.png';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: h1,
    description,
    image,
    datePublished: '2020-06-15T14:22:00.000Z',
    dateModified: '2026-09-24T00:00:00.000Z',
    author: { '@type': 'Person', name: 'Stefanni Parabavidez' },
    publisher: {
      '@type': 'Organization',
      name: 'Playful Agency',
      logo: { '@type': 'ImageObject', url: 'https://playfulagency.com/images/logos/playful-logo-schema.png' },
    },
    mainEntityOfPage: canonical,
    url: canonical,
  };
  const html = [
    `<html><head><title>Zelle</title><meta name="description" content="${description}">`,
    `<link rel="canonical" href="${canonical}">`,
    `<meta property="og:image" content="${image}">`,
    `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script></head>`,
    `<body><h1>${h1}</h1><article><p>${'x'.repeat(120)}</p><p>${'y'.repeat(120)}</p></article></body></html>`,
  ].join('');
  const analysis = analyzeBlogPostJsonLd(html, {
    h1Text: h1,
    description,
    canonical,
    ogImage: image,
  });
  assert.equal(analysis.ok, true, analysis.reasons.join(','));
  assert.equal(analysis.count, 1);
});

test('two Article blocks or a related-posts loader fail the SEO checks', () => {
  const html = [
    '<html><body>',
    '<script type="application/ld+json">{"@type":"Article","headline":"A"}</script>',
    '<script type="application/ld+json">{"@type":"BlogPosting","headline":"B"}</script>',
    '<p>Cargando artículos…</p>',
    '<a href="/blog">Ver más artículos</a>',
    '</body></html>',
  ].join('');
  const jsonLd = analyzeBlogPostJsonLd(html, { h1Text: 'A' });
  assert.equal(jsonLd.ok, false);
  assert.match(jsonLd.reasons.join(','), /jsonld-count=2/);
  const related = analyzeBlogRelatedPosts(html);
  assert.equal(related.ok, false);
  assert.equal(related.hasRelatedLoader, true);
});

test('related posts require real /blog/category/slug links in visible HTML', () => {
  const hidden = [
    '<html><body>',
    '<p>Cargando artículos…</p>',
    '<a href="/blog">Ver más artículos</a>',
    '<script>self.__next_f.push([1,"<a href=\\"/blog/tecnologia/actualizar-tu-e-commerce\\">Leer más</a>"])</script>',
    '</body></html>',
  ].join('');
  assert.equal(analyzeBlogRelatedPosts(hidden).ok, false);

  const visible = [
    '<html><body>',
    '<a href="/blog/tecnologia/actualizar-tu-e-commerce">Leer más</a>',
    '<a href="/blog">Ver más artículos</a>',
    '</body></html>',
  ].join('');
  const related = analyzeBlogRelatedPosts(visible);
  assert.equal(related.ok, true);
  assert.deepEqual(related.relatedHrefs, ['/blog/tecnologia/actualizar-tu-e-commerce']);
});

test('JSON-LD description with leftover WP entities still matches decoded meta', () => {
  const description = '¿Cuáles son sus ventajas? y… si realmente puede ser una alternativa.\n';
  const html = [
    '<html><head>',
    '<meta name="description" content="¿Cuáles son sus ventajas? y&amp;#8230; si realmente puede ser una alternativa.\n">',
    '<link rel="canonical" href="https://playfulagency.com/blog/tecnologia/ecommerce-mi-negocio-online">',
    '<meta property="og:image" content="https://playfulagency.com/images/blog/07-ecommerce-negocio-online-magnific-s7AzDuWl8e.png">',
    '<script type="application/ld+json">',
    JSON.stringify({
      '@type': 'BlogPosting',
      headline: 'Crear un e-commerce',
      description: '¿Cuáles son sus ventajas? y&#8230; si realmente puede ser una alternativa.\n',
      image: 'https://playfulagency.com/images/blog/07-ecommerce-negocio-online-magnific-s7AzDuWl8e.png',
      datePublished: '2021-03-01T10:00:00.000Z',
      dateModified: '2021-03-01T10:00:00.000Z',
      author: { '@type': 'Person', name: 'Playful Agency' },
      publisher: {
        '@type': 'Organization',
        name: 'Playful Agency',
        logo: { '@type': 'ImageObject', url: 'https://playfulagency.com/images/logos/playful-logo-schema.png' },
      },
      mainEntityOfPage:
        'https://playfulagency.com/blog/tecnologia/ecommerce-mi-negocio-online',
      url: 'https://playfulagency.com/blog/tecnologia/ecommerce-mi-negocio-online',
    }),
    '</script></head><body><h1>Crear un e-commerce</h1></body></html>',
  ].join('');
  const head = extractSeoHead(html);
  const analysis = analyzeBlogPostJsonLd(html, {
    h1Text: 'Crear un e-commerce',
    description: head.description,
    canonical: head.canonical,
    ogImage: head.ogImage,
  });
  assert.equal(head.description, description);
  assert.equal(analysis.ok, true, analysis.reasons.join(','));
});

test('title/meta/canonical/OG comparison is exact after entity decode', () => {
  const local = extractSeoHead(
    '<html><head><title>A &amp; B</title><meta name="description" content="Desc"><link rel="canonical" href="https://playfulagency.com/blog/seo/a"><meta property="og:title" content="A &amp; B"><meta property="og:description" content="Desc"><meta property="og:url" content="https://playfulagency.com/blog/seo/a"><meta property="og:image" content="/images/og-blog.jpg"></head></html>',
  );
  const prod = extractSeoHead(
    '<html><head><title>A &amp; B</title><meta name="description" content="Desc"><link rel="canonical" href="https://playfulagency.com/blog/seo/a"><meta property="og:title" content="A &amp; B"><meta property="og:description" content="Desc"><meta property="og:url" content="https://playfulagency.com/blog/seo/a"><meta property="og:image" content="https://playfulagency.com/images/og-blog.jpg"></head></html>',
  );
  assert.equal(local.title, 'A & B');
  assert.equal(compareSeoHead(local, prod).ok, true);
  const drifted = { ...prod, title: 'Otro' };
  assert.equal(compareSeoHead(local, drifted).ok, false);
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
