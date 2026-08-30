import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const BUILD_BUDGET_MS = 90_000;
export const FORCE_KILL_GRACE_MS = 5_000;

function killProcessTree(child, signal) {
  if (!child.pid) return;
  if (process.platform === 'win32') {
    const args = ['/pid', String(child.pid), '/t'];
    if (signal === 'SIGKILL') args.push('/f');
    spawn('taskkill', args, { stdio: 'ignore' });
    return;
  }

  try {
    // The child is detached on POSIX, so the negative pid targets its complete
    // process group, including webpack/Next workers and their descendants.
    process.kill(-child.pid, signal);
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error;
  }
}

export async function runGuardedCommand(command, args, options = {}) {
  const budgetMs = options.budgetMs ?? BUILD_BUDGET_MS;
  const forceKillGraceMs = options.forceKillGraceMs ?? FORCE_KILL_GRACE_MS;
  const stdio = options.stdio ?? ['ignore', 'pipe', 'pipe'];
  const child = spawn(
    command,
    args,
    {
      // A detached POSIX group must not write directly to the parent's PTY or
      // it can be suspended as a background terminal group. Pipe and forward
      // instead while retaining visible build logs.
      stdio,
      detached: process.platform !== 'win32',
    },
  );
  if (!options.stdio) {
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  }
  options.onSpawn?.(child);
  let exceededBudget = false;
  let forceKillPromise = Promise.resolve();
  const timer = setTimeout(() => {
    exceededBudget = true;
    console.error(`Build exceeded the ${budgetMs / 1_000}s resilience budget.`);
    killProcessTree(child, 'SIGTERM');
    forceKillPromise = new Promise((resolve) => {
      setTimeout(() => {
        killProcessTree(child, 'SIGKILL');
        resolve();
      }, forceKillGraceMs);
    });
  }, budgetMs);

  const exitCode = await new Promise((resolve) => {
    child.once('exit', (code) => resolve(code));
    child.once('error', () => resolve(1));
  });
  clearTimeout(timer);

  if (exceededBudget) {
    // Wait for the forced group kill even if the leader exits on SIGTERM; a
    // descendant may ignore SIGTERM and otherwise become an orphan.
    await forceKillPromise;
    return 124;
  }
  return typeof exitCode === 'number' ? exitCode : 1;
}

export function runGuardedBuild() {
  return runGuardedCommand(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'build'],
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  process.exitCode = await runGuardedBuild();
}
