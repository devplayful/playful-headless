import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { SITEMAP_PODCAST_PATHS } = await import('../utils/apex-sitemap.ts');

/** Episodes in sitemap that lacked href on /podcast (9) — CEO brief cited 5; all must be linked after fix. */
const ORPHANS_BEFORE_FIX = [
  '/podcast/comenzando-de-cero-es-necesaria-una-pagina-web',
  '/podcast/el-meollo-del-asunto-que-es-el-seo',
  '/podcast/el-punto-clave-las-keywords',
  '/podcast/es-hora-de-revisar-es-momento-de-una-auditoria',
  '/podcast/la-respuesta-a-la-famosa-pregunta-que-funciona',
  '/podcast/lo-que-hacemos-impacta-diseno-ux-en-el-seo',
  '/podcast/lo-que-ven-tus-usuarios-tu-pagina-es-linda-o-funcional',
  '/podcast/sin-miedo-a-nada-nos-toca-optimizar-la-pagina-web',
  '/podcast/tocando-fibras-paginas-web-vs-redes-sociales',
];

const navSource = readFileSync(
  new URL('../app/podcast/PodcastSitemapEpisodeNav.tsx', import.meta.url),
  'utf8',
);

test('orphan list is a subset of the podcast sitemap', () => {
  for (const path of ORPHANS_BEFORE_FIX) {
    assert.equal(SITEMAP_PODCAST_PATHS.includes(path), true, path);
  }
});

test('hub sitemap nav links every sitemap path via map (covers former orphans)', () => {
  assert.match(navSource, /SITEMAP_PODCAST_PATHS\.map/);
  assert.match(navSource, /href=\{path\}/);
  assert.equal(SITEMAP_PODCAST_PATHS.length, 18);
  for (const path of ORPHANS_BEFORE_FIX) {
    assert.equal(SITEMAP_PODCAST_PATHS.includes(path), true, path);
  }
});
