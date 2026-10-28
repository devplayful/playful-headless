/**
 * Body appends/rewrites from playful-copy #380 SHA 11b38dc.
 * Only when the live original is present. Never invent the stem.
 * PENDIENTE_FIRMA_JOSE_380 — redline de José, no producción.
 */

import { PENDIENTE_FIRMA_JOSE_380 } from './pendiente-firma-jose-380.ts';

export type BlogSeo380Append = {
  id: 'E1' | 'E2' | 'E3' | 'S1' | 'S2' | 'S3';
  slug: string;
  /** Exact live HTML fragment (tags included when WP wraps a word). */
  find: string;
  replace: string;
};

// PENDIENTE_FIRMA_JOSE_380 — marca en código, no en el HTML renderizado.
void PENDIENTE_FIRMA_JOSE_380;

export const BLOG_SEO_380_APPENDS: readonly BlogSeo380Append[] = [
  {
    id: 'E1',
    slug: 'desarrollo-de-aplicaciones-web',
    find: 'Pero antes de dar este paso es necesario que evalúes si es realmente lo que necesitas.',
    replace:
      'Pero antes de dar este paso es necesario que evalúes si es realmente lo que necesitas. Si lo que te hace falta es mejorar la tienda online de tu negocio, también trabajamos como <a href="/agencia-e-commerce">agencia de ecommerce para marcas que ya venden</a>.',
  },
  {
    id: 'E2',
    slug: 'que-es-una-agencia-de-sem',
    find: 'y estamos aquí para ayudarte a alcanzar tus metas.',
    replace:
      'y estamos aquí para ayudarte a alcanzar tus metas. Si tienes un <a href="/agencia-e-commerce">ecommerce que ya vende</a>, también trabajamos la tienda que recibe ese tráfico.',
  },
  {
    id: 'E3',
    slug: 'seo-y-sem-que-son-y-en-que-se-diferencian',
    find: 'Lo ideal, es combinar ambas estrategias para conseguir los objetivos deseados.',
    replace:
      'Lo ideal, es combinar ambas estrategias para conseguir los objetivos deseados y, si vendes por internet, sumarlas a la <a href="/agencia-e-commerce">estrategia para tu tienda online</a>.',
  },
  {
    id: 'S1',
    slug: 'crear-un-e-commerce',
    // Live HTML wraps Shopify in <strong>; the untagged phrase is not contiguous.
    find: '<strong>Shopify</strong> ofrece soporte 24/7, lo que te da tranquilidad si algo sale mal.',
    replace:
      'Si montas una <a href="/agencia-shopify">tienda en Shopify</a>, la plataforma ofrece soporte 24/7, lo que te da tranquilidad si algo sale mal.',
  },
  {
    id: 'S2',
    slug: 'los-5-problemas-de-e-commerce',
    find: '<strong>Solución:</strong> Optimizar el proceso de compra es clave.',
    replace:
      '<strong>Solución:</strong> Optimizar el proceso de compra es clave. Si vendes con Shopify, ese trabajo empieza por el <a href="/agencia-shopify">checkout de tu tienda Shopify</a>.',
  },
  {
    id: 'S3',
    slug: 'cintillos-de-promocion',
    find: 'aprovechen al máximo las ofertas que tienes para ellos.',
    replace:
      'aprovechen al máximo las ofertas que tienes para ellos. Si vendes con Shopify, en Playful hacemos el <a href="/agencia-shopify">diseño de tu tienda en Shopify</a> para móvil y escritorio.',
  },
];

/**
 * Slug-scoped. Idempotent. Missing `find` is a no-op (do not invent).
 */
export function rewriteBlogSeo380Appends(html: string, slug: string): string {
  if (!html || !slug) return html;
  let out = html;
  for (const item of BLOG_SEO_380_APPENDS) {
    if (item.slug !== slug) continue;
    if (out.includes(item.replace)) continue;
    if (!out.includes(item.find)) continue;
    out = out.replace(item.find, item.replace);
  }
  return out;
}
