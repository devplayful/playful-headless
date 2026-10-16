/**
 * Instagram @somosplayful link-in-bio (/links). Edit `href` on the first entry
 * when rotating the weekly hero link (e.g. Cashea post from 21 Oct).
 */
export type LinksBioEntry = {
  /** Visible button text — must match the destination page title. */
  label: string;
  /** Site path; may include an existing query string (preserved when adding UTMs). */
  href: string;
};

export const LINKS_BIO_ENTRIES: readonly LinksBioEntry[] = [
  {
    label: 'Zelle en Venezuela: cobra en tu tienda online | Playful',
    href: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  },
  {
    label: 'Llamada diagnóstica',
    href: '/reunion-playful',
  },
  {
    label: 'Agencia Shopify para marcas que ya venden | Playful Agency',
    href: '/agencia-shopify',
  },
  {
    label: 'SoyTechno: el eCommerce que entendió cómo paga y confía Venezuela',
    href: '/casos-de-exito/soytechno-ecommerce-venezuela',
  },
  {
    label: 'Playful Agency | Hacemos tu Tienda Online o E-commerce',
    href: '/',
  },
];

const UTM_SOURCE = 'instagram';
const UTM_MEDIUM = 'social';
const UTM_CONTENT = 'bio';

/** Last path segment for campaign; home uses `home`. */
export function utmCampaignForHref(href: string): string {
  const pathOnly = href.split('?')[0]?.replace(/\/$/, '') ?? '';
  if (!pathOnly || pathOnly === '/') return 'home';
  const segments = pathOnly.split('/').filter(Boolean);
  return segments[segments.length - 1] ?? 'home';
}

/** Append Instagram bio UTMs without dropping an existing query on `href`. */
export function buildLinksBioHref(href: string): string {
  const question = href.indexOf('?');
  const path = question === -1 ? href : href.slice(0, question);
  const existing = question === -1 ? '' : href.slice(question + 1);
  const params = new URLSearchParams(existing);
  params.set('utm_source', UTM_SOURCE);
  params.set('utm_medium', UTM_MEDIUM);
  params.set('utm_campaign', utmCampaignForHref(path));
  params.set('utm_content', UTM_CONTENT);
  const query = params.toString();
  return query ? `${path}?${query}` : path;
}
