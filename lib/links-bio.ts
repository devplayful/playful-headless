import { CONTACT_HREF } from '../utils/booking.ts';

/**
 * Instagram link-in-bio (/links). Keep a single ordered array so Cashea
 * can be inserted as the first item later without reshuffling the rest.
 */
export type LinksBioEntry = {
  label: string;
  path: string;
};

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
