import { loadBlobMigrationMap } from './blob-image-map.ts';
import { isBlobImagesEnabled, maybeRewriteMediaUrl } from './blob-image-url.ts';
import { toAbsoluteSiteUrl } from '../utils/canonical.ts';

export const WP_ENDPOINT_ORIGIN = 'https://endpoint.playfulagency.com';

/** Mismo origen: el rewrite en next.config sirve el binario desde endpoint sin cambiar la URL visible del HTML. */
export const WP_LEGACY_STATIC_PREFIX = '/legacy-wp';

const ENDPOINT_HOST_RE =
  /(?:https?:)?\/\/(?:endpoint\.|crear\.endpoint\.)?playfulagency\.com/gi;

const WTI_PIXEL_RE = /wti-like-post\/images\/pixel\.gif/i;

/**
 * Imágenes/medios: mapa Blob. Resto de wp-content (CSS, plugins, etc.): proxy same-origin en preview H2.
 */
export function rewriteEndpointAssetUrlForPreview(
  href: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!href?.trim() || !isBlobImagesEnabled(env)) return href;
  const map = loadBlobMigrationMap(env);
  const fromMap = maybeRewriteMediaUrl(href, map, env);
  if (fromMap !== href) return fromMap;
  const trimmed = href.trim();
  if (trimmed.startsWith(WP_ENDPOINT_ORIGIN)) {
    const path = trimmed.slice(WP_ENDPOINT_ORIGIN.length) || '/';
    return toAbsoluteSiteUrl(`${WP_LEGACY_STATIC_PREFIX}${path.startsWith('/') ? path : `/${path}`}`);
  }
  if (trimmed.startsWith('//endpoint.playfulagency.com')) {
    return rewriteEndpointAssetUrlForPreview(`https:${trimmed}`, env);
  }
  return href;
}

export function stripWtiLikeTrackingPixels(html: string, env: NodeJS.ProcessEnv = process.env): string {
  if (!html || !isBlobImagesEnabled(env)) return html;
  return html.replace(/<img\b[^>]*>/gi, (tag) => (WTI_PIXEL_RE.test(tag) ? '' : tag));
}

export function countEndpointHostRefs(text: string): number {
  if (!text) return 0;
  return (text.match(ENDPOINT_HOST_RE) || []).length;
}

export function countWtiPixelRefs(text: string): number {
  if (!text) return 0;
  return (text.match(WTI_PIXEL_RE) || []).length;
}

export function countElementorStylesheetHrefRefs(text: string): number {
  if (!text) return 0;
  const re =
    /href=["']https?:\/\/endpoint\.playfulagency\.com\/wp-content\/(?:uploads\/elementor\/css|plugins\/)/gi;
  return (text.match(re) || []).length;
}
