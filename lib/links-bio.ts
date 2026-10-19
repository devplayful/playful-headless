import { ogJpegForPath } from './og-images.ts';
import { CONTACT_HREF } from '../utils/booking.ts';

/**
 * Instagram link-in-bio (/links). Keep a single ordered array so Cashea
 * can be inserted as the first item later without reshuffling the rest.
 */
export type LinksBioEntry = {
  label: string;
  path: string;
};

export type LinksBioThumb = {
  src: string;
  isFallback: boolean;
};

export const LINKS_BIO_UTM =
  '?utm_source=instagram&utm_medium=social&utm_campaign=bio';

/** Square thumb fallback when WP featured / OG / portada is missing. */
export const LINKS_BIO_FALLBACK_THUMB = '/images/logos/playful-logov.svg';

export const LINKS_BIO_ENTRIES: readonly LinksBioEntry[] = [
  // Cashea: add first when that campaign is ready.
  {
    label: 'Cómo integrar Zelle en tu tienda',
    path: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  },
  {
    label: 'Casos de éxito',
    path: '/casos-de-exito',
  },
  {
    label: 'Agencia e-commerce',
    path: '/agencia-e-commerce',
  },
  {
    label: 'Agencia Shopify',
    path: '/agencia-shopify',
  },
  {
    label: 'Contacto',
    path: CONTACT_HREF,
  },
];

export function buildLinksBioHref(path: string): string {
  return `${path}${LINKS_BIO_UTM}`;
}

export function linksBioBlogSlug(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  if (parts[0] !== 'blog' || parts.length < 2) return null;
  return parts[parts.length - 1] ?? null;
}

/**
 * Blog: WP featured media (already cover-resolved).
 * Service / static pages: OG JPEG, which is the production portada.
 * Last resort: Playful logo.
 */
export function resolveLinksBioThumb(
  path: string,
  featuredMediaUrl?: string | null,
): LinksBioThumb {
  if (typeof featuredMediaUrl === 'string' && featuredMediaUrl.trim()) {
    return { src: featuredMediaUrl.trim(), isFallback: false };
  }
  const og = ogJpegForPath(path);
  if (og) {
    return { src: og, isFallback: false };
  }
  return { src: LINKS_BIO_FALLBACK_THUMB, isFallback: true };
}
