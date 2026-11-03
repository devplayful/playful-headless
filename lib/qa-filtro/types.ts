export const QA_SELLING_OPTIONS = [
  'vendo_online',
  'vendo_fisica_sin_online',
  'vendo_ambos',
  'aun_no_vendo',
] as const;

export const QA_PLATFORM_OPTIONS = [
  'shopify',
  'woocommerce',
  'vtex',
  'magento_adobe',
  'otra',
  'sin_tienda_online',
] as const;

export const QA_REVENUE_OPTIONS = [
  'under_10k',
  '10k_50k',
  '50k_100k',
  '100k_250k',
  'over_250k',
] as const;

export const QA_BUSINESS_TYPE_OPTIONS = [
  'marca_d2c',
  'revendedor',
  'agencia',
] as const;

export const QA_THIRD_PARTY_OPTIONS = ['si', 'no'] as const;

export type QaSelling = (typeof QA_SELLING_OPTIONS)[number];
export type QaPlatform = (typeof QA_PLATFORM_OPTIONS)[number];
export type QaRevenue = (typeof QA_REVENUE_OPTIONS)[number];
export type QaBusinessType = (typeof QA_BUSINESS_TYPE_OPTIONS)[number];
export type QaThirdParty = (typeof QA_THIRD_PARTY_OPTIONS)[number];

export interface QaFiltroAnswers {
  name: string;
  email: string;
  selling: QaSelling;
  platform: QaPlatform;
  revenueOnline: QaRevenue;
  revenueOtherChannels: QaRevenue;
  businessType: QaBusinessType;
  thirdParty: QaThirdParty;
  /** Informativo; campo GHL calif_equipo. */
  team: string;
}

export type QaFiltroOutcome = 'rejected' | 'review' | 'qualified';

export type QaCalifTag = 'calif-no' | 'calif-pendiente' | 'calif-limite';

export interface QaFiltroEvaluation {
  outcome: QaFiltroOutcome;
  califTag: QaCalifTag;
}
