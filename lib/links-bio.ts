/**
 * Instagram link-in-bio (/links). Ordered list matches the 27 oct 2026 brief.
 * WhatsApp fuera hasta que haya número oficial en la web.
 */
export type LinksBioEntry = {
  label: string;
  path: string;
  utmContent: string;
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

/** Shared UTM on every /links button. Each entry adds its own utm_content. */
export const LINKS_BIO_UTM_SOURCE = 'ig';
export const LINKS_BIO_UTM_MEDIUM = 'social';
export const LINKS_BIO_UTM_CAMPAIGN = 'links';

export const LINKS_BIO_UTM =
  '?utm_source=ig&utm_medium=social&utm_campaign=links';

/** playful-copy PR #380 SHA 11b38dc. Borrador para redline de José. */
export const PENDIENTE_FIRMA_JOSE_380 = 'PENDIENTE_FIRMA_JOSE_380';

export const LINKS_BIO_ENTRIES: readonly LinksBioEntry[] = [
  {
    label: 'Reserva tu llamada diagnóstica',
    path: '/reunion-playful',
    utmContent: 'btn-llamada',
  },
  {
    // PENDIENTE_FIRMA_JOSE_380 — playful-copy #380 SHA 11b38dc, redline de José.
    label: 'Cuotas con Cashea para comercios',
    path: '/blog/tecnologia/cashea-para-comercios',
    utmContent: 'btn-cashea',
  },
  {
    label: 'Cobra con Zelle en tu tienda',
    path: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
    utmContent: 'btn-zelle',
  },
  {
    label: 'Casos',
    path: '/casos-de-exito',
    utmContent: 'btn-casos',
  },
  {
    label: 'Nuestra web',
    path: '/',
    utmContent: 'btn-web',
  },
];

export function buildLinksBioHref(
  entry: Pick<LinksBioEntry, 'path' | 'utmContent'>,
): string {
  return `${entry.path}${LINKS_BIO_UTM}&utm_content=${entry.utmContent}`;
}
