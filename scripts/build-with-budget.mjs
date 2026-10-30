import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { shouldRunPreviewMigrate, shouldRunPreviewPaginasB4Seed } from '../lib/cms-database.mjs';

export const BUILD_WARNING_MS = 90_000;
export const BUILD_INACTIVITY_MS = 180_000;
export const BUILD_BUDGET_MS = 300_000;
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
  const warningMs = options.warningMs ?? BUILD_WARNING_MS;
  const inactivityMs = options.inactivityMs ?? BUILD_INACTIVITY_MS;
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
      env: options.env ?? process.env,
    },
  );
  if (!options.stdio) {
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  }
  options.onSpawn?.(child);
  let exceededBudget = false;
  let inactivityTimer;
  let forwardedSignal;
  let forceKillPromise = Promise.resolve();
  let forceKillTimer;

  const terminateGroup = (signal) => {
    if (forwardedSignal || exceededBudget) return;
    forwardedSignal = signal;
    killProcessTree(child, signal);
    forceKillPromise = new Promise((resolve) => {
      forceKillTimer = setTimeout(() => {
        killProcessTree(child, 'SIGKILL');
        resolve();
      }, forceKillGraceMs);
    });
  };
  const onSigterm = () => terminateGroup('SIGTERM');
  const onSigint = () => terminateGroup('SIGINT');
  process.on('SIGTERM', onSigterm);
  process.on('SIGINT', onSigint);

  const stopForBudget = (message) => {
    if (forwardedSignal || exceededBudget) return;
    exceededBudget = true;
    console.error(message);
    killProcessTree(child, 'SIGTERM');
    forceKillPromise = new Promise((resolve) => {
      forceKillTimer = setTimeout(() => {
        killProcessTree(child, 'SIGKILL');
        resolve();
      }, forceKillGraceMs);
    });
  };

  const trackActivity = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      stopForBudget(`Build produced no output for ${inactivityMs / 1_000}s; stopping the stalled process group.`);
    }, inactivityMs);
  };
  const tracksOutput = Boolean(child.stdout || child.stderr);
  if (tracksOutput) {
    child.stdout?.on('data', trackActivity);
    child.stderr?.on('data', trackActivity);
    trackActivity();
  }

  const warningTimer = setTimeout(() => {
    if (forwardedSignal || exceededBudget) return;
    const message = `Build passed the ${warningMs / 1_000}s warning budget; continuing to the ${budgetMs / 1_000}s hard limit.`;
    if (options.onWarning) options.onWarning(message);
    else console.warn(message);
  }, warningMs);

  const timer = setTimeout(() => {
    stopForBudget(`Build exceeded the ${budgetMs / 1_000}s absolute resilience budget.`);
  }, budgetMs);

  let exitCode;
  try {
    exitCode = await new Promise((resolve) => {
      child.once('exit', (code) => resolve(code));
      child.once('error', () => resolve(1));
    });
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    clearTimeout(timer);

    if (exceededBudget || forwardedSignal) {
      // Wait for the forced group kill even if the leader exits on the gentle
      // signal; a descendant may ignore it and otherwise become an orphan.
      await forceKillPromise;
    }
  } finally {
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    clearTimeout(timer);
    child.stdout?.removeListener('data', trackActivity);
    child.stderr?.removeListener('data', trackActivity);
    if (!exceededBudget && !forwardedSignal && forceKillTimer) {
      clearTimeout(forceKillTimer);
    }
    process.removeListener('SIGTERM', onSigterm);
    process.removeListener('SIGINT', onSigint);
  }

  if (exceededBudget) return 124;
  if (forwardedSignal === 'SIGTERM') return 128 + 15;
  if (forwardedSignal === 'SIGINT') return 128 + 2;
  return typeof exitCode === 'number' ? exitCode : 1;
}

export { shouldRunPreviewMigrate, shouldRunPreviewPaginasB4Seed };

function redactSecrets(text) {
  return String(text).replace(/postgres(?:ql)?:\/\/[^\s]+/gi, 'postgres://***');
}

function shortErrorMessage(stdout, stderr, exitCode) {
  const combined = redactSecrets(`${stderr}\n${stdout}`).replace(/\s+/g, ' ').trim();
  if (!combined) return `exit code ${exitCode}`;
  return combined.length > 180 ? `${combined.slice(0, 177)}…` : combined;
}

export function summarizeSeedPaginasB4Output(output) {
  const text = String(output);
  const okLines = text.match(/^\[H6-B4\] [\w-]+ OK/gm) ?? [];
  const errLines = text.match(/^\[H6-B4\] [\w-]+ ERROR/gm) ?? [];
  const resumen = text.match(/\[H6-B4\] resumen: (\d+) OK \/ (\d+) ERROR/);
  if (!resumen) return null;
  return {
    ok: Number(resumen[1]),
    err: Number(resumen[2]),
    slugOkCount: okLines.length,
    slugErrCount: errLines.length,
  };
}

async function runGuardedCommandWithCapture(command, args, options = {}) {
  let stdout = '';
  let stderr = '';
  const exitCode = await runGuardedCommand(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
    onSpawn(child) {
      options.onSpawn?.(child);
      child.stdout?.on('data', (chunk) => {
        stdout += chunk.toString();
        process.stdout.write(chunk);
      });
      child.stderr?.on('data', (chunk) => {
        stderr += chunk.toString();
        process.stderr.write(chunk);
      });
    },
  });
  return { exitCode, stdout, stderr };
}

export async function runPayloadPreviewSeedPaginasB4(env = process.env) {
  if (!shouldRunPreviewPaginasB4Seed(env)) {
    console.log(
      'cms:seed-paginas-b4: omitido (requiere VERCEL_ENV=preview y DATABASE_URL; nunca Production)',
    );
    return 0;
  }
  console.log('cms:seed-paginas-b4: ejecutando (Preview, DATABASE_URL presente)');
  const { exitCode, stdout, stderr } = await runGuardedCommandWithCapture(
    process.execPath,
    ['scripts/seed-paginas-b4.mts'],
    { env, budgetMs: BUILD_BUDGET_MS, inactivityMs: BUILD_INACTIVITY_MS },
  );
  if (exitCode !== 0) {
    console.log(`seed-paginas-b4 ERROR: ${shortErrorMessage(stdout, stderr, exitCode)}`);
    return exitCode;
  }
  const summary = summarizeSeedPaginasB4Output(stdout);
  if (!summary || summary.err > 0 || summary.slugOkCount < 2) {
    console.log('seed-paginas-b4 ERROR: se esperaban [H6-B4] contactar-agencia-de-marketing-digital y reunion-playful OK');
    return 1;
  }
  console.log(
    `seed-paginas-b4 OK: ${summary.ok} OK / ${summary.err} ERROR (${summary.slugOkCount} slug(s) [H6-B4])`,
  );
  return 0;
}

export function payloadMigrateArgs() {
  return ['node_modules/payload/bin.js', 'migrate', '--disable-transpile'];
}

export async function runPayloadPreviewMigrate(env = process.env) {
  if (!shouldRunPreviewMigrate(env)) {
    console.log('payload migrate: omitido (sin DATABASE_URL o VERCEL_ENV=production)');
    return 0;
  }
  console.log('payload migrate: ejecutando (Preview/Development, DATABASE_URL presente)');
  const migrateEnv = { ...env, PAYLOAD_MIGRATING: 'true' };
  return runGuardedCommand(
    process.execPath,
    payloadMigrateArgs(),
    { env: migrateEnv },
  );
}

export async function runGuardedBuild() {
  const migrateCode = await runPayloadPreviewMigrate();
  if (migrateCode !== 0) return migrateCode;
  const seedCode = await runPayloadPreviewSeedPaginasB4();
  if (seedCode !== 0) return seedCode;
  return runGuardedCommand(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'build'],
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  process.exitCode = await runGuardedBuild();
}
