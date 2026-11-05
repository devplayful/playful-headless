/**
 * Import mínimo de posts WP por wpId (solo lista H5). Serie, 1 req/s, PlayfulQA/1.0.
 */
import type { Payload } from 'payload';
import { activeH5ContentAltOverrides } from '../data/posts-content-alt-h5.ts';
import { applyContentAltOverrides, contentImages } from './post-content-images.ts';
import { findPostByWpId } from './h5-posts-alt-seed.ts';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;

let lastRequest = 0;

async function wpGet(path: string): Promise<any> {
  const wait = lastRequest + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();
  const res = await fetch(`${WP}${path}`, { headers: { 'User-Agent': UA, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

const text = (html?: string) =>
  (html || '').replace(/<[^>]+>/g, '').replace(/&#8211;/g, '–').replace(/&#8217;/g, '’').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();

const gmt = (v?: string | null) => (v ? `${v.replace(/Z$/, '')}Z` : null);

export async function ensureH5PostsFromWp(payload: Payload, wpIds: number[]): Promise<void> {
  const h5AltOverrides = activeH5ContentAltOverrides(false);
  for (const wpId of wpIds) {
    const existing = await findPostByWpId(payload, wpId);
    if (existing) continue;
    const p = await wpGet(`/wp/v2/posts/${wpId}?_embed=author`);
    let html = p.content?.rendered || '';
    let imagenes = contentImages(html);
    ({ html, images: imagenes } = applyContentAltOverrides(wpId, html, imagenes, h5AltOverrides));
    await payload.create({
      collection: 'posts',
      data: {
        wpId: p.id,
        titulo: text(p.title?.rendered) || p.slug,
        slug: p.slug,
        estado: p.status,
        date: gmt(p.date_gmt),
        wpDate: p.date,
        modifiedGmt: gmt(p.modified_gmt),
        extracto: text(p.excerpt?.rendered) || null,
        contentHtml: html,
        imagenesContenido: imagenes,
      },
      depth: 0,
    });
  }
}
