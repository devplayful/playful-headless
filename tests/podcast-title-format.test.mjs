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

test('short titles keep ¿ ¡ and trailing ! when under length cap', () => {
  assert.equal(
    formatPlayfulDocumentTitle('Episodio 8 – SEO para E-commerce: ¡Sé el primero!'),
    'Episodio 8 – SEO para E-commerce: ¡Sé el primero! | Playful',
  );
  assert.equal(
    formatPlayfulDocumentTitle('Episodio 5 – Inteligencia Artificial y SEO Optimizamos a otro nivel'),
    'Episodio 5 – Inteligencia Artificial y SEO Optimizamos a otro nivel | Playful',
  );
  assert.equal(
    formatPlayfulDocumentTitle('Episodio 10 – Llegamos al final: ¡Nos toca medir!'),
    'Episodio 10 – Llegamos al final: ¡Nos toca medir! | Playful',
  );
});

test('formatPlayfulDocumentTitle trims dangling punctuation only when over segment cap', () => {
  const long = 'Episodio 6 – Plan de contenidos: ¿Qué es? ¿Por qué te hace vender más en digital y seguir creciendo?';
  assert.ok(long.length > 70);
  const doc = formatPlayfulDocumentTitle(long);
  const base = doc.replace(/ \| Playful$/, '');
  assert.ok(base.length <= 70, `${base} (${base.length})`);
  const openQ = (base.match(/¿/g) || []).length;
  const closeQ = (base.match(/\?/g) || []).length;
  assert.ok(openQ <= closeQ, base);
});

test('exports 18 episode titles and og:titles for SEO report snapshot', () => {
  const lines = [];
  const titles = episodes.map((ep) => {
    const seg = decodeHtmlEntities((ep.title?.rendered || '').replace(/<[^>]+>/g, ''));
    const doc = formatPlayfulDocumentTitle(seg);
    const meta = buildPodcastEpisodeMetadata({
      ...ep,
      title: { rendered: ep.title?.rendered || ep.slug },
    });
    const ogTitle = typeof meta.openGraph?.title === 'string' ? meta.openGraph.title : String(meta.openGraph?.title ?? '');
    lines.push(`${ep.slug}\ttitle=${doc}\tog:title=${ogTitle}`);
    return doc;
  });
  assert.equal(titles.length, 18);
  try {
    writeFileSync('/opt/cursor/artifacts/podcast-18-titles.txt', `${lines.join('\n')}\n`);
  } catch {
    // artifacts dir may be absent locally
  }
});