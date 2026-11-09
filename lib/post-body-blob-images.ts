/**
 * Reescritura de imágenes del cuerpo de posts (HTML de WordPress → Vercel Blob).
 * Usa el mismo mapa que H2/H7 (`docs/blob-migration-map.json` + lookupBlobMapTarget).
 * Conserva alt, width, height y el descriptor de cada candidato de srcset.
 * Si no hay equivalente en el mapa, la URL se deja igual.
 */
import { loadBlobMigrationMap } from './blob-image-map.ts';
import {
  blobPublicUrlFromStoredMapTarget,
  lookupBlobMapTarget,
  type BlobUrlMap,
} from './blob-image-url.ts';

export const CMS_BLOB_BODY_IMAGES_ENV = 'CMS_BLOB_BODY_IMAGES';

const IMG_TAG_RE = /<img\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
const URL_ATTR_RE =
  /(?<![\w-])(src|srcset|data-src|data-lazy-src|data-srcset)(\s*=\s*)(["'])([\s\S]*?)\3/gi;
const SRC_ATTR_RE = /(?<![\w-])src(\s*=\s*)(["'])([\s\S]*?)\2/i;

export function shouldRewritePostBodyImages(env: NodeJS.ProcessEnv = process.env): boolean {
  if (env.VERCEL_ENV === 'production') return false;
  const flag = env[CMS_BLOB_BODY_IMAGES_ENV];
  if (flag === '1' || flag === 'true') return true;
  return env.VERCEL_ENV === 'preview';
}

function decodeAttrUrl(value: string): string {
  return value
    .replace(/&amp;/gi, '&')
    .replace(/&#0*38;/g, '&')
    .replace(/&#x0*26;/gi, '&');
}

/** URL pública de Blob si el mapa tiene la copia; si no, null. */
export function blobUrlForBodyImage(raw: string, map: BlobUrlMap | null | undefined): string | null {
  if (!raw || !map) return null;
  const target = lookupBlobMapTarget(decodeAttrUrl(raw.trim()), map);
  if (!target) return null;
  return blobPublicUrlFromStoredMapTarget(target);
}

function rewriteSrcsetValue(value: string, map: BlobUrlMap): string {
  return value
    .split(',')
    .map((part) => {
      const lead = part.match(/^\s*/)?.[0] ?? '';
      const trimmed = part.trim();
      if (!trimmed) return part;
      const bits = trimmed.split(/\s+/);
      const next = blobUrlForBodyImage(bits[0], map);
      if (!next || next === bits[0]) return part;
      bits[0] = next;
      return lead + bits.join(' ');
    })
    .join(',');
}

function rewriteImgTag(tag: string, map: BlobUrlMap): string {
  return tag.replace(URL_ATTR_RE, (full, name: string, eq: string, quote: string, value: string) => {
    const attr = name.toLowerCase();
    const next = attr === 'srcset' || attr === 'data-srcset'
      ? rewriteSrcsetValue(value, map)
      : (blobUrlForBodyImage(value, map) ?? value);
    if (next === value) return full;
    return `${name}${eq}${quote}${next}${quote}`;
  });
}

/** Reescribe src/srcset de <img> del cuerpo. El resto del HTML no cambia. */
export function rewritePostBodyHtml(
  html: string,
  map: BlobUrlMap | null = loadBlobMigrationMap(),
): string {
  if (!html || !map) return html;
  return html.replace(IMG_TAG_RE, (tag) => rewriteImgTag(tag, map));
}

/** En preview (o con CMS_BLOB_BODY_IMAGES=1). En producción el HTML sigue igual. */
export function rewritePostBodyImagesForPreview(
  html: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!shouldRewritePostBodyImages(env)) return html;
  return rewritePostBodyHtml(html);
}

/**
 * Portada, tarjeta relacionada e imagen OG. Misma puerta que el cuerpo y el
 * mismo mapa. Una ruta local o una URL sin equivalente se devuelve igual.
 */
export function rewriteBlogMediaUrlForPreview(
  url: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!url) return url || '';
  if (!shouldRewritePostBodyImages(env)) return url;
  return blobUrlForBodyImage(url, loadBlobMigrationMap()) || url;
}

export function isLegacyPostBodyImageSrc(src: string): boolean {
  const trimmed = decodeAttrUrl(src).trim();
  if (!trimmed) return false;
  const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
  try {
    const url = new URL(absolute);
    const host = url.hostname.toLowerCase();
    if (host === 'endpoint.playfulagency.com') return true;
    if (host === 'i0.wp.com' && url.pathname.includes('crear.endpoint')) return true;
    return false;
  } catch {
    return false;
  }
}

export type PostBodyImageCount = {
  srcTotal: number;
  srcRewritten: number;
  srcUnmapped: string[];
};

/** Cuenta src de <img> que aún apuntan a endpoint o a i0.wp.com/crear.endpoint. */
export function countLegacyPostBodyImageSrcs(
  html: string,
  map: BlobUrlMap | null = loadBlobMigrationMap(),
): PostBodyImageCount {
  const srcUnmapped: string[] = [];
  let srcTotal = 0;
  let srcRewritten = 0;
  for (const tag of html.match(IMG_TAG_RE) || []) {
    const src = SRC_ATTR_RE.exec(tag)?.[3];
    if (src == null || !isLegacyPostBodyImageSrc(src)) continue;
    srcTotal += 1;
    if (blobUrlForBodyImage(src, map)) srcRewritten += 1;
    else srcUnmapped.push(decodeAttrUrl(src).trim());
  }
  return { srcTotal, srcRewritten, srcUnmapped };
}
