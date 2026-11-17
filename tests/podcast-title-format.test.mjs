import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const { formatPlayfulDocumentTitle, buildPodcastEpisodeMetadata } = await import(
  '../lib/podcast-editorial-meta.ts'
);
const { decodeHtmlEntities } = await import('../lib/blog-editorial-meta.ts');

const episodes = JSON.parse(
  readFileSync(new URL('../data/wp-snapshot/collections/podcast.json', import.meta.url), 'utf8'),
);

const BAD_TITLE_END = /(?:¿|¡|:|,)$/;

test('episodios 5, 8 y 10 referencia: longitudes 50, 49 y 49 sin recorte innecesario', () => {
  const baseTitle = (slug) => {
    const ep = episodes.find((e) => e.slug === slug);
    assert.ok(ep, slug);
    const seg = decodeHtmlEntities((ep.title?.rendered || '').replace(/<[^>]+>/g, ''));
    return formatPlayfulDocumentTitle(seg).replace(/ \| Playful$/, '');
  };
  assert.equal(baseTitle('el-meollo-del-asunto-que-es-el-seo').length, 50);
  assert.equal(
    baseTitle('episodio-8-seo-para-e-commerce'),
    'Episodio 8 – SEO para E-commerce: ¡Sé el primero!',
  );
  assert.equal(
    baseTitle('llegamos-al-final-nos-toca-medir'),
    'Episodio 10 – Llegamos al final: ¡Nos toca medir!',
  );
});

test('18 episodios: title ≤50, sin cierre colgante, og:title idéntico', () => {
  const rows = [];
  for (const ep of episodes) {
    const seg = decodeHtmlEntities((ep.title?.rendered || '').replace(/<[^>]+>/g, ''));
    const doc = formatPlayfulDocumentTitle(seg);
    const base = doc.replace(/ \| Playful$/, '');
    const meta = buildPodcastEpisodeMetadata({
      ...ep,
      title: { rendered: ep.title?.rendered || ep.slug },
    });
    const ogTitle =
      typeof meta.openGraph?.title === 'string'
        ? meta.openGraph.title
        : String(meta.openGraph?.title ?? '');
    assert.ok(base.length <= 50, `${ep.slug} len=${base.length} ${base}`);
    assert.ok(!BAD_TITLE_END.test(base), `${ep.slug} ends badly: ${base}`);
    assert.equal(ogTitle, doc, `${ep.slug} og:title`);
    rows.push({ slug: ep.slug, before: seg, beforeLen: seg.length, after: base, afterLen: base.length, doc });
  }
  assert.equal(rows.length, 18);
  try {
    writeFileSync('/opt/cursor/artifacts/podcast-18-titles.txt', `${JSON.stringify(rows, null, 2)}\n`);
  } catch {
    /* optional */
  }
});