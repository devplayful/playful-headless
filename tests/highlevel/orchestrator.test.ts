import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  BeginResult,
  IdempotencyStore,
  SubmissionState,
} from '../../lib/contact/idempotency.ts';
import { processContactPipeline } from '../../lib/contact/orchestrator.ts';
import { lead } from './fixtures.ts';

class TestStore implements IdempotencyStore {
  records = new Map<string, SubmissionState>();

  async begin(key: string, owner: string): Promise<BeginResult> {
    const record = this.records.get(key);
    if (record) return { kind: 'existing', record };
    this.records.set(key, { state: 'delivery_processing', owner });
    return { kind: 'acquired' };
  }
  async markDelivered(key: string) { this.records.set(key, { state: 'delivered' }); }
  async beginCrm(key: string, owner: string) {
    if (this.records.get(key)?.state !== 'delivered') return false;
    this.records.set(key, { state: 'crm_processing', owner });
    return true;
  }
  async markCompleted(key: string, _owner: string, crmSynced: boolean, dryRun: boolean) {
    this.records.set(key, { state: 'completed', crmSynced, dryRun });
  }
  async releaseDelivery(key: string) { this.records.delete(key); }
  async releaseCrm(key: string) { this.records.set(key, { state: 'delivered' }); }
}

test('resumes CRM after confirmed delivery without delivering WordPress twice', async () => {
  const store = new TestStore();
  let deliveries = 0;
  let crmAttempts = 0;

  await assert.rejects(() => processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: async () => { crmAttempts += 1; throw new Error('temporary'); },
    dryRun: true,
    ownerId: 'attempt-1',
  }));

  const recovered = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: async () => { crmAttempts += 1; },
    dryRun: true,
    ownerId: 'attempt-2',
  });

  const replay = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: async () => { crmAttempts += 1; },
    dryRun: true,
    ownerId: 'attempt-3',
  });

  assert.equal(deliveries, 1);
  assert.equal(crmAttempts, 2);
  assert.equal(recovered.replayed, false);
  assert.equal(replay.replayed, true);
});

