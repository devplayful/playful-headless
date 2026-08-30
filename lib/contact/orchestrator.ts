import { createHash, randomUUID } from 'node:crypto';
import type { WebsiteLead, LeadProcessingResult } from './types.ts';
import { DeterministicContactDeliveryError } from './delivery.ts';
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

export class RetainResourceLeaseError extends Error {
  constructor(public readonly originalError: unknown) {
    super('El resultado remoto es incierto; el lease se conservará hasta expirar.');
    this.name = 'RetainResourceLeaseError';
  }
}

export interface ContactPipelineDependencies {
  store: IdempotencyStore;
  deliver: (lead: WebsiteLead) => Promise<void>;
  syncCrm?: (lead: WebsiteLead, control: CrmSyncControl) => Promise<void>;
  dryRun: boolean;
  ownerId?: string;
}

export function submissionKey(submissionId: string): string {
  return createHash('sha256').update(submissionId).digest('hex');
}

function pendingDelivery(dryRun: boolean, replayed: boolean): LeadProcessingResult {
  return {
    deliveryStatus: 'pending_confirmation',
    delivered: false,
    crmSynced: false,
    dryRun,
    replayed,
  };
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
      deliveryStatus: 'confirmed',
      delivered: true,
      crmSynced: initial.record.crmSynced,
      dryRun: initial.record.dryRun,
      replayed: true,
    };
  }

  if (initial.kind === 'existing' && (
    initial.record.state === 'delivery_pending'
    || initial.record.state === 'delivery_uncertain'
  )) {
    return pendingDelivery(dependencies.dryRun, true);
  }

  let delivered = initial.kind === 'existing' && initial.record.state === 'delivered';

  if (!delivered) {
    try {
      await dependencies.deliver(lead);
    } catch (error) {
      if (error instanceof DeterministicContactDeliveryError) {
        await dependencies.store.clearPendingDelivery(key, owner);
        throw error;
      }
      try {
        await dependencies.store.markDeliveryUncertain(key, owner);
      } catch {
        // begin() persisted delivery_pending before the remote write. Keeping
        // that durable reservation is safer than a blind second delivery.
      }
      return pendingDelivery(dependencies.dryRun, false);
    }
    try {
      await dependencies.store.markDelivered(key, owner);
      delivered = true;
    } catch {
      // WordPress returned success but its Redis checkpoint was not confirmed.
      // delivery_pending remains durable and prevents another remote write.
      return pendingDelivery(dependencies.dryRun, false);
    }
  }

  if (!await dependencies.store.beginCrm(key, owner)) {
    throw new SubmissionInProgressError();
  }

  const progress: CrmProgress = initial.kind === 'existing'
    && initial.record.state === 'delivered'
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
      let release = true;
      try {
        return await operation();
      } catch (error) {
        if (error instanceof RetainResourceLeaseError) {
          release = false;
          throw error.originalError;
        }
        throw error;
      } finally {
        if (release) await dependencies.store.releaseResourceLease(resource, owner);
      }
    },
  };

  try {
    if (dependencies.syncCrm) await dependencies.syncCrm(lead, control);
    await dependencies.store.markCompleted(
      key,
      owner,
      Boolean(dependencies.syncCrm),
      dependencies.dryRun,
    );
  } catch (error) {
    await dependencies.store.releaseCrm(key, owner);
    throw error;
  }

  return {
    deliveryStatus: 'confirmed',
    delivered: true,
    crmSynced: Boolean(dependencies.syncCrm),
    dryRun: dependencies.dryRun,
    replayed: false,
  };
}
