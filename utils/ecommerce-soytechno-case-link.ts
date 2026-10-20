/**
 * Slug-scoped Elementor rewriter: the «Últimas entradas» SoyTechno card on
 * /agencia-e-commerce still pointed at the CIMA press post. Point it at the
 * published case study (GSC brief 20 oct 2026). Body HTML only.
 */

export const ECOMMERCE_SOYTECHNO_CASE_SLUG = 'agencia-e-commerce';

export const SOYTECHNO_CASE_HREF = '/casos-de-exito/soytechno-ecommerce-venezuela';

const CIMA_SOYTECHNO_HREF_RE =
  /href=(["'])(?:https:\/\/(?:endpoint\.|www\.)?playfulagency\.com)?\/blog\/otros\/premios-cima-2026-soytechno-playful\/?\1/gi;

/**
 * On /agencia-e-commerce only: CIMA carousel hrefs for the SoyTechno case
 * card become the live case URL. Idempotent.
 */
export function rewriteEcommerceSoytechnoCaseLink(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_SOYTECHNO_CASE_SLUG) return html;
  if (!CIMA_SOYTECHNO_HREF_RE.test(html)) return html;
  CIMA_SOYTECHNO_HREF_RE.lastIndex = 0;
  return html.replace(CIMA_SOYTECHNO_HREF_RE, `href="${SOYTECHNO_CASE_HREF}"`);
}
