import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  BUILD_BUDGET_MS,
  runGuardedCommand,
} from '../scripts/build-with-budget.mjs';

const require = createRequire(import.meta.url);
const nextConfig = require('../next.config.js');

test('bounds WordPress-backed static generation and avoids nested page retries', () => {
  assert.equal(nextConfig.experimental.staticGenerationMaxConcurrency, 2);
  assert.ok(nextConfig.experimental.staticGenerationMaxConcurrency <= 2);
  assert.equal(nextConfig.experimental.staticGenerationMinPagesPerWorker, 1_000);
  assert.equal(nextConfig.experimental.staticGenerationRetryCount, 1);
  assert.equal(BUILD_BUDGET_MS, 90_000);
});

test('build timeout kills the complete process group without an orphan', {
  skip: process.platform === 'win32' ? 'POSIX process-group assertion' : false,
}, async () => {
  const fixture = fileURLToPath(new URL('./fixtures/process-tree.mjs', import.meta.url));
  let output = '';
  let grandchildPid;

  const result = await runGuardedCommand(process.execPath, [fixture], {
    budgetMs: 75,
    forceKillGraceMs: 75,
    stdio: ['ignore', 'pipe', 'pipe'],
    onSpawn(child) {
      child.stdout.on('data', (chunk) => {
        output += chunk.toString();
      });
    },
  });

  const match = output.match(/GRANDCHILD_PID=(\d+)/);
  assert.ok(match, `expected grandchild pid in output: ${output}`);
  grandchildPid = Number(match[1]);
  assert.equal(result, 124);

  let alive = true;
  for (let attempt = 0; attempt < 20 && alive; attempt += 1) {
    try {
      process.kill(grandchildPid, 0);
      await new Promise((resolve) => setTimeout(resolve, 25));
    } catch (error) {
      if (error?.code !== 'ESRCH') throw error;
      alive = false;
    }
  }
  assert.equal(alive, false, `grandchild ${grandchildPid} survived the build timeout`);
});
