#!/usr/bin/env node
/**
 * Compara WordPress (live) vs snapshot content/migrated y escribe docs/migracion-cms/PARIDAD.md
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;
const SITE = 'https://playfulagency.com';
const OUT = path.join(process.cwd(), 'docs', 'migracion-cms', 'PARIDAD.md');
const SNAP = path.join(process.cwd(), 'content', 'migrated');

let last = 0;
async function wpFetch(urlPath) {
  const wait = last + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  const res = await fetch(`${WP}${urlPath}`, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${urlPath}`);
  return res.json();
}

function stripHtml(s) {
  return (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function h1FromHtml(html) {
  const m = (html || '').match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  return m ? stripHtml(m[1]) : null;
}

function loadSnap() {
  return {
    posts: JSON.parse(readFileSync(path.join(SNAP, 'posts.json'), 'utf8')),
    casos: JSON.parse(readFileSync(path.join(SNAP, 'casos.json'), 'utf8')),
    categories: JSON.parse(readFileSync(path.join(SNAP, 'categories.json'), 'utf8')),
  };
}

function catSlug(post, categories) {
  const id = post.categories?.[0];
  const c = categories.find((x) => x.id === id);
  return c?.slug || 'sin-categoria';
}

function yoastOf(post) {
  const y = post.yoast_head_json || {};
  return {
    title: y.title || null,
    description: y.description || null,
    canonical: y.canonical || null,
    robots: y.robots || null,
    schema: y.schema ? JSON.stringify(y.schema) : null,
  };
}

function compareField(label, a, b) {
  const ok = (a ?? '') === (b ?? '') || String(a ?? '') === String(b ?? '');
  return { label, ok, wp: a, snap: b };
}

async function main() {
  mkdirSync(path.dirname(OUT), { recursive: true });
  const snap = loadSnap();
  const rows = [];
  let okCount = 0;
  let failCount = 0;

  const sortedPosts = [...snap.posts]
    .filter((p) => p.status === 'publish')
    .sort((a, b) => (b.date_gmt || '').localeCompare(a.date_gmt || ''));

  const spotSlugs = new Set(['cima-86564', 'zelle-86152']);
  const samplePosts = [
    sortedPosts[0],
    sortedPosts.find((p) => p.slug.includes('zelle') || p.id === 86152),
    ...sortedPosts.filter((p) => spotSlugs.has(p.slug)).slice(0, 2),
  ].filter(Boolean);

  const seen = new Set();
  const toCheck = [];
  for (const p of [...samplePosts, ...sortedPosts.slice(0, 15)]) {
    if (!p || seen.has(p.slug)) continue;
    seen.add(p.slug);
    toCheck.push(p);
  }

  for (const snapPost of toCheck) {
    const slug = snapPost.slug;
    const cat = catSlug(snapPost, snap.categories);
    const pathUrl = `/blog/${cat}/${slug}`;
    const liveArr = await wpFetch(`/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=author,wp:featuredmedia,wp:term`);
    const live = liveArr[0];
    if (!live) {
      rows.push({ path: pathUrl, ok: false, notes: 'post no encontrado en WP live' });
      failCount += 1;
      continue;
    }
    const checks = [
      compareField('title', stripHtml(live.title?.rendered), stripHtml(snapPost.title?.rendered)),
      compareField('meta title', yoastOf(live).title, yoastOf(snapPost).title),
      compareField('meta description', yoastOf(live).description, yoastOf(snapPost).description),
      compareField('canonical', yoastOf(live).canonical, yoastOf(snapPost).canonical),
      compareField('robots', JSON.stringify(yoastOf(live).robots), JSON.stringify(yoastOf(snapPost).robots)),
      compareField('H1', h1FromHtml(live.content?.rendered), h1FromHtml(snapPost.content?.rendered)),
      compareField('date_gmt', live.date_gmt, snapPost.date_gmt),
      compareField('author', live._embedded?.author?.[0]?.name, snapPost._embedded?.author?.[0]?.name),
    ];
    const ok = checks.every((c) => c.ok);
    if (ok) okCount += 1;
    else failCount += 1;
    rows.push({
      path: pathUrl,
      ok,
      fails: checks.filter((c) => !c.ok).map((c) => c.label),
    });
  }

  for (const snapCaso of snap.casos.filter((c) => c.status === 'publish')) {
    const liveArr = await wpFetch(`/wp/v2/casos-de-exito?slug=${encodeURIComponent(snapCaso.slug)}&acf_format=standard`);
    const live = liveArr[0];
    const pathUrl = `/casos-de-exito/${snapCaso.slug}`;
    if (!live) {
      rows.push({ path: pathUrl, ok: false, notes: 'caso no en WP' });
      failCount += 1;
      continue;
    }
    const checks = [
      compareField('title', stripHtml(live.title?.rendered), stripHtml(snapCaso.title?.rendered)),
      compareField('meta title', yoastOf(live).title, yoastOf(snapCaso).title),
      compareField('canonical', yoastOf(live).canonical, yoastOf(snapCaso).canonical),
      compareField('acf.h1', live.acf?.h1, snapCaso.acf?.h1),
    ];
    const ok = checks.every((c) => c.ok);
    if (ok) okCount += 1;
    else failCount += 1;
    rows.push({ path: pathUrl, ok, fails: checks.filter((c) => !c.ok).map((c) => c.label) });
  }

  const page1 = sortedPosts.slice(0, 12).map((p) => `${catSlug(p, snap.categories)}/${p.slug}`);
  const md = [
    '# Paridad WP ↔ snapshot git (CMS_SOURCE=new)',
    '',
    `Generado: ${new Date().toISOString()} · Origen live: \`${WP}\``,
    '',
    '## Resumen',
    '',
    '| Métrica | Valor |',
    '| --- | --- |',
    `| URLs auditadas (muestra) | ${rows.length} |`,
    `| OK | ${okCount} |`,
    `| Con diferencias | ${failCount} |`,
    `| Posts en snapshot | ${snap.posts.filter((p) => p.status === 'publish').length} |`,
    `| Casos en snapshot | ${snap.casos.filter((c) => c.status === 'publish').length} |`,
    '',
    '## Orden página 1 del blog (por date_gmt desc)',
    '',
    page1.map((s, i) => `${i + 1}. \`/blog/${s}\``).join('\n'),
    '',
    'Comprobación solicitada: CIMA (86564) primero; Zelle (86152) en página 1.',
    '',
    `- Primero global: \`${sortedPosts[0]?.slug}\` (id ${sortedPosts[0]?.id})`,
    `- Zelle en snapshot: ${snap.posts.some((p) => p.id === 86152 || p.slug.includes('zelle')) ? 'sí' : 'no'}`,
    '',
    '## Tabla de muestra',
    '',
    '| URL | Estado | Campos con drift |',
    '| --- | --- | --- |',
    ...rows.map((r) => `| \`${r.path}\` | ${r.ok ? 'OK' : 'DRIFT'} | ${r.fails?.join(', ') || r.notes || '—'} |`),
    '',
    '## Notas',
    '',
    '- JSON-LD y enlaces internos se validan en CI (`test:canonical`, `blog-post-ssr`); este informe compara metadatos y H1 entre live y snapshot.',
    '- Regenerar: `npm run cms:export` y luego `npm run cms:parity`.',
    '',
  ].join('\n');

  writeFileSync(OUT, md);
  console.log(`Wrote ${OUT} (${okCount} ok, ${failCount} drift)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
