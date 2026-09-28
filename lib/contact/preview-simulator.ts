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
  attribution: {
    originalSource: string;
    recentSource: string;
    landing: string;
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
    gclid: string;
    fbclid: string;
    referrer: string;
    captured: boolean;
  };
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
    attribution: {
      originalSource: lead.originalAttribution.source,
      recentSource: lead.recentAttribution.source,
      landing: lead.originalAttribution.landing,
      utm_source: lead.originalAttribution.utm_source,
      utm_medium: lead.originalAttribution.utm_medium,
      utm_campaign: lead.originalAttribution.utm_campaign,
      utm_content: lead.originalAttribution.utm_content,
      utm_term: lead.originalAttribution.utm_term,
      gclid: lead.originalAttribution.gclid,
      fbclid: lead.originalAttribution.fbclid,
      referrer: lead.originalAttribution.referrer,
      captured: lead.originalAttribution.captured,
    },
    storage: 'none',
    externalRequests: false,
  };
}
