import type {
  QaBusinessType,
  QaFiltroAnswers,
  QaPlatform,
  QaRevenue,
  QaSelling,
  QaThirdParty,
} from './types.ts';

export const QA_SELLING_LABELS: Record<QaSelling, string> = {
  vendo_online: 'Vendo online',
  vendo_fisica_sin_online: 'Vendo en tienda física, sin tienda online',
  vendo_ambos: 'Vendo en ambos',
  aun_no_vendo: 'Aún no vendo',
};

export const QA_PLATFORM_LABELS: Record<QaPlatform, string> = {
  shopify: 'Shopify',
  woocommerce: 'WooCommerce',
  vtex: 'VTEX',
  magento_adobe: 'Magento-Adobe',
  otra: 'Otra',
  sin_tienda_online: 'No tengo tienda online',
};

export const QA_REVENUE_LABELS: Record<QaRevenue, string> = {
  under_10k: '<10k',
  '10k_50k': '10–50k',
  '50k_100k': '50–100k',
  '100k_250k': '100–250k',
  over_250k: '>250k',
};

export const QA_BUSINESS_LABELS: Record<QaBusinessType, string> = {
  marca_d2c: 'Marca propia que vende a cliente final',
  revendedor: 'Revendedor, distribuidor o busco proveedores',
  agencia: 'Agencia o freelance',
};

export const QA_THIRD_PARTY_LABELS: Record<QaThirdParty, string> = {
  si: 'Sí',
  no: 'No',
};

export function formatQaFiltroNote(answers: QaFiltroAnswers): string {
  return [
    '[QA filtro reunión — preview]',
    `¿Ya vendes?: ${QA_SELLING_LABELS[answers.selling]}`,
    `Plataforma: ${QA_PLATFORM_LABELS[answers.platform]}`,
    `Facturación tienda online: ${QA_REVENUE_LABELS[answers.revenueOnline]}`,
    `Facturación otros canales: ${QA_REVENUE_LABELS[answers.revenueOtherChannels]}`,
    `Tipo de negocio: ${QA_BUSINESS_LABELS[answers.businessType]}`,
    `¿Terceros/distribuidores?: ${QA_THIRD_PARTY_LABELS[answers.thirdParty]}`,
  ].join('\n');
}
