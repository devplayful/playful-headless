import assert from 'node:assert/strict';
import test from 'node:test';
import {
  HighLevelApiError,
  HighLevelApiClient,
  type HighLevelGateway,
  type HighLevelOpportunity,
  type HighLevelTask,
  type UpsertContactInput,
  type UpsertContactResult,
  type CreateOpportunityInput,
  type CreateTaskInput,
  type HighLevelCustomFieldValue,
} from '../../lib/highlevel/client.ts';
import { syncWebsiteLeadToHighLevel } from '../../lib/highlevel/workflow.ts';
import { processContactPipeline } from '../../lib/contact/orchestrator.ts';
import { config, lead } from './fixtures.ts';
import {
  type IdempotencyStore,
  type BeginResult,
  type SubmissionState,
} from '../../lib/contact/idempotency.ts';

class InboundTagGateway implements HighLevelGateway {
  calls: string[] = [];
  contact: UpsertContactResult = { id: 'contact-1', isNew: true };
  contactTags: string[] = [];
  removeTagsError?: unknown;
  addTagsError?: unknown;
  opportunities: HighLevelOpportunity[] = [];
  tasks: HighLevelTask[] = [];
  customFields = new Map<string, string>();

  async upsertContact(input: UpsertContactInput) {
    this.calls.push('upsert');
    void input;
    return this.contact;
  }
  async getContactCustomFields() {
    this.calls.push('get-fields');
    return Array.from(this.customFields).map(([id, fieldValue]) => ({ id, fieldValue }));
  }
  async getContactTags(contactId: string) {
    this.calls.push('get-tags');
    void contactId;
    return [...this.contactTags];
  }
  async updateContactCustomFields(_contactId: string, customFields: HighLevelCustomFieldValue[]) {
    this.calls.push('update-original');
    for (const item of customFields) {
      if (item.id) this.customFields.set(item.id, item.fieldValue);
    }
  }
  async removeContactTags(contactId: string, tags: string[]) {
    this.calls.push('untag');
    void contactId;
    if (this.removeTagsError) throw this.removeTagsError;
    this.contactTags = this.contactTags.filter((item) => !tags.includes(item));
  }
  async addContactTags(contactId: string, tags: string[]) {
    this.calls.push('tag');
    void contactId;
    if (this.addTagsError) throw this.addTagsError;
    for (const item of tags) {
      if (!this.contactTags.includes(item)) this.contactTags.push(item);
    }
  }
  async findOpenOpportunities() {
    this.calls.push('search');
    return [...this.opportunities];
  }
  async createOpportunity(input: CreateOpportunityInput) {
    this.calls.push('create-opportunity');
    void input;
    this.opportunities.push({ id: 'opportunity-1', status: 'open' });
    return { id: 'opportunity-1' };
  }
  async updateOpportunityCustomFields() {
    this.calls.push('update-opportunity');
  }
  async findTasks() {
    this.calls.push('find-tasks');
    return [...this.tasks];
  }
  async createTask(_contactId: string, input: CreateTaskInput) {
    this.calls.push('create-task');
    void input;
    return { id: 'task-1' };
  }
}

function tagOperations(calls: string[]): string[] {
  return calls.filter((item) => item === 'get-tags' || item === 'untag' || item === 'tag');
}

test('new contact: no tag lookup for inbound refresh and only one add', async () => {
  const gateway = new InboundTagGateway();
  gateway.contact = { id: 'contact-new', isNew: true };

  await syncWebsiteLeadToHighLevel(lead, gateway, config);

  assert.deepEqual(tagOperations(gateway.calls), ['tag']);
});

test('existing contact without website-inbound: no untag before add', async () => {
  const gateway = new InboundTagGateway();
  gateway.contact = { id: 'contact-old', isNew: false };
  gateway.contactTags = [];

  await syncWebsiteLeadToHighLevel(lead, gateway, config);

  assert.deepEqual(tagOperations(gateway.calls), ['get-tags', 'tag']);
  assert(!gateway.calls.includes('untag'));
});

test('existing contact with website-inbound: DELETE then POST in order', async () => {
  const gateway = new InboundTagGateway();
  gateway.contact = { id: 'contact-returning', isNew: false };
  gateway.contactTags = [config.contactTag, 'legacy'];

  await syncWebsiteLeadToHighLevel(lead, gateway, config);

  assert.deepEqual(tagOperations(gateway.calls), ['get-tags', 'untag', 'tag']);
  const untagIndex = gateway.calls.indexOf('untag');
  const tagIndex = gateway.calls.indexOf('tag');
  assert(untagIndex >= 0 && tagIndex > untagIndex);
});

test('failed inbound DELETE does not block sync or user success path', async () => {
  const gateway = new InboundTagGateway();
  gateway.contact = { id: 'contact-returning', isNew: false };
  gateway.contactTags = [config.contactTag];
  gateway.removeTagsError = new HighLevelApiError(500, 'remove contact tag');

  const result = await syncWebsiteLeadToHighLevel(lead, gateway, config);
  assert.equal(result.contactId, 'contact-returning');
  assert.deepEqual(tagOperations(gateway.calls), ['get-tags', 'untag', 'tag']);
});

test('failed inbound DELETE does not prevent orchestrator confirmed delivery', async () => {
  const gateway = new InboundTagGateway();
  gateway.contact = { id: 'contact-returning', isNew: false };
  gateway.contactTags = [config.contactTag];
  gateway.removeTagsError = new HighLevelApiError(500, 'remove contact tag');

  const store: IdempotencyStore = {
    async begin(): Promise<BeginResult> { return { kind: 'acquired' }; },
    async beginDeliveryReconciliation(): Promise<SubmissionState | null> { return null; },
    async markDelivered() {},
    async markDeliveryUncertain() {},
    async clearPendingDelivery() {},
    async releaseDelivery() {},
    async beginCrm() { return true; },
    async saveCrmProgress() {},
    async markCompleted() {},
    async releaseCrm() {},
    async acquireResourceLease() { return true; },
    async releaseResourceLease() {},
  };

  const pipelineResult = await processContactPipeline(lead, {
    store,
    deliver: async () => {},
    syncCrm: (submission, control) => syncWebsiteLeadToHighLevel(
      submission,
      gateway,
      config,
      new Date(),
      control,
    ).then(() => undefined),
    dryRun: false,
  });

  assert.equal(pipelineResult.deliveryStatus, 'confirmed');
  assert.equal(pipelineResult.delivered, true);
  assert.equal(pipelineResult.crmSynced, true);
});

test('HighLevelApiClient removeContactTags uses DELETE and tolerates empty body', async () => {
  const seen: Array<{ method: string; path: string; body?: string }> = [];
  const client = new HighLevelApiClient('token', 1000, async (url, init) => {
    seen.push({
      method: init?.method || 'GET',
      path: String(url),
      body: typeof init?.body === 'string' ? init.body : undefined,
    });
    return new Response('', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });

  await client.removeContactTags('contact-42', ['website-inbound']);

  assert.equal(seen.length, 1);
  assert.equal(seen[0].method, 'DELETE');
  assert.match(seen[0].path, /\/contacts\/contact-42\/tags$/);
  assert.equal(seen[0].body, JSON.stringify({ tags: ['website-inbound'] }));
});