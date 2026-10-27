import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

export type CmsExportManifest = {
  exportedAt: string;
  wpBase: string;
  counts: Record<string, number>;
};

export type CmsExportBundle = {
  manifest: CmsExportManifest;
  categories: any[];
  authors: any[];
  mediaById: Map<number, any>;
  posts: any[];
  casos: any[];
};

const ROOT = path.join(process.cwd(), 'content', 'migrated');

let cached: CmsExportBundle | null = null;

function readJson<T>(file: string): T {
  const full = path.join(ROOT, file);
  if (!existsSync(full)) {
    throw new Error(`Falta el snapshot CMS (${full}). Ejecuta: npm run cms:export`);
  }
  return JSON.parse(readFileSync(full, 'utf8')) as T;
}

export function loadCmsExportBundle(): CmsExportBundle {
  if (cached) return cached;
  const manifest = readJson<CmsExportManifest>('manifest.json');
  const categories = readJson<any[]>('categories.json');
  const authors = readJson<any[]>('authors.json');
  const media = readJson<any[]>('media.json');
  const posts = readJson<any[]>('posts.json');
  const casos = readJson<any[]>('casos.json');
  const mediaById = new Map<number, any>();
  for (const m of media) {
    if (typeof m?.id === 'number') mediaById.set(m.id, m);
  }
  cached = { manifest, categories, authors, mediaById, posts, casos };
  return cached;
}

export function clearCmsExportBundleCache(): void {
  cached = null;
}
