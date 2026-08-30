import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const BUILD_BUDGET_MS = 90_000;

export async function runGuardedBuild() {
  const child = spawn(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'build'],
    { stdio: 'inherit' },
  );
  let exceededBudget = false;
  let forceKillTimer;
  const timer = setTimeout(() => {
    exceededBudget = true;
    console.error(`Build exceeded the ${BUILD_BUDGET_MS / 1_000}s resilience budget.`);
    child.kill('SIGTERM');
    forceKillTimer = setTimeout(() => child.kill('SIGKILL'), 5_000);
  }, BUILD_BUDGET_MS);

  const exitCode = await new Promise((resolve) => {
    child.once('exit', (code) => resolve(code));
    child.once('error', () => resolve(1));
  });
  clearTimeout(timer);
  if (forceKillTimer) clearTimeout(forceKillTimer);

  if (exceededBudget) return 124;
  return typeof exitCode === 'number' ? exitCode : 1;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  process.exitCode = await runGuardedBuild();
}
