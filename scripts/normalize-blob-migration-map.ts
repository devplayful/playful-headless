/**
 * Reescribe valores del mapa e inventario a la URL pública real del store (sin subir nada).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  blobStorageKeyFromCanonicalUrl,
  canonicalWordPressUploadUrl,
} from '../lib/blob-image-url.ts';

const BASE = 'https://xl21culwxno499zc.public.blob.vercel-storage.com';
const MAP_PATH = path.join(process.cwd(), 'docs/blob-migration-map.json');
const INV_PATH = path.join(process.cwd(), 'docs/blob-migration-inventory.json');

function blobUrlForSource(sourceUrl: string): string | null {
  const canonical = canonicalWordPressUploadUrl(sourceUrl) || sourceUrl;
  const key = blobStorageKeyFromCanonicalUrl(canonical);
  if (!key) return null;
  return `${BASE}/${key}`;
}

const mapDoc = JSON.parse(readFileSync(MAP_PATH, 'utf8')) as {
  map: Record<string, string>;
  blobPublicBase?: string;
};
let mapUpdates = 0;
for (const key of Object.keys(mapDoc.map)) {
  const next = blobUrlForSource(key);
  if (next && mapDoc.map[key] !== next) {
    mapDoc.map[key] = next;
    mapUpdates++;
  }
}
mapDoc.blobPublicBase = BASE;
writeFileSync(MAP_PATH, JSON.stringify(mapDoc, null, 2) + '\n');

const inv = JSON.parse(readFileSync(INV_PATH, 'utf8')) as {
  items: Array<{ url: string; blobUrl: string | null }>;
};
let invUpdates = 0;
for (const row of inv.items) {
  const next = blobUrlForSource(row.url);
  if (next && row.blobUrl !== next) {
    row.blobUrl = next;
    invUpdates++;
  }
}
writeFileSync(INV_PATH, JSON.stringify(inv, null, 2) + '\n');

console.log(JSON.stringify({ mapUpdates, invUpdates, base: BASE }, null, 2));
