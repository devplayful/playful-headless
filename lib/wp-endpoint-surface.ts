import { loadBlobMigrationMap } from './blob-image-map.ts';
import {
  blobPublicUrlFromStoredMapTarget,
  isBlobImagesEnabled,
  lookupBlobMapTarget,
  maybeRewriteMediaUrl,
} from './blob-image-url.ts';
import { lookupWpStaticPublicUrl, resolveMirroredAssetUrl } from './wp-static-assets-map.ts';

export const WP_ENDPOINT_ORIGIN = 'https://endpoint.playfulagency.com';

const ENDPOINT_HOST_RE =
  /(?:https?:)?\/\/(?:endpoint\.|crear\.endpoint\.)?playfulagency\.com/gi;

const WTI_PIXEL_RE = /wti-like-post\/images\/pixel\.gif/i;
const WTI_PIXEL_STATIC = '/wp-static/wp-content/plugins/wti-like-post/images/pixel.gif';

const NON_IMAGE_STATIC_RE =
  /\/wp-content\/(?:plugins|uploads\/elementor\/css|themes)|\/wp-includes\/js\//i;

export function isNonImageEndpointStaticUrl(url: string): boolean {
  if (!url.includes('endpoint.playfulagency.com')) return false;
  if (/\/wp-content\/uploads\//i.test(url) && !/\/wp-content\/uploads\/elementor\//i.test(url)) {
    return false;
  }
  return NON_IMAGE_STATIC_RE.test(url) || /\.(css|js|woff2?|ttf|eot)(\?|$)/i.test(url);
}

/**
 * Preview H2: CSS/JS/fuentes → copia en /wp-static; uploads en mapa Blob.
 * Sin sustituto si no hay copia (404 en origen).
 */
function normalizePreviewAssetHref(href: string): string {
  const trimmed = href.trim();
  if (trimmed.startsWith('//endpoint.') || trimmed.startsWith('//crear.endpoint.')) {
    return `https:${trimmed}`;
  }
  return trimmed;
}

function isUnresolvedEndpointUploadUrl(url: string): boolean {
  if (!url?.trim()) return false;
  try {
    const absolute = normalizePreviewAssetHref(url).split('?')[0];
    const parsed = new URL(absolute);
    if (!parsed.hostname.endsWith('playfulagency.com')) return false;
    return parsed.pathname.startsWith('/wp-content/uploads/');
  } catch {
    return false;
  }
}

export function rewriteEndpointAssetUrlForPreview(
  href: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!href?.trim() || !isBlobImagesEnabled(env)) return href;
  const normalized = normalizePreviewAssetHref(href);
  const trimmed = normalized.split('?')[0];
  const map = loadBlobMigrationMap(env);
  const mapped = lookupBlobMapTarget(normalized, map || {});
  if (mapped) {
    return blobPublicUrlFromStoredMapTarget(mapped, env);
  }
  const staticPath = lookupWpStaticPublicUrl(trimmed);
  if (staticPath) return staticPath;
  const mirrored = resolveMirroredAssetUrl(trimmed, map, env);
  if (mirrored?.startsWith('http')) return mirrored;
  if (mirrored?.startsWith('/')) return mirrored;
  return href.startsWith('//') ? normalized : href;
}

function isInvalidSrcsetUrl(url: string): boolean {
  return !url || /[\s\u2028\u2029]/.test(url);
}

function isCompleteEndpointUploadUrl(url: string): boolean {
  if (!/\/wp-content\/uploads\//i.test(url)) return true;
  try {
    const absolute = normalizePreviewAssetHref(url).split('?')[0];
    const file = decodeURIComponent(new URL(absolute).pathname).split('/').pop() || '';
    if (!file || !/\.\w{2,5}$/i.test(file)) return false;
    if (/[\s\u2028\u2029]/.test(file)) return false;
    return true;
  } catch {
    return false;
  }
}

function rewriteEndpointUrlInHtmlFragment(url: string, env: NodeJS.ProcessEnv): string {
  if (!isCompleteEndpointUploadUrl(url)) return url;
  return rewriteEndpointAssetUrlForPreview(url, env);
}

function parseSrcsetCandidate(part: string): { url: string; descriptor: string } | null {
  const trimmed = part.trim();
  if (!trimmed) return null;
  const descriptorMatch = trimmed.match(/\s+(\d+(?:\.\d+)?[wx])$/i);
  if (!descriptorMatch) {
    return { url: trimmed, descriptor: '' };
  }
  const descriptor = descriptorMatch[1];
  const url = trimmed.slice(0, trimmed.length - descriptorMatch[0].length);
  return { url, descriptor };
}

/** Reescribe src/srcset de img; omite entradas srcset sin Blob ni /wp-static. */
export function rewritePreviewMediaAttributesInHtml(
  html: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!html || !isBlobImagesEnabled(env)) return html;
  return html.replace(/<img\b([^>]*)>/gi, (_full, attrs: string) => {
    let next = attrs;
    const srcMatch = /\bsrc\s*=\s*(["'])([^"']*)\1/i.exec(attrs);
    if (srcMatch) {
      const q = srcMatch[1];
      const resolved = rewriteEndpointAssetUrlForPreview(srcMatch[2], env);
      next = next.replace(srcMatch[0], `src=${q}${resolved}${q}`);
    }
    const srcsetMatch = /\bsrcset\s*=\s*(["'])([^"']*)\1/i.exec(attrs);
    if (srcsetMatch) {
      const q = srcsetMatch[1];
      const kept: string[] = [];
      for (const part of srcsetMatch[2].split(',')) {
        const parsed = parseSrcsetCandidate(part);
        if (!parsed) continue;
        const { url: rawUrl, descriptor } = parsed;
        if (isInvalidSrcsetUrl(rawUrl)) continue;
        const resolved = rewriteEndpointAssetUrlForPreview(rawUrl, env);
        if (isInvalidSrcsetUrl(resolved) || isUnresolvedEndpointUploadUrl(resolved)) continue;
        kept.push(descriptor ? `${resolved} ${descriptor}` : resolved);
      }
      if (kept.length === 0) {
        next = next.replace(srcsetMatch[0], '');
      } else {
        next = next.replace(srcsetMatch[0], `srcset=${q}${kept.join(', ')}${q}`);
      }
    }
    return `<img${next}>`;
  });
}

export function rewriteElementorScriptUrlForPreview(
  src: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return rewriteEndpointAssetUrlForPreview(src, env);
}

const ENDPOINT_URL_IN_TEXT_RE =
  /https?:\/\/endpoint\.playfulagency\.com[^\s"'<>\\)]*/gi;

const PROTOCOL_RELATIVE_ENDPOINT_UPLOAD_RE =
  /(?<![:/])\/\/endpoint\.playfulagency\.com\/wp-content\/uploads\/[^\s"'<>\\)]*/gi;

const JSON_ESCAPED_ENDPOINT_URL_RE =
  /https:\\\/\\\/endpoint\.playfulagency\.com\\\/[^&]+?\.json(?=&quot;)/gi;

function unescapeJsonSlashes(value: string): string {
  return value.replace(/\\\//g, '/');
}

function escapeJsonSlashes(value: string): string {
  return value.replace(/\//g, '\\/');
}

/** Preview H2: reescribe URLs endpoint embebidas en HTML (p. ej. Lottie en data-settings). */
export function rewriteEndpointUrlsInHtmlForPreview(
  html: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!html || !isBlobImagesEnabled(env)) return html;
  let out = rewritePreviewMediaAttributesInHtml(html, env);
  out = out.replace(ENDPOINT_URL_IN_TEXT_RE, (url) => rewriteEndpointUrlInHtmlFragment(url, env));
  out = out.replace(PROTOCOL_RELATIVE_ENDPOINT_UPLOAD_RE, (url) => {
    const resolved = rewriteEndpointUrlInHtmlFragment(`https:${url}`, env);
    if (resolved.startsWith('https://') && !resolved.includes('endpoint.playfulagency.com')) {
      return resolved;
    }
    if (resolved.startsWith('/')) return resolved;
    return resolved;
  });
  out = rewritePreviewMediaAttributesInHtml(out, env);
  out = out.replace(JSON_ESCAPED_ENDPOINT_URL_RE, (escaped) => {
    const plain = unescapeJsonSlashes(escaped);
    const resolved = rewriteEndpointAssetUrlForPreview(plain, env);
    if (resolved === plain) return escaped;
    return escapeJsonSlashes(resolved);
  });
  return out;
}

export function rewriteWtiLikeTrackingPixels(html: string, env: NodeJS.ProcessEnv = process.env): string {
  if (!html || !isBlobImagesEnabled(env)) return html;
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    if (!WTI_PIXEL_RE.test(tag)) return tag;
    if (/\bsrc\s*=/i.test(tag)) {
      return tag.replace(/\bsrc\s*=\s*(["'])[^"']*\1/i, `src="${WTI_PIXEL_STATIC}"`);
    }
    return tag.replace(/<img\b/i, `<img src="${WTI_PIXEL_STATIC}"`);
  });
}

export function countEndpointHostRefs(text: string): number {
  if (!text) return 0;
  return (text.match(ENDPOINT_HOST_RE) || []).length;
}

export function countNonImageEndpointStaticRefs(text: string): number {
  if (!text) return 0;
  let n = 0;
  for (const match of Array.from(text.matchAll(/https?:\/\/endpoint\.playfulagency\.com[^\s"'<>\\)]*/gi))) {
    if (isNonImageEndpointStaticUrl(match[0])) n++;
  }
  return n;
}

export function countWtiPixelRefs(text: string): number {
  if (!text) return 0;
  return (text.match(WTI_PIXEL_RE) || []).length;
}
