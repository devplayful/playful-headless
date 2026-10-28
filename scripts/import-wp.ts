/**
 * Importa el contenido público de WordPress (endpoint.playfulagency.com) a Payload.
 *
 *   DATABASE_URI=postgres://... npm run cms:import
 *
 * - Solo REST público, en serie y a 1 petición/segundo, user agent PlayfulQA/1.0.
 * - Idempotente por el id de WP (campo wpId): crea o actualiza, nunca duplica.
 * - Medios: solo URL y metadatos (no descarga binarios).
 */
import { writeFileSync } from 'node:fs';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import { CASO_ACF_IMAGE_FIELDS } from '../cms/collections/casos-acf-fields.ts';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;
const REPORT_PATH = process.env.IMPORT_REPORT_PATH || 'docs/importacion-resultado.json';

type Json = Record<string, any>;
type Stat = { leidos: number; creados: number; actualizados: number; fallidos: number; errores: string[] };
const stats: Record<string, Stat> = {};
const unmapped: Record<string, Set<string>> = {};
const stat = (c: string) => (stats[c] ||= { leidos: 0, creados: 0, actualizados: 0, fallidos: 0, errores: [] });
const noteUnmapped = (c: string, f: string) => (unmapped[c] ||= new Set()).add(f);

let lastRequest = 0;
let requests = 0;
async function wp(path: string): Promise<{ data: any; total: number; totalPages: number }> {
  const wait = lastRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  requests++;
  const res = await fetch(`${WP}${path}`, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return {
    data: await res.json(),
    total: Number(res.headers.get('x-wp-total') || 0),
    totalPages: Number(res.headers.get('x-wp-totalpages') || 1),
  };
}

async function wpAll(path: string): Promise<Json[]> {
  const sep = path.includes('?') ? '&' : '?';
  const first = await wp(`${path}${sep}per_page=100&page=1`);
  const out: Json[] = [...first.data];
  for (let page = 2; page <= first.totalPages; page++) {
    out.push(...(await wp(`${path}${sep}per_page=100&page=${page}`)).data);
  }
  return out;
}

const gmt = (v?: string | null) => (v ? `${v.replace(/Z$/, '')}Z` : null);
const text = (html?: string) =>
  (html || '').replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();

function yoast(item: Json) {
  const y = item.yoast_head_json || {};
  return {
    title: y.title ?? null,
    description: y.description ?? null,
    canonical: y.canonical ?? null,
    robots: y.robots ?? null,
    ogImage: Array.isArray(y.og_image) && y.og_image[0]?.url ? y.og_image[0].url : null,
    ogTitle: y.og_title ?? null,
    ogDescription: y.og_description ?? null,
    schema: y.schema ?? null,
  };
}

function contentImages(html: string) {
  const out: { src: string; alt: string | null }[] = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = /\ssrc=["']([^"']*)["']/i.exec(tag)?.[1] || '';
    const altMatch = /\salt=["']([^"']*)["']/i.exec(tag);
    out.push({ src, alt: altMatch ? altMatch[1] : null });
  }
  return out;
}

async function upsert(payload: Payload, collection: any, wpId: number, data: Json, idx: Map<number, number | string>) {
  const s = stat(collection);
  try {
    const found = await payload.find({ collection, where: { wpId: { equals: wpId } }, limit: 1, depth: 0 });
    let id: number | string;
    if (found.docs[0]) {
      id = found.docs[0].id;
      await payload.update({ collection, id, data: { ...data, wpId }, depth: 0 });
      s.actualizados++;
    } else {
      const created = await payload.create({ collection, data: { ...data, wpId }, depth: 0 });
      id = created.id;
      s.creados++;
    }
    idx.set(wpId, id);
    return id;
  } catch (err: any) {
    s.fallidos++;
    s.errores.push(`wp ${wpId}: ${String(err?.message || err).slice(0, 300)}`);
    return null;
  }
}

async function main() {
  const payload = await getPayload({ config });
  const started = new Date();
  const ids = {
    medios: new Map<number, number | string>(),
    autores: new Map<number, number | string>(),
    categorias: new Map<number, number | string>(),
    posts: new Map<number, number | string>(),
  };

  // 1) Lectura (todo en serie, 1 req/s)
  const categorias = await wpAll('/wp/v2/categories?_fields=id,name,slug,description,parent');
  const posts = await wpAll('/wp/v2/posts?_embed=author');
  const paginas = await wpAll('/wp/v2/pages');
  const casos = await wpAll('/wp/v2/casos-de-exito');
  stat('categorias').leidos = categorias.length;
  stat('posts').leidos = posts.length;
  stat('paginas').leidos = paginas.length;
  stat('casos').leidos = casos.length;

  // Medios referenciados: destacadas + imágenes ACF de casos y páginas
  const mediaIds = new Set<number>();
  for (const it of [...posts, ...paginas, ...casos]) if (it.featured_media) mediaIds.add(it.featured_media);
  for (const c of casos) {
    for (const f of CASO_ACF_IMAGE_FIELDS) {
      const v = c.acf?.[f];
      if (typeof v === 'number' && v > 0) mediaIds.add(v);
    }
  }
  const mediaList: Json[] = [];
  const all = Array.from(mediaIds);
  for (let i = 0; i < all.length; i += 100) {
    const chunk = all.slice(i, i + 100);
    const { data } = await wp(
      `/wp/v2/media?include=${chunk.join(',')}&per_page=100&_fields=id,source_url,alt_text,title,caption,mime_type,media_details`,
    );
    mediaList.push(...data);
  }
  stat('medios').leidos = mediaIds.size;
  const returned = new Set(mediaList.map((m) => m.id));
  for (const id of all) if (!returned.has(id)) {
    stat('medios').fallidos++;
    stat('medios').errores.push(`wp ${id}: no devuelto por /wp/v2/media (borrado o privado)`);
  }

  // 2) Escritura
  for (const m of mediaList) {
    await upsert(payload, 'medios', m.id, {
      alt: m.alt_text || null,
      titulo: text(m.title?.rendered) || null,
      caption: text(m.caption?.rendered) || null,
      sourceUrl: m.source_url,
      wpMimeType: m.mime_type,
      wpWidth: m.media_details?.width ?? null,
      wpHeight: m.media_details?.height ?? null,
      wpSizes: m.media_details?.sizes ?? null,
    }, ids.medios);
  }

  for (const c of categorias) {
    await upsert(payload, 'categorias', c.id, {
      nombre: text(c.name), slug: c.slug, descripcion: c.description || null, parentWpId: c.parent || null,
    }, ids.categorias);
  }

  const autores = new Map<number, Json>();
  for (const p of posts) for (const a of p._embedded?.author || []) if (a?.id) autores.set(a.id, a);
  stat('autores').leidos = autores.size;
  for (const p of posts) if (p.author && !autores.has(p.author)) {
    stat('autores').fallidos++;
    stat('autores').errores.push(`wp ${p.author}: autor del post ${p.id} no embebido`);
  }
  for (const a of Array.from(autores.values())) {
    await upsert(payload, 'autores', a.id, {
      nombre: a.name, slug: a.slug, descripcion: a.description || null, url: a.url || null,
      avatarUrl: a.avatar_urls?.['96'] || null,
    }, ids.autores);
  }

  const media = (id?: number) => (id && ids.medios.get(id)) || null;

  for (const p of posts) {
    const html = p.content?.rendered || '';
    const catIds = (p.categories || []).map((c: number) => ids.categorias.get(c)).filter(Boolean);
    for (const k of Object.keys(p.acf || {})) if (k !== 'articulos_relacionados') noteUnmapped('posts', `acf.${k}`);
    if ((p.tags || []).length) noteUnmapped('posts', 'tags');
    await upsert(payload, 'posts', p.id, {
      titulo: text(p.title?.rendered) || p.slug,
      slug: p.slug,
      estado: p.status,
      categoria: catIds[0] || null,
      categorias: catIds,
      autor: ids.autores.get(p.author) || null,
      date: gmt(p.date_gmt),
      wpDate: p.date,
      modifiedGmt: gmt(p.modified_gmt),
      extracto: text(p.excerpt?.rendered) || null,
      contentHtml: html,
      imagenDestacada: media(p.featured_media),
      imagenesContenido: contentImages(html),
      articulosRelacionadosWpIds: p.acf?.articulos_relacionados ?? p.meta?.articulos_relacionados ?? [],
      yoast: yoast(p),
    }, ids.posts);
  }
  // segunda pasada: relacionados
  let relFaltan = 0;
  for (const p of posts) {
    const id = ids.posts.get(p.id);
    if (!id) continue;
    const rel: number[] = (p.acf?.articulos_relacionados ?? p.meta?.articulos_relacionados ?? []).map(Number);
    const resolved = rel.map((r) => ids.posts.get(r)).filter(Boolean);
    relFaltan += rel.length - resolved.length;
    if (rel.length) await payload.update({ collection: 'posts', id, data: { articulosRelacionados: resolved as any }, depth: 0 });
  }

  const paginasIdx = new Map<number, number | string>();
  for (const pg of paginas) {
    await upsert(payload, 'paginas', pg.id, {
      titulo: text(pg.title?.rendered) || pg.slug,
      slug: pg.slug,
      estado: pg.status,
      parentWpId: pg.parent || null,
      link: pg.link,
      plantilla: pg.template || null,
      date: gmt(pg.date_gmt),
      wpDate: pg.date,
      modifiedGmt: gmt(pg.modified_gmt),
      contentHtml: pg.content?.rendered || '',
      imagenDestacada: media(pg.featured_media),
      acf: pg.acf && !Array.isArray(pg.acf) ? pg.acf : null,
      yoast: yoast(pg),
    }, paginasIdx);
    if (pg.meta?._elementor_data) noteUnmapped('paginas', 'meta._elementor_data');
  }

  const casosIdx = new Map<number, number | string>();
  for (const c of casos) {
    const acf: Json = { ...(c.acf || {}) };
    for (const f of CASO_ACF_IMAGE_FIELDS) {
      const v = acf[f];
      acf[f] = typeof v === 'number' && v > 0 ? media(v) : null;
      if (typeof v === 'number' && v > 0 && !acf[f]) noteUnmapped('casos', `acf.${f} (medio ${v} no encontrado)`);
    }
    // url_video (ACF «Video», group_6355d51c9403a): el grupo no se expone en REST.
    // Solo lectura: se toma si viene en acf o meta; si no, null y se anota.
    const rawVideo = c.acf?.url_video ?? c.meta?.url_video ?? (Array.isArray(c.meta?.url_video) ? c.meta.url_video[0] : undefined);
    let url_video: string | null = null;
    if (typeof rawVideo === 'string' && rawVideo.trim()) {
      try {
        const u = new URL(rawVideo.trim());
        if (u.protocol === 'http:' || u.protocol === 'https:') url_video = u.toString();
      } catch {}
    }
    delete acf.url_video;
    if (!url_video) {
      const existing = await payload.find({
        collection: 'casos',
        where: { wpId: { equals: c.id } },
        limit: 1,
        depth: 0,
      });
      const previous = existing.docs[0]?.url_video;
      if (typeof previous === 'string' && previous) url_video = previous;
      else noteUnmapped('casos', 'url_video (grupo ACF «Video» sin Show in REST; queda null)');
    }
    await upsert(payload, 'casos', c.id, {
      url_video,
      titulo: text(c.title?.rendered) || c.slug,
      slug: c.slug,
      estado: c.status,
      date: gmt(c.date_gmt),
      wpDate: c.date,
      modifiedGmt: gmt(c.modified_gmt),
      contentHtml: c.content?.rendered || '',
      imagenDestacada: media(c.featured_media),
      acf,
      yoast: yoast(c),
    }, casosIdx);
  }

  const result = {
    origen: WP,
    inicio: started.toISOString(),
    fin: new Date().toISOString(),
    peticiones: requests,
    colecciones: stats,
    relacionadosSinResolver: relFaltan,
    camposNoMapeados: Object.fromEntries(Object.entries(unmapped).map(([k, v]) => [k, Array.from(v).sort()])),
  };
  writeFileSync(REPORT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ ...result, colecciones: Object.fromEntries(Object.entries(stats).map(([k, v]) => [k, { ...v, errores: v.errores.length }])) }, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
