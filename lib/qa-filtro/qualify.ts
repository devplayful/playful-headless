import { QA_FILTRO_REVENUE_CUTOFF_USD } from './constants.ts';
import type {
  QaFiltroAnswers,
  QaFiltroEvaluation,
  QaFiltroOutcome,
  QaRevenue,
} from './types.ts';

const QUALIFY_BUCKETS: readonly QaRevenue[] =
  QA_FILTRO_REVENUE_CUTOFF_USD >= 50_000
    ? ['50k_100k', '100k_250k', 'over_250k']
    : ['10k_50k', '50k_100k', '100k_250k', 'over_250k'];

const BELOW_CUTOFF_BUCKETS: readonly QaRevenue[] = ['under_10k', '10k_50k'];

function isAtOrAboveCutoff(revenue: QaRevenue): boolean {
  return QUALIFY_BUCKETS.includes(revenue);
}

function isBelowCutoff(revenue: QaRevenue): boolean {
  return BELOW_CUTOFF_BUCKETS.includes(revenue);
}

function isHardReject(answers: QaFiltroAnswers): boolean {
  if (answers.selling === 'aun_no_vendo') return true;
  if (answers.businessType === 'revendedor' || answers.businessType === 'agencia') return true;
  if (answers.revenueOnline === 'under_10k' && answers.revenueOtherChannels === 'under_10k') {
    return true;
  }
  return false;
}

function isBorderline(answers: QaFiltroAnswers): boolean {
  if (answers.thirdParty === 'si') return true;
  if (
    isBelowCutoff(answers.revenueOnline)
    && isBelowCutoff(answers.revenueOtherChannels)
    && (answers.revenueOnline === '10k_50k' || answers.revenueOtherChannels === '10k_50k')
  ) {
    return true;
  }
  return false;
}

function isQualified(answers: QaFiltroAnswers): boolean {
  return isAtOrAboveCutoff(answers.revenueOnline) || isAtOrAboveCutoff(answers.revenueOtherChannels);
}

export function evaluateQaFiltro(answers: QaFiltroAnswers): QaFiltroEvaluation {
  let outcome: QaFiltroOutcome;
  if (isHardReject(answers)) {
    outcome = 'rejected';
  } else if (isBorderline(answers)) {
    outcome = 'review';
  } else if (isQualified(answers)) {
    outcome = 'qualified';
  } else {
    outcome = 'review';
  }

  return {
    outcome,
    califTag: outcome === 'rejected' ? 'calif-no' : 'calif-pendiente',
  };
}
