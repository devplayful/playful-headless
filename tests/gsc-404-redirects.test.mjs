import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const closedPostsJson = require('../config/blog-closed-posts.json');
const {
  CLOSED_BLOG_PATHS,
  GSC_GONE_PATHS,
  blogClosedDecision,
  isClosedBlogPath,
} = await import('../utils/blog-closed-paths.ts');

const middlewareSource = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

const GSC_301 = [
  [
    '/blog/email-marketing/tipos-de-publicidad-online',
    'https://playfulagency.com/blog/pautas-digitales/tipos-de-publicidad-online',
  ],
  [
    '/blog/pautas-digitales/conoce-todo-sobre-instagram-ads',
    'https://playfulagency.com/blog/otros/conoce-todo-sobre-instagram-ads',
  ],
  [
    '/otros/conoce-todo-sobre-instagram-ads',
    'https://playfulagency.com/blog/otros/conoce-todo-sobre-instagram-ads',
  ],
  [
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    'https://playfulagency.com/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
  ],
];

const CERRAR_SAMPLE_410 = [
  '/blog/otros/marketing-de-guerrilla-te-atreves-a-intentarlo',
  '/blog/mas-vistos/todo-lo-que-debes-saber-para-ganar-dinero-con-tiktok',
  '/blog/mas-vistos/bad-bunny-como-marca-la-potencia-del-marketing-musical',
  '/blog/mas-vistos/messi-y-el-marketing-hablemos-sobre-su-marca-personal',
  '/blog/otros/ibai-llanos-por-que-es-tendencia-y-que-tiene-que-ver-con-el-futbol',
];

const TEMPORADA_2 = '/blog/categoria/temporada-2';

test('GSC 301 aliases use absolute playfulagency.com destinations', () => {
  for (const [source, dest] of GSC_301) {
    const escaped = source.replaceAll('/', '\\/');
    assert.match(
      middlewareSource,
      new RegExp(`'${escaped}':\\s*'${dest.replaceAll('/', '\\/')}'`),
      source,
    );
    assert.equal(blogClosedDecision(source).type, 'next', source);
    assert.equal(blogClosedDecision(`${source}/`).type, 'next', `${source}/`);
  }
});

test('GSC junk paths are 410 and stay out of the CERRAR 31-path inventory', () => {
  assert.deepEqual([...GSC_GONE_PATHS], [
    '/project/bottle-mockup',
    '/agencylog',
  ]);
  assert.equal(CLOSED_BLOG_PATHS.length, 31);
  assert.deepEqual(closedPostsJson, [...CLOSED_BLOG_PATHS]);

  for (const gonePath of GSC_GONE_PATHS) {
    assert.equal(isClosedBlogPath(gonePath), false, gonePath);
    assert.deepEqual(blogClosedDecision(gonePath), { type: 'gone', status: 410 });
    assert.deepEqual(blogClosedDecision(`${gonePath}/`), { type: 'gone', status: 410 });
    assert.equal(CLOSED_BLOG_PATHS.includes(gonePath), false, gonePath);
    assert.equal(closedPostsJson.includes(gonePath), false, gonePath);
  }
});

test('item 7 temporada-2 is not redirected or marked gone', () => {
  assert.doesNotMatch(middlewareSource, /temporada-2/);
  assert.equal(isClosedBlogPath(TEMPORADA_2), false);
  assert.deepEqual(blogClosedDecision(TEMPORADA_2), { type: 'next' });
  assert.deepEqual(blogClosedDecision(`${TEMPORADA_2}/`), { type: 'next' });
  assert.equal(closedPostsJson.includes(TEMPORADA_2), false);
});

test('CERRAR inventory 410 samples stay gone and unchanged', () => {
  for (const closedPath of CERRAR_SAMPLE_410) {
    assert.equal(isClosedBlogPath(closedPath), true, closedPath);
    assert.deepEqual(blogClosedDecision(closedPath), { type: 'gone', status: 410 });
    assert.deepEqual(blogClosedDecision(`${closedPath}/`), { type: 'gone', status: 410 });
    assert.equal(closedPostsJson.includes(closedPath), true, closedPath);
  }
});

test('middleware matcher covers non-blog GSC origins with trailing slashes', () => {
  for (const source of [
    '/otros/conoce-todo-sobre-instagram-ads',
    '/agencia-seo-internacional-en-el-2025-es-una-necesidad',
    '/project/bottle-mockup',
    '/agencylog',
  ]) {
    assert.match(middlewareSource, new RegExp(`'${source.replaceAll('/', '\\/')}'`));
    assert.match(middlewareSource, new RegExp(`'${source.replaceAll('/', '\\/')}\\/'`));
  }
});

test('no legacy redirect_to or agencylog rewrite exists in config', () => {
  const configDir = path.join(process.cwd(), 'config');
  for (const name of readdirSync(configDir)) {
    const body = readFileSync(path.join(configDir, name), 'utf8');
    assert.doesNotMatch(body, /agencylog/i, name);
    assert.doesNotMatch(body, /redirect_to/i, name);
  }
  assert.doesNotMatch(middlewareSource, /redirect_to/);
});
