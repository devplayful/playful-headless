import assert from 'node:assert/strict';
import test from 'node:test';
import { HighLevelApiClient, HighLevelApiError } from '../../lib/highlevel/client.ts';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('create opportunity accepts both HighLevel response envelopes', async () => {
  const nested = new HighLevelApiClient('token', 1000, async () => (
    jsonResponse(201, { opportunity: { id: 'opp-nested' } })
  ));
  assert.deepEqual(await nested.createOpportunity({
    pipelineId: 'p',
    locationId: 'l',
    name: 'Lead',
    pipelineStageId: 's',
    status: 'open',
    contactId: 'c',
    assignedTo: 'o',
    customFields: [],
  }), { id: 'opp-nested' });

  const flat = new HighLevelApiClient('token', 1000, async () => (
    jsonResponse(201, { id: 'opp-flat' })
  ));
  assert.deepEqual(await flat.createOpportunity({
    pipelineId: 'p',
    locationId: 'l',
    name: 'Lead',
    pipelineStageId: 's',
    status: 'open',
    contactId: 'c',
    assignedTo: 'o',
    customFields: [],
  }), { id: 'opp-flat' });
});

test('keeps a sanitized HighLevel 400 detail and drops PII-looking text', async () => {
  const safe = new HighLevelApiClient('token', 1000, async () => (
    jsonResponse(400, { message: 'This location already has an open opportunity' })
  ));
  await assert.rejects(
    () => safe.upsertContact({
      name: 'Ada',
      email: 'ada@example.com',
      locationId: 'l',
      assignedTo: 'o',
      customFields: [],
      createNewIfDuplicateAllowed: false,
    }),
    (error: unknown) => (
      error instanceof HighLevelApiError
      && error.status === 400
      && error.detail === 'This location already has an open opportunity'
    ),
  );

  const pii = new HighLevelApiClient('token', 1000, async () => (
    jsonResponse(400, { message: 'Duplicate email ada@example.com' })
  ));
  await assert.rejects(
    () => pii.upsertContact({
      name: 'Ada',
      email: 'ada@example.com',
      locationId: 'l',
      assignedTo: 'o',
      customFields: [],
      createNewIfDuplicateAllowed: false,
    }),
    (error: unknown) => (
      error instanceof HighLevelApiError
      && error.status === 400
      && error.detail === undefined
    ),
  );
});
