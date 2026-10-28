/**
 * Slug-scoped Elementor rewriter for /agencia-e-commerce (GO 28 oct 2026).
 * Body HTML only. Does not touch title, meta, H1, header, footer or CSS.
 */

import { SOYTECHNO_CASE_HREF } from './ecommerce-soytechno-case-link.ts';

export const ECOMMERCE_AEO_SLUG = 'agencia-e-commerce';

export const ECOM_H2_LIVE = 'Agencia E-commerce';
export const ECOM_H2_SIGNED =
  'Agencia e-commerce para marcas que ya venden en Venezuela, LATAM y España';

export const COPY_UNSIGNED = 'COPY SIN FIRMAR';
export const ECOM_INTRO_PLACEHOLDER_ATTR = 'agencia-e-commerce-intro';

export const ECOM_VE_FAQ_QUESTION =
  '¿Trabajáis con marcas de Caracas y del resto de Venezuela?';

export const SOYTECHNO_CASE_ANCHOR = 'ecommerce en Venezuela: el caso SoyTechno';

const H2_LIVE_HTML =
  '<h2 class="elementor-heading-title elementor-size-default">Agencia E-commerce</h2>';
const H2_SIGNED_HTML =
  `<h2 class="elementor-heading-title elementor-size-default">${ECOM_H2_SIGNED}</h2>`;

const INTRO_PLACEHOLDER_HTML =
  `<p data-copy-pending="${ECOM_INTRO_PLACEHOLDER_ATTR}">${COPY_UNSIGNED}</p>`;

const LAST_LIVE_FAQ =
  '¿Puedo trabajar con una agencia e-commerce si ya tengo una tienda en línea?';

const FAQ_ITEM_HTML = `
<div class="elementor-accordion-item" data-copy-pending="faq-caracas-venezuela">
					<div id="elementor-tab-title-playful-ve" class="elementor-tab-title" data-tab="6" role="button" aria-controls="elementor-tab-content-playful-ve" aria-expanded="false">
													<span class="elementor-accordion-icon elementor-accordion-icon-left" aria-hidden="true">
															<span class="elementor-accordion-icon-closed"><i class="fas fa-plus"></i></span>
								<span class="elementor-accordion-icon-opened"><i class="fas fa-minus"></i></span>
														</span>
												<a class="elementor-accordion-title" tabindex="0">${ECOM_VE_FAQ_QUESTION}</a>
					</div>
					<div id="elementor-tab-content-playful-ve" class="elementor-tab-content elementor-clearfix" data-tab="6" role="region" aria-labelledby="elementor-tab-title-playful-ve"><p data-copy-pending="faq-caracas-venezuela">${COPY_UNSIGNED}</p></div>
				</div>`;

const CASE_LINK_HTML =
  `<p data-playful-soytechno-case="1"><a href="${SOYTECHNO_CASE_HREF}">${SOYTECHNO_CASE_ANCHOR}</a></p>`;

function rewriteH2AndIntro(html: string): string {
  let out = html;
  if (out.includes(H2_LIVE_HTML)) {
    out = out.replace(H2_LIVE_HTML, H2_SIGNED_HTML);
  }
  if (
    out.includes(ECOM_H2_SIGNED) &&
    !out.includes(`data-copy-pending="${ECOM_INTRO_PLACEHOLDER_ATTR}"`)
  ) {
    out = out.replace(H2_SIGNED_HTML, `${H2_SIGNED_HTML}${INTRO_PLACEHOLDER_HTML}`);
  }
  return out;
}

function appendFaqItem(html: string): string {
  if (html.includes(ECOM_VE_FAQ_QUESTION)) return html;
  const titleIdx = html.indexOf(LAST_LIVE_FAQ);
  if (titleIdx < 0) return html;
  const itemStart = html.lastIndexOf('<div class="elementor-accordion-item">', titleIdx);
  if (itemStart < 0) return html;
  const contentMark = html.indexOf('elementor-tab-content', titleIdx);
  if (contentMark < 0) return html;
  const contentOpenEnd = html.indexOf('>', contentMark);
  if (contentOpenEnd < 0) return html;
  const contentClose = html.indexOf('</div>', contentOpenEnd);
  if (contentClose < 0) return html;
  const itemClose = html.indexOf('</div>', contentClose + 6);
  if (itemClose < 0) return html;
  const insertAt = itemClose + 6;
  return html.slice(0, insertAt) + FAQ_ITEM_HTML + html.slice(insertAt);
}

function insertSoytechnoCaseAnchor(html: string): string {
  if (html.includes(SOYTECHNO_CASE_ANCHOR)) return html;
  const resultsH2 =
    '<h2 class="main-heading">No confíes solo en nuestra palabra, mira los resultados</h2>';
  if (html.includes(resultsH2)) {
    return html.replace(resultsH2, `${resultsH2}${CASE_LINK_HTML}`);
  }
  const marcasH2 = '<h2 class="main-heading">Marcas que han trabajado con nosotros</h2>';
  if (html.includes(marcasH2)) {
    return html.replace(marcasH2, `${marcasH2}${CASE_LINK_HTML}`);
  }
  return html;
}

/**
 * On /agencia-e-commerce only. Idempotent. Other slugs are a no-op.
 */
export function rewriteEcommerceAeo2810(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_AEO_SLUG) return html;
  return insertSoytechnoCaseAnchor(appendFaqItem(rewriteH2AndIntro(html)));
}
