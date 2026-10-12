const WP_UPLOADS_HOST = 'endpoint.playfulagency.com';

/** Build a same-origin `/_next/image` URL for remote WordPress uploads. */
export function buildNextImageUrl(
  src: string,
  width: number,
  quality = 75,
): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('/_next/image') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  if (!/^https?:\/\//i.test(trimmed)) return trimmed;
  try {
    const host = new URL(trimmed).hostname;
    if (host !== WP_UPLOADS_HOST) return trimmed;
  } catch {
    return trimmed;
  }
  const params = new URLSearchParams({
    url: trimmed,
    w: String(Math.max(1, Math.round(width))),
    q: String(Math.min(100, Math.max(1, Math.round(quality)))),
  });
  return `/_next/image?${params.toString()}`;
}

export function isOptimizableWpUpload(src: string): boolean {
  if (!src?.trim()) return false;
  try {
    const url = new URL(src.trim());
    return (
      url.hostname === WP_UPLOADS_HOST
      && url.pathname.startsWith('/wp-content/uploads/')
    );
  } catch {
    return false;
  }
}
