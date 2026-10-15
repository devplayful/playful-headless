import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  BLOG_LANDING_LINKS,
  BLOG_LANDING_LINK_COPY_LOCKED_SLUGS,
  getBlogLandingLink,
  applyBlogLandingLinkHtml,
  normalizeLandingHref,
} = await import('../utils/blog-landing-links.ts');
const { rewriteInSitePageHrefs } = await import('../services/rewrite-in-site-hrefs.mjs');

const blogPage = readFileSync(
  new URL('../app/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const serviceCta = readFileSync(
  new URL('../utils/blog-service-cta.ts', import.meta.url),
  'utf8',
);

const EXPECTED = [
  ['actualizar-tu-e-commerce', '/agencia-e-commerce', 'agencia de e-commerce'],
  ['wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo', '/agencia-ux-ui', 'agencia UX/UI'],
  ['agencia-seo-internacional-en-el-2025-es-una-necesidad', '/agencia-seo', 'agencia SEO'],
  ['necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti', '/agencia-seo', 'agencia SEO'],
  ['programacion-web-que-es-como-puede-servirle-a-mi-marca', '/agencia-diseno-web', 'agencia de diseño web'],
  ['descubre-todo-lo-que-el-posicionamiento-sem-tiene-para-ti', '/agencia-sem', 'agencia SEM'],
  ['auditoria-seo-que-es-como-se-hace', '/agencia-seo', 'agencia SEO'],
  ['que-es-data-studio-de-google-y-como-funciona', '/agencia-seo', 'agencia SEO'],
  ['desarrollo-ui-ux', '/agencia-ux-ui', 'agencia UX/UI'],
  ['la-nueva-gestion-de-google-ads', '/agencia-sem', 'agencia SEM'],
  ['zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', '/agencia-shopify', 'agencia Shopify'],
  ['diseno-web-de-paginas-web', '/agencia-diseno-web', 'agencia de diseño web'],
  ['los-5-problemas-de-e-commerce', '/agencia-e-commerce', 'agencia de e-commerce'],
  ['como-elegir-el-mejor-framework-para-tu-web', '/agencia-diseno-web', 'agencia de diseño web'],
  ['como-posicionar-tu-negocio-en-google-ads', '/agencia-sem', 'agencia SEM'],
  ['seo-y-sem-que-son-y-en-que-se-diferencian', '/agencia-sem', 'agencia SEM'],
  ['ecommerce-mi-negocio-online', '/agencia-e-commerce', 'agencia de e-commerce'],
  ['rediseno-web', '/agencia-diseno-web', 'agencia de diseño web'],
  ['6-herramientas-para-crear-informes-seo', '/agencia-seo', 'agencia SEO'],
  ['aprende-todo-sobre-el-seo', '/agencia-seo', 'agencia SEO'],
  ['crear-un-e-commerce', '/agencia-e-commerce', 'agencia de e-commerce'],
  ['tendencias-en-diseno-web-para-el-2022', '/agencia-diseno-web', 'agencia de diseño web'],
];

test('map has the 22 closed slug→{href,anchor} entries', () => {
  assert.equal(Object.keys(BLOG_LANDING_LINKS).length, 22);
  assert.equal(EXPECTED.length, 22);
  for (const [slug, href, anchor] of EXPECTED) {
    const entry = getBlogLandingLink(slug);
    assert.ok(entry, slug);
    assert.equal(entry.href, href, slug);
    assert.equal(entry.anchor, anchor, slug);
  }
  assert.equal(getBlogLandingLink('que-es-una-agencia-de-sem'), null);
});

test('copy-locked slugs are the six with a different live anchor', () => {
  assert.deepEqual([...BLOG_LANDING_LINK_COPY_LOCKED_SLUGS], [
    'necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti',
    'que-es-data-studio-de-google-y-como-funciona',
    'la-nueva-gestion-de-google-ads',
    'ecommerce-mi-negocio-online',
    '6-herramientas-para-crear-informes-seo',
    'aprende-todo-sobre-el-seo',
  ]);
});

test('wraps the exact first-third anchor and does not duplicate', () => {
  const html = '<p>Contrata una agencia SEO internacional hoy mismo para crecer.</p>'.repeat(6);
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'agencia-seo-internacional-en-el-2025-es-una-necesidad',
  );
  assert.equal(result.status, 'applied');
  assert.equal((out.match(/href="\/agencia-seo"/g) || []).length, 1);
  assert.match(out, /<a href="\/agencia-seo">agencia SEO<\/a>/);
  assert.match(out, /agencia SEO<\/a> internacional/);
});

test('already-linked exact first-third anchor is a no-op', () => {
  const html =
    '<p>Somos <a href="/agencia-seo">agencia SEO</a> en el primer tercio del artículo.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>` +
    '<p>Otra agencia SEO más abajo no se envuelve.</p>';
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'agencia-seo-internacional-en-el-2025-es-una-necesidad',
  );
  assert.equal(result.status, 'already-existed');
  assert.equal((out.match(/href="\/agencia-seo"/g) || []).length, 1);
  assert.match(out, /Otra agencia SEO más abajo/);
});

test('missing exact first-third phrase is not invented', () => {
  const html = '<p>El posicionamiento orgánico ayuda a tu marca a aparecer en Google.</p>'.repeat(8);
  const { html: out, result } = applyBlogLandingLinkHtml(html, 'auditoria-seo-que-es-como-se-hace');
  assert.equal(result.status, 'anchor-absent');
  assert.equal(out.includes('href="/agencia-seo"'), false);
  assert.doesNotMatch(out, /agencia SEO/);
});

test('moves a lower landing href onto the first-third exact anchor', () => {
  const intro = '<p>Trabaja con una agencia de e-commerce que conozca tu catálogo.</p>';
  const tail = '<p>Más abajo: <a href="/agencia-e-commerce">nuestro equipo</a>.</p>'.repeat(8);
  const { html: out, result } = applyBlogLandingLinkHtml(
    intro + tail,
    'actualizar-tu-e-commerce',
  );
  assert.equal(result.status, 'applied');
  assert.equal((out.match(/href="\/agencia-e-commerce"/g) || []).length, 1);
  assert.match(out, /<a href="\/agencia-e-commerce">agencia de e-commerce<\/a>/);
  assert.match(out, /Más abajo: nuestro equipo/);
  assert.doesNotMatch(out, /<a href="\/agencia-e-commerce">nuestro equipo<\/a>/);
});

test('copy-locked posts keep the different anchor after in-site rewrite', () => {
  const cases = [
    {
      slug: 'necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti',
      path: '/blog/pautas-digitales/necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti',
      from: '/landing-seo',
      anchor: 'Comunícate hoy con nosotros',
    },
    {
      slug: 'que-es-data-studio-de-google-y-como-funciona',
      path: '/blog/seo/que-es-data-studio-de-google-y-como-funciona',
      from: '/landing-seo',
      anchor: 'Landing Page SEO',
    },
    {
      slug: 'la-nueva-gestion-de-google-ads',
      path: '/blog/pautas-digitales/la-nueva-gestion-de-google-ads',
      from: '/servicios/automatizacion-del-marketing',
      anchor: 'servicio de Marketing Digital',
    },
    {
      slug: 'ecommerce-mi-negocio-online',
      path: '/blog/tecnologia/ecommerce-mi-negocio-online',
      from: '/servicios/desarrollo-web',
      anchor: 'equipo de desarrollo web',
    },
    {
      slug: '6-herramientas-para-crear-informes-seo',
      path: '/blog/seo/6-herramientas-para-crear-informes-seo',
      from: '/landing-seo',
      anchor: 'Landing Page SEO',
    },
    {
      slug: 'aprende-todo-sobre-el-seo',
      path: '/blog/seo/aprende-todo-sobre-el-seo',
      from: '/landing-seo',
      anchor: 'Haz clic aquí e infórmate más.',
    },
  ];

  for (const item of cases) {
    const body = `<p>${'Introducción al tema de este artículo. '.repeat(40)}</p><p>Cierre: <a href="${item.from}">${item.anchor}</a></p>`;
    const rewritten = rewriteInSitePageHrefs(body, item.path);
    const { html: out, result } = applyBlogLandingLinkHtml(rewritten, item.slug);
    assert.equal(result.status, 'anchor-different', item.slug);
    assert.equal(result.existingAnchor, item.anchor, item.slug);
    assert.match(out, new RegExp(`>${item.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</`));
    assert.doesNotMatch(out, new RegExp(`<a href="${result.href}">${BLOG_LANDING_LINKS[item.slug].anchor}</a>`));
    assert.equal((out.match(new RegExp(`href="${result.href}"`, 'g')) || []).length, 1, item.slug);
  }
});

test('exact phrase after the first third is not wrapped', () => {
  const html =
    `<p>${'Sin la frase clave en la apertura del artículo. '.repeat(40)}</p>` +
    '<p>Cierre: contrata una agencia SEO ahora.</p>';
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'agencia-seo-internacional-en-el-2025-es-una-necesidad',
  );
  assert.equal(result.status, 'anchor-absent');
  assert.doesNotMatch(out, /href="\/agencia-seo"/);
});

test('unmapped slugs are a no-op', () => {
  const html = '<p>Una agencia SEO cualquier cosa.</p>';
  const { html: out, result } = applyBlogLandingLinkHtml(html, 'otro-articulo');
  assert.equal(result, null);
  assert.equal(out, html);
});

test('blog post page applies the landing map in the same cheerio render as the CTA wrap', () => {
  assert.match(blogPage, /applyBlogLandingLink\(\$, postSlug\)/);
  assert.match(blogPage, /linkFirstUnlinkedServiceMention\(\$, serviceCta\)/);
  const landingIdx = blogPage.indexOf('applyBlogLandingLink($, postSlug)');
  const ctaIdx = blogPage.indexOf('linkFirstUnlinkedServiceMention($, serviceCta)');
  assert.ok(landingIdx > 0 && ctaIdx > landingIdx);
});

test('the 22 map does not add compact service CTAs', () => {
  assert.doesNotMatch(serviceCta, /actualizar-tu-e-commerce/);
  assert.doesNotMatch(serviceCta, /BLOG_LANDING_LINKS/);
});

test('absolute apex hrefs count as the same landing', () => {
  assert.equal(
    normalizeLandingHref('https://playfulagency.com/agencia-seo/'),
    '/agencia-seo',
  );
  const html = '<p>Lee <a href="https://playfulagency.com/agencia-seo/">agencia SEO</a> aquí. '.repeat(8) + '</p>';
  const { result } = applyBlogLandingLinkHtml(
    html,
    'agencia-seo-internacional-en-el-2025-es-una-necesidad',
  );
  assert.equal(result.status, 'already-existed');
});
