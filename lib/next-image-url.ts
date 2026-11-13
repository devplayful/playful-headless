/** Snapshot uploads are same-origin under /wp-media; no remote optimizer needed. */
export function buildNextImageUrl(
  src: string,
  _width: number,
  _quality = 75,
): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('/wp-media/')) return trimmed;
  return trimmed;
}

export function isOptimizableWpUpload(src: string): boolean {
  return Boolean(src?.trim().startsWith('/wp-media/wp-content/uploads/'));
}
