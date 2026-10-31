/**
 * Reescritura de documentos Payload con el mapa Blob (solo si CMS_BLOB_IMAGES=1).
 * Pensado para ejecutarse tras migrate-images-to-blob --dry-run.
 */
import type { Payload } from 'payload';
import {
  isBlobImagesEnabled,
  maybeRewriteHtmlForBlob,
  maybeRewriteMediaUrl,
  type BlobUrlMap,
} from './blob-image-url.ts';
import { loadBlobMigrationMap } from './blob-image-map.ts';

function rewriteMedioRelation(
  value: unknown,
  map: BlobUrlMap,
): unknown {
  if (!value || typeof value !== 'object') return value;
  const doc = value as Record<string, unknown>;
  const sourceUrl = typeof doc.sourceUrl === 'string' ? doc.sourceUrl : '';
  if (!sourceUrl) return value;
  const next = maybeRewriteMediaUrl(sourceUrl, map);
  if (next === sourceUrl) return value;
  return { ...doc, sourceUrl: next };
}

function rewriteAcfImages(acf: unknown, map: BlobUrlMap): unknown {
  if (!acf || typeof acf !== 'object' || Array.isArray(acf)) return acf;
  const out: Record<string, unknown> = { ...(acf as Record<string, unknown>) };
  for (const [key, val] of Object.entries(out)) {
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      const rewritten = rewriteMedioRelation(val, map);
      if (rewritten !== val) out[key] = rewritten;
    }
  }
  return out;
}

export async function applyBlobImageMapToCollection(
  payload: Payload,
  collection: 'posts' | 'paginas' | 'casos' | 'medios',
  map: BlobUrlMap,
  env: NodeJS.ProcessEnv = process.env,
): Promise<{ updated: number; scanned: number }> {
  if (!isBlobImagesEnabled(env)) {
    return { updated: 0, scanned: 0 };
  }

  let updated = 0;
  let scanned = 0;
  let page = 1;
  const limit = 50;

  for (;;) {
    const batch = await payload.find({ collection, limit, page, depth: 2 });
    for (const doc of batch.docs) {
      scanned++;
      const patch: Record<string, unknown> = {};
      const id = doc.id;

      if (typeof doc.contentHtml === 'string') {
        const next = maybeRewriteHtmlForBlob(doc.contentHtml, map, env);
        if (next !== doc.contentHtml) patch.contentHtml = next;
      }

      if (Array.isArray(doc.imagenesContenido)) {
        const nextArr = doc.imagenesContenido.map((row: { src?: string; alt?: string }) => {
          const src = row?.src || '';
          const rewritten = maybeRewriteMediaUrl(src, map, env);
          return rewritten === src ? row : { ...row, src: rewritten };
        });
        if (JSON.stringify(nextArr) !== JSON.stringify(doc.imagenesContenido)) {
          patch.imagenesContenido = nextArr;
        }
      }

      if (doc.imagenDestacada) {
        const next = rewriteMedioRelation(doc.imagenDestacada, map);
        if (next !== doc.imagenDestacada) patch.imagenDestacada = next;
      }

      if (doc.yoast && typeof doc.yoast === 'object') {
        const y = { ...(doc.yoast as Record<string, unknown>) };
        if (typeof y.ogImage === 'string') {
          const og = maybeRewriteMediaUrl(y.ogImage, map, env);
          if (og !== y.ogImage) y.ogImage = og;
        }
        if (JSON.stringify(y) !== JSON.stringify(doc.yoast)) patch.yoast = y;
      }

      if (doc.acf) {
        const acf = rewriteAcfImages(doc.acf, map);
        if (JSON.stringify(acf) !== JSON.stringify(doc.acf)) patch.acf = acf;
      }

      if (collection === 'medios' && typeof doc.sourceUrl === 'string') {
        const next = maybeRewriteMediaUrl(doc.sourceUrl, map, env);
        if (next !== doc.sourceUrl) patch.sourceUrl = next;
      }

      if (Object.keys(patch).length > 0) {
        await payload.update({ collection, id, data: patch as never, depth: 0 });
        updated++;
      }
    }
    if (!batch.hasNextPage) break;
    page++;
  }

  return { updated, scanned };
}

export async function applyBlobImageMapAllPayload(
  payload: Payload,
  env: NodeJS.ProcessEnv = process.env,
): Promise<Record<string, { updated: number; scanned: number }>> {
  const map = loadBlobMigrationMap(env);
  if (!map || !isBlobImagesEnabled(env)) {
    return {};
  }
  const result: Record<string, { updated: number; scanned: number }> = {};
  for (const col of ['medios', 'posts', 'paginas', 'casos'] as const) {
    result[col] = await applyBlobImageMapToCollection(payload, col, map, env);
  }
  return result;
}
