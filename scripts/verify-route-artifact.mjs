#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  assertArtifactProvenance,
  discoverSourceRoutes,
  loadArtifactBundle,
  verifyRouteInventory,
} from './route-integrity-lib.mjs';

export const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function git(args) {
  return execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' }).trim();
}

function parseArgs(argv) {
  const options = { artifact: '.next', manifest: 'config/expected-routes.json', commit: 'HEAD' };
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

export async function resolveCleanHead({ commit = 'HEAD', manifestPath = 'config/expected-routes.json' } = {}) {
  const absoluteManifest = path.resolve(repositoryRoot, manifestPath);
  const manifest = JSON.parse(await readFile(absoluteManifest, 'utf8'));
  const status = git(['status', '--porcelain=v1', '--untracked-files=all']);
  if (status) throw new Error('working tree must be clean before route verification');
  const head = git(['rev-parse', 'HEAD^{commit}']);
  const resolvedCommit = git(['rev-parse', `${commit}^{commit}`]);
  if (head !== resolvedCommit) throw new Error('--commit must resolve to the checked-out clean HEAD');
  try {
    execFileSync('git', ['merge-base', '--is-ancestor', manifest.baselineCommit, resolvedCommit], {
      cwd: repositoryRoot,
      stdio: 'ignore',
    });
  } catch {
    throw new Error(`commit ${resolvedCommit} does not descend from baseline ${manifest.baselineCommit}`);
  }
  return { commit: resolvedCommit, manifest, manifestPath: absoluteManifest };
}

export function provenancePathForArtifact(artifactPath) {
  return path.join(path.resolve(repositoryRoot, artifactPath), 'route-integrity-provenance.json');
}

export async function verifyArtifactAgainstHead({
  artifactPath = '.next',
  manifestPath = 'config/expected-routes.json',
  commit = 'HEAD',
} = {}) {
  const resolved = await resolveCleanHead({ commit, manifestPath });
  const trackedFiles = git(['ls-tree', '-r', '--name-only', resolved.commit, '--', 'app'])
    .split('\n')
    .filter(Boolean);
  const sourceRoutes = discoverSourceRoutes(trackedFiles);
  const artifact = await loadArtifactBundle(path.resolve(repositoryRoot, artifactPath));
  const provenance = JSON.parse(await readFile(provenancePathForArtifact(artifactPath), 'utf8'));
  assertArtifactProvenance({ provenance, commit: resolved.commit, artifact });
  const result = verifyRouteInventory({ sourceRoutes, artifact, manifest: resolved.manifest });
  if (!result.ok) {
    const error = new Error(result.errors.join('\n'));
    error.routeErrors = result.errors;
    throw error;
  }
  return { commit: resolved.commit, manifest: resolved.manifest, artifact, result };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  try {
    const verified = await verifyArtifactAgainstHead({
      artifactPath: options.artifact,
      manifestPath: options.manifest,
      commit: options.commit,
    });
    process.stdout.write(`${JSON.stringify({
      ok: true,
      commit: verified.commit,
      baselineCommit: verified.manifest.baselineCommit,
      artifactFormat: verified.artifact.format,
      artifactFingerprint: verified.artifact.fingerprint,
      sourceRouteCount: verified.result.sourceRoutes.length,
      artifactTemplateCount: verified.result.artifactTemplates.length,
      governedConcreteCount: verified.artifact.concreteRoutes.length,
      criticalRouteCount: verified.manifest.criticalRoutes.length,
    })}\n`);
  } catch (error) {
    const messages = error.routeErrors ?? [error.message];
    for (const message of messages) process.stderr.write(`route-integrity: ${message}\n`);
    process.exitCode = 1;
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
