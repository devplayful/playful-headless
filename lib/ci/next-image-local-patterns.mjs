/**
 * Debe coincidir con images.localPatterns en next.config.js (guard CI).
 */
export const NEXT_IMAGE_LOCAL_PATTERNS = [
  '/wp-static/**',
  '/wp-media/**',
  '/images/**',
  '/casos/**',
];

export function pathMatchesNextImageLocalPattern(pathname) {
  if (!pathname || !pathname.startsWith('/')) return false;
  const clean = pathname.split('?')[0];
  for (const pattern of NEXT_IMAGE_LOCAL_PATTERNS) {
    const base = pattern.replace(/\*\*$/, '');
    if (pattern.endsWith('/**') && clean.startsWith(base)) return true;
    if (clean === pattern) return true;
  }
  return false;
}