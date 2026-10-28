/**
 * Slug-scoped Elementor rewriter for /agencia-e-commerce (GO 28 oct 2026).
 * Body HTML only. Does not touch title, meta, H1, header, footer or CSS.
 */

import { AGENCIA_SEO_HREF, AGENCIA_UX_UI_HREF } from './broken-internal-hrefs.ts';
import { SOYTECHNO_CASE_HREF } from './ecommerce-soytechno-case-link.ts';
import { PENDIENTE_FIRMA_JOSE_380 } from './pendiente-firma-jose-380.ts';

export { PENDIENTE_FIRMA_JOSE_380 };

export const ECOMMERCE_AEO_SLUG = 'agencia-e-commerce';

export const ECOM_H2_LIVE = 'Agencia E-commerce';
export const ECOM_H2_SIGNED =
  'Agencia e-commerce para marcas que ya venden en Venezuela, LATAM y España';

/**
 * H2 that José will sign in playful-copy #377.
 * Empty until that copy is signed — do not invent the phrase.
 * When set, it replaces the live H2 «Agencia E-commerce» and the tanda 6
 * H2 (`ECOM_H2_SIGNED`) is inserted as a new H2 immediately after, before
 * «¿Buscas una Agencia e-Commerce que Hable Claro?».
 */
export const ECOM_H2_JOSE = '';
export const ECOM_H2_JOSE_COPY_ISSUE = 'playful-copy#377';
export const ECOM_HABLE_CLARO = '¿Buscas una Agencia e-Commerce que Hable Claro?';

export const ECOM_INTRO_PLACEHOLDER_ATTR = 'agencia-e-commerce-intro';

/** PENDIENTE_FIRMA_JOSE_380 — párrafo bajo el H2, literal de #380. */
export const ECOM_INTRO_HTML_380 =
  'Trabajamos desde Venezuela con marcas que ya venden online, y lo hacemos para Venezuela, para el resto de Latinoamérica y para España. En Venezuela eso pasa por integrar en el checkout los pagos que usan tus compradores, como Zelle para cobrar en dólares y Cashea para vender en cuotas. En <a href="/casos-de-exito/soytechno-ecommerce-venezuela">SoyTechno</a> desarrollamos un checkout propio que muestra los métodos de pago según la moneda que elige el comprador, y ahí logramos la primera integración de Cashea en web.';

/** PENDIENTE_FIRMA_JOSE_380 — respuesta FAQ visible (href relativo). */
export const ECOM_VE_FAQ_ANSWER_HTML =
  'Sí, si tu marca ya vende online, esté en Caracas o en cualquier otra ciudad del país. Trabajamos sobre la tienda que ya tienes, incluidos pagos locales como Zelle y Cashea, y en <a href="/casos-de-exito/soytechno-ecommerce-venezuela">el caso SoyTechno</a> puedes ver cómo integramos esos pagos en una tienda de tecnología venezolana.';

/** PENDIENTE_FIRMA_JOSE_380 — mismo texto en JSON-LD con href absoluto. */
export const ECOM_VE_FAQ_ANSWER_JSONLD =
  'Sí, si tu marca ya vende online, esté en Caracas o en cualquier otra ciudad del país. Trabajamos sobre la tienda que ya tienes, incluidos pagos locales como Zelle y Cashea, y en <a href="https://playfulagency.com/casos-de-exito/soytechno-ecommerce-venezuela">el caso SoyTechno</a> puedes ver cómo integramos esos pagos en una tienda de tecnología venezolana.';

export const ECOM_VE_FAQ_QUESTION_PREV =
  '¿Trabajáis con marcas de Caracas y del resto de Venezuela?';

export const ECOM_VE_FAQ_QUESTION =
  '¿Puedo trabajar con Playful si mi marca está en Caracas o en otra ciudad de Venezuela?';

export function isJoseH2Signed(joseH2: string = ECOM_H2_JOSE): boolean {
  return Boolean(joseH2 && joseH2.trim());
}

export const SOYTECHNO_CASE_ANCHOR = 'ecommerce en Venezuela: el caso SoyTechno';

/** D6 — SEO1. Live HTML 28 oct 2026, bajo el H3. playful-copy #380 SHA d4844d5. */
export const ECOM_D6_H3 = 'SEO que Encuentra a tus Clientes';
export const ECOM_D6_ORIGINAL =
  'No es magia, es estrategia. Trabajamos el SEO de tu e-commerce para que quienes buscan productos como los tuyos, te encuentren primero.';
export const ECOM_D6_APPEND =
  ` En <a href="${AGENCIA_SEO_HREF}">SEO para tu tienda online</a> te contamos cómo elegimos las palabras clave que busca tu audiencia y cómo ajustamos la tienda cuando cambian los buscadores.`;

/** D7 — UX3. Live HTML 28 oct 2026, bajo el H3. playful-copy #380 SHA d4844d5. */
export const ECOM_D7_H3 = 'Diseño que Vende (y Convence)';
export const ECOM_D7_ORIGINAL =
  '¿Bonito y funcional? ¡Sí, se puede! Diseñamos una tienda visualmente atractiva que haga que tus clientes quieran añadir al carrito y no mirar atrás.';
export const ECOM_D7_APPEND =
  ` En el <a href="${AGENCIA_UX_UI_HREF}">diseño UX/UI de tu tienda</a> simplificamos la navegación para que tus clientes encuentren lo que buscan sin perderse.`;

const H2_LIVE_HTML =
  '<h2 class="elementor-heading-title elementor-size-default">Agencia E-commerce</h2>';
const H2_SIGNED_HTML =
  `<h2 class="elementor-heading-title elementor-size-default">${ECOM_H2_SIGNED}</h2>`;

const INTRO_PLACEHOLDER_HTML =
  `<p data-copy-pending="${ECOM_INTRO_PLACEHOLDER_ATTR}">${ECOM_INTRO_HTML_380}</p>`;

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
					<div id="elementor-tab-content-playful-ve" class="elementor-tab-content elementor-clearfix" data-tab="6" role="region" aria-labelledby="elementor-tab-title-playful-ve"><p data-copy-pending="faq-caracas-venezuela">${ECOM_VE_FAQ_ANSWER_HTML}</p></div>
				</div>`;

const CASE_LINK_HTML =
  `<p data-playful-soytechno-case="1"><a href="${SOYTECHNO_CASE_HREF}">${SOYTECHNO_CASE_ANCHOR}</a></p>`;

function ensureIntroAfterSignedH2(html: string): string {
  let out = html;
  if (
    out.includes(ECOM_H2_SIGNED) &&
    !out.includes(`data-copy-pending="${ECOM_INTRO_PLACEHOLDER_ATTR}"`)
  ) {
    return out.replace(H2_SIGNED_HTML, `${H2_SIGNED_HTML}${INTRO_PLACEHOLDER_HTML}`);
  }
  return out;
}

/**
 * Prepared order for when José signs playful-copy #377.
 * Not called from production until `ECOM_H2_JOSE` is a non-empty signed literal.
 */
export function applyJoseThenTanda6H2Order(html: string, joseH2: string): string {
  if (!isJoseH2Signed(joseH2)) return html;
  const joseHtml = `<h2 class="elementor-heading-title elementor-size-default">${joseH2}</h2>`;
  let out = html;
  if (out.includes(H2_LIVE_HTML)) {
    out = out.replace(H2_LIVE_HTML, joseHtml);
  }
  if (out.includes(joseHtml) && !out.includes(H2_SIGNED_HTML)) {
    const joseEnd = out.indexOf(joseHtml) + joseHtml.length;
    out = `${out.slice(0, joseEnd)}${H2_SIGNED_HTML}${out.slice(joseEnd)}`;
  }
  return ensureIntroAfterSignedH2(out);
}

function rewriteH2AndIntro(html: string, joseH2: string = ECOM_H2_JOSE): string {
  if (isJoseH2Signed(joseH2)) {
    return applyJoseThenTanda6H2Order(html, joseH2);
  }
  let out = html;
  if (out.includes(H2_LIVE_HTML)) {
    out = out.replace(H2_LIVE_HTML, H2_SIGNED_HTML);
  }
  return ensureIntroAfterSignedH2(out);
}

function appendFaqItem(html: string): string {
  let out = html;
  if (out.includes(ECOM_VE_FAQ_QUESTION_PREV)) {
    out = out.split(ECOM_VE_FAQ_QUESTION_PREV).join(ECOM_VE_FAQ_QUESTION);
  }
  if (out.includes(ECOM_VE_FAQ_QUESTION)) return out;
  const titleIdx = out.indexOf(LAST_LIVE_FAQ);
  if (titleIdx < 0) return out;
  const itemStart = out.lastIndexOf('<div class="elementor-accordion-item">', titleIdx);
  if (itemStart < 0) return out;
  const contentMark = out.indexOf('elementor-tab-content', titleIdx);
  if (contentMark < 0) return out;
  const contentOpenEnd = out.indexOf('>', contentMark);
  if (contentOpenEnd < 0) return out;
  const contentClose = out.indexOf('</div>', contentOpenEnd);
  if (contentClose < 0) return out;
  const itemClose = out.indexOf('</div>', contentClose + 6);
  if (itemClose < 0) return out;
  const insertAt = itemClose + 6;
  return out.slice(0, insertAt) + FAQ_ITEM_HTML + out.slice(insertAt);
}

/**
 * Append D6/D7 after the live original under each H3.
 * Missing original is a no-op — do not invent the stem.
 */
function appendD6D7(html: string): string {
  let out = html;
  const items = [
    { h3: ECOM_D6_H3, original: ECOM_D6_ORIGINAL, append: ECOM_D6_APPEND },
    { h3: ECOM_D7_H3, original: ECOM_D7_ORIGINAL, append: ECOM_D7_APPEND },
  ];
  for (const item of items) {
    const replaced = `${item.original}${item.append}`;
    if (out.includes(replaced)) continue;
    if (!out.includes(item.h3) || !out.includes(item.original)) continue;
    out = out.replace(item.original, replaced);
  }
  return out;
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
export function rewriteEcommerceAeo2810(
  html: string,
  slug: string,
  options?: { joseH2?: string },
): string {
  if (!html || slug !== ECOMMERCE_AEO_SLUG) return html;
  const joseH2 = options?.joseH2 ?? ECOM_H2_JOSE;
  return appendD6D7(
    insertSoytechnoCaseAnchor(appendFaqItem(rewriteH2AndIntro(html, joseH2))),
  );
}
