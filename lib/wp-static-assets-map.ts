import type { BlobUrlMap } from './blob-image-url.ts';
import { lookupBlobMapTarget, blobPublicUrlFromStoredMapTarget } from './blob-image-url.ts';
import mapDocument from '../docs/wp-static-assets-map.json' with { type: 'json' };

type MapDocument = { map: Record<string, string> };

const bundled = (mapDocument as MapDocument).map;

let cached: Record<string, string> | undefined;

export function loadWpStaticAssetsMap(): Record<string, string> {
  if (cached) return cached;
  cached = bundled && typeof bundled === 'object' ? bundled : {};
  return cached;
}

export function lookupWpStaticPublicUrl(endpointUrl: string): string | null {
  if (!endpointUrl) return null;
  const map = loadWpStaticAssetsMap();
  const key = endpointUrl.split('?')[0];
  return map[key] || null;
}

/** Une mapa estático (CSS/JS/fuentes) con Blob para uploads referenciados en CSS. */
export function resolveMirroredAssetUrl(
  endpointUrl: string,
  blobMap: BlobUrlMap | null,
  env: NodeJS.ProcessEnv = process.env,
): string | null {
  const trimmed = endpointUrl.trim().split('?')[0];
  if (!trimmed) return null;
  const staticPath = lookupWpStaticPublicUrl(trimmed);
  if (staticPath) return staticPath;
  if (blobMap) {
    const target = lookupBlobMapTarget(trimmed, blobMap);
    if (target) return blobPublicUrlFromStoredMapTarget(target, env);
  }
  return null;
}
