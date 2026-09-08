import { createHash } from 'node:crypto';
import { qualificationLevel, type QualificationLevel } from '../highlevel/workflow.ts';
import type { WebsiteLead } from './types.ts';

export interface PreviewSimulationEvidence {
  version: 'preview-contact-simulator-v1';
  submissionRef: string;
  gate: 'simulated-validated';
  email: 'suppressed';
  highLevel: {
    contact: 'simulated-upsert';
    opportunity: 'simulated-consulta' | 'not-created';
    nextAction: 'simulated-sla-task' | 'not-created';
  };
  qualificationLevel: QualificationLevel;
  storage: 'none';
  externalRequests: false;
}

/**
 * Preview-only stand-in for Gate -> email -> HighLevel. It is intentionally
 * stateless: a deterministic opaque reference demonstrates replay safety while
 * making persistence, mail and third-party calls impossible from this codepath.
 */
export function simulatePreviewContact(lead: WebsiteLead): PreviewSimulationEvidence {
  const fit = qualificationLevel(lead);
  const priority = fit === 'priority';

  return {
    version: 'preview-contact-simulator-v1',
    submissionRef: createHash('sha256').update(lead.submissionId).digest('hex').slice(0, 16),
    gate: 'simulated-validated',
    email: 'suppressed',
    highLevel: {
      contact: 'simulated-upsert',
      opportunity: priority ? 'simulated-consulta' : 'not-created',
      nextAction: priority ? 'simulated-sla-task' : 'not-created',
    },
    qualificationLevel: fit,
    storage: 'none',
    externalRequests: false,
  };
}
