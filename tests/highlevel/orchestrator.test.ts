import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  BeginResult,
  CrmProgress,
  IdempotencyStore,
  SubmissionState,
} from '../../lib/contact/idempotency.ts';
import {
  IdempotencyStoreUnavailableError,
  SubmissionInProgressError,
  SubmissionPayloadMismatchError,
} from '../../lib/contact/idempotency.ts';
import {
  DeterministicContactDeliveryError,
  UncertainContactDeliveryError,
} from '../../lib/contact/delivery.ts';
import {
  ContactPipelineUnavailableBeforeDeliveryError,
  DeliveryReceiptMissingError,
  processContactPipeline,
  submissionFingerprint,
  submissionKey,
} from '../../lib/contact/orchestrator.ts';
import { lead } from './fixtures.ts';

class TestStore implements IdempotencyStore {
  records = new Map<string, SubmissionState>();
  leases = new Map<string, { owner: string; expiresAt: number }>();
  now = 0;

  advance(seconds: number) { this.now += seconds; }

  private acquire(resource: string, owner: string) {
    const current = this.leases.get(resource);
    if (current && current.expiresAt > this.now) return false;
    this.leases.set(resource, { owner, expiresAt: this.now + 30 });
    return true;
  }

  private release(resource: string, owner: string) {
    if (this.leases.get(resource)?.owner === owner) this.leases.delete(resource);
  }

  async begin(key: string, owner: string, fingerprint?: string): Promise<BeginResult> {
    const record = this.records.get(key);
    if (record) {
      if (record.fingerprint && fingerprint && record.fingerprint !== fingerprint) {
        throw new SubmissionPayloadMismatchError();
      }
      return { kind: 'existing', record };
    }
    if (!this.acquire(`delivery:${key}`, owner)) return { kind: 'busy' };
    this.records.set(key, { state: 'delivery_pending', fingerprint });
    return { kind: 'acquired' };
  }
  async beginDeliveryReconciliation(key: string, owner: string) {
    if (!this.acquire(`delivery:${key}`, owner)) throw new SubmissionInProgressError();
    const record = this.records.get(key) || null;
    if (!record || (record.state !== 'delivery_pending' && record.state !== 'delivery_uncertain')) {
      this.release(`delivery:${key}`, owner);
    }
    return record;
  }
  async markDelivered(key: string, owner: string) {
    if (this.leases.get(`delivery:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    const current = this.records.get(key);
    const state = current?.state;
    if (state !== 'delivery_pending' && state !== 'delivery_uncertain') throw new SubmissionInProgressError();
    this.records.set(key, { state: 'delivered', fingerprint: current?.fingerprint, crm: {} });
    this.release(`delivery:${key}`, owner);
  }
  async markDeliveryUncertain(key: string, owner: string) {
    if (this.leases.get(`delivery:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    const current = this.records.get(key);
    if (current?.state !== 'delivery_pending' && current?.state !== 'delivery_uncertain') {
      throw new SubmissionInProgressError();
    }
    this.records.set(key, { state: 'delivery_uncertain', fingerprint: current.fingerprint });
    this.release(`delivery:${key}`, owner);
  }
  async clearPendingDelivery(key: string, owner: string) {
    if (this.leases.get(`delivery:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    const state = this.records.get(key)?.state;
    if (state !== 'delivery_pending' && state !== 'delivery_uncertain') throw new SubmissionInProgressError();
    this.records.delete(key);
    this.release(`delivery:${key}`, owner);
  }
  async releaseDelivery(key: string, owner: string) { this.release(`delivery:${key}`, owner); }
  async beginCrm(key: string, owner: string) {
    return this.records.get(key)?.state === 'delivered' && this.acquire(`crm:${key}`, owner);
  }
  async saveCrmProgress(key: string, owner: string, progress: CrmProgress) {
    if (this.leases.get(`crm:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    const current = this.records.get(key);
    this.records.set(key, {
      state: 'delivered',
      fingerprint: current?.fingerprint,
      crm: { ...progress },
    });
    this.leases.set(`crm:${key}`, { owner, expiresAt: this.now + 30 });
  }
  async markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean) {
    if (this.leases.get(`crm:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    const current = this.records.get(key);
    const crm = current?.state === 'delivered' ? current.crm : {};
    this.records.set(key, {
      state: 'completed',
      fingerprint: current?.fingerprint,
      crmSynced,
      dryRun,
      crm,
    });
    this.release(`crm:${key}`, owner);
  }
  async releaseCrm(key: string, owner: string) { this.release(`crm:${key}`, owner); }
  async acquireResourceLease(resource: string, owner: string) { return this.acquire(`resource:${resource}`, owner); }
  async releaseResourceLease(resource: string, owner: string) { this.release(`resource:${resource}`, owner); }
}

test('resumes CRM from its last checkpoint without delivering WordPress twice', async () => {
  const store = new TestStore();
  let deliveries = 0;
  const visited: string[] = [];

  await assert.rejects(() => processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: async (_submission, control) => {
      await control.checkpoint({ contactId: 'contact-1' });
      throw new Error('crash after contact checkpoint');
    },
    dryRun: true,
    ownerId: 'attempt-1',
  }));

  const recovered = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: async (_submission, control) => {
      visited.push(control.progress.contactId || 'missing');
      await control.checkpoint({ taskId: 'task-1' });
    },
    dryRun: true,
    ownerId: 'attempt-2',
  });

  const replay = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: async () => { throw new Error('must not replay CRM'); },
    dryRun: true,
    ownerId: 'attempt-3',
  });

  assert.equal(deliveries, 1);
  assert.deepEqual(visited, ['contact-1']);
  assert.equal(recovered.replayed, false);
  assert.equal(replay.replayed, true);
  assert.equal(replay.deliveryStatus, 'confirmed');
});

test('a crashed worker lease expires while the durable delivered checkpoint survives', async () => {
  const store = new TestStore();
  const key = submissionKey(lead.submissionId);
  store.records.set(key, { state: 'delivered', crm: { contactId: 'contact-before-crash' } });
  assert.equal(await store.beginCrm(key, 'crashed-worker'), true);

  await assert.rejects(() => processContactPipeline(lead, {
    store,
    deliver: async () => { throw new Error('must not redeliver'); },
    syncCrm: async () => {},
    dryRun: true,
    ownerId: 'early-retry',
  }), SubmissionInProgressError);

  store.advance(31);
  let recoveredCheckpoint = '';
  await processContactPipeline(lead, {
    store,
    deliver: async () => { throw new Error('must not redeliver'); },
    syncCrm: async (_submission, control) => { recoveredCheckpoint = control.progress.contactId || ''; },
    dryRun: true,
    ownerId: 'recovered-worker',
  });

  assert.equal(recoveredCheckpoint, 'contact-before-crash');
});

test('does not redeliver when WordPress completed remotely but its response was lost', async () => {
  const store = new TestStore();
  let remoteDeliveries = 0;
  let crmCalls = 0;

  const first = await processContactPipeline(lead, {
    store,
    deliver: async () => {
      remoteDeliveries += 1; // WordPress/mail completed before the socket timed out.
      throw new UncertainContactDeliveryError();
    },
    syncCrm: async () => { crmCalls += 1; },
    dryRun: false,
    ownerId: 'lost-response-1',
  });

  store.advance(31);
  const retry = await processContactPipeline(lead, {
    store,
    deliver: async () => { remoteDeliveries += 1; },
    reconcileDelivery: async () => 'completed',
    syncCrm: async () => { crmCalls += 1; },
    dryRun: false,
    ownerId: 'lost-response-2',
  });

  assert.deepEqual(first, {
    deliveryStatus: 'pending_confirmation',
    delivered: false,
    crmSynced: false,
    dryRun: false,
    replayed: false,
  });
  assert.equal(retry.deliveryStatus, 'confirmed');
  assert.equal(retry.replayed, false);
  assert.equal(remoteDeliveries, 1);
  assert.equal(crmCalls, 1);
  assert.equal(store.records.get(submissionKey(lead.submissionId))?.state, 'completed');
});

test('clears an unconfirmed reservation only after the safe receipt endpoint reports missing', async () => {
  const store = new TestStore();
  let attempts = 0;

  const first = await processContactPipeline(lead, {
    store,
    deliver: async () => {
      attempts += 1;
      throw new UncertainContactDeliveryError();
    },
    dryRun: false,
    ownerId: 'not-received-1',
  });
  await assert.rejects(() => processContactPipeline(lead, {
    store,
    deliver: async () => { attempts += 1; },
    reconcileDelivery: async () => 'missing',
    dryRun: false,
    ownerId: 'not-received-2',
    reconcileOnly: true,
  }), DeliveryReceiptMissingError);

  assert.equal(first.deliveryStatus, 'pending_confirmation');
  assert.equal(attempts, 1);
  assert.equal(store.records.has(submissionKey(lead.submissionId)), false);
});

test('keeps the reservation and performs no delivery while the receipt is still processing', async () => {
  const store = new TestStore();
  const key = submissionKey(lead.submissionId);
  store.records.set(key, { state: 'delivery_uncertain' });
  let deliveries = 0;

  const result = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    reconcileDelivery: async () => 'processing',
    dryRun: true,
    ownerId: 'processing-receipt',
    reconcileOnly: true,
  });

  assert.equal(result.deliveryStatus, 'pending_confirmation');
  assert.equal(result.dryRun, true);
  assert.equal(deliveries, 0);
  assert.equal(store.records.get(key)?.state, 'delivery_uncertain');
});

test('classifies Redis failure before WordPress as a pre-delivery outage', async () => {
  const store = new TestStore();
  store.begin = async () => {
    throw new IdempotencyStoreUnavailableError();
  };
  let deliveries = 0;

  await assert.rejects(() => processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    dryRun: false,
  }), ContactPipelineUnavailableBeforeDeliveryError);
  assert.equal(deliveries, 0);
});

test('clears only deterministic WordPress rejections so a corrected request can retry', async () => {
  const store = new TestStore();
  let attempts = 0;

  await assert.rejects(() => processContactPipeline(lead, {
    store,
    deliver: async () => {
      attempts += 1;
      throw new DeterministicContactDeliveryError(422);
    },
    dryRun: false,
    ownerId: 'rejected-1',
  }), DeterministicContactDeliveryError);

  const retry = await processContactPipeline(lead, {
    store,
    deliver: async () => { attempts += 1; },
    dryRun: false,
    ownerId: 'rejected-2',
  });

  assert.equal(attempts, 2);
  assert.equal(retry.deliveryStatus, 'confirmed');
  assert.equal(retry.crmSynced, false);
});

test('binds a submission id to its original payload across explicit checks and reloads', async () => {
  const store = new TestStore();
  const key = submissionKey(lead.submissionId);
  store.records.set(key, {
    state: 'delivery_uncertain',
    fingerprint: submissionFingerprint(lead),
  });
  let deliveries = 0;
  let receiptChecks = 0;

  await assert.rejects(() => processContactPipeline({
    ...lead,
    message: 'Contenido distinto después de una recarga.',
  }, {
    store,
    deliver: async () => { deliveries += 1; },
    reconcileDelivery: async () => {
      receiptChecks += 1;
      return 'completed';
    },
    dryRun: false,
    ownerId: 'changed-payload',
    reconcileOnly: true,
  }), SubmissionPayloadMismatchError);

  assert.equal(deliveries, 0);
  assert.equal(receiptChecks, 0);
  assert.equal(store.records.get(key)?.state, 'delivery_uncertain');
});

test('reconciles a WordPress receipt even when the Redis reservation was lost', async () => {
  const store = new TestStore();
  let deliveries = 0;
  let receiptChecks = 0;

  const result = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    reconcileDelivery: async () => {
      receiptChecks += 1;
      return 'completed';
    },
    dryRun: false,
    ownerId: 'lost-redis-state',
    reconcileOnly: true,
  });

  assert.equal(result.deliveryStatus, 'confirmed');
  assert.equal(deliveries, 0);
  assert.equal(receiptChecks, 1);
  assert.equal(store.records.get(submissionKey(lead.submissionId))?.state, 'completed');
});
