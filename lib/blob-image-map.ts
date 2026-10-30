import type { BlobUrlMap } from './blob-image-url.ts';
import mapDocument from '../docs/blob-migration-map.json';

type MapDocument = {
  map: BlobUrlMap;
  blobPublicBase?: string;
};

const bundledMap = (mapDocument as MapDocument).map;

let cached: BlobUrlMap | null | undefined;

/** Ruta lógica del mapa (scripts / documentación); el runtime usa el JSON empaquetado. */
export function getBlobMigrationMapPath(env: NodeJS.ProcessEnv = process.env): string {
  return env.BLOB_MIGRATION_MAP_PATH || 'docs/blob-migration-map.json';
}

export function loadBlobMigrationMap(_env: NodeJS.ProcessEnv = process.env): BlobUrlMap | null {
  if (cached !== undefined) return cached;
  cached = bundledMap && typeof bundledMap === 'object' ? bundledMap : null;
  return cached;
}

export function clearBlobMigrationMapCache(): void {
  cached = undefined;
}
