import { loadBlobMigrationMap } from './blob-image-map.ts';
import {
  isBlobImagesEnabled,
  maybeRewriteHtmlForBlob,
  maybeRewriteMediaUrl,
} from './blob-image-url.ts';
import { rewriteStringUrls } from './wp-snapshot/rewrite-media-urls.mjs';
import {
  rewriteWtiLikeTrackingPixels,
  rewriteEndpointUrlsInHtmlForPreview,
  rewriteEndpointAssetUrlForPreview,
  rewriteEndpointAssetUrlForRuntime,
  isNonImageEndpointStaticUrl,
} from './wp-endpoint-surface.ts';
import { ORGANIZATION_LOGO_URL } from '../utils/organization-schema.mjs';

const YOAST_SCHEMA_LOGO_ENDPOINT =
  'https://endpoint.playfulagency.com/wp-content/uploads/2020/12/PlayfulAgency-logo-blanco.svg';

const ENDPOINT_IMAGE_RE =
  /(?:https?:)?\/\/(?:i[0-3]\.wp\.com\/)?(?:endpoint\.|crear\.endpoint\.)?playfulagency\.com\/wp-content\/uploads\/[^\s"'<>\\)]*/gi;

export function applyBlobImagesToHtml(
  html: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const snapshotSafe = rewriteStringUrls(html);
  const map = loadBlobMigrationMap(env);
  const rewritten = maybeRewriteHtmlForBlob(snapshotSafe, map, env);
  const surfaced = rewriteEndpointUrlsInHtmlForPreview(rewritten, env);
  return rewriteWtiLikeTrackingPixels(surfaced, env);
}

export function applyBlobImagesToUrl(
  url: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!url) return url || '';
  const trimmed = url.trim();
  if (trimmed.startsWith('/wp-media/')) return trimmed.split('?')[0];
  if (trimmed.startsWith('/wp-content/uploads/')) {
    return rewriteStringUrls(trimmed).split('?')[0];
  }
  if (
    trimmed.includes('endpoint.playfulagency.com') ||
    trimmed.startsWith('//endpoint.') ||
    isNonImageEndpointStaticUrl(trimmed)
  ) {
    return rewriteEndpointAssetUrlForRuntime(trimmed, env);
  }
  if (isBlobImagesEnabled(env)) {
    return rewriteEndpointAssetUrlForPreview(trimmed, env);
  }
  const normalized = rewriteStringUrls(trimmed);
  const map = loadBlobMigrationMap(env);
  return maybeRewriteMediaUrl(normalized, map, env);
}

export function applyBlobImagesToJsonLd<T>(value: T, env: NodeJS.ProcessEnv = process.env): T {
  let json = JSON.stringify(value);
  json = rewriteStringUrls(json);
  json = json.split(YOAST_SCHEMA_LOGO_ENDPOINT).join(ORGANIZATION_LOGO_URL);
  if (!isBlobImagesEnabled(env)) {
    return JSON.parse(json) as T;
  }
  const map = loadBlobMigrationMap(env);
  if (!map) return JSON.parse(json) as T;
  json = maybeRewriteHtmlForBlob(json, map, env);
  json = rewriteEndpointUrlsInHtmlForPreview(json, env);
  return JSON.parse(json) as T;
}

/** Post/página WP ya reescrita en hrefs: aplica mapa Blob a HTML renderizado, featured y Yoast. */
export function applyBlobImagesToWpItem<T extends Record<string, unknown>>(item: T, env: NodeJS.ProcessEnv = process.env): T {
  if (!isBlobImagesEnabled(env)) return item;
  const next = { ...item } as T & {
    content?: { rendered?: string };
    excerpt?: { rendered?: string };
    featured_media_url?: string;
    yoast_head_json?: unknown;
  };
  if (next.content?.rendered) {
    next.content = {
      ...next.content,
      rendered: applyBlobImagesToHtml(next.content.rendered, env),
    };
  }
  if (next.excerpt?.rendered) {
    next.excerpt = {
      ...next.excerpt,
      rendered: applyBlobImagesToHtml(next.excerpt.rendered, env),
    };
  }
  if (typeof next.featured_media_url === 'string') {
    next.featured_media_url = applyBlobImagesToUrl(next.featured_media_url, env);
  }
  if (next.yoast_head_json) {
    next.yoast_head_json = applyBlobImagesToJsonLd(next.yoast_head_json, env);
  }
  return next as T;
}

export function countEndpointUploadImageRefs(text: string): number {
  if (!text) return 0;
  return (text.match(ENDPOINT_IMAGE_RE) || []).length;
}
