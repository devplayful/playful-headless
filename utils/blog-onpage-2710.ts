/**
 * Slug-scoped blog on-page (SEO tanda 27 oct 2026, bloque 2).
 * Zelle + CIMA only. The shared blog template stays as-is for every
 * other post (visible title remains H2; final CTA stays on Contactar).
 */
import { ZELLE_VE_BLOG_SLUG } from '../lib/blog-body-overrides.ts';
import { CONTACT_HREF, SERVICE_BOOKING_HREF } from './booking.ts';

export const CIMA_BLOG_SLUG = 'premios-cima-2026-soytechno-playful';

export const BLOG_ONPAGE_2710_SLUGS = Object.freeze([
  ZELLE_VE_BLOG_SLUG,
  CIMA_BLOG_SLUG,
] as const);

export type BlogOnpage2710Slug = (typeof BLOG_ONPAGE_2710_SLUGS)[number];

export function isBlogOnpage2710Slug(
  slug: string | undefined | null,
): slug is BlogOnpage2710Slug {
  return Boolean(slug && (BLOG_ONPAGE_2710_SLUGS as readonly string[]).includes(slug));
}

/** Visible hero title is an H2 that repeats the H1 on the shared template. */
export function blogHeroTitleIsH2Duplicate(slug: string | undefined | null): boolean {
  return isBlogOnpage2710Slug(slug);
}

export const UNSIGNED_FINAL_CTA_BUTTON =
  '[COPY SIN FIRMAR — Contenido: texto del botón del CTA final. Destino: /reunion-playful]';

export function blogFinalCtaHref(slug: string | undefined | null): string {
  return isBlogOnpage2710Slug(slug) ? SERVICE_BOOKING_HREF : CONTACT_HREF;
}

export function blogFinalCtaButtonText(slug: string | undefined | null): string {
  return isBlogOnpage2710Slug(slug)
    ? UNSIGNED_FINAL_CTA_BUTTON
    : 'Llena el formulario y hablemos sobre tu web';
}

export const ZELLE_CIERRE_HOLE =
  '[COPY SIN FIRMAR — Contenido: cierre de servicio del post Zelle. El bloque debe pedir el servicio de integración, no la cuenta de Zelle.]';

export const ZELLE_CIERRE_BUTTON_HOLE =
  '[COPY SIN FIRMAR — Contenido: texto del botón de cierre a /reunion-playful]';

export const ZELLE_CIERRE_SHOPIFY_ANCHOR =
  'integrar Zelle y pagos locales en tu tienda Shopify';

export const ZELLE_CIERRE_HTML = `
<div data-playful-zelle-cierre="2710">
<p>${ZELLE_CIERRE_HOLE}</p>
<p><a href="/agencia-shopify">${ZELLE_CIERRE_SHOPIFY_ANCHOR}</a></p>
<p><a href="/reunion-playful">${ZELLE_CIERRE_BUTTON_HOLE}</a></p>
</div>
`.trim();

/** FAQ H3s on CIMA that repeat nearby H2s (checklist 8 / 21). */
export const CIMA_FAQ_H3S = Object.freeze([
  '¿Qué son los premios CIMA?',
  '¿Cuándo y dónde fue la gala de los Premios CIMA 2026?',
  '¿Quién ganó los Premios CIMA 2026 en Plataforma de E-commerce?',
  '¿Qué consiguió SoyTechno en 2025?',
] as const);

const CIMA_FAQ_H3_SET = new Set<string>(CIMA_FAQ_H3S);

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * On CIMA only: turn the FAQ H3s into visible questions without an Hn tag
 * so they leave the heading tree. Other posts are a no-op.
 */
export function demoteCimaFaqHeadings(
  html: string,
  slug: string | undefined | null,
): string {
  if (!html || slug !== CIMA_BLOG_SLUG) return html;
  return html.replace(/<h3\b([^>]*)>([\s\S]*?)<\/h3>/gi, (full, attrs: string, inner: string) => {
    const text = stripTags(inner);
    if (!CIMA_FAQ_H3_SET.has(text)) return full;
    const id = /\bid\s*=\s*(["'])([^"']*)\1/i.exec(attrs)?.[2] || '';
    const idAttr = id ? ` id="${id}"` : '';
    return `<p data-playful-faq-q="cima-2710" class="playful-faq-question"${idAttr}><strong>${text}</strong></p>`;
  });
}

/**
 * SoyTechno is WooCommerce, not Shopify. Acción 8 said: if the store is
 * not Shopify, keep /agencia-e-commerce (already in the body) and warn SEO.
 */
export const CIMA_SHOPIFY_LINK_DECISION = Object.freeze({
  addAgenciaShopify: false,
  reason:
    'SoyTechno es WooCommerce (no Shopify). Se mantiene el enlace existente a /agencia-e-commerce. Aviso a SEO: no se inyecta /agencia-shopify.',
  existingHref: '/agencia-e-commerce',
} as const);
