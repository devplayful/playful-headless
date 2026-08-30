import { createHash, randomUUID } from 'node:crypto';
import type { WebsiteLead, LeadProcessingResult } from './types.ts';
import {
  type CrmProgress,
  type IdempotencyStore,
  SubmissionInProgressError,
} from './idempotency.ts';

export interface CrmSyncControl {
  submissionKey: string;
  progress: CrmProgress;
  checkpoint(patch: Partial<CrmProgress>): Promise<void>;
  withResourceLease<T>(resource: string, operation: () => Promise<T>): Promise<T>;
}

export interface ContactPipelineDependencies {
  store: IdempotencyStore;
  deliver: (lead: WebsiteLead) => Promise<void>;
  syncCrm: (lead: WebsiteLead, control: CrmSyncControl) => Promise<void>;
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

  if (initial.kind === 'busy') throw new SubmissionInProgressError();

  if (initial.kind === 'existing' && initial.record.state === 'completed') {
    return {
      delivered: true,
      crmSynced: initial.record.crmSynced,
      dryRun: initial.record.dryRun,
      replayed: true,
    };
  }

  let delivered = initial.kind === 'existing' && initial.record.state === 'delivered';

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

  const progress: CrmProgress = initial.kind === 'existing'
    ? { ...initial.record.crm }
    : {};
  const control: CrmSyncControl = {
    submissionKey: key,
    progress,
    checkpoint: async (patch) => {
      const next = { ...progress, ...patch };
      await dependencies.store.saveCrmProgress(key, owner, next);
      Object.assign(progress, patch);
    },
    withResourceLease: async (resource, operation) => {
      if (!await dependencies.store.acquireResourceLease(resource, owner)) {
        throw new SubmissionInProgressError();
      }
      try {
        return await operation();
      } finally {
        await dependencies.store.releaseResourceLease(resource, owner);
      }
    },
  };

  try {
    await dependencies.syncCrm(lead, control);
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
