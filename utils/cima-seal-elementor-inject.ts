import { buildCimaCelebrationBreakerHtml } from '@/lib/cima-breaker';

/** Results / social-proof section on /agencia-e-commerce (after Beneficios mint block). */
const ECOM_RESULTS_SECTION_MARKER =
  'elementor-element-b43f202 elementor-section-stretched';

export function injectCimaSealAgenciaEcommerce(html: string, slug: string): string {
  if (slug !== 'agencia-e-commerce') return html;
  if (!html.includes(ECOM_RESULTS_SECTION_MARKER)) return html;
  if (html.includes('cima-breaker--celebration')) return html;

  const breaker = buildCimaCelebrationBreakerHtml('ecommerce');
  return html.replace(
    `<section class="elementor-section elementor-top-section elementor-element elementor-element-b43f202`,
    `${breaker}<section class="elementor-section elementor-top-section elementor-element elementor-element-b43f202`,
  );
}
