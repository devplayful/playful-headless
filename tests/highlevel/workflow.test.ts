import assert from 'node:assert/strict';
import test from 'node:test';
import type { CrmSyncControl } from '../../lib/contact/orchestrator.ts';
import { SubmissionInProgressError } from '../../lib/contact/idempotency.ts';
import type {
  CreateOpportunityInput,
  CreateTaskInput,
  HighLevelCustomFieldValue,
  HighLevelGateway,
  HighLevelOpportunity,
  HighLevelTask,
  UpsertContactInput,
  UpsertContactResult,
} from '../../lib/highlevel/client.ts';
import {
  AmbiguousOpportunityError,
  syncWebsiteLeadToHighLevel,
} from '../../lib/highlevel/workflow.ts';
import { config, lead } from './fixtures.ts';

class GatewayMock implements HighLevelGateway {
  calls: Array<{ operation: string; value?: unknown }> = [];
  contact: UpsertContactResult = { id: 'contact-1', isNew: true };
  opportunities: HighLevelOpportunity[] = [];
  tasks: HighLevelTask[] = [];
  customFields = new Map<string, string>();
  loseFirstUpsertResponse = false;
  loseFirstOriginalResponse = false;
  loseFirstTaskResponse = false;

  async upsertContact(input: UpsertContactInput) {
    this.calls.push({ operation: 'upsert', value: input });
    if (this.loseFirstUpsertResponse) {
      this.loseFirstUpsertResponse = false;
      throw new Error('response lost after HighLevel applied upsert');
    }
    return this.contact;
  }
  async getContactCustomFields() {
    this.calls.push({ operation: 'get-fields' });
    return Array.from(this.customFields).map(([id, fieldValue]) => ({ id, fieldValue }));
  }
  async updateContactCustomFields(contactId: string, customFields: HighLevelCustomFieldValue[]) {
    this.calls.push({ operation: 'update-original', value: { contactId, customFields } });
    for (const item of customFields) this.customFields.set(item.id, item.fieldValue);
    if (this.loseFirstOriginalResponse) {
      this.loseFirstOriginalResponse = false;
      throw new Error('response lost after HighLevel applied original fields');
    }
  }
  async addContactTags(contactId: string, tags: string[]) {
    this.calls.push({ operation: 'tag', value: { contactId, tags } });
  }
  async findOpenOpportunities() {
    this.calls.push({ operation: 'search' });
    return [...this.opportunities];
  }
  async createOpportunity(input: CreateOpportunityInput) {
    this.calls.push({ operation: 'create-opportunity', value: input });
    const opportunity = { id: `opportunity-${this.opportunities.length + 1}`, status: 'open' };
    this.opportunities.push(opportunity);
    return { id: opportunity.id };
  }
  async findTasks() {
    this.calls.push({ operation: 'find-tasks' });
    return [...this.tasks];
  }
  async createTask(contactId: string, input: CreateTaskInput) {
    this.calls.push({ operation: 'create-task', value: { contactId, input } });
    const task = { id: `task-${this.tasks.length + 1}`, title: input.title, body: input.body };
    this.tasks.push(task);
    if (this.loseFirstTaskResponse) {
      this.loseFirstTaskResponse = false;
      throw new Error('response lost after HighLevel created task');
    }
    return { id: task.id };
  }
}

function memoryControl(
  submissionKey: string,
  locks = new Set<string>(),
): CrmSyncControl {
  const progress: CrmSyncControl['progress'] = {};
  return {
    submissionKey,
    progress,
    checkpoint: async (patch) => { Object.assign(progress, patch); },
    withResourceLease: async (resource, operation) => {
      if (locks.has(resource)) throw new SubmissionInProgressError();
      locks.add(resource);
      try { return await operation(); } finally { locks.delete(resource); }
    },
  };
}

test('checkpoints contact, first touch, tag, Consulta opportunity and SLA task', async () => {
  const gateway = new GatewayMock();
  const control = memoryControl('submission-a');
  const result = await syncWebsiteLeadToHighLevel(
    lead,
    gateway,
    config,
    new Date('2026-08-30T12:00:00.000Z'),
    control,
  );

  assert.equal(result.opportunityCreated, true);
  assert.deepEqual(gateway.calls.map((call) => call.operation), [
    'upsert', 'get-fields', 'update-original', 'tag', 'search',
    'create-opportunity', 'find-tasks', 'create-task',
  ]);
  assert.deepEqual(control.progress, {
    contactId: 'contact-1',
    originalAttributionCompleted: true,
    tagsCompleted: true,
    opportunityId: 'opportunity-1',
    opportunityCreated: true,
    taskId: 'task-1',
  });

  const upsert = gateway.calls[0].value as UpsertContactInput;
  assert.equal(upsert.createNewIfDuplicateAllowed, false);
  assert(!JSON.stringify(upsert.customFields).includes('field-original-source'));

  const opportunity = gateway.calls[5].value as CreateOpportunityInput;
  assert.equal(opportunity.pipelineStageId, 'stage-consulta-test');

  const task = gateway.calls[7].value as { input: CreateTaskInput };
  assert.equal(task.input.dueDate, '2026-08-31T12:00:00.000Z');
  assert.match(task.input.body, /\[playful-submission:submission-a\]/);
});

test('fills only blank original attribution fields for existing contacts', async () => {
  const gateway = new GatewayMock();
  gateway.contact = { id: 'contact-1', isNew: false };
  gateway.customFields.set(config.customFieldIds.original_source, 'referral');
  gateway.customFields.set(config.customFieldIds.original_landing, '');
  gateway.opportunities = [{ id: 'opportunity-existing', status: 'open' }];

  const result = await syncWebsiteLeadToHighLevel(lead, gateway, config);
  assert.equal(result.opportunityCreated, false);
  const update = gateway.calls.find((call) => call.operation === 'update-original')?.value as {
    customFields: HighLevelCustomFieldValue[];
  };
  assert.deepEqual(update.customFields, [{
    id: config.customFieldIds.original_landing,
    fieldValue: lead.originalAttribution.landing,
  }]);
});

test('first touch survives lost upsert and attribution responses on retry', async () => {
  const gateway = new GatewayMock();
  const control = memoryControl('submission-retry');
  gateway.loseFirstUpsertResponse = true;

  await assert.rejects(() => syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), control));
  assert.equal(control.progress.contactId, undefined);
  gateway.loseFirstOriginalResponse = true;
  await assert.rejects(() => syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), control));
  assert.equal(control.progress.contactId, 'contact-1');
  assert.equal(control.progress.originalAttributionCompleted, undefined);

  await syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), control);
  assert.equal(gateway.calls.filter((call) => call.operation === 'upsert').length, 2);
  assert.equal(gateway.calls.filter((call) => call.operation === 'update-original').length, 1);
  assert.equal(gateway.customFields.get(config.customFieldIds.original_source), lead.originalAttribution.source);
  assert.equal(gateway.customFields.get(config.customFieldIds.original_landing), lead.originalAttribution.landing);
});

test('recovers a task id when create succeeded but its response was lost', async () => {
  const gateway = new GatewayMock();
  const control = memoryControl('submission-lost-task');
  gateway.loseFirstTaskResponse = true;

  await assert.rejects(() => syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), control));
  assert.equal(gateway.tasks.length, 1);
  assert.equal(control.progress.taskId, undefined);

  const recovered = await syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), control);
  assert.equal(recovered.taskId, 'task-1');
  assert.equal(gateway.tasks.length, 1);
  assert.equal(gateway.calls.filter((call) => call.operation === 'create-task').length, 1);
});

test('serializes opportunity search-create for concurrent submissions to one contact and pipeline', async () => {
  const gateway = new GatewayMock();
  const locks = new Set<string>();
  const first = memoryControl('submission-concurrent-1', locks);
  const second = memoryControl('submission-concurrent-2', locks);
  let releaseSearch!: () => void;
  const searchBlocked = new Promise<void>((resolve) => { releaseSearch = resolve; });
  let firstSearch = true;
  gateway.findOpenOpportunities = async () => {
    gateway.calls.push({ operation: 'search' });
    if (firstSearch) {
      firstSearch = false;
      await searchBlocked;
    }
    return [...gateway.opportunities];
  };

  const firstRun = syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), first);
  await new Promise<void>((resolve) => setImmediate(resolve));
  await assert.rejects(
    () => syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), second),
    SubmissionInProgressError,
  );
  releaseSearch();
  await firstRun;
  await syncWebsiteLeadToHighLevel(lead, gateway, config, new Date(), second);

  assert.equal(gateway.calls.filter((call) => call.operation === 'create-opportunity').length, 1);
  assert.equal(gateway.opportunities.length, 1);
});

test('fails closed when the canonical pipeline already has multiple open opportunities', async () => {
  const gateway = new GatewayMock();
  gateway.opportunities = [
    { id: 'opportunity-1', status: 'open' },
    { id: 'opportunity-2', status: 'open' },
  ];

  await assert.rejects(() => syncWebsiteLeadToHighLevel(lead, gateway, config), AmbiguousOpportunityError);
  assert(!gateway.calls.some((call) => call.operation === 'create-opportunity'));
  assert(!gateway.calls.some((call) => call.operation === 'create-task'));
});
