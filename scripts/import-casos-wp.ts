/**
 * Importa solo casos-de-exito (+ medios referenciados) desde WP a Payload.
 * Idempotente por wpId. REST público, 1 req/s, User-Agent PlayfulQA/1.0.
 *
 *   DATABASE_URI=postgres://... node scripts/import-casos-wp.ts
 */
import { getPayload, type Payload } from 'payload';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import config from '../payload.config.ts';
import { CASO_ACF_IMAGE_FIELDS } from '../cms/collections/casos-acf-fields.ts';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(
  /\/$/,
  '',
);
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;

type Json = Record<string, any>;

let lastRequest = 0;
let requests = 0;

async function wp(path: string): Promise<{ data: any; totalPages: number }> {
  const wait = lastRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  requests++;
  const res = await fetch(`${WP}${path}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return {
    data: await res.json(),
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
  (html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, '’')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim();

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

async function upsert(
  payload: Payload,
  collection: 'medios' | 'casos',
  wpId: number,
  data: Json,
  idx: Map<number, number | string>,
): Promise<number | string | null> {
  try {
    const found = await payload.find({
      collection,
      where: { wpId: { equals: wpId } },
      limit: 1,
      depth: 0,
    });
    let id: number | string;
    if (found.docs[0]) {
      id = found.docs[0].id;
      await payload.update({ collection, id, data: { ...data, wpId }, depth: 0 });
    } else {
      const created = await payload.create({ collection, data: { ...data, wpId }, depth: 0 });
      id = created.id;
    }
    idx.set(wpId, id);
    return id;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`upsert ${collection} wp ${wpId}: ${message.slice(0, 300)}`);
  }
}

export async function importCasosFromWordPress(): Promise<{ casos: number; medios: number; requests: number }> {
  const payload = await getPayload({ config });
  const mediosIdx = new Map<number, number | string>();
  const casosIdx = new Map<number, number | string>();

  const casos = await wpAll('/wp/v2/casos-de-exito');
  const mediaIds = new Set<number>();
  for (const c of casos) if (c.featured_media) mediaIds.add(c.featured_media);
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

  for (const m of mediaList) {
    await upsert(
      payload,
      'medios',
      m.id,
      {
        alt: m.alt_text || null,
        titulo: text(m.title?.rendered) || null,
        caption: text(m.caption?.rendered) || null,
        sourceUrl: m.source_url,
        wpMimeType: m.mime_type,
        wpWidth: m.media_details?.width ?? null,
        wpHeight: m.media_details?.height ?? null,
        wpSizes: m.media_details?.sizes ?? null,
      },
      mediosIdx,
    );
  }

  const media = (id?: number) => (id && mediosIdx.get(id)) || null;

  for (const c of casos) {
    const acf: Json = { ...(c.acf || {}) };
    for (const f of CASO_ACF_IMAGE_FIELDS) {
      const v = acf[f];
      acf[f] = typeof v === 'number' && v > 0 ? media(v) : null;
    }
    const rawVideo =
      c.acf?.url_video ??
      c.meta?.url_video ??
      (Array.isArray(c.meta?.url_video) ? c.meta.url_video[0] : undefined);
    let url_video: string | null = null;
    if (typeof rawVideo === 'string' && rawVideo.trim()) {
      try {
        const u = new URL(rawVideo.trim());
        if (u.protocol === 'http:' || u.protocol === 'https:') url_video = u.toString();
      } catch {
        /* ignore */
      }
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
    }
    await upsert(
      payload,
      'casos',
      c.id,
      {
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
      },
      casosIdx,
    );
  }

  return { casos: casos.length, medios: mediaList.length, requests };
}

async function main() {
  const result = await importCasosFromWordPress();
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
