import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const { formatPlayfulDocumentTitle } = await import('../lib/podcast-editorial-meta.ts');
const { decodeHtmlEntities } = await import('../lib/blog-editorial-meta.ts');

const episodes = JSON.parse(
  readFileSync(new URL('../data/wp-snapshot/collections/podcast.json', import.meta.url), 'utf8'),
);

test('formatPlayfulDocumentTitle avoids unclosed ¿ ¡ and dangling words', () => {
  assert.equal(
    formatPlayfulDocumentTitle('Episodio 8 – SEO para E-commerce: ¡Sé el primero!'),
    'Episodio 8 – SEO para E-commerce | Playful',
  );
  for (const title of episodes) {
    const seg = decodeHtmlEntities((title.title?.rendered || '').replace(/<[^>]+>/g, ''));
    const doc = formatPlayfulDocumentTitle(seg);
    assert.match(doc, / \| Playful$/);
    const base = doc.replace(/ \| Playful$/, '');
    assert.ok(base.length <= 50, `${base} (${base.length})`);
    const openQ = (base.match(/¿/g) || []).length;
    const closeQ = (base.match(/\?/g) || []).length;
    const openEx = (base.match(/¡/g) || []).length;
    const closeEx = (base.match(/!/g) || []).length;
    assert.ok(openQ <= closeQ, base);
    assert.ok(openEx <= closeEx, base);
    assert.doesNotMatch(base, /^(vs\.?|en|a)$/i);
  }
});

test('exports 18 episode titles for SEO report snapshot', () => {
  const titles = episodes.map((ep) => {
    const seg = decodeHtmlEntities((ep.title?.rendered || '').replace(/<[^>]+>/g, ''));
    return formatPlayfulDocumentTitle(seg);
  });
  assert.equal(titles.length, 18);
});