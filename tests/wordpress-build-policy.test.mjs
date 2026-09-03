import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import {
  BUILD_BUDGET_MS,
  BUILD_INACTIVITY_MS,
  BUILD_WARNING_MS,
  runGuardedCommand,
} from '../scripts/build-with-budget.mjs';

const require = createRequire(import.meta.url);
const nextConfig = require('../next.config.js');

test('bounds WordPress-backed static generation and avoids nested page retries', () => {
  assert.equal(nextConfig.experimental.staticGenerationMaxConcurrency, 2);
  assert.ok(nextConfig.experimental.staticGenerationMaxConcurrency <= 2);
  assert.equal(nextConfig.experimental.staticGenerationMinPagesPerWorker, 1_000);
  assert.equal(nextConfig.experimental.staticGenerationRetryCount, 1);
  assert.equal(BUILD_WARNING_MS, 90_000);
  assert.equal(BUILD_INACTIVITY_MS, 90_000);
  assert.equal(BUILD_BUDGET_MS, 300_000);
});

test('redirect inventory requests only the fields consumed by the build', async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl;
  globalThis.fetch = async (input) => {
    requestedUrl = new URL(String(input));
    return new Response(JSON.stringify([{
      slug: 'sample-post',
      _links: {},
      _embedded: {
        'wp:term': [[
          { taxonomy: 'category', slug: 'primary' },
          { taxonomy: 'category', slug: 'secondary' },
        ]],
      },
    }]), {
      status: 200,
      headers: { 'x-wp-totalpages': '1', 'content-type': 'application/json' },
    });
  };

  try {
    const redirects = await nextConfig.redirects();
    assert.equal(requestedUrl.searchParams.get('_embed'), 'wp:term');
    assert.equal(requestedUrl.searchParams.get('_fields'), 'slug,_links,_embedded');
    assert.deepEqual(redirects, [{
      source: '/blog/secondary/sample-post',
      destination: '/blog/primary/sample-post',
      permanent: true,
    }]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('warning budget reports slow progress without terminating a healthy command', async () => {
  const warnings = [];
  const result = await runGuardedCommand(
    process.execPath,
    ['-e', 'setTimeout(() => process.exit(0), 40)'],
    {
      warningMs: 10,
      budgetMs: 250,
      onWarning(message) {
        warnings.push(message);
      },
    },
  );

  assert.equal(result, 0);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /continuing/);
  assert.match(warnings[0], /hard limit/);
});

test('inactivity budget stops a command that makes no observable progress', async () => {
  const result = await runGuardedCommand(
    process.execPath,
    ['-e', 'setTimeout(() => process.exit(0), 250)'],
    {
      warningMs: 500,
      inactivityMs: 30,
      budgetMs: 500,
      forceKillGraceMs: 25,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  assert.equal(result, 124);
});

test('inactivity shutdown suppresses a simultaneous continuing warning', async () => {
  const warnings = [];
  const result = await runGuardedCommand(
    process.execPath,
    ['-e', 'setTimeout(() => process.exit(0), 250)'],
    {
      warningMs: 30,
      inactivityMs: 30,
      budgetMs: 500,
      forceKillGraceMs: 25,
      stdio: ['ignore', 'pipe', 'pipe'],
      onWarning(message) {
        warnings.push(message);
      },
    },
  );

  assert.equal(result, 124);
  assert.deepEqual(warnings, []);
});

test('observable progress extends the inactivity budget', async () => {
  const result = await runGuardedCommand(
    process.execPath,
    ['-e', 'let count = 0; const timer = setInterval(() => { console.log(++count); if (count === 5) { clearInterval(timer); process.exit(0); } }, 40)'],
    {
      warningMs: 500,
      inactivityMs: 100,
      budgetMs: 500,
      forceKillGraceMs: 25,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  assert.equal(result, 0);
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

test('external SIGTERM is forwarded by the wrapper and force-kills descendants', {
  skip: process.platform === 'win32' ? 'POSIX process-group assertion' : false,
}, async () => {
  const fixture = fileURLToPath(new URL('./fixtures/external-signal-wrapper.mjs', import.meta.url));
  const wrapper = spawn(process.execPath, [fixture], { stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  let grandchildPid;

  await new Promise((resolve, reject) => {
    const onData = (chunk) => {
      output += chunk.toString();
      const match = output.match(/GRANDCHILD_PID=(\d+)/);
      if (!match) return;
      grandchildPid = Number(match[1]);
      wrapper.stdout.off('data', onData);
      resolve();
    };
    wrapper.stdout.on('data', onData);
    wrapper.once('error', reject);
    wrapper.once('exit', (code, signal) => {
      reject(new Error(`wrapper exited before its child was ready: code=${code} signal=${signal}`));
    });
  });

  wrapper.kill('SIGTERM');
  const { code, signal } = await new Promise((resolve, reject) => {
    wrapper.once('error', reject);
    wrapper.once('exit', (code, signal) => resolve({ code, signal }));
  });
  assert.equal(signal, null);
  assert.equal(code, 143);

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
  assert.equal(alive, false, `grandchild ${grandchildPid} survived external SIGTERM`);
});
