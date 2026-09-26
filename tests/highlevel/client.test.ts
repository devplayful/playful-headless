import assert from 'node:assert/strict';
import test from 'node:test';
import { HighLevelApiClient, HighLevelApiError } from '../../lib/highlevel/client.ts';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

test('create task accepts both HighLevel response envelopes', async () => {
  const nested = new HighLevelApiClient('token', 1000, async () => (
    jsonResponse(201, { task: { id: 'task-nested' } })
  ));
  assert.deepEqual(
    await nested.createTask('c', {
      title: 'Responder consulta web',
      body: 'marker',
      dueDate: '2026-09-26T00:00:00.000Z',
      completed: false,
      assignedTo: 'o',
    }),
    { id: 'task-nested' },
  );

  const flat = new HighLevelApiClient('token', 1000, async () => (
    jsonResponse(201, { id: 'task-flat' })
  ));
  assert.deepEqual(
    await flat.createTask('c', {
      title: 'Responder consulta web',
      body: 'marker',
      dueDate: '2026-09-26T00:00:00.000Z',
      completed: false,
      assignedTo: 'o',
    }),
    { id: 'task-flat' },
  );
});

test('treats an empty 2xx HighLevel body as a recoverable API error, not a TypeError', async () => {
  const client = new HighLevelApiClient('token', 1000, async () => (
    new Response('', { status: 201, headers: { 'Content-Type': 'application/json' } })
  ));
  await assert.rejects(
    () => client.createTask('c', {
      title: 'Responder consulta web',
      body: 'marker',
      dueDate: '2026-09-26T00:00:00.000Z',
      completed: false,
      assignedTo: 'o',
    }),
    (error: unknown) => (
      error instanceof HighLevelApiError
      && error.status === 502
      && error.operation === 'create follow-up task'
      && error.detail === 'respuesta vacía'
    ),
  );
});

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
