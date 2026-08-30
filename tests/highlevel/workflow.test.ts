import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  CreateOpportunityInput,
  CreateTaskInput,
  HighLevelCustomFieldValue,
  HighLevelGateway,
  HighLevelOpportunity,
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

  async upsertContact(input: UpsertContactInput) {
    this.calls.push({ operation: 'upsert', value: input });
    return this.contact;
  }
  async updateContactCustomFields(contactId: string, customFields: HighLevelCustomFieldValue[]) {
    this.calls.push({ operation: 'update-original', value: { contactId, customFields } });
  }
  async addContactTags(contactId: string, tags: string[]) {
    this.calls.push({ operation: 'tag', value: { contactId, tags } });
  }
  async findOpenOpportunities() {
    this.calls.push({ operation: 'search' });
    return this.opportunities;
  }
  async createOpportunity(input: CreateOpportunityInput) {
    this.calls.push({ operation: 'create-opportunity', value: input });
    return { id: 'opportunity-new' };
  }
  async createTask(contactId: string, input: CreateTaskInput) {
    this.calls.push({ operation: 'create-task', value: { contactId, input } });
    return { id: 'task-1' };
  }
}

test('upserts once, preserves first touch for new contacts and creates Consulta plus SLA task', async () => {
  const gateway = new GatewayMock();
  const result = await syncWebsiteLeadToHighLevel(
    lead,
    gateway,
    config,
    new Date('2026-08-30T12:00:00.000Z'),
  );

  assert.equal(result.opportunityCreated, true);
  assert.deepEqual(gateway.calls.map((call) => call.operation), [
    'upsert', 'update-original', 'tag', 'search', 'create-opportunity', 'create-task',
  ]);

  const upsert = gateway.calls[0].value as UpsertContactInput;
  assert.equal(upsert.createNewIfDuplicateAllowed, false);
  assert.equal(upsert.assignedTo, 'owner-test');
  assert(!JSON.stringify(upsert.customFields).includes('field-original-source'));

  const opportunity = gateway.calls[4].value as CreateOpportunityInput;
  assert.equal(opportunity.pipelineStageId, 'stage-consulta-test');
  assert.equal(opportunity.status, 'open');

  const task = gateway.calls[5].value as { input: CreateTaskInput };
  assert.equal(task.input.dueDate, '2026-08-31T12:00:00.000Z');
});

test('reuses one existing open opportunity without moving or duplicating it', async () => {
  const gateway = new GatewayMock();
  gateway.contact = { id: 'contact-1', isNew: false };
  gateway.opportunities = [{ id: 'opportunity-existing', status: 'open' }];

  const result = await syncWebsiteLeadToHighLevel(lead, gateway, config);
  assert.equal(result.opportunityCreated, false);
  assert.equal(result.opportunityId, 'opportunity-existing');
  assert(!gateway.calls.some((call) => call.operation === 'create-opportunity'));
  assert(!gateway.calls.some((call) => call.operation === 'update-original'));
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

