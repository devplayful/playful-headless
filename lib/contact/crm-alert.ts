import { HighLevelApiError } from '../highlevel/client.ts';
import type { CrmProgress } from './idempotency.ts';

export function describeCrmFailure(error: unknown): string {
  if (error instanceof HighLevelApiError) {
    return error.detail
      ? `HighLevel ${error.operation} HTTP ${error.status}: ${error.detail}`
      : `HighLevel ${error.operation} HTTP ${error.status}`;
  }
  if (error instanceof Error && error.name === 'AmbiguousOpportunityError') {
    const count = 'count' in error && typeof error.count === 'number' ? error.count : undefined;
    return count === undefined
      ? 'múltiples oportunidades abiertas'
      : `múltiples oportunidades abiertas (${count})`;
  }
  if (error instanceof Error) return error.name;
  return 'unknown';
}

export function failedCrmStep(progress: CrmProgress = {}): string {
  if (!progress.contactId) return 'upsert';
  if (!progress.originalAttributionCompleted) return 'original-attribution';
  if (!progress.tagsCompleted) return 'tags';
  if (!progress.opportunityId) return 'opportunity';
  if (!progress.taskId) return 'task';
  return 'unknown';
}

export function logCrmFailureAfterDelivery(error: unknown, progress: CrmProgress = {}): void {
  const contactId = progress.contactId || 'unknown';
  const step = failedCrmStep(progress);
  console.error(
    'ALERTA interna: el mensaje del formulario ya se entregó, pero el registro comercial no se confirmó.',
    `contactId=${contactId} step=${step}`,
    describeCrmFailure(error),
  );
}
