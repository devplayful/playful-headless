import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  BLOG_LANDING_LINKS,
  BLOG_LANDING_LINK_COPY_LOCKED_SLUGS,
  BLOG_CONTEXT_INTERNAL_LINKS,
  getBlogLandingLink,
  getBlogLandingLinks,
  applyBlogLandingLinkHtml,
  normalizeLandingHref,
} = await import('../utils/blog-landing-links.ts');
const { rewriteInSitePageHrefs } = await import('../services/rewrite-in-site-hrefs.mjs');

const blogPage = readFileSync(
  new URL('../app/(frontend)/blog/[...slug]/page.tsx', import.meta.url),
  'utf8',
);
const serviceCta = readFileSync(
  new URL('../utils/blog-service-cta.ts', import.meta.url),
  'utf8',
);

const EXPECTED = [
  { slug: 'actualizar-tu-e-commerce', href: '/agencia-e-commerce', anchor: 'actualizar tu e-commerce' },
  { slug: 'wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo', href: '/agencia-ux-ui', anchor: 'experiencia al usuario' },
  { slug: 'agencia-seo-internacional-en-el-2025-es-una-necesidad', href: '/agencia-seo', anchor: 'agencia SEO' },
  { slug: 'necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti', href: '/agencia-seo', anchor: 'agencia SEO' },
  { slug: 'programacion-web-que-es-como-puede-servirle-a-mi-marca', href: '/agencia-diseno-web', anchor: 'desarrollo web' },
  { slug: 'descubre-todo-lo-que-el-posicionamiento-sem-tiene-para-ti', href: '/agencia-sem', anchor: 'posicionamiento SEM' },
  { slug: 'auditoria-seo-que-es-como-se-hace', href: '/agencia-seo', anchor: 'agencia SEO' },
  { slug: 'que-es-data-studio-de-google-y-como-funciona', href: '/agencia-seo', anchor: 'agencia SEO' },
  { slug: 'desarrollo-ui-ux', href: '/agencia-ux-ui', anchor: 'agencia UX/UI' },
  { slug: 'la-nueva-gestion-de-google-ads', href: '/agencia-sem', anchor: 'agencia SEM' },
  { slug: 'zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', href: '/agencia-shopify', anchor: 'agencia Shopify' },
  { slug: 'diseno-web-de-paginas-web', href: '/agencia-diseno-web', anchor: 'diseño web efectivo' },
  { slug: 'los-5-problemas-de-e-commerce', href: '/agencia-e-commerce', anchor: 'tienda online' },
  { slug: 'como-elegir-el-mejor-framework-para-tu-web', href: '/agencia-diseno-web', anchor: 'desarrollo web' },
  { slug: 'como-posicionar-tu-negocio-en-google-ads', href: '/agencia-sem', anchor: 'publicidad en motores de búsqueda' },
  { slug: 'seo-y-sem-que-son-y-en-que-se-diferencian', href: '/agencia-sem', anchor: 'SEM', context: 'SEO y SEM' },
  { slug: 'ecommerce-mi-negocio-online', href: '/agencia-e-commerce', anchor: 'agencia de e-commerce' },
  { slug: 'rediseno-web', href: '/agencia-diseno-web', anchor: 'rediseño web', context: 'rediseño web es el proceso' },
  { slug: '6-herramientas-para-crear-informes-seo', href: '/agencia-seo', anchor: 'agencia SEO' },
  { slug: 'aprende-todo-sobre-el-seo', href: '/agencia-seo', anchor: 'agencia SEO' },
  { slug: 'crear-un-e-commerce', href: '/agencia-e-commerce', anchor: 'tienda online' },
  { slug: 'tendencias-en-diseno-web-para-el-2022', href: '/agencia-diseno-web', anchor: 'tendencias en diseño web' },
];

test('map keeps the 22 closed slug→{href,anchor} primaries', () => {
  assert.equal(EXPECTED.length, 22);
  for (const item of EXPECTED) {
    const entry = getBlogLandingLink(item.slug);
    assert.ok(entry, item.slug);
    assert.equal(entry.href, item.href, item.slug);
    assert.equal(entry.anchor, item.anchor, item.slug);
    assert.equal(entry.context, item.context, item.slug);
    assert.equal(entry.occurrence, item.occurrence, item.slug);
  }
  assert.equal(getBlogLandingLink('que-es-una-agencia-de-sem'), null);
  assert.equal(Object.keys(BLOG_LANDING_LINKS).length, 37);
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
  const intro = '<p>Conviene actualizar tu e-commerce que conozca tu catálogo.</p>';
  const tail = '<p>Más abajo: <a href="/agencia-e-commerce">nuestro equipo</a>.</p>'.repeat(8);
  const { html: out, result } = applyBlogLandingLinkHtml(
    intro + tail,
    'actualizar-tu-e-commerce',
  );
  assert.equal(result.status, 'applied');
  assert.equal((out.match(/href="\/agencia-e-commerce"/g) || []).length, 1);
  assert.match(out, /<a href="\/agencia-e-commerce">actualizar tu e-commerce<\/a>/);
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
  assert.match(blogPage, /applyBlogLandingLinks\(\$, postSlug\)/);
  assert.match(blogPage, /linkFirstUnlinkedServiceMention\(\$, serviceCta\)/);
  const landingIdx = blogPage.indexOf('applyBlogLandingLinks($, postSlug)');
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

test('context wraps only the sub-word SEM inside the first SEO y SEM', () => {
  const html =
    '<p>Has oído hablar de SEO y SEM, pero ¿sabes qué significan?</p>' +
    `<p>${'Relleno del artículo para empujar el resto fuera del primer tercio. '.repeat(20)}</p>` +
    '<p>Más abajo otro SEO y SEM no se envuelve, ni un SEM suelto.</p>';
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'seo-y-sem-que-son-y-en-que-se-diferencian',
  );
  assert.equal(result.status, 'applied');
  assert.equal((out.match(/href="\/agencia-sem"/g) || []).length, 1);
  assert.match(out, /SEO y <a href="\/agencia-sem">SEM<\/a>/);
  assert.match(out, /otro SEO y SEM no se envuelve/);
  assert.doesNotMatch(out, /<a href="\/agencia-sem">SEO y SEM<\/a>/);
});

test('context skips a lone SEM before the SEO y SEM phrase', () => {
  const html =
    '<p>El SEM suelto no cuenta; el enlace va en SEO y SEM del primer párrafo.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`;
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'seo-y-sem-que-son-y-en-que-se-diferencian',
  );
  assert.equal(result.status, 'applied');
  assert.match(out, /El SEM suelto no cuenta/);
  assert.match(out, /SEO y <a href="\/agencia-sem">SEM<\/a>/);
});

test('context wraps rediseño web in the defining sentence, not the first mention', () => {
  const html =
    '<p>El rediseño web se ha convertido en una herramienta. ' +
    '¿Qué implica el rediseño web? El rediseño web es el proceso de revisar el sitio.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>` +
    '<p>Otro rediseño web al final no se envuelve.</p>';
  const { html: out, result } = applyBlogLandingLinkHtml(html, 'rediseno-web');
  assert.equal(result.status, 'applied');
  assert.equal((out.match(/href="\/agencia-diseno-web"/g) || []).length, 1);
  assert.match(out, /El <a href="\/agencia-diseno-web">rediseño web<\/a> es el proceso/);
  assert.match(out, /El rediseño web se ha convertido/);
  assert.match(out, /Otro rediseño web al final/);
});

test('occurrence 2 wraps the second wrappable match in the first third', () => {
  const html =
    '<p>Primera tienda online y después la segunda tienda online del tercio.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>` +
    '<p>Tercera tienda online fuera de alcance.</p>';
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'los-5-problemas-de-e-commerce',
    { href: '/agencia-e-commerce', anchor: 'tienda online', occurrence: 2 },
  );
  assert.equal(result.status, 'applied');
  assert.equal((out.match(/href="\/agencia-e-commerce"/g) || []).length, 1);
  assert.match(out, /Primera tienda online y después la segunda <a href="\/agencia-e-commerce">tienda online<\/a>/);
  assert.match(out, /Tercera tienda online fuera/);
});

test('does not wrap an exact match that is already inside another <a>', () => {
  const html =
    '<p>Lee <a href="/blog/otro">tienda online</a> y luego una tienda online libre.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`;
  const { html: out, result } = applyBlogLandingLinkHtml(
    html,
    'los-5-problemas-de-e-commerce',
  );
  assert.equal(result.status, 'applied');
  assert.match(out, /<a href="\/blog\/otro">tienda online<\/a>/);
  assert.match(out, /luego una <a href="\/agencia-e-commerce">tienda online<\/a> libre/);
});

test('accent-sensitive match does not wrap the unaccented lookalike', () => {
  const html =
    '<p>El rediseno web sin tilde no cuenta; el rediseño web es el proceso sí.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`;
  const { html: out, result } = applyBlogLandingLinkHtml(html, 'rediseno-web');
  assert.equal(result.status, 'applied');
  assert.match(out, /El rediseno web sin tilde no cuenta/);
  assert.match(out, /el <a href="\/agencia-diseno-web">rediseño web<\/a> es el proceso/);
});

test('natural first-third phrases wrap without rewriting surrounding copy', () => {
  const cases = [
    {
      slug: 'actualizar-tu-e-commerce',
      html: '<p>Conviene actualizar tu e-commerce antes de migrar el catálogo.</p>',
      wrap: '<a href="/agencia-e-commerce">actualizar tu e-commerce</a>',
    },
    {
      slug: 'wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo',
      html: '<p>Buscamos una intuitiva experiencia al usuario en el prototipo.</p>',
      wrap: '<a href="/agencia-ux-ui">experiencia al usuario</a>',
    },
    {
      slug: 'programacion-web-que-es-como-puede-servirle-a-mi-marca',
      html: '<p>Hay dos tipologías del desarrollo web que puedes aplicar.</p>',
      wrap: '<a href="/agencia-diseno-web">desarrollo web</a>',
    },
    {
      slug: 'descubre-todo-lo-que-el-posicionamiento-sem-tiene-para-ti',
      html: '<p>Con el posicionamiento SEM podrás generar más tráfico.</p>',
      wrap: '<a href="/agencia-sem">posicionamiento SEM</a>',
    },
    {
      slug: 'diseno-web-de-paginas-web',
      html: '<p>Más que páginas bonitas, el diseño web efectivo crea experiencias.</p>',
      wrap: '<a href="/agencia-diseno-web">diseño web efectivo</a>',
    },
    {
      slug: 'como-elegir-el-mejor-framework-para-tu-web',
      html: '<p>Los frameworks en el desarrollo web son herramientas clave.</p>',
      wrap: '<a href="/agencia-diseno-web">desarrollo web</a>',
    },
    {
      slug: 'como-posicionar-tu-negocio-en-google-ads',
      html: '<p>El uso de publicidad en motores de búsqueda como Google es necesario.</p>',
      wrap: '<a href="/agencia-sem">publicidad en motores de búsqueda</a>',
    },
    {
      slug: 'crear-un-e-commerce',
      html: '<p>Hoy crear una tienda online es más accesible que nunca.</p>',
      wrap: '<a href="/agencia-e-commerce">tienda online</a>',
    },
    {
      slug: 'tendencias-en-diseno-web-para-el-2022',
      html: '<p>Te presentamos las principales tendencias en diseño web de este año.</p>',
      wrap: '<a href="/agencia-diseno-web">tendencias en diseño web</a>',
    },
  ];
  for (const item of cases) {
    const { html: out, result } = applyBlogLandingLinkHtml(
      item.html.repeat(6),
      item.slug,
    );
    assert.equal(result.status, 'applied', item.slug);
    assert.equal(out.includes(item.wrap), true, item.slug);
  }
});

const {
  BLOG_BODY_OVERRIDES,
} = await import('../lib/blog-body-overrides.ts');

function escapeRe(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('the 29 contextual internal links are in the map with exact context', () => {
  assert.equal(BLOG_CONTEXT_INTERNAL_LINKS.length, 29);
  const destsBySlug = new Map();
  for (const item of BLOG_CONTEXT_INTERNAL_LINKS) {
    assert.ok(item.context.includes(item.anchor), `n=${item.n} context must contain anchor`);
    const match = getBlogLandingLinks(item.slug).find(
      (link) =>
        link.href === item.href &&
        link.anchor === item.anchor &&
        link.context === item.context,
    );
    assert.ok(match, `n=${item.n} ${item.slug}`);
    const dests = destsBySlug.get(item.slug) || new Set();
    assert.equal(dests.has(item.href), false, `n=${item.n} duplicate dest`);
    dests.add(item.href);
    destsBySlug.set(item.slug, dests);
    assert.equal(BLOG_BODY_OVERRIDES[item.slug], undefined, `n=${item.n} override`);
  }
});

test('each of the 29 wraps only the anchor inside the exact context phrase', () => {
  for (const item of BLOG_CONTEXT_INTERNAL_LINKS) {
    const html =
      `<p>${item.context}</p>` +
      `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`;
    const { html: out, results } = applyBlogLandingLinkHtml(html, item.slug);
    const hit = results.find(
      (result) => result.href === item.href && result.wantedAnchor === item.anchor,
    );
    assert.ok(hit, `n=${item.n} missing result`);
    assert.equal(hit.status, 'applied', `n=${item.n}`);
    assert.equal(hit.applied, true, `n=${item.n}`);
    const wrap = `<a href="${item.href}">${item.anchor}</a>`;
    const decoded = out.replace(/&nbsp;/g, '\u00a0');
    assert.equal(decoded.includes(wrap), true, `n=${item.n} wrap`);
    assert.equal((out.match(new RegExp(`href="${escapeRe(item.href)}"`, 'g')) || []).length, 1, `n=${item.n} dest`);
    assert.equal(decoded.includes(item.context), false, `n=${item.n} raw context stays unwrapped only at the anchor`);
    const around = item.context.replace(item.anchor, wrap);
    assert.equal(decoded.includes(around), true, `n=${item.n} surrounding copy`);
  }
});

test('each of the 29 skips an already-linked anchor in that context phrase', () => {
  for (const item of BLOG_CONTEXT_INTERNAL_LINKS) {
    const linked = item.context.replace(
      item.anchor,
      `<a href="${item.href}">${item.anchor}</a>`,
    );
    const html =
      `<p>${linked}</p>` +
      `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`;
    const { html: out, results } = applyBlogLandingLinkHtml(html, item.slug);
    const hit = results.find(
      (result) => result.href === item.href && result.wantedAnchor === item.anchor,
    );
    assert.ok(hit, `n=${item.n}`);
    assert.equal(hit.status, 'already-existed', `n=${item.n}`);
    assert.equal((out.match(new RegExp(`href="${escapeRe(item.href)}"`, 'g')) || []).length, 1, `n=${item.n}`);
  }
});

test('each of the 29 skips a missing context phrase without inventing copy', () => {
  for (const item of BLOG_CONTEXT_INTERNAL_LINKS) {
    const html = `<p>Texto sin la frase de contexto ni el ancla mapeada para este destino.</p>`.repeat(8);
    const { html: out, results } = applyBlogLandingLinkHtml(html, item.slug);
    const hit = results.find(
      (result) => result.href === item.href && result.wantedAnchor === item.anchor,
    );
    assert.ok(hit, `n=${item.n}`);
    assert.equal(hit.status, 'anchor-absent', `n=${item.n}`);
    assert.equal(out.includes(`href="${item.href}"`), false, `n=${item.n}`);
    assert.equal(out.includes(item.anchor), false, `n=${item.n}`);
  }
});

test('context spanning strong/b tags still wraps only the anchor', () => {
  const html =
    '<p><strong>Optimización para Motores de Búsqueda (SEO):</strong> El diseño web también implica optimizar el sitio web para mejorar su visibilidad en los motores de búsqueda.</p>' +
    `<p>${'Más texto de relleno sin repetir la clave. '.repeat(20)}</p>`;
  const { html: out, results } = applyBlogLandingLinkHtml(html, 'diseno-web-de-paginas-web');
  const hit = results.find((result) => result.href === '/agencia-seo');
  assert.equal(hit.status, 'applied');
  assert.match(out, /<strong>Optimización para <a href="\/agencia-seo">Motores de Búsqueda<\/a> \(SEO\):<\/strong>/);
});

test('a context phrase after the first third is still wrapped', () => {
  const item = BLOG_CONTEXT_INTERNAL_LINKS.find((row) => row.n === 28);
  const html =
    `<p>${'Apertura sin la frase de contexto. '.repeat(40)}</p>` +
    `<p>${item.context}</p>`;
  const { html: out, results } = applyBlogLandingLinkHtml(html, item.slug);
  const hit = results.find((result) => result.href === item.href && result.wantedAnchor === item.anchor);
  assert.equal(hit.status, 'applied');
  assert.match(out, /punto de vista de un <a href="\/agencia-e-commerce">e-commerce<\/a>/);
});
