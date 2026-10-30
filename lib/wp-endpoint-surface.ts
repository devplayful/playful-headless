import { loadBlobMigrationMap } from './blob-image-map.ts';
import { isBlobImagesEnabled, maybeRewriteMediaUrl } from './blob-image-url.ts';
import { lookupWpStaticPublicUrl, resolveMirroredAssetUrl } from './wp-static-assets-map.ts';

export const WP_ENDPOINT_ORIGIN = 'https://endpoint.playfulagency.com';

const ENDPOINT_HOST_RE =
  /(?:https?:)?\/\/(?:endpoint\.|crear\.endpoint\.)?playfulagency\.com/gi;

const WTI_PIXEL_RE = /wti-like-post\/images\/pixel\.gif/i;

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
export function rewriteEndpointAssetUrlForPreview(
  href: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!href?.trim() || !isBlobImagesEnabled(env)) return href;
  const map = loadBlobMigrationMap(env);
  const fromBlob = maybeRewriteMediaUrl(href, map, env);
  if (fromBlob !== href) return fromBlob;
  const trimmed = href.trim().split('?')[0];
  const staticPath = lookupWpStaticPublicUrl(trimmed);
  if (staticPath) return staticPath;
  const mirrored = resolveMirroredAssetUrl(trimmed, map, env);
  if (mirrored?.startsWith('http')) return mirrored;
  if (mirrored?.startsWith('/')) return mirrored;
  if (trimmed.startsWith('//endpoint.playfulagency.com')) {
    return rewriteEndpointAssetUrlForPreview(`https:${trimmed}`, env);
  }
  return href;
}

export function rewriteElementorScriptUrlForPreview(
  src: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  return rewriteEndpointAssetUrlForPreview(src, env);
}

const ENDPOINT_URL_IN_TEXT_RE =
  /https?:\/\/endpoint\.playfulagency\.com[^\s"'<>\\)]*/gi;

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
  let out = html.replace(ENDPOINT_URL_IN_TEXT_RE, (url) => rewriteEndpointAssetUrlForPreview(url, env));
  out = out.replace(JSON_ESCAPED_ENDPOINT_URL_RE, (escaped) => {
    const plain = unescapeJsonSlashes(escaped);
    const resolved = rewriteEndpointAssetUrlForPreview(plain, env);
    if (resolved === plain) return escaped;
    return escapeJsonSlashes(resolved);
  });
  return out;
}

export function stripWtiLikeTrackingPixels(html: string, env: NodeJS.ProcessEnv = process.env): string {
  if (!html || !isBlobImagesEnabled(env)) return html;
  return html.replace(/<img\b[^>]*>/gi, (tag) => (WTI_PIXEL_RE.test(tag) ? '' : tag));
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
