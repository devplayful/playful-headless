#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { lstat, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { loadArtifactBundle } from './route-integrity-lib.mjs';
import {
  provenancePathForArtifact,
  repositoryRoot,
  resolveCleanHead,
  verifyArtifactAgainstHead,
} from './verify-route-artifact.mjs';

function parseArgs(argv) {
  const separator = argv.indexOf('--');
  const optionArgs = separator === -1 ? argv : argv.slice(0, separator);
  const buildCommand = separator === -1 ? [] : argv.slice(separator + 1);
  let artifactPath = '.next';
  for (let index = 0; index < optionArgs.length; index += 1) {
    if (optionArgs[index] !== '--artifact' || !optionArgs[index + 1]) {
      throw new Error('usage: build-and-verify-routes.mjs [--artifact PATH] [-- COMMAND ...]');
    }
    artifactPath = optionArgs[index + 1];
    index += 1;
  }
  return {
    artifactPath,
    buildCommand: buildCommand.length
      ? buildCommand
      : [process.execPath, 'scripts/build-with-budget.mjs'],
  };
}

const canonicalGeneratedArtifacts = new Set([
  path.join(repositoryRoot, '.next'),
  path.join(repositoryRoot, '.vercel/output'),
]);

function pathIsInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (
    relative !== '..'
    && !relative.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relative)
  );
}

async function lstatOrNull(candidate) {
  try {
    return await lstat(candidate);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

export async function assertPhysicalArtifactAncestors(rootDirectory, artifactPath) {
  const absoluteRoot = path.resolve(rootDirectory);
  const absoluteArtifact = path.resolve(artifactPath);
  if (!pathIsInside(absoluteRoot, absoluteArtifact) || absoluteRoot === absoluteArtifact) {
    throw new Error(`artifact destination must be below repository root: ${absoluteArtifact}`);
  }
  const rootInfo = await lstat(absoluteRoot);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) {
    throw new Error(`repository root must be a physical directory: ${absoluteRoot}`);
  }
  const physicalRoot = await realpath(absoluteRoot);
  const segments = path.relative(absoluteRoot, absoluteArtifact).split(path.sep);
  let current = absoluteRoot;
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index]);
    const info = await lstatOrNull(current);
    if (!info) break;
    if (info.isSymbolicLink()) {
      throw new Error(`artifact destination ancestor must be physical: ${current}`);
    }
    if (index < segments.length - 1 && !info.isDirectory()) {
      throw new Error(`artifact destination ancestor must be a directory: ${current}`);
    }
    const physicalCurrent = await realpath(current);
    if (!pathIsInside(physicalRoot, physicalCurrent)) {
      throw new Error(`artifact destination resolves outside repository root: ${current}`);
    }
  }
  return absoluteArtifact;
}

async function prepareArtifactDestination(artifactPath) {
  const absolute = path.resolve(repositoryRoot, artifactPath);
  if (canonicalGeneratedArtifacts.has(absolute)) {
    await assertPhysicalArtifactAncestors(repositoryRoot, absolute);
  }
  try {
    await lstat(absolute);
  } catch (error) {
    if (error?.code === 'ENOENT') return absolute;
    throw error;
  }
  if (!canonicalGeneratedArtifacts.has(absolute)) {
    throw new Error(`artifact destination must be absent before build: ${absolute}`);
  }
  await rm(absolute, { recursive: true, force: true });
  return absolute;
}

export async function runBuildProducingArtifact({ artifactPath, buildCommand }) {
  const absoluteArtifact = await prepareArtifactDestination(artifactPath);
  const build = spawnSync(buildCommand[0], buildCommand.slice(1), {
    cwd: repositoryRoot,
    stdio: 'inherit',
    env: process.env,
  });
  if (build.error) throw build.error;
  if (build.status !== 0) throw new Error(`build command failed with exit ${build.status}`);
  if (canonicalGeneratedArtifacts.has(absoluteArtifact)) {
    await assertPhysicalArtifactAncestors(repositoryRoot, absoluteArtifact);
  }
  try {
    const artifactStat = await lstat(absoluteArtifact);
    if (!artifactStat.isDirectory()) throw new Error('build output is not a directory');
  } catch (error) {
    if (error?.code === 'ENOENT') {
      throw new Error(`build command did not recreate artifact directory: ${absoluteArtifact}`);
    }
    throw error;
  }
  return absoluteArtifact;
}

async function main() {
  const { artifactPath, buildCommand } = parseArgs(process.argv.slice(2));
  const before = await resolveCleanHead();
  const startedAt = new Date().toISOString();
  const absoluteArtifact = await runBuildProducingArtifact({ artifactPath, buildCommand });
  const after = await resolveCleanHead();
  if (after.commit !== before.commit) throw new Error('HEAD changed during build');
  const artifact = await loadArtifactBundle(absoluteArtifact);
  const provenance = {
    schemaVersion: 1,
    commit: after.commit,
    artifactFingerprint: artifact.fingerprint,
    artifactFormat: artifact.format,
    generator: 'build-and-verify-routes.mjs',
    buildExecutable: path.basename(buildCommand[0]),
    startedAt,
    finishedAt: new Date().toISOString(),
  };
  await writeFile(provenancePathForArtifact(artifactPath), `${JSON.stringify(provenance, null, 2)}\n`, {
    flag: 'wx',
  });
  const verified = await verifyArtifactAgainstHead({ artifactPath });
  process.stdout.write(`${JSON.stringify({
    ok: true,
    commit: verified.commit,
    artifactFormat: verified.artifact.format,
    artifactFingerprint: verified.artifact.fingerprint,
    sourceRouteCount: verified.result.sourceRoutes.length,
    artifactTemplateCount: verified.result.artifactTemplates.length,
    governedConcreteCount: verified.artifact.concreteRoutes.length,
  })}\n`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    process.stderr.write(`route-integrity-build: ${error.message}\n`);
    process.exitCode = 1;
  });
}
