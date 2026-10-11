import { BLOG_COVER_OVERRIDES } from './blog-cover-image.ts';

const EXTRA_WEBP_SIBLINGS = [
  '/images/playful-imagen-banner.png',
  '/images/nosotros-playful-imagen.png',
  '/images/agencia-shopify/hero-gORwV7MSXO@1x.png',
  '/images/agencia-shopify/hero-gORwV7MSXO@2x.png',
] as const;

const WEBP_SIBLINGS = new Set<string>([
  ...Object.values(BLOG_COVER_OVERRIDES),
  ...EXTRA_WEBP_SIBLINGS,
]);

/**
 * Serve a same-aspect `.webp` sibling for known local PNG/JPEG sources.
 * Canonical override paths stay on PNG; only the runtime src swaps.
 * Remote URLs and unlisted files are untouched. No filesystem I/O —
 * this module is imported from client components via wordpress.ts.
 */
export function publicWebpIfPresent(src: string): string {
  if (!src || typeof src !== 'string') return src;
  if (!WEBP_SIBLINGS.has(src)) return src;
  return src.replace(/\.(png|jpe?g)$/i, '.webp');
}
