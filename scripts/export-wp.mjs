#!/usr/bin/env node
/**
 * Exporta contenido público de WordPress a content/migrated/*.json (git-based CMS).
 * Peticiones en serie, máx. 1/s, UA PlayfulQA/1.0.
 *
 *   npm run cms:export
 *   WP_REST_URL=https://endpoint.playfulagency.com/wp-json npm run cms:export
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;
const OUT = path.join(process.cwd(), 'content', 'migrated');

const CASO_ACF_IMAGE_FIELDS = [
  'imagenbanner', 'imagenminuta1', 'imagenminuta2', 'imagenminuta3', 'desafioimagen1',
  'desafioimagen2', 'desafioimagen3', 'desafioimagen4', 'imagendesarrollo', 'imagenminuta4',
  'imagenminuta5', 'imagenminuta6', 'grilla1', 'grilla2', 'grilla3', 'grilla4', 'grilla5',
  'grilla6', 'grilla7', 'grilla8', 'telefono1', 'telefono2', 'telefono3', 'telefono4',
  'telefonos', 'testimonial_foto',
];

let lastRequest = 0;
let requests = 0;

async function wp(urlPath) {
  const wait = lastRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  requests += 1;
  const res = await fetch(`${WP}${urlPath}`, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${urlPath}`);
  return {
    data: await res.json(),
    total: Number(res.headers.get('x-wp-total') || 0),
    totalPages: Number(res.headers.get('x-wp-totalpages') || 1),
  };
}

async function wpAll(urlPath) {
  const sep = urlPath.includes('?') ? '&' : '?';
  const first = await wp(`${urlPath}${sep}per_page=100&page=1`);
  const out = [...first.data];
  for (let page = 2; page <= first.totalPages; page += 1) {
    out.push(...(await wp(`${urlPath}${sep}per_page=100&page=${page}`)).data);
  }
  return out;
}

function writeJson(name, data) {
  writeFileSync(path.join(OUT, name), `${JSON.stringify(data, null, 2)}\n`);
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const started = new Date().toISOString();

  const categories = await wpAll('/wp/v2/categories?_fields=id,name,slug,description,parent,count');
  const posts = await wpAll(
    '/wp/v2/posts?status=publish&_embed=author,wp:featuredmedia,wp:term&acf_format=standard',
  );
  const authorMap = new Map();
  for (const p of posts) {
    for (const a of p._embedded?.author || []) {
      if (a?.id) authorMap.set(a.id, a);
    }
  }
  const authors = Array.from(authorMap.values());
  const casos = await wpAll('/wp/v2/casos-de-exito?status=publish&_embed=wp:featuredmedia&acf_format=standard');
  const pages = await wpAll('/wp/v2/pages?status=publish');

  const mediaIds = new Set();
  for (const it of [...posts, ...pages, ...casos]) {
    if (it.featured_media) mediaIds.add(it.featured_media);
  }
  for (const c of casos) {
    for (const f of CASO_ACF_IMAGE_FIELDS) {
      const v = c.acf?.[f];
      if (typeof v === 'number' && v > 0) mediaIds.add(v);
      if (v && typeof v === 'object' && typeof v.ID === 'number') mediaIds.add(v.ID);
    }
  }

  const media = [];
  const ids = Array.from(mediaIds);
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const { data } = await wp(
      `/wp/v2/media?include=${chunk.join(',')}&per_page=100&_fields=id,source_url,alt_text,title,caption,mime_type,media_details`,
    );
    media.push(...data);
  }

  for (const c of casos) {
    const rawVideo = c.acf?.url_video ?? c.meta?.url_video;
    if (rawVideo != null) c._export_url_video = rawVideo;
  }

  const manifest = {
    exportedAt: new Date().toISOString(),
    started,
    wpBase: WP,
    requests,
    counts: {
      categories: categories.length,
      authors: authors.length,
      posts: posts.length,
      casos: casos.length,
      pages: pages.length,
      media: media.length,
      mediaRequested: ids.length,
    },
  };

  writeJson('manifest.json', manifest);
  writeJson('categories.json', categories);
  writeJson('authors.json', authors);
  writeJson('posts.json', posts);
  writeJson('casos.json', casos);
  writeJson('pages.json', pages);
  writeJson('media.json', media);

  console.log(JSON.stringify(manifest, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
