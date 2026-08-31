#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

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
      : [process.execPath, 'node_modules/next/dist/bin/next', 'build'],
  };
}

async function main() {
  const { artifactPath, buildCommand } = parseArgs(process.argv.slice(2));
  const before = await resolveCleanHead();
  const startedAt = new Date().toISOString();
  const build = spawnSync(buildCommand[0], buildCommand.slice(1), {
    cwd: repositoryRoot,
    stdio: 'inherit',
    env: process.env,
  });
  if (build.error) throw build.error;
  if (build.status !== 0) throw new Error(`build command failed with exit ${build.status}`);
  const after = await resolveCleanHead();
  if (after.commit !== before.commit) throw new Error('HEAD changed during build');
  const artifact = await loadArtifactBundle(path.resolve(repositoryRoot, artifactPath));
  const provenance = {
    schemaVersion: 1,
    commit: after.commit,
    artifactFingerprint: artifact.fingerprint,
    artifactFormat: artifact.format,
    generator: 'build-and-verify-routes.mjs',
    buildCommand,
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

main().catch((error) => {
  process.stderr.write(`route-integrity-build: ${error.message}\n`);
  process.exitCode = 1;
});
