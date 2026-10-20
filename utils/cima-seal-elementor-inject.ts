import { buildCimaSealPictureHtml } from '@/lib/cima-award-seal';

/** Client-logo carousel on /agencia-e-commerce (Elementor widget id). */
const ECOM_CLIENT_CAROUSEL_MARKER = 'data-id="d0fefa4"';

export function injectCimaSealAgenciaEcommerce(html: string, slug: string): string {
  if (slug !== 'agencia-e-commerce') return html;
  if (!html.includes(ECOM_CLIENT_CAROUSEL_MARKER)) return html;
  if (html.includes('playful-cima-award-seal')) return html;

  const seal = buildCimaSealPictureHtml('agency');
  return html.replace(
    `<div class="elementor-element elementor-element-d0fefa4`,
    `${seal}<div class="elementor-element elementor-element-d0fefa4`,
  );
}
