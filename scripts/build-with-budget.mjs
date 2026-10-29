import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { shouldRunPreviewMigrate, shouldRunPreviewServiciosSeed } from '../lib/cms-database.mjs';

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

export { shouldRunPreviewMigrate, shouldRunPreviewServiciosSeed };

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

export function summarizeSeedServiciosOutput(output) {
  const text = String(output);
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd <= jsonStart) return null;
  try {
    const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    const acciones = parsed?.acciones && typeof parsed.acciones === 'object' ? parsed.acciones : {};
    const values = Object.values(acciones);
    const creados = values.filter((value) => value === 'creado').length;
    const actualizados = values.filter((value) => value === 'actualizado').length;
    return { creados, actualizados };
  } catch {
    return null;
  }
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

export async function runPayloadPreviewSeedServicios(env = process.env) {
  if (!shouldRunPreviewServiciosSeed(env)) {
    console.log(
      'cms:seed-servicios: omitido (requiere VERCEL_ENV=preview y DATABASE_URL; nunca Production)',
    );
    return 0;
  }
  console.log('cms:seed-servicios: ejecutando (Preview, DATABASE_URL presente)');
  const { exitCode, stdout, stderr } = await runGuardedCommandWithCapture(
    process.execPath,
    ['scripts/seed-servicios.ts'],
    {
      env,
      budgetMs: BUILD_BUDGET_MS,
      inactivityMs: BUILD_INACTIVITY_MS,
    },
  );
  if (exitCode !== 0) {
    console.log(`seed-servicios ERROR: ${shortErrorMessage(stdout, stderr, exitCode)}`);
    return exitCode;
  }
  const counts = summarizeSeedServiciosOutput(stdout);
  if (!counts) {
    console.log('seed-servicios ERROR: no se pudo leer el resumen del seed');
    return 1;
  }
  console.log(`seed-servicios OK: ${counts.creados} creados / ${counts.actualizados} actualizados`);
  return exitCode;
}

export async function runGuardedBuild() {
  const migrateCode = await runPayloadPreviewMigrate();
  if (migrateCode !== 0) return migrateCode;
  const seedCode = await runPayloadPreviewSeedServicios();
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
