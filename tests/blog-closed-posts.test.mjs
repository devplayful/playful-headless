import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const closedPostsJson = require('../config/blog-closed-posts.json');

const {
  CLOSED_BLOG_PATHS,
  blogClosedDecision,
  filterOpenBlogPosts,
  isClosedBlogPath,
  isClosedBlogPost,
} = await import('../utils/blog-closed-paths.ts');
const { buildSitemapXml, getSitemapLocs } = await import('../utils/apex-sitemap.ts');

const JOSE_V2_CLOSED_PATHS = [
  '/blog/pautas-digitales/google-grants-descubre-que-es-y-como-funciona',
  '/blog/pautas-digitales/como-ser-tendencia',
  '/blog/seo/marketing-social-la-estrategia-ganadora-de-las-ong',
  '/blog/mas-vistos/todo-lo-que-debes-saber-para-ganar-dinero-con-tiktok',
  '/blog/otros/lgbtq-siglas-con-historia-significado-y-marketing-de-inclusion',
  '/blog/otros/debes-usar-el-lenguaje-inclusivo-en-redes-sociales',
  '/blog/mas-vistos/quiero-ver-mi-negocio-en-google-maps',
  '/blog/mas-vistos/shakira-y-pique-un-buen-ejemplo-del-marketing-emocional',
  '/blog/otros/ibai-llanos-por-que-es-tendencia-y-que-tiene-que-ver-con-el-futbol',
  '/blog/pautas-digitales/twitter-ads',
  '/blog/seo/hacks-seo-local',
  '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
  '/blog/tecnologia/lenguajes-de-programacion-para-que-sirve-y-cuales-son-los-mas-usados',
  '/blog/email-marketing/como-hacer-un-email-marketing-eficaz-durante-la-pandemia',
  '/blog/mas-vistos/marketing-deportivo-qatar-2022',
  '/blog/mas-vistos/messi-y-el-marketing-hablemos-sobre-su-marca-personal',
  '/blog/otros/marketing-de-guerrilla-te-atreves-a-intentarlo',
  '/blog/otros/marketing-para-medicos-como-ganar-mientras-ayudas',
  '/blog/otros/mes-del-orgullo-gay-por-que-se-celebra',
  '/blog/otros/metaverso-que-es',
  '/blog/otros/una-herramienta-para-ganar-autoridad',
  '/blog/otros/ya-sabes-cuando-se-celebra-el-dia-mundial-del-emoji',
  '/blog/pautas-digitales/actualizaciones-de-instagram',
  '/blog/pautas-digitales/anuncios-en-linkedin',
  '/blog/pautas-digitales/conoce-el-marketing-digital-del-2020',
  '/blog/pautas-digitales/convierte-en-el-experto-de-los-webinar',
  '/blog/pautas-digitales/linkedin-ads-aumenta-el-alcance-de-tu-negocio',
  '/blog/pautas-digitales/porque-tener-un-perfil-empresarial-en-linkedin',
  '/blog/seo/black-hat-seo',
  '/blog/seo/busqueda-por-voz-que-es-y-como-afecta-al-seo',
  '/blog/tecnologia/google-ads-grants-con-un-blog-digital',
];

const MUST_STAY_OPEN = [
  '/blog/seo/como-verificar-la-veracidad-del-contenido-creado-con-herramientas-de-inteligencia-artificial',
  '/blog/otros/el-gran-e-importante-big-data',
  '/blog/otros/estrategia-para-el-dia-de-las-madres',
  '/blog/otros/es-tiktok-el-nuevo-google',
  '/blog/mas-vistos/cual-es-la-mejor-hora-para-publicar-en-tiktok',
  '/blog/mas-vistos/wireframe-conoce-ejemplos-tipos-y-herramientas-para-implementarlo',
  '/blog/otros/tiktok-live-studio-la-forma-mas-facil-de-realizar-tu-directo',
];

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const listingSource = readFileSync(new URL('../app/blog/page.tsx', import.meta.url), 'utf8');
const wordpressSource = readFileSync(new URL('../services/wordpress.ts', import.meta.url), 'utf8');

test('closed set equals José Excel v2 — exactly these 31 paths', () => {
  assert.equal(CLOSED_BLOG_PATHS.length, 31);
  assert.equal(new Set(CLOSED_BLOG_PATHS).size, 31);
  assert.deepEqual([...CLOSED_BLOG_PATHS], JOSE_V2_CLOSED_PATHS);
  assert.deepEqual(closedPostsJson, JOSE_V2_CLOSED_PATHS);
});

test('each of the 31 paths maps to closed, including trailing slashes', () => {
  for (const path of JOSE_V2_CLOSED_PATHS) {
    assert.equal(isClosedBlogPath(path), true, path);
    assert.equal(isClosedBlogPath(`${path}/`), true, `${path}/`);
    assert.equal(isClosedBlogPost({
      slug: path.split('/').at(-1),
      categories: [{ slug: path.split('/')[2] }],
    }), true, path);
  }
});

test('sample closed path returns a 410 gone decision', () => {
  assert.deepEqual(
    blogClosedDecision('/blog/seo/black-hat-seo'),
    { type: 'gone', status: 410 },
  );
  assert.deepEqual(
    blogClosedDecision('/blog/seo/black-hat-seo/'),
    { type: 'gone', status: 410 },
  );
  assert.deepEqual(
    blogClosedDecision('/blog/mas-vistos/ecosistema-digital-de-tu-marca'),
    { type: 'next' },
  );
});

test('paths discarded from the previous draft list stay open', () => {
  for (const path of MUST_STAY_OPEN) {
    assert.equal(isClosedBlogPath(path), false, path);
    assert.deepEqual(blogClosedDecision(path), { type: 'next' }, path);
  }
});

test('sitemap excludes the 31 closed URLs and keeps open posts', () => {
  const locs = getSitemapLocs();
  const xml = buildSitemapXml();
  for (const path of JOSE_V2_CLOSED_PATHS) {
    const loc = `https://playfulagency.com${path}`;
    assert.equal(locs.includes(loc), false, loc);
    assert.doesNotMatch(xml, new RegExp(`${loc.replaceAll('/', '\\/')}<`));
  }
  assert.match(xml, /https:\/\/playfulagency\.com\/blog\/otros\/tiktok-live-studio-la-forma-mas-facil-de-realizar-tu-directo</);
  assert.match(xml, /https:\/\/playfulagency\.com\/blog\/mas-vistos\/ecosistema-digital-de-tu-marca</);
  assert.match(xml, /https:\/\/playfulagency\.com\/agencia-shopify</);
});

test('listing helpers drop closed cards that still arrive from WordPress', () => {
  const posts = filterOpenBlogPosts([
    {
      slug: 'black-hat-seo',
      href: '/blog/seo/black-hat-seo',
      categories: [{ slug: 'seo' }],
    },
    {
      slug: 'ecosistema-digital-de-tu-marca',
      href: '/blog/mas-vistos/ecosistema-digital-de-tu-marca',
      categories: [{ slug: 'mas-vistos' }],
    },
  ]);
  assert.deepEqual(posts.map((post) => post.slug), ['ecosistema-digital-de-tu-marca']);
});

test('route-integrity inventory no longer governs the 31 closed posts', () => {
  const manifest = require('../config/expected-routes.json');
  const governed = new Set(manifest.governedConcreteRoutes['/blog/[...slug]']);
  for (const path of JOSE_V2_CLOSED_PATHS) {
    assert.equal(governed.has(path), false, path);
  }
  assert.equal(governed.has('/blog/otros/tiktok-live-studio-la-forma-mas-facil-de-realizar-tu-directo'), true);
  assert.equal(governed.size, 73);
});

test('middleware returns 410 before category/AMP redirects; listings filter closed posts', () => {
  const body = middlewareSource.slice(middlewareSource.indexOf('export function middleware'));
  const closedIdx = body.indexOf('blogClosedDecision');
  const redirectIdx = body.indexOf('blogSeoRedirectDecision');
  assert.ok(closedIdx !== -1 && redirectIdx !== -1 && closedIdx < redirectIdx);
  assert.match(middlewareSource, /status: 410/);
  assert.match(listingSource, /filterOpenBlogPosts/);
  assert.match(wordpressSource, /filterOpenBlogPosts/);
});
