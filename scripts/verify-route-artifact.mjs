#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  discoverSourceRoutes,
  loadArtifactRoutes,
  verifyRouteInventory,
} from './route-integrity-lib.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function git(args) {
  return execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const options = {
    artifact: '.next',
    manifest: 'config/expected-routes.json',
    commit: 'HEAD',
  };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (!['--artifact', '--manifest', '--commit'].includes(argument)) {
      throw new Error(`unknown argument: ${argument}`);
    }
    const value = argv[index + 1];
    if (!value) throw new Error(`${argument} requires a value`);
    options[argument.slice(2)] = value;
    index += 1;
  }
  return options;
}

function assertCleanCommit(commit, baselineCommit) {
  const status = git(['status', '--porcelain=v1', '--untracked-files=all']);
  if (status) throw new Error('working tree must be clean before route verification');

  const head = git(['rev-parse', 'HEAD^{commit}']);
  const resolvedCommit = git(['rev-parse', `${commit}^{commit}`]);
  if (head !== resolvedCommit) throw new Error('--commit must resolve to the checked-out clean HEAD');

  try {
    execFileSync('git', ['merge-base', '--is-ancestor', baselineCommit, resolvedCommit], {
      cwd: repositoryRoot,
      stdio: 'ignore',
    });
  } catch {
    throw new Error(`commit ${resolvedCommit} does not descend from baseline ${baselineCommit}`);
  }
  return resolvedCommit;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const manifestPath = path.resolve(repositoryRoot, options.manifest);
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const commit = assertCleanCommit(options.commit, manifest.baselineCommit);
  const trackedFiles = git(['ls-tree', '-r', '--name-only', commit, '--', 'app']).split('\n').filter(Boolean);
  const sourceRoutes = discoverSourceRoutes(trackedFiles);
  const artifactRoutes = await loadArtifactRoutes(path.resolve(repositoryRoot, options.artifact));
  const result = verifyRouteInventory({ sourceRoutes, artifactRoutes, manifest });

  if (!result.ok) {
    for (const error of result.errors) process.stderr.write(`route-integrity: ${error}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`${JSON.stringify({
    ok: true,
    commit,
    baselineCommit: manifest.baselineCommit,
    sourceRouteCount: result.sourceRoutes.length,
    artifactRouteCount: result.artifactRoutes.length,
    criticalRouteCount: manifest.criticalRoutes.length,
  })}\n`);
}

main().catch((error) => {
  process.stderr.write(`route-integrity: ${error.message}\n`);
  process.exitCode = 1;
});
