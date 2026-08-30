import assert from 'node:assert/strict';
import test from 'node:test';
import { RedisRestIdempotencyStore } from '../../lib/contact/idempotency.ts';
import { processContactPipeline } from '../../lib/contact/orchestrator.ts';
import { DryRunHighLevelGateway } from '../../lib/highlevel/client.ts';
import { syncWebsiteLeadToHighLevel } from '../../lib/highlevel/workflow.ts';
import { UncertainContactDeliveryError } from '../../lib/contact/delivery.ts';
import { config, lead } from './fixtures.ts';

function redisRestDouble() {
  const records = new Map<string, string>();
  const bodies: string[] = [];

  const fetchImpl: typeof fetch = async (_input, init) => {
    const body = String(init?.body || '');
    bodies.push(body);
    const command = JSON.parse(body) as Array<string | number>;
    const operation = command[0];
    let result: string | number | null = null;

    if (operation === 'SET') {
      const key = String(command[1]);
      if (!records.has(key)) {
        records.set(key, String(command[2]));
        result = 'OK';
      }
    } else if (operation === 'GET') {
      result = records.get(String(command[1])) || null;
    } else if (operation === 'EVAL') {
      const script = String(command[1]);
      const firstKey = String(command[3]);
      if (Number(command[2]) === 1) {
        const owner = String(command[4]);
        if (records.get(firstKey) === owner) {
          records.delete(firstKey);
          result = 1;
        } else {
          result = 0;
        }
      } else {
        const stateKey = String(command[4]);
        const owner = String(command[5]);
        if (records.get(firstKey) === owner) {
          if (script.includes("redis.call('DEL', KEYS[2])")) {
            records.delete(stateKey);
          } else {
            records.set(stateKey, String(command[6]));
          }
          if (script.includes("redis.call('DEL', KEYS[1])")) records.delete(firstKey);
          result = 1;
        } else {
          result = 0;
        }
      }
    }

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  return { fetchImpl, bodies };
}

test('Preview E2E entrega una vez, simula CRM y no guarda PII en Redis', async () => {
  const redis = redisRestDouble();
  const store = new RedisRestIdempotencyStore(
    'https://redis.test',
    'test-token',
    config.idempotencyTtlSeconds,
    config.leaseSeconds,
    redis.fetchImpl,
  );
  const gateway = new DryRunHighLevelGateway();
  let deliveries = 0;

  const run = (ownerId: string) => processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: (submission, control) => syncWebsiteLeadToHighLevel(
      submission,
      gateway,
      config,
      new Date(),
      control,
    ).then(() => undefined),
    dryRun: true,
    ownerId,
  });

  const first = await run('preview-attempt-1');
  const replay = await run('preview-attempt-2');

  assert.deepEqual(first, {
    deliveryStatus: 'confirmed',
    delivered: true,
    crmSynced: true,
    dryRun: true,
    replayed: false,
  });
  assert.equal(replay.replayed, true);
  assert.equal(deliveries, 1);

  const redisTraffic = redis.bodies.join('\n');
  assert.equal(redisTraffic.includes(lead.email), false);
  assert.equal(redisTraffic.includes(lead.phone || ''), false);
  assert.equal(redisTraffic.includes(lead.name), false);
  assert.equal(redisTraffic.includes('"NX","EX",30'), true);
  assert.equal(redisTraffic.includes('604800'), true);
});

test('Preview E2E conserva delivery_uncertain y no reenvía después de una respuesta perdida', async () => {
  const redis = redisRestDouble();
  const store = new RedisRestIdempotencyStore(
    'https://redis.test',
    'test-token',
    config.idempotencyTtlSeconds,
    config.leaseSeconds,
    redis.fetchImpl,
  );
  let deliveries = 0;

  const first = await processContactPipeline(lead, {
    store,
    deliver: async () => {
      deliveries += 1;
      throw new UncertainContactDeliveryError();
    },
    dryRun: false,
    ownerId: 'uncertain-attempt-1',
  });
  const replay = await processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    dryRun: false,
    ownerId: 'uncertain-attempt-2',
  });

  assert.equal(first.deliveryStatus, 'pending_confirmation');
  assert.equal(replay.deliveryStatus, 'pending_confirmation');
  assert.equal(replay.replayed, true);
  assert.equal(deliveries, 1);
  const traffic = redis.bodies.join('\n');
  assert.match(traffic, /delivery_pending/);
  assert.match(traffic, /delivery_uncertain/);
  assert.equal(traffic.includes(lead.email), false);
});
