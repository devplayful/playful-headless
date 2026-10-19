import { CONTACT_HREF } from '../utils/booking.ts';

/**
 * Instagram link-in-bio (/links). Keep a single ordered array so Cashea
 * can be inserted as the first item later without reshuffling the rest.
 */
export type LinksBioEntry = {
  label: string;
  path: string;
};

/** Square thumb fallback when the href is not a blog post or has no cover. */
export const LINKS_BIO_FALLBACK_THUMB = '/images/logos/playful-logov.svg';

/** Last segment of `/blog/{category}/{slug}` (and longer WP paths). */
export function linksBioArticleSlug(path: string): string | null {
  const pathname = (path.split('?')[0] || '').replace(/\/+$/, '');
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length < 3 || parts[0] !== 'blog') return null;
  return parts[parts.length - 1] || null;
}

export const LINKS_BIO_UTM =
  '?utm_source=instagram&utm_medium=social&utm_campaign=bio';

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
