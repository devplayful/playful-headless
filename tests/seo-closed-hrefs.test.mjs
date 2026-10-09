import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { rewriteInSitePageHrefs, rewriteWpRenderedHtmlFields } from '../services/rewrite-in-site-hrefs.mjs';
import {
  AGENCIA_DISENO_HREF,
  AGENCIA_ECOMMERCE_HREF,
  AGENCIA_SEO_HREF,
  AGENCIA_SEM_HREF,
  AGENCIA_UX_UI_HREF,
  BLOG_HREF,
  CASOS_HREF,
  CONTACT_HREF,
  GUIA_MARKETING_HREF,
  INSTAGRAM_ADS_HREF,
  PUBLICIDAD_DIGITAL_HREF,
  SKIP_BROKEN_HREF_PATHS,
  SKIP_REWRITE_SOURCE_SLUGS,
  decideBrokenInternalHref,
} from '../utils/broken-internal-hrefs.ts';

const REWRITES = [
  { source: '/blog/seo/seo-y-sem-que-son-y-en-que-se-diferencian', from: '/landing-seo', to: AGENCIA_SEO_HREF, anchor: 'Landing Page sobre SEO' },
  { source: '/blog/seo/que-es-data-studio-de-google-y-como-funciona', from: '/landing-seo', to: AGENCIA_SEO_HREF, anchor: 'Landing Page SEO' },
  { source: '/blog/seo/aprende-todo-sobre-el-seo', from: '/landing-seo', to: AGENCIA_SEO_HREF, anchor: 'Haz clic aquí e infórmate más.' },
  { source: '/blog/seo/6-herramientas-para-crear-informes-seo', from: '/landing-seo', to: AGENCIA_SEO_HREF, anchor: 'Landing Page SEO' },
  { source: '/blog/pautas-digitales/necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti', from: '/landing-seo', to: AGENCIA_SEO_HREF, anchor: 'Comunícate hoy con nosotros' },
  { source: '/blog/seo/conoce-los-tipos-de-enlaces-seo', from: '/landing-seo', to: AGENCIA_SEO_HREF, anchor: 'posicionamiento de tu página web' },
  { source: '/blog/seo/aprende-todo-sobre-el-seo', from: 'https://seo.crear.endpoint.playfulagency.com/', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/conoce-los-tipos-de-enlaces-seo', from: 'https://seo.crear.endpoint.playfulagency.com/', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/seo-y-sem-que-son-y-en-que-se-diferencian', from: 'https://seo.crear.endpoint.playfulagency.com/', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/diseno-web-y-posicionamiento-seo', from: 'https://seo.crear.endpoint.playfulagency.com/', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/auditoria-seo-que-es-como-se-hace', from: 'https://auditoria-seo.crear.endpoint.playfulagency.com/', to: AGENCIA_SEO_HREF, anchor: 'auditoría' },
  { source: '/blog/pautas-digitales/analitica-web-que-es-como-puede-ayudar-a-mi-marca', from: '/servicios/seo', to: AGENCIA_SEO_HREF, anchor: 'analítica web' },
  { source: '/blog/seo/blog-corporativo-aumenta-el-trafico-de-tu-sitio-web', from: '/servicios/seo', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/chat-gpt-puede-mejorar-el-seo-de-una-pagina-web', from: '/servicios/seo', to: AGENCIA_SEO_HREF, anchor: 'trabajo SEO' },
  { source: '/blog/seo/que-es-data-studio-de-google-y-como-funciona', from: '/servicios/seo', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/rich-snippet-ayuda-a-optimizar-tu-web', from: '/servicios/seo', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/pautas-digitales/tiktok-ads-ahora-puedes-hacer-publicidad-en-tiktok', from: '/seo', to: AGENCIA_SEO_HREF, anchor: 'posicionamiento orgánico' },
  { source: '/blog/seo/desarrollo-ui-ux', from: '/seo', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/tecnologia/que-es-wordpress-por-que-tengo-que-usarlo', from: '/seo', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/seo/que-es-un-blog', from: '/seo', to: AGENCIA_SEO_HREF, anchor: 'SEO' },
  { source: '/blog/pautas-digitales/la-nueva-gestion-de-google-ads', from: '/servicios/automatizacion-del-marketing', to: AGENCIA_SEM_HREF, anchor: 'servicio de Marketing Digital' },
  { source: '/blog/seo/posicionamiento-organico-vs-pago', from: '/servicios/automatizacion-del-marketing', to: AGENCIA_SEM_HREF, anchor: 'Playful Agency te ayudamos a crear estrategias' },
  { source: '/blog/seo/6-herramientas-para-crear-informes-seo', from: '/servicios/automatizacion-del-marketing', to: AGENCIA_SEO_HREF, anchor: 'automatización' },
  { source: '/blog/seo/que-es-la-intencion-de-busqueda-y-cuales-son-sus-beneficios', from: '/servicios/automatizacion-del-marketing', to: AGENCIA_SEO_HREF, anchor: 'automatización' },
  { source: '/blog/seo/rich-snippet-ayuda-a-optimizar-tu-web', from: '/servicios/automatizacion-del-marketing', to: AGENCIA_SEO_HREF, anchor: 'estrategia de Marketing Digital' },
  { source: '/blog/email-marketing/haz-email-marketing-como-todo-un-experto-ejemplos', from: '/servicios/automatizacion-del-marketing', to: CONTACT_HREF, anchor: 'Si deseas implementar esta estrategia con nosotros' },
  { source: '/blog/pautas-digitales/como-usar-instagram-para-expandir-tu-negocio', from: '/servicios/automatizacion-del-marketing', to: CONTACT_HREF, anchor: 'automatización' },
  { source: '/blog/pautas-digitales/conoce-como-impulsar-tu-marca-online', from: '/servicios/automatizacion-del-marketing', to: CONTACT_HREF, anchor: 'desarrollar una sólida estrategia digital' },
  { source: '/blog/tecnologia/desarrollo-de-aplicaciones-web', from: '/servicios/desarrollo-web', to: AGENCIA_DISENO_HREF, anchor: 'desarrollador web' },
  { source: '/blog/seo/diseno-web-y-posicionamiento-seo', from: '/servicios/desarrollo-web', to: AGENCIA_DISENO_HREF, anchor: 'diseño' },
  { source: '/blog/seo/web-app-y-app-nativa-cual-es-la-mejor-opcion', from: '/servicios/desarrollo-web', to: AGENCIA_DISENO_HREF, anchor: 'desarrollo' },
  { source: '/blog/seo/desarrollo-ui-ux', from: '/servicios/desarrollo-web', to: AGENCIA_UX_UI_HREF, anchor: 'diseño y desarrollo' },
  { source: '/blog/tecnologia/ecommerce-mi-negocio-online', from: '/servicios/desarrollo-web', to: AGENCIA_ECOMMERCE_HREF, anchor: 'equipo de desarrollo web' },
  { source: '/blog/pautas-digitales/el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas', from: '/servicios/pautas-digitales', to: CONTACT_HREF, anchor: 'pautas' },
  { source: '/blog/pautas-digitales/el-sms-marketing', from: '/servicios/pautas-digitales', to: CONTACT_HREF, anchor: 'pautas' },
  { source: '/blog/pautas-digitales/tiktok-ads-ahora-puedes-hacer-publicidad-en-tiktok', from: '/servicios/pautas-digitales', to: CONTACT_HREF, anchor: 'servicio de Pautas Digitales' },
  { source: '/blog/email-marketing/haz-email-marketing-como-todo-un-experto-ejemplos', from: 'https://emailmarketing.crear.endpoint.playfulagency.com/', to: CONTACT_HREF, anchor: 'email' },
  { source: '/blog/mas-vistos/ecosistema-digital-de-tu-marca', from: 'https://promociones.crear.endpoint.playfulagency.com/optin1631114756459', to: CONTACT_HREF, anchor: 'promociones' },
  { source: '/blog/pautas-digitales/publicidad-digital-en-tu-negocio', from: '/tipos-de-publicidad-online', to: GUIA_MARKETING_HREF, anchor: 'Las estrategias de Marketing Digital' },
  { source: '/blog/pautas-digitales/el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas', from: '/blog/pautas-digitales/implementa-publicidad-online-en-tus-estrategias', to: PUBLICIDAD_DIGITAL_HREF, anchor: 'cómo puede mejorar tus estrategias' },
  { source: '/blog/otros/conoce-todo-sobre-instagram-ads', from: '/implementa-publicidad-online-en-tus-estrategias', to: PUBLICIDAD_DIGITAL_HREF, anchor: 'Implementa la publicidad online' },
  { source: '/blog/pautas-digitales/que-son-los-buyer-persona-y-como-se-determinan', from: '/email-marketing-una-herramienta-que-no-puedes-dejar-de-usar-en-tu-empresa', to: GUIA_MARKETING_HREF, anchor: 'estrategia de marketing' },
  { source: '/blog/pautas-digitales/necesitas-realizar-un-informe-seo-nosotros-lo-hacemos-por-ti', from: '/blog/pautas-digitales/por-que-debes-hacer-publicidad-digital-en-tu-negocio', to: PUBLICIDAD_DIGITAL_HREF, anchor: 'Un resumen de la publicidad de display' },
  { source: '/blog/pautas-digitales/como-usar-el-remarketing-para-tener-mas-clientes', from: '/blog/pautas-digitales/por-que-debes-hacer-publicidad-digital-en-tu-negocio', to: PUBLICIDAD_DIGITAL_HREF, anchor: 'Publicidad Digital: distintas formas de atraer tráfico a tu web' },
  { source: '/blog/mas-vistos/ecosistema-digital-de-tu-marca', from: '/blog/email-marketing', to: '/blog/email-marketing/estrategia-de-email-marketing', anchor: 'Email Marketing' },
  { source: '/blog/email-marketing/como-crear-una-base-de-datos-de-email-marketing', from: '/blog/email-marketing/como-hacer-un-email-marketing-eficaz-durante-la-pandemia', to: '/blog/email-marketing/estrategia-de-email-marketing', anchor: 'campañas de email marketing.' },
  { source: '/blog/tecnologia/que-es-wordpress-por-que-tengo-que-usarlo', from: '/blog/tecnologia/lenguajes-de-programacion-para-que-sirve-y-cuales-son-los-mas-usados', to: '/blog/tecnologia/programacion-web-que-es-como-puede-servirle-a-mi-marca', anchor: 'Lenguajes de programación' },
  { source: '/blog/seo/rich-snippet-ayuda-a-optimizar-tu-web', from: '/blog/seo/optimizacion-web', to: '/blog/seo/consejos-para-la-optimizacion-web', anchor: 'ayuda al posicionamiento de una página' },
  { source: '/blog/seo/desarrollo-ui-ux', from: '/blog/tecnologia/ecommerce-quiero-tener-mi-negocio-online', to: '/blog/tecnologia/ecommerce-mi-negocio-online', anchor: 'e-commerce' },
  { source: '/blog/pautas-digitales/errores-que-pueden-perjudicar-a-tu-marca-al-generar-anuncios-en-facebook', from: '/blog/pautas-digitales/que-es-pixel-de-facebook-y-como-te-puede-ayudar-con-tus-campanas', to: '/blog/pautas-digitales/el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas', anchor: 'pixel de Facebook' },
  { source: '/blog/seo/chat-gpt-puede-mejorar-el-seo-de-una-pagina-web', from: '/blog/seo/blog-seo-aprende-todo-sobre-el-seo', to: '/blog/seo/aprende-todo-sobre-el-seo', anchor: 'estrategias de SEO' },
  { source: '/blog/email-marketing/5-plataformas-para-email-marketing-efectivo', from: '/6-herramientas-para-crear-informes-seo', to: '/blog/seo/6-herramientas-para-crear-informes-seo', anchor: 'herramienta Google Analytics' },
  { source: '/blog/tecnologia/que-es-wordpress-por-que-tengo-que-usarlo', from: '/blog/otros/que-es-un-blog', to: '/blog/seo/que-es-un-blog', anchor: 'tener un blog' },
  { source: '/blog/seo/aprende-todo-sobre-el-seo', from: '/contactanos', to: CONTACT_HREF, anchor: 'contáctanos' },
  { source: '/blog/otros/ecosistema-digital-de-tu-marca', from: '/blog/otros/ecosistema-digital-de-tu-marca', to: '/blog/mas-vistos/ecosistema-digital-de-tu-marca', anchor: 'ecosistema' },
  { source: '/blog/seo/aprende-todo-sobre-el-seo', from: '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads', to: INSTAGRAM_ADS_HREF, anchor: 'Instagram Ads' },
  { source: '/blog/seo/aprende-todo-sobre-el-seo', from: '/otros/conoce-todo-sobre-instagram-ads', to: INSTAGRAM_ADS_HREF, anchor: 'Instagram Ads' },
];

const UNWRAPS = [
  { source: '/blog/pautas-digitales/el-pixel-de-facebook-y-como-te-ayuda-con-tus-campanas', from: '/servicios/desarrollo-web', anchor: 'integración de herramientas analíticas para tu sitio' },
  { source: '/blog/pautas-digitales/publicidad-digital-en-tu-negocio', from: '/tipos-de-publicidad-online', anchor: 'publicidad' },
  { source: '/blog/pautas-digitales/que-son-los-buyer-persona-y-como-se-determinan', from: '/7-consejos-seo-para-posicionar-tu-pagina-web', anchor: 'público objetivo' },
  { source: '/blog/seo/aprende-todo-sobre-el-seo', from: '/e-books/Seo-Local/Playful_Agengy_Ebook_seo_local.pdf', anchor: 'Descarga nuestro E-Book' },
  { source: '/blog/seo/ejemplos-de-marketing-de-contenido', from: '/blog/otros/podcast-una-herramienta-de-contenido-para-ganar-autoridad', anchor: 'Podcast' },
  { source: '/blog/pautas-digitales/que-son-los-buyer-persona-y-como-se-determinan', from: '/como-hacer-que-se-enamoren-de-tu-marca', anchor: 'pretende alcanzar (y cautivar)' },
  { source: '/blog/pautas-digitales/publicidad-navidena', from: '/blog/pautas-digitales/actualizaciones-de-instagram', anchor: 'actualizaciones de Instagram' },
  { source: '/blog/otros/es-tiktok-el-nuevo-google', from: '/blog/seo/busqueda-por-voz-que-es-y-como-afecta-al-seo', anchor: 'Búsqueda por voz' },
  { source: '/blog/seo/que-es-un-blog', from: '/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona', anchor: 'Google Grants' },
  { source: '/blog/seo/que-es-un-blog', from: '/google-grants-descubre-que-es-y-como-funciona', anchor: 'Google Grants' },
  { source: '/blog/mas-vistos/que-es-una-agencia-de-sem', from: '/blog/pautas-digitales/porque-tener-un-perfil-empresarial-en-linkedin', anchor: 'LinkedIn Ads' },
  { source: '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad', from: '/seo-internacional', anchor: 'agencia de SEO' },
];

const LANDING_REWRITES = [
  { from: '/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', to: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', anchor: 'Zelle' },
  { from: '/que-es-una-agencia-de-sem', to: '/blog/mas-vistos/que-es-una-agencia-de-sem', anchor: 'SEM' },
  { from: '/publicidad-digital-en-tu-negocio', to: PUBLICIDAD_DIGITAL_HREF, anchor: 'publicidad' },
  { from: '/todo-sobre-el-seo', to: '/blog/seo/aprende-todo-sobre-el-seo', anchor: 'SEO' },
  { from: '/google-grants-descubre-que-es-y-como-funciona', to: BLOG_HREF, anchor: 'Grants' },
  { from: '/category/tecnologia', to: BLOG_HREF, anchor: 'tecnología' },
  { from: '/author/arosillo', to: BLOG_HREF, anchor: 'autor' },
  { from: '/project/bottle-mockup', to: CASOS_HREF, anchor: 'mockup' },
  { from: '/projects', to: CASOS_HREF, anchor: 'proyectos' },
  { from: '/caso-de-exito-pcm', to: CASOS_HREF, anchor: 'PCM' },
];

function renderCase({ from, anchor }) {
  return `<p>Lee <a class="x" href="${from}">${anchor}</a> hoy.</p>`;
}

test('rewrites each listed href and keeps the anchor', () => {
  for (const item of REWRITES) {
    const html = renderCase(item);
    const rewritten = rewriteInSitePageHrefs(html, item.source);
    assert.doesNotMatch(rewritten, new RegExp(`href="${item.from.replaceAll('/', '\\/').replaceAll('?', '\\?')}"`), `${item.source} ${item.from}`);
    assert.match(rewritten, new RegExp(`href="${item.to.replaceAll('/', '\\/')}">${item.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</`));
    assert.match(rewritten, new RegExp(`>${item.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</`));
  }
});

test('unwraps listed anchors and leaves the text', () => {
  for (const item of UNWRAPS) {
    const html = renderCase(item);
    const rewritten = rewriteInSitePageHrefs(html, item.source);
    assert.doesNotMatch(rewritten, /<a\b/, `${item.source} ${item.from}`);
    assert.doesNotMatch(rewritten, new RegExp(item.from.replaceAll('/', '\\/').replaceAll('?', '\\?')));
    assert.match(rewritten, new RegExp(item.anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(decideBrokenInternalHref(item.from, item.source, item.anchor).unwrap, true);
  }
});

test('landing carousel hrefs resolve without changing the markup around them', () => {
  for (const landing of ['/agencia-e-commerce', '/agencia-seo', '/agencia-sem', '/agencia-diseno-web']) {
    for (const item of LANDING_REWRITES) {
      const html = `<div class="mae-news-carousel"><a href="${item.from}">${item.anchor}</a></div>`;
      const rewritten = rewriteInSitePageHrefs(html, landing);
      assert.match(rewritten, /mae-news-carousel/);
      assert.doesNotMatch(rewritten, new RegExp(`href="${item.from.replaceAll('/', '\\/')}"`));
      assert.match(rewritten, new RegExp(`href="${item.to.replaceAll('/', '\\/')}">${item.anchor}</`));
    }
  }
});

test('does not rewrite inside #211 origin posts or unpublished landings', () => {
  const skipHtml = '<a href="/landing-seo">Landing Page sobre SEO</a><a href="/6-herramientas-para-crear-informes-seo">informes</a>';
  for (const slug of SKIP_REWRITE_SOURCE_SLUGS) {
    assert.equal(rewriteInSitePageHrefs(skipHtml, `/blog/pautas-digitales/${slug}`), skipHtml, slug);
  }
  const unpublished = SKIP_BROKEN_HREF_PATHS.map((path) => `<a href="${path}">x</a>`).join('');
  assert.equal(rewriteInSitePageHrefs(unpublished, '/blog/seo/aprende-todo-sobre-el-seo'), unpublished);
});

test('posts 96, 81 and 124 change only the banner href and leave alt and paragraph hrefs', () => {
  const cases = [
    {
      source: '/blog/seo/que-es-data-studio-de-google-y-como-funciona',
      from: '/servicios/seo',
      to: AGENCIA_SEO_HREF,
      img: '<img class="aligncenter size-full wp-image-72109" src="https://endpoint.playfulagency.com/wp-content/uploads/2020/06/BANNER-CTA_PLAYFUL_DataStudio.png" alt="" width="834" height="348" />',
      keep: [
        '<a href="/blog/seo/6-herramientas-para-crear-informes-seo"><b>herramienta SEO</b></a>',
        '<a href="/blog/seo/diseno-web-y-posicionamiento-seo"><img alt="otro banner" src="/x.png" /></a>',
      ],
    },
    {
      source: '/blog/seo/6-herramientas-para-crear-informes-seo',
      from: '/servicios/automatizacion-del-marketing',
      to: AGENCIA_SEO_HREF,
      img: '<img class="size-full wp-image-72103" src="https://endpoint.playfulagency.com/wp-content/uploads/2020/06/BANNER-CTA_PLAYFUL_6-Herramientas-para-crear-informes-SEO.png" alt="6 herramientas para crear informes SEO" width="834" height="348" />',
      keep: [
        '<a href="/blog/seo/consejos-para-la-optimizacion-web"><span>optimizar una página web</span></a>',
      ],
    },
    {
      source: '/blog/seo/que-es-la-intencion-de-busqueda-y-cuales-son-sus-beneficios',
      from: '/servicios/automatizacion-del-marketing',
      to: AGENCIA_SEO_HREF,
      img: '<img class="alignnone size-full wp-image-77702" src="https://endpoint.playfulagency.com/wp-content/uploads/2022/11/banner.png" alt="BANNER CTA_PLAYFUL_Implementa hoy la intención de búsqueda" width="600" height="250" />',
      keep: [
        '<a href="/blog/seo/conoce-los-tipos-de-enlaces-seo">el usuario encuentre lo que desea</a>',
      ],
    },
  ];

  for (const item of cases) {
    const html = `<p>${item.keep.join(' ')}</p><p><a href="https://endpoint.playfulagency.com${item.from}/">${item.img}</a></p>`;
    const rewritten = rewriteInSitePageHrefs(html, item.source);
    assert.doesNotMatch(
      rewritten,
      new RegExp(`${item.from.replaceAll('/', '\\/')}/?`),
      `${item.source} ${item.from}`,
    );
    assert.match(rewritten, new RegExp(`href="${item.to.replaceAll('/', '\\/')}"`));
    assert.equal(rewritten.includes(item.img), true, `${item.source} img/alt`);
    for (const neighbor of item.keep) {
      assert.equal(rewritten.includes(neighbor), true, `${item.source} keep ${neighbor}`);
    }
  }
});

test('item 24 unwraps the H2 to /seo-internacional and keeps the heading text', () => {
  const html = '<h2><a href="/seo-internacional">agencia de SEO</a></h2>';
  const rewritten = rewriteInSitePageHrefs(
    html,
    '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
  );
  assert.equal(rewritten, '<h2>agencia de SEO</h2>');
});

test('does not invent dests outside the closed list', () => {
  assert.equal(
    decideBrokenInternalHref('/pasarela-de-pagos-venezuela', '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce').href,
    '/pasarela-de-pagos-venezuela',
  );
  assert.equal(
    decideBrokenInternalHref('/agencia-prestashop', '/blog/tecnologia/crear-un-e-commerce').href,
    '/agencia-prestashop',
  );
  assert.equal(
    decideBrokenInternalHref('/agencia-woocommerce', '/blog/tecnologia/que-es-wordpress-por-que-tengo-que-usarlo').href,
    '/agencia-woocommerce',
  );
  assert.equal(
    decideBrokenInternalHref('/servicios/automatizacion-del-marketing', '/blog/seo/aprende-todo-sobre-el-seo').href,
    '/servicios/automatizacion-del-marketing',
  );
  assert.equal(
    decideBrokenInternalHref('/servicios/pautas-digitales', '/blog/seo/aprende-todo-sobre-el-seo').href,
    '/servicios/pautas-digitales',
  );
});

test('rewriteWpRenderedHtmlFields uses the post slug for contextual dests', () => {
  const post = rewriteWpRenderedHtmlFields({
    slug: 'ecommerce-mi-negocio-online',
    content: { rendered: '<a href="/servicios/desarrollo-web">equipo de desarrollo web</a>' },
    excerpt: { rendered: '<a href="https://seo.crear.endpoint.playfulagency.com/">SEO</a>' },
  });
  assert.match(post.content.rendered, /href="\/agencia-e-commerce"/);
  assert.match(post.content.rendered, />equipo de desarrollo web</);
  assert.match(post.excerpt.rendered, /href="\/agencia-seo"/);
});

test('getPageBySlug and the in-site rewriter pass a source path into the closed-href map', async () => {
  const wordpress = await readFile(new URL('../services/wordpress.ts', import.meta.url), 'utf8');
  const rewriter = await readFile(new URL('../services/rewrite-in-site-hrefs.mjs', import.meta.url), 'utf8');
  const pageFn = wordpress.slice(
    wordpress.indexOf('export async function getPageBySlug'),
    wordpress.indexOf('\n// Interfaz para los ítems del menú'),
  );
  assert.match(pageFn, /rewriteInSitePageHrefs\(stripScripts\(rawHtml\), `\/\$\{slug\}`\)/);
  assert.match(rewriter, /rewriteBrokenInternalAnchors\(remapped, sourcePath\)/);
  assert.match(rewriter, /item\.slug === 'string' && item\.slug \? `\/\$\{item\.slug\}`/);
});
