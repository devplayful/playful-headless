import type { MonthlyRevenue, SalesModel, WebsiteLead } from '../contact/types.ts';
import { QA_FILTRO_FORM_ID } from './constants.ts';
import { formatQaFiltroNote } from './labels.ts';
import type { QaFiltroAnswers, QaRevenue, QaSelling } from './types.ts';

function mapRevenueToCrm(revenue: QaRevenue | ''): MonthlyRevenue {
  switch (revenue) {
    case 'under_10k':
      return 'under_10k';
    case '10k_50k':
      return '10k_50k';
    case '50k_100k':
      return '50k_100k';
    case '100k_250k':
      return '50k_100k';
    case 'over_250k':
      return 'over_100k';
    default:
      return 'prefer_not_to_say';
  }
}

function mapSellingToSalesModel(selling: QaSelling, businessType: QaFiltroAnswers['businessType']): SalesModel {
  if (selling === 'aun_no_vendo') return 'not_online_or_unsure';
  if (businessType === 'revendedor') return 'other';
  if (businessType === 'agencia') return 'other';
  if (selling === 'vendo_fisica_sin_online') return 'd2c_b2b';
  return 'd2c';
}

export function mapQaFiltroToWebsiteLead(
  answers: QaFiltroAnswers,
  submissionId: string,
  consentCapturedAt: string,
): WebsiteLead {
  const note = formatQaFiltroNote(answers);
  const salesModel = mapSellingToSalesModel(answers.selling, answers.businessType);
  const thirdPartyNote = answers.thirdParty === 'si'
    ? 'Vende también en tiendas de terceros o distribuidores: Sí'
    : 'Vende también en tiendas de terceros o distribuidores: No';

  return {
    submissionId,
    name: answers.name,
    email: answers.email,
    phone: '',
    business: '',
    message: `${note}\n${thirdPartyNote}`,
    qualification: {
      decisionRole: answers.businessType === 'marca_d2c' ? 'owner' : 'other',
      decisionRoleOther: '',
      salesModel,
      salesModelOther: answers.businessType === 'marca_d2c' ? '' : answers.businessType,
      secondaryMarketplaces: answers.thirdParty === 'si' ? thirdPartyNote : '',
      monthlyRevenue: mapRevenueToCrm(answers.revenue),
      monthlyRevenueOther: answers.revenue === '100k_250k' ? '100.000–250.000 USD (rango QA)' : '',
      projectTiming: 'evaluating',
      projectTimingOther: '',
    },
    privacyConsent: true,
    marketingConsent: false,
    consentCapturedAt,
    originalAttribution: {
      captured: true,
      source: 'qa-interno',
      landing: '/qa/filtro-reunion',
      formId: QA_FILTRO_FORM_ID,
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
      gclid: '',
      fbclid: '',
      referrer: '',
    },
    recentAttribution: {
      captured: true,
      source: 'qa-interno',
      landing: '/qa/filtro-reunion',
      formId: QA_FILTRO_FORM_ID,
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
      gclid: '',
      fbclid: '',
      referrer: '',
    },
  };
}
