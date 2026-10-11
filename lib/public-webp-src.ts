import { existsSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(process.cwd(), 'public');

/**
 * Serve a same-aspect `.webp` sibling when one exists on disk.
 * Canonical PNG/JPEG paths stay in overrides and tests; only the
 * runtime src swaps. Remote URLs and missing siblings are untouched.
 */
export function publicWebpIfPresent(src: string): string {
  if (!src || typeof src !== 'string') return src;
  if (!src.startsWith('/') || src.startsWith('//')) return src;
  if (!/\.(png|jpe?g)$/i.test(src)) return src;
  const webp = src.replace(/\.(png|jpe?g)$/i, '.webp');
  const onDisk = join(PUBLIC_DIR, webp.replace(/^\//, ''));
  return existsSync(onDisk) ? webp : src;
}
