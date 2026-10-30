import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import type { BlobUrlMap } from './blob-image-url.ts';

const DEFAULT_MAP_PATH = path.join(process.cwd(), 'docs/blob-migration-map.json');

let cached: BlobUrlMap | null | undefined;

export function getBlobMigrationMapPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.BLOB_MIGRATION_MAP_PATH || DEFAULT_MAP_PATH;
}

export function loadBlobMigrationMap(env: NodeJS.ProcessEnv = process.env): BlobUrlMap | null {
  if (cached !== undefined) return cached;
  const file = getBlobMigrationMapPath(env);
  if (!existsSync(file)) {
    cached = null;
    return null;
  }
  try {
    const raw = JSON.parse(readFileSync(file, 'utf8')) as { map?: BlobUrlMap } | BlobUrlMap;
    cached = 'map' in raw && raw.map ? raw.map : (raw as BlobUrlMap);
    return cached;
  } catch {
    cached = null;
    return null;
  }
}

export function clearBlobMigrationMapCache(): void {
  cached = undefined;
}
