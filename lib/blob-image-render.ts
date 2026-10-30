import { loadBlobMigrationMap } from './blob-image-map.ts';
import {
  isBlobImagesEnabled,
  maybeRewriteHtmlForBlob,
  maybeRewriteMediaUrl,
} from './blob-image-url.ts';
import { stripWtiLikeTrackingPixels, rewriteEndpointUrlsInHtmlForPreview } from './wp-endpoint-surface.ts';
import { ORGANIZATION_LOGO_URL } from '../utils/organization-schema.mjs';

const YOAST_SCHEMA_LOGO_ENDPOINT =
  'https://endpoint.playfulagency.com/wp-content/uploads/2020/12/PlayfulAgency-logo-blanco.svg';

const ENDPOINT_IMAGE_RE =
  /(?:https?:)?\/\/(?:i[0-3]\.wp\.com\/)?(?:endpoint\.|crear\.endpoint\.)?playfulagency\.com\/wp-content\/uploads\/[^\s"'<>\\)]*/gi;

export function applyBlobImagesToHtml(
  html: string,
  env: NodeJS.ProcessEnv = process.env,
): string {
  const map = loadBlobMigrationMap(env);
  const rewritten = maybeRewriteHtmlForBlob(html, map, env);
  const surfaced = rewriteEndpointUrlsInHtmlForPreview(rewritten, env);
  return stripWtiLikeTrackingPixels(surfaced, env);
}

export function applyBlobImagesToUrl(
  url: string | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): string {
  if (!url) return url || '';
  const map = loadBlobMigrationMap(env);
  return maybeRewriteMediaUrl(url, map, env);
}

export function applyBlobImagesToJsonLd<T>(value: T, env: NodeJS.ProcessEnv = process.env): T {
  if (!isBlobImagesEnabled(env)) return value;
  const map = loadBlobMigrationMap(env);
  if (!map) return value;
  let json = JSON.stringify(value);
  json = maybeRewriteHtmlForBlob(json, map, env);
  json = json.split(YOAST_SCHEMA_LOGO_ENDPOINT).join(ORGANIZATION_LOGO_URL);
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
