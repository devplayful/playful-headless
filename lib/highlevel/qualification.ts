import type { LeadQualification } from '../contact/types.ts';

export type QualificationLevel = 'priority' | 'transition' | 'review';

export function qualificationLevel(lead: { qualification: LeadQualification }): QualificationLevel {
  const qualification = lead.qualification;
  const isDecisionMaker = qualification.decisionRole === 'owner'
    || qualification.decisionRole === 'decision_lead';
  const isNearTerm = qualification.projectTiming === '0_30_days'
    || qualification.projectTiming === '1_3_months';
  const isDirectCommerce = qualification.salesModel === 'd2c'
    || qualification.salesModel === 'd2c_b2b'
    || qualification.salesModel === 'marketplace_to_d2c';

  if (isDecisionMaker && isNearTerm && isDirectCommerce
    && qualification.monthlyRevenue === 'over_100k') return 'priority';
  if (['amazon', 'mercado_libre', 'marketplaces_other', 'marketplace_to_d2c', 'pre_d2c']
    .includes(qualification.salesModel)) return 'transition';
  return 'review';
}

export function inboundOpportunityStageId(
  fit: QualificationLevel,
  config: { consultaStageId: string; revisarStageId: string },
): string {
  return fit === 'priority' ? config.consultaStageId : config.revisarStageId;
}

/**
 * Move only between inbound form stages (Consulta ↔ Revisar).
 * A later pipeline stage (Lead cualificado, Reunión, …) is left untouched
 * so a documented sales progression is not rewound.
 */
export function canMoveInboundOpportunityStage(
  currentStageId: string | undefined,
  config: { consultaStageId: string; revisarStageId: string },
): boolean {
  if (!currentStageId) return true;
  return currentStageId === config.consultaStageId
    || currentStageId === config.revisarStageId;
}
