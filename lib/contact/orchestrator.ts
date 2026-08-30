import { createHash, randomUUID } from 'node:crypto';
import type { WebsiteLead, LeadProcessingResult } from './types.ts';
import {
  type IdempotencyStore,
  SubmissionInProgressError,
} from './idempotency.ts';

export interface ContactPipelineDependencies {
  store: IdempotencyStore;
  deliver: (lead: WebsiteLead) => Promise<void>;
  syncCrm: (lead: WebsiteLead) => Promise<void>;
  dryRun: boolean;
  ownerId?: string;
}

export function submissionKey(submissionId: string): string {
  return createHash('sha256').update(submissionId).digest('hex');
}

export async function processContactPipeline(
  lead: WebsiteLead,
  dependencies: ContactPipelineDependencies,
): Promise<LeadProcessingResult> {
  const key = submissionKey(lead.submissionId);
  const owner = dependencies.ownerId || randomUUID();
  const initial = await dependencies.store.begin(key, owner);

  if (initial.kind === 'existing' && initial.record.state === 'completed') {
    return {
      delivered: true,
      crmSynced: initial.record.crmSynced,
      dryRun: initial.record.dryRun,
      replayed: true,
    };
  }

  let delivered = initial.kind === 'existing' && initial.record.state === 'delivered';
  if (initial.kind === 'existing' && !delivered) throw new SubmissionInProgressError();

  if (!delivered) {
    try {
      await dependencies.deliver(lead);
      await dependencies.store.markDelivered(key, owner);
      delivered = true;
    } catch (error) {
      await dependencies.store.releaseDelivery(key, owner);
      throw error;
    }
  }

  if (!await dependencies.store.beginCrm(key, owner)) {
    throw new SubmissionInProgressError();
  }

  try {
    await dependencies.syncCrm(lead);
    await dependencies.store.markCompleted(key, owner, true, dependencies.dryRun);
  } catch (error) {
    await dependencies.store.releaseCrm(key, owner);
    throw error;
  }

  return {
    delivered: true,
    crmSynced: true,
    dryRun: dependencies.dryRun,
    replayed: false,
  };
}

