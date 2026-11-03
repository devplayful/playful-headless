import type {
  QaFiltroAnswers,
  QaFiltroEvaluation,
  QaFiltroOutcome,
  QaRevenue,
} from './types.ts';

const PASSING_REVENUE: readonly QaRevenue[] = [
  '10k_50k',
  '50k_100k',
  '100k_250k',
  'over_250k',
];

function isHardReject(answers: QaFiltroAnswers): boolean {
  if (answers.selling === 'aun_no_vendo') return true;
  if (answers.revenue === 'under_10k') return true;
  if (answers.businessType === 'revendedor' || answers.businessType === 'agencia') return true;
  return false;
}

function isBorderline(answers: QaFiltroAnswers): boolean {
  if (!answers.revenue) return true;
  if (answers.revenue === '10k_50k' && answers.thirdParty === 'si') return true;
  return false;
}

export function evaluateQaFiltro(answers: QaFiltroAnswers): QaFiltroEvaluation {
  let outcome: QaFiltroOutcome;
  if (isHardReject(answers)) {
    outcome = 'rejected';
  } else if (isBorderline(answers)) {
    outcome = 'review';
  } else if (answers.revenue && PASSING_REVENUE.includes(answers.revenue)) {
    outcome = 'qualified';
  } else {
    outcome = 'review';
  }

  return {
    outcome,
    califTag: outcome === 'rejected' ? 'calif-no' : 'calif-pendiente',
  };
}
