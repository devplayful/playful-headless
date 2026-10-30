import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { shouldRunPreviewMigrate, shouldRunPreviewCasosSeed } from '../lib/cms-database.mjs';

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

export { shouldRunPreviewMigrate, shouldRunPreviewCasosSeed };

export function payloadMigrateArgs() {
  return ['node_modules/payload/bin.js', 'migrate', '--disable-transpile'];
}

function redactSecrets(text) {
  return String(text)
    .replace(/postgres(?:ql)?:\/\/[^\s'"`]+/gi, '[database-url]')
    .replace(/\bDATABASE_URL(?:_UNPOOLED)?=[^\s]+/gi, 'DATABASE_URL=[redacted]')
    .trim();
}

function shortErrorMessage(stdout, stderr, exitCode) {
  const combined = redactSecrets(`${stderr}\n${stdout}`).replace(/\s+/g, ' ').trim();
  if (!combined) return `exit code ${exitCode}`;
  return combined.length > 180 ? `${combined.slice(0, 177)}…` : combined;
}

export function summarizePayloadMigrateOutput(output) {
  const text = String(output);
  const applied = [];
  const patterns = [
    /Migrat(?:e|ed|ing)(?::\s*|\s+)(20\d{6}_\d+)/gi,
    /Ran migration (20\d{6}_\d+)/gi,
    /Applying migration (20\d{6}_\d+)/gi,
  ];
  for (const pattern of patterns) {
    let match = pattern.exec(text);
    while (match) {
      applied.push(match[1]);
      match = pattern.exec(text);
    }
  }
  const unique = [...new Set(applied)];
  if (unique.length) return unique.join(', ');
  if (/no migrations|nothing to migrate|already up to date|nada pendiente|0 migrations/i.test(text)) {
    return 'nada pendiente';
  }
  return 'nada pendiente';
}

export function summarizePreviewH4CasosOutput(output) {
  const text = String(output);
  const slugLines = [...text.matchAll(/^\[H4-CASOS\] ([a-z0-9-]+) (OK|ERROR)/gm)];
  const ok = slugLines.filter((match) => match[2] === 'OK').length;
  const err = slugLines.filter((match) => match[2] === 'ERROR').length;
  const resumen = text.match(/\[H4-CASOS\] resumen: (\d+) OK \/ (\d+) ERROR/);
  const lines = slugLines.map((match) => match[0]);
  return {
    ok: resumen ? Number(resumen[1]) : ok,
    err: resumen ? Number(resumen[2]) : err,
    lines,
    resumenLine: resumen ? resumen[0] : null,
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

export async function runPayloadPreviewMigrate(env = process.env) {
  if (!shouldRunPreviewMigrate(env)) {
    console.log('payload migrate: omitido (sin DATABASE_URL o VERCEL_ENV=production)');
    return 0;
  }
  console.log('payload migrate: ejecutando (Preview/Development, DATABASE_URL presente)');
  const migrateEnv = { ...env, PAYLOAD_MIGRATING: 'true' };
  const { exitCode, stdout, stderr } = await runGuardedCommandWithCapture(
    process.execPath,
    payloadMigrateArgs(),
    { env: migrateEnv },
  );
  if (exitCode !== 0) {
    console.log(`payload migrate ERROR: ${shortErrorMessage(stdout, stderr, exitCode)}`);
    return exitCode;
  }
  console.log(`payload migrate OK: ${summarizePayloadMigrateOutput(`${stdout}\n${stderr}`)}`);
  return exitCode;
}

export async function runPayloadPreviewH4Casos(env = process.env) {
  if (!shouldRunPreviewCasosSeed(env)) {
    console.log(
      'preview-h4-casos: omitido (requiere VERCEL_ENV=preview y DATABASE_URL; nunca Production)',
    );
    return 0;
  }
  console.log('preview-h4-casos: ejecutando import WP casos + seed (Preview, DATABASE_URL presente)');
  const { exitCode, stdout, stderr } = await runGuardedCommandWithCapture(
    process.execPath,
    ['scripts/preview-h4-casos.mts'],
    {
      env,
      budgetMs: BUILD_BUDGET_MS,
      inactivityMs: BUILD_INACTIVITY_MS,
    },
  );
  const combined = `${stdout}\n${stderr}`;
  const summary = summarizePreviewH4CasosOutput(combined);
  if (exitCode !== 0) {
    console.log(`preview-h4-casos ERROR: ${shortErrorMessage(stdout, stderr, exitCode)}`);
    return exitCode;
  }
  if (summary.resumenLine) {
    console.log(summary.resumenLine);
  }
  console.log(
    `preview-h4-casos OK: ${summary.ok} OK / ${summary.err} ERROR (${summary.lines.length} casos [H4-CASOS])`,
  );
  if (summary.lines.length !== 3 || summary.err !== 0) {
    console.log('preview-h4-casos ERROR: se esperaban 3 líneas OK por slug');
    return 1;
  }
  return exitCode;
}

export async function runGuardedBuild() {
  const migrateCode = await runPayloadPreviewMigrate();
  if (migrateCode !== 0) return migrateCode;
  const h4Code = await runPayloadPreviewH4Casos();
  if (h4Code !== 0) return h4Code;
  return runGuardedCommand(
    process.execPath,
    ['node_modules/next/dist/bin/next', 'build'],
  );
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  process.exitCode = await runGuardedBuild();
}
