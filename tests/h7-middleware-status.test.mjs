import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import seoCruce2810Redirects from '../utils/seo-cruce-2810-redirect-map.json' with { type: 'json' };
import { blogClosedDecision } from '../utils/blog-closed-paths.ts';
import permanent301 from '../utils/blog-category-redirect-map.json' with { type: 'json' };

const SAMPLE_301_ORIGINS = [
  '/blog/pautas-digitales/consejos-para-que-hagas-pautas-en-tus-post-de-instagram',
  '/blog/seo/tendencias-seo-2020',
  '/blog/seo/que-es-un-blog',
  '/blog/pautas-digitales/conoce-como-impulsar-tu-marca-online',
  '/blog/pautas-digitales/por-que-incluir-la-transformacion-digital-en-mi-negocio',
  '/blog/pautas-digitales/tipos-de-publicidad-online-conceptos-y-datos-curiosos',
  '/blog/seo/posicionamiento-organico-vs-pago',
  '/seo-internacional',
];

const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');

test('/reunion-playful middleware issues 308 to /reunion (Location keeps query)', () => {
  assert.match(middleware, /path === '\/reunion-playful'/);
  assert.match(middleware, /new URL\(`\/reunion\$\{request\.nextUrl\.search\}`/);
  assert.match(middleware, /NextResponse\.redirect\(target, 308\)/);
});

test('seo-cruce sample: map has 22 entries and middleware imports it', () => {
  for (const origin of SAMPLE_301_ORIGINS) {
    assert.ok(seoCruce2810Redirects[origin], origin);
  }
  assert.equal(Object.keys(seoCruce2810Redirects).length, 22);
  assert.match(middleware, /seo-cruce-2810-redirect-map\.json/);
  assert.match(middleware, /\.\.\.seoCruce2810Redirects/);
  assert.ok(Object.keys(permanent301).length > 0, 'sample sanity');
});

test('410 Gone paths: /test-blog and /landing-page', () => {
  assert.deepEqual(blogClosedDecision('/test-blog'), { type: 'gone', status: 410 });
  assert.deepEqual(blogClosedDecision('/landing-page'), { type: 'gone', status: 410 });
  const body = middleware.slice(middleware.indexOf('export function middleware'));
  const goneIdx = body.indexOf("closed.type === 'gone'");
  const redirectIdx = body.indexOf('resolveSingleHopRedirect');
  assert.ok(goneIdx > 0 && goneIdx < redirectIdx, '410 runs before 301 chain');
});
