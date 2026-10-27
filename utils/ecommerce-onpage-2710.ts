/**
 * Slug-scoped /agencia-e-commerce on-page (SEO tanda 27 oct 2026, bloque 2).
 * Body HTML only. Header/footer stay outside this fragment.
 */

export const ECOMMERCE_ONPAGE_SLUG = 'agencia-e-commerce';

export const ECOMMERCE_H1_BEFORE =
  'Tu Agencia e-Commerce para Resultados Reales';
export const ECOMMERCE_H1_AFTER =
  'Agencia de ecommerce para marcas D2C que ya facturan';

export const ECOMMERCE_FIRST_H2_BEFORE = 'Agencia E-commerce';
export const ECOMMERCE_FIRST_H2_AFTER =
  '¿Qué hace una agencia de ecommerce para una marca D2C?';

export const ECOMMERCE_H2_ANSWER_HOLE =
  '[COPY SIN FIRMAR — Contenido: respuesta citable de 40-60 palabras bajo el primer H2 de /agencia-e-commerce]';

export const ECOMMERCE_JUMEX_CASE_HREF =
  '/casos-de-exito/jumex-shopify-dtc-ecommerce';
export const ECOMMERCE_ODWALLA_CASE_HREF =
  '/casos-de-exito/odwalla-shopify-dtc-ecommerce';
export const ECOMMERCE_JUMEX_CASE_ANCHOR = 'caso Jumex en Shopify';
export const ECOMMERCE_ODWALLA_CASE_ANCHOR = 'caso Odwalla en Shopify';

const H1_RE =
  /<h1 class="elementor-heading-title elementor-size-default">Tu Agencia e-Commerce para Resultados Reales<\/h1>/;

const FIRST_H2_RE =
  /<h2 class="elementor-heading-title elementor-size-default">Agencia E-commerce<\/h2>/;

const CASE_LINKS_HTML =
  `<p data-playful-ecom-case-links="2710">` +
  `<a href="${ECOMMERCE_JUMEX_CASE_HREF}">${ECOMMERCE_JUMEX_CASE_ANCHOR}</a>` +
  ' · ' +
  `<a href="${ECOMMERCE_ODWALLA_CASE_HREF}">${ECOMMERCE_ODWALLA_CASE_ANCHOR}</a>` +
  '</p>';

function rewriteEcommerceH1(html: string): string {
  if (html.includes(`>${ECOMMERCE_H1_AFTER}<`)) return html;
  return html.replace(
    H1_RE,
    `<h1 class="elementor-heading-title elementor-size-default">${ECOMMERCE_H1_AFTER}</h1>`,
  );
}

function rewriteEcommerceFirstH2(html: string): string {
  if (html.includes(`>${ECOMMERCE_FIRST_H2_AFTER}<`)) {
    if (html.includes(ECOMMERCE_H2_ANSWER_HOLE)) return html;
    return html.replace(
      `<h2 class="elementor-heading-title elementor-size-default">${ECOMMERCE_FIRST_H2_AFTER}</h2>`,
      `<h2 class="elementor-heading-title elementor-size-default">${ECOMMERCE_FIRST_H2_AFTER}</h2>` +
        `<p data-playful-copy-hole="ecom-h2-answer">${ECOMMERCE_H2_ANSWER_HOLE}</p>`,
    );
  }
  return html.replace(
    FIRST_H2_RE,
    `<h2 class="elementor-heading-title elementor-size-default">${ECOMMERCE_FIRST_H2_AFTER}</h2>` +
      `<p data-playful-copy-hole="ecom-h2-answer">${ECOMMERCE_H2_ANSWER_HOLE}</p>`,
  );
}

function insertEcommerceCaseLinks(html: string): string {
  if (html.includes('data-playful-ecom-case-links="2710"')) return html;

  const afterVisible = html.replace(
    '<h2 class="main-heading">No confíes solo en nuestra palabra, mira los resultados</h2>',
    `<h2 class="main-heading">No confíes solo en nuestra palabra, mira los resultados</h2>${CASE_LINKS_HTML}`,
  );
  if (afterVisible !== html) return afterVisible;

  return html.replace(
    '<h2 class="main-heading">Marcas que han trabajado con nosotros</h2>',
    `<h2 class="main-heading">Marcas que han trabajado con nosotros</h2>${CASE_LINKS_HTML}`,
  );
}

/**
 * On /agencia-e-commerce only: H1, first H2 + copy hole, Jumex/Odwalla
 * anchors in the brands/results block. Other slugs are a no-op.
 */
export function rewriteEcommerceOnpage2710(html: string, slug: string): string {
  if (!html || slug !== ECOMMERCE_ONPAGE_SLUG) return html;
  return insertEcommerceCaseLinks(rewriteEcommerceFirstH2(rewriteEcommerceH1(html)));
}
