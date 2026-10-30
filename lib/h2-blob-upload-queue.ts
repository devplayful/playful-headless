import inventory from '../docs/blob-migration-inventory.json' with { type: 'json' };

export type H2UploadJob = {
  src: string;
  blobKey: string;
  inventoryStatus: number | null;
};

let cachedJobs: H2UploadJob[] | undefined;

/** Lista estable de canonical a subir (dedupe por canonical, orden lexicográfico). */
export function getH2BlobUploadJobs(): H2UploadJob[] {
  if (cachedJobs) return cachedJobs;
  const byCanonical = new Map<string, H2UploadJob>();
  for (const row of inventory.items) {
    const src = row.canonicalUrl || row.url;
    if (!src || !row.blobKey) continue;
    if (byCanonical.has(src)) continue;
    byCanonical.set(src, {
      src,
      blobKey: row.blobKey,
      inventoryStatus: row.httpStatus ?? null,
    });
  }
  cachedJobs = Array.from(byCanonical.values()).sort((a, b) => a.src.localeCompare(b.src));
  return cachedJobs;
}

export function totalH2BlobUploadJobs(): number {
  return getH2BlobUploadJobs().length;
}

export function sliceH2BlobUploadJobs(offset: number, limit: number): H2UploadJob[] {
  const jobs = getH2BlobUploadJobs();
  const start = Math.max(0, offset);
  return jobs.slice(start, start + Math.max(1, limit));
}

/** Lotes con limit por defecto 40 (para documentar total de lotes). */
export function countH2BlobUploadBatches(batchSize = 40): number {
  const total = totalH2BlobUploadJobs();
  return total === 0 ? 0 : Math.ceil(total / batchSize);
}
