import assert from 'node:assert/strict';
import test from 'node:test';
import { RedisRestIdempotencyStore } from '../../lib/contact/idempotency.ts';
import { processContactPipeline } from '../../lib/contact/orchestrator.ts';
import { DryRunHighLevelGateway } from '../../lib/highlevel/client.ts';
import { syncWebsiteLeadToHighLevel } from '../../lib/highlevel/workflow.ts';
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
      const key = String(command[3]);
      const currentRaw = records.get(key);
      const current = currentRaw ? JSON.parse(currentRaw) as { state: string; owner?: string } : null;

      if (command.length === 5) {
        const owner = String(command[4]);
        if (!current || (current.state === 'delivery_processing' && current.owner === owner)) {
          records.delete(key);
          result = 1;
        } else {
          result = 0;
        }
      } else {
        const from = String(command[4]);
        const owner = String(command[5]);
        if (current && current.state === from && (!owner || current.owner === owner)) {
          records.set(key, String(command[6]));
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
    redis.fetchImpl,
  );
  const gateway = new DryRunHighLevelGateway();
  let deliveries = 0;

  const run = (ownerId: string) => processContactPipeline(lead, {
    store,
    deliver: async () => { deliveries += 1; },
    syncCrm: (submission) => syncWebsiteLeadToHighLevel(submission, gateway, config).then(() => undefined),
    dryRun: true,
    ownerId,
  });

  const first = await run('preview-attempt-1');
  const replay = await run('preview-attempt-2');

  assert.deepEqual(first, {
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
});
