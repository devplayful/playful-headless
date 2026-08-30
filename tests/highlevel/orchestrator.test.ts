import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  BeginResult,
  CrmProgress,
  IdempotencyStore,
  SubmissionState,
} from '../../lib/contact/idempotency.ts';
import { SubmissionInProgressError } from '../../lib/contact/idempotency.ts';
import {
  DeterministicContactDeliveryError,
  UncertainContactDeliveryError,
} from '../../lib/contact/delivery.ts';
import { processContactPipeline, submissionKey } from '../../lib/contact/orchestrator.ts';
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

  async begin(key: string, owner: string): Promise<BeginResult> {
    const record = this.records.get(key);
    if (record) return { kind: 'existing', record };
    if (!this.acquire(`delivery:${key}`, owner)) return { kind: 'busy' };
    this.records.set(key, { state: 'delivery_pending' });
    return { kind: 'acquired' };
  }
  async markDelivered(key: string, owner: string) {
    if (this.leases.get(`delivery:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    if (this.records.get(key)?.state !== 'delivery_pending') throw new SubmissionInProgressError();
    this.records.set(key, { state: 'delivered', crm: {} });
    this.release(`delivery:${key}`, owner);
  }
  async markDeliveryUncertain(key: string, owner: string) {
    if (this.leases.get(`delivery:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    if (this.records.get(key)?.state !== 'delivery_pending') throw new SubmissionInProgressError();
    this.records.set(key, { state: 'delivery_uncertain' });
    this.release(`delivery:${key}`, owner);
  }
  async clearPendingDelivery(key: string, owner: string) {
    if (this.leases.get(`delivery:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    if (this.records.get(key)?.state !== 'delivery_pending') throw new SubmissionInProgressError();
    this.records.delete(key);
    this.release(`delivery:${key}`, owner);
  }
  async beginCrm(key: string, owner: string) {
    return this.records.get(key)?.state === 'delivered' && this.acquire(`crm:${key}`, owner);
  }
  async saveCrmProgress(key: string, owner: string, progress: CrmProgress) {
    if (this.leases.get(`crm:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    this.records.set(key, { state: 'delivered', crm: { ...progress } });
    this.leases.set(`crm:${key}`, { owner, expiresAt: this.now + 30 });
  }
  async markCompleted(key: string, owner: string, crmSynced: boolean, dryRun: boolean) {
    if (this.leases.get(`crm:${key}`)?.owner !== owner) throw new SubmissionInProgressError();
    const current = this.records.get(key);
    const crm = current?.state === 'delivered' ? current.crm : {};
    this.records.set(key, { state: 'completed', crmSynced, dryRun, crm });
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
  assert.equal(retry.deliveryStatus, 'pending_confirmation');
  assert.equal(retry.replayed, true);
  assert.equal(remoteDeliveries, 1);
  assert.equal(crmCalls, 0);
  assert.equal(store.records.get(submissionKey(lead.submissionId))?.state, 'delivery_uncertain');
});

test('does not blindly retry when WordPress may not have received the timed-out request', async () => {
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
  const retry = await processContactPipeline(lead, {
    store,
    deliver: async () => { attempts += 1; },
    dryRun: false,
    ownerId: 'not-received-2',
  });

  assert.equal(first.deliveryStatus, 'pending_confirmation');
  assert.equal(retry.deliveryStatus, 'pending_confirmation');
  assert.equal(attempts, 1);
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
