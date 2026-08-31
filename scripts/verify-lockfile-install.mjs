#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-lockfile-gate-'));

try {
  await copyFile(path.join(repositoryRoot, 'package.json'), path.join(temporary, 'package.json'));
  await copyFile(path.join(repositoryRoot, 'package-lock.json'), path.join(temporary, 'package-lock.json'));
  const npmCli = process.env.npm_execpath;
  if (!npmCli) throw new Error('npm_execpath is required; run this gate through npm');
  const result = spawnSync(process.execPath, [
    npmCli,
    'ci',
    '--ignore-scripts',
    '--no-audit',
    '--no-fund',
  ], {
    cwd: temporary,
    encoding: 'utf8',
    env: process.env,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const combined = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
    const mismatch = combined.split('\n').find((line) => /Missing: .* from lock file/.test(line));
    process.stderr.write(`lockfile-gate: ${mismatch?.trim() ?? `npm ci failed with exit ${result.status}`}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write('lockfile-gate: npm ci reproducibility PASS\n');
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
