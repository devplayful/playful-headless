import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  lstat,
  readFile,
  readdir,
  readlink,
  realpath,
  stat,
} from 'node:fs/promises';
import path from 'node:path';

const ROUTE_SOURCE_PATTERN = /\/(page|route)\.(?:js|jsx|ts|tsx)$/;
const ROOT_METADATA_ROUTES = new Map([
  ['app/robots.js', '/robots.txt'],
  ['app/robots.ts', '/robots.txt'],
  ['app/sitemap.js', '/sitemap.xml'],
  ['app/sitemap.ts', '/sitemap.xml'],
  ['app/manifest.js', '/manifest.webmanifest'],
  ['app/manifest.ts', '/manifest.webmanifest'],
]);

function compareStrings(left, right) {
  return left.localeCompare(right, 'en');
}

export function sortedUnique(values) {
  return [...new Set(values)].sort(compareStrings);
}

function publicSegments(segments) {
  return segments.filter((segment) => segment && !segment.startsWith('(') && !segment.startsWith('@'));
}

export function sourceFileToRoute(file) {
  const normalized = file.replaceAll('\\', '/');
  if (ROOT_METADATA_ROUTES.has(normalized)) return ROOT_METADATA_ROUTES.get(normalized);
  if (!normalized.startsWith('app/') || !ROUTE_SOURCE_PATTERN.test(normalized)) return null;
  const withoutFile = normalized.replace(ROUTE_SOURCE_PATTERN, '');
  const segments = publicSegments(withoutFile.split('/').slice(1));
  return segments.length === 0 ? '/' : `/${segments.join('/')}`;
}

export function discoverSourceRoutes(files) {
  return sortedUnique(files.map(sourceFileToRoute).filter(Boolean));
}

export function isDynamicRoute(route) {
  return /\[[^\]]+\]/.test(route);
}

export function appManifestKeyToRoute(key) {
  let normalized = String(key).replaceAll('\\', '/').replace(/\/(?:page|route)$/, '');
  const segments = publicSegments(normalized.split('/'));
  normalized = `/${segments.join('/')}`.replace(/\/{2,}/g, '/');
  return normalized === '' || normalized === '/page' ? '/' : normalized;
}

export function routesFromAppPathsManifest(payload, origin = 'app-paths-manifest.json') {
  assert.ok(payload && !Array.isArray(payload) && typeof payload === 'object', `${origin} must be an object`);
  return sortedUnique(Object.keys(payload).map(appManifestKeyToRoute));
}

export function routesFromPrerenderManifest(payload, origin = 'prerender-manifest.json') {
  assert.equal(payload?.version, 4, `${origin} must use prerender schema version 4`);
  assert.ok(payload.routes && typeof payload.routes === 'object', `${origin} must contain routes`);
  assert.ok(payload.dynamicRoutes && typeof payload.dynamicRoutes === 'object', `${origin} must contain dynamicRoutes`);
  const concreteRoutes = [];
  for (const [route, metadata] of Object.entries(payload.routes)) {
    const sourceTemplate = metadata?.srcRoute;
    if (!sourceTemplate || !isDynamicRoute(sourceTemplate)) continue;
    concreteRoutes.push({ route, sourceTemplate, origin });
  }
  return {
    dynamicTemplates: sortedUnique(Object.keys(payload.dynamicRoutes)),
    concreteRoutes: concreteRoutes.sort((left, right) => (
      compareStrings(`${left.sourceTemplate}:${left.route}`, `${right.sourceTemplate}:${right.route}`)
    )),
  };
}

function normalizePublicPath(value) {
  let route = String(value).split('?')[0].replaceAll('\\', '/');
  if (route === '') return '/';
  return `/${route}`.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function exactRouteFromVercelSource(source) {
  if (typeof source !== 'string') return null;
  let candidate = source.trim().replace(/^\^/, '').replace(/\$$/, '');
  candidate = candidate.replace(/\(\?:\\?\/\)\?$/, '').replace(/\\?\/\?$/, '');
  candidate = candidate.replaceAll('\\/', '/').replaceAll('\\.', '.');
  if (!candidate.startsWith('/') || /[()[\]{}*+?|\\]/.test(candidate)) return null;
  return normalizePublicPath(candidate);
}

function destinationRoute(destination) {
  if (typeof destination !== 'string' || !destination.startsWith('/')) return null;
  if (destination.startsWith('/_next/')) return null;
  return normalizePublicPath(destination);
}

function routeMatches(rule, route) {
  if (typeof rule?.src !== 'string') return false;
  if (rule.has || rule.missing || rule.methods) return false;
  try {
    return new RegExp(rule.src).test(route);
  } catch (error) {
    throw new Error(`invalid Vercel route regexp ${rule.src}: ${error.message}`);
  }
}

export function isFilesystemReachable(routes, route) {
  if (isDynamicRoute(route)) return true;
  for (const rule of routes) {
    if (rule?.handle === 'filesystem') return true;
    if (!rule || rule.handle || !routeMatches(rule, route)) continue;
    if (rule.check === true) return true;
    if (rule.continue === true) continue;
    return false;
  }
  return true;
}

export function routesFromVercelConfig(payload, origin = 'config.json') {
  assert.equal(payload?.version, 3, `${origin} must use Vercel output version 3`);
  const routes = payload.routes ?? [];
  assert.ok(Array.isArray(routes), `${origin} routes must be an array`);
  const exactDynamicMappings = [];
  for (let index = 0; index < routes.length; index += 1) {
    const item = routes[index];
    if (!item || item.handle || typeof item !== 'object') continue;
    const destination = destinationRoute(item.dest);
    if (!destination) continue;
    const exactSource = exactRouteFromVercelSource(item.src);
    if (exactSource && isDynamicRoute(destination)) {
      exactDynamicMappings.push({
        route: exactSource,
        sourceTemplate: destination,
        origin,
        routeIndex: index,
        filesystemReachable: isFilesystemReachable(routes, exactSource),
      });
    }
  }
  const overrides = payload.overrides ?? {};
  assert.ok(overrides && !Array.isArray(overrides) && typeof overrides === 'object', `${origin} overrides must be an object`);
  return { routes, overrides, exactDynamicMappings };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function loadNextArtifact(artifactDirectory) {
  const appPathsFile = path.join(artifactDirectory, 'server/app-paths-manifest.json');
  const prerenderFile = path.join(artifactDirectory, 'prerender-manifest.json');
  const templates = routesFromAppPathsManifest(await readJson(appPathsFile), appPathsFile);
  const prerender = routesFromPrerenderManifest(await readJson(prerenderFile), prerenderFile);
  return {
    format: 'next',
    artifactDirectory,
    templates,
    concreteRoutes: prerender.concreteRoutes,
    prerenderDynamicTemplates: prerender.dynamicTemplates,
  };
}

async function listVercelFunctionAssets(directory, relativeDirectory = '') {
  const entries = await readdir(path.join(directory, relativeDirectory), { withFileTypes: true });
  const functions = [];
  const prerenderConfigs = [];
  for (const entry of entries) {
    const relative = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name);
    const absolute = path.join(directory, relative);
    if (entry.isSymbolicLink() && !entry.name.endsWith('.func')) {
      assert.fail(`${relative} symlink must have a .func suffix`);
    }
    if (entry.name.endsWith('.func')) {
      assert.ok(entry.isDirectory() || entry.isSymbolicLink(), `${relative} must be a function directory or symlink`);
      functions.push({
        absolute,
        base: relative.slice(0, -'.func'.length),
        isSymbolicLink: entry.isSymbolicLink(),
        relative,
        route: normalizePublicPath(relative.slice(0, -'.func'.length)),
      });
    } else if (entry.isDirectory()) {
      const nested = await listVercelFunctionAssets(directory, relative);
      functions.push(...nested.functions);
      prerenderConfigs.push(...nested.prerenderConfigs);
    } else if (entry.name.endsWith('.prerender-config.json')) {
      prerenderConfigs.push({
        absolute,
        base: relative.slice(0, -'.prerender-config.json'.length),
        relative,
        route: normalizePublicPath(relative.replace(/\.prerender-config\.json$/, '')),
      });
    }
  }
  return { functions, prerenderConfigs };
}

function pathIsInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function existingRealPath(file, missingMessage) {
  try {
    return await realpath(file);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(missingMessage);
    throw error;
  }
}

async function validateVercelFunction(entry, functionsDirectory, realFunctionsDirectory) {
  const entryInfo = await lstat(entry.absolute);
  assert.equal(entryInfo.isSymbolicLink(), entry.isSymbolicLink, `${entry.relative} changed while inspecting artifact`);
  let symlinkTarget = null;
  if (entry.isSymbolicLink) {
    const target = await readlink(entry.absolute);
    const targetAbsolute = path.resolve(path.dirname(entry.absolute), target);
    assert.ok(pathIsInside(functionsDirectory, targetAbsolute), `${entry.relative} points outside functions`);
    const relativeTarget = path.relative(functionsDirectory, targetAbsolute).replaceAll('\\', '/');
    const targetMatch = relativeTarget.match(/^(.+?)\.func$/);
    assert.ok(targetMatch, `${entry.relative} symlink target must be a .func directory`);
    symlinkTarget = {
      base: targetMatch[1],
      route: normalizePublicPath(targetMatch[1]),
    };
  }

  const realFunctionDirectory = await existingRealPath(
    entry.absolute,
    `${entry.relative} points to a missing function directory`,
  );
  assert.ok(pathIsInside(realFunctionsDirectory, realFunctionDirectory), `${entry.relative} resolves outside functions`);
  const functionInfo = await stat(entry.absolute);
  assert.ok(functionInfo.isDirectory(), `${entry.relative} must resolve to a directory`);

  const configFile = path.join(entry.absolute, '.vc-config.json');
  let configInfo;
  try {
    configInfo = await stat(configFile);
  } catch (error) {
    if (error?.code === 'ENOENT') throw new Error(`${entry.relative} is missing .vc-config.json`);
    throw error;
  }
  assert.ok(configInfo.isFile(), `${entry.relative}/.vc-config.json must be a file`);
  const config = await readJson(configFile);
  assert.ok(config && !Array.isArray(config) && typeof config === 'object', `${entry.relative}/.vc-config.json must be an object`);
  assert.ok(typeof config.runtime === 'string' && config.runtime, `${entry.relative} must declare a runtime`);
  const entrypoint = config.runtime === 'edge' ? config.entrypoint : config.handler;
  const entrypointName = config.runtime === 'edge' ? 'entrypoint' : 'handler';
  assert.ok(typeof entrypoint === 'string' && entrypoint, `${entry.relative} must declare a ${entrypointName}`);
  assert.ok(!path.isAbsolute(entrypoint), `${entry.relative} ${entrypointName} must be relative`);
  const entrypointPath = path.resolve(realFunctionDirectory, entrypoint);
  assert.ok(pathIsInside(realFunctionDirectory, entrypointPath), `${entry.relative} ${entrypointName} escapes the function`);
  const realEntrypoint = await existingRealPath(
    entrypointPath,
    `${entry.relative} ${entrypointName} does not exist: ${entrypoint}`,
  );
  assert.ok(pathIsInside(realFunctionDirectory, realEntrypoint), `${entry.relative} ${entrypointName} resolves outside the function`);
  const entrypointInfo = await stat(realEntrypoint);
  assert.ok(entrypointInfo.isFile(), `${entry.relative} ${entrypointName} must be a file`);
  return { ...entry, config, realFunctionDirectory, symlinkTarget };
}

function exactDynamicMappingForRoute(mappings, route) {
  const sourceTemplates = sortedUnique(
    mappings
      .filter((mapping) => mapping.route === route && mapping.filesystemReachable)
      .map((mapping) => mapping.sourceTemplate),
  );
  assert.ok(sourceTemplates.length <= 1, `Vercel route ${route} maps to multiple dynamic templates`);
  return sourceTemplates[0] ?? null;
}

async function assertPrerenderConfig(config) {
  const payload = await readJson(config.absolute);
  const expirationIsValid = payload?.expiration === false
    || (Number.isInteger(payload?.expiration) && payload.expiration >= 0);
  assert.ok(expirationIsValid, `${config.relative} must contain a valid expiration`);
}

function publicStaticRoute(relative, overrides) {
  const override = overrides[relative];
  if (override === undefined) return normalizePublicPath(relative);
  assert.ok(override && !Array.isArray(override) && typeof override === 'object', `override for ${relative} must be an object`);
  if (override.path === undefined) return normalizePublicPath(relative);
  assert.equal(typeof override.path, 'string', `override path for ${relative} must be a string`);
  return normalizePublicPath(override.path);
}

async function loadVercelArtifact(outputDirectory) {
  const configFile = path.join(outputDirectory, 'config.json');
  const configRoutes = routesFromVercelConfig(await readJson(configFile), configFile);
  const templates = [];
  const concreteRoutes = [];
  const functionsDirectory = path.join(outputDirectory, 'functions');
  const staticDirectory = path.join(outputDirectory, 'static');
  try {
    const assets = await listVercelFunctionAssets(functionsDirectory);
    const realFunctionsDirectory = await realpath(functionsDirectory);
    const validatedFunctions = [];
    for (const entry of assets.functions) {
      validatedFunctions.push(await validateVercelFunction(entry, functionsDirectory, realFunctionsDirectory));
    }
    const functionsByBase = new Map(validatedFunctions.map((entry) => [entry.base, entry]));
    const concreteFunctionBases = new Set();
    for (const prerenderConfig of assets.prerenderConfigs) {
      await assertPrerenderConfig(prerenderConfig);
      const functionEntry = functionsByBase.get(prerenderConfig.base);
      assert.ok(functionEntry, `${prerenderConfig.relative} must have a sibling .func`);
      const symlinkTarget = functionEntry.symlinkTarget;
      if (symlinkTarget) {
        assert.ok(
          functionsByBase.has(symlinkTarget.base),
          `${functionEntry.relative} points to a missing source function`,
        );
      }
      const symlinkTemplate = symlinkTarget?.route ?? null;
      const configuredTemplate = exactDynamicMappingForRoute(
        configRoutes.exactDynamicMappings,
        prerenderConfig.route,
      );
      if (symlinkTemplate && configuredTemplate) {
        assert.equal(
          symlinkTemplate,
          configuredTemplate,
          `${prerenderConfig.route} symlink and Vercel route disagree on source template`,
        );
      }
      const sourceTemplate = symlinkTemplate ?? configuredTemplate;
      if (!isDynamicRoute(prerenderConfig.route) && isDynamicRoute(sourceTemplate ?? '')) {
        assert.ok(
          validatedFunctions.some((entry) => entry.route === sourceTemplate),
          `${prerenderConfig.route} references a missing source function ${sourceTemplate}`,
        );
        if (isFilesystemReachable(configRoutes.routes, prerenderConfig.route)) {
          concreteRoutes.push({
            route: prerenderConfig.route,
            sourceTemplate,
            origin: prerenderConfig.relative,
          });
          concreteFunctionBases.add(prerenderConfig.base);
        }
      }
    }
    for (const functionEntry of validatedFunctions) {
      if (
        !concreteFunctionBases.has(functionEntry.base)
        && isFilesystemReachable(configRoutes.routes, functionEntry.route)
      ) templates.push(functionEntry.route);
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  try {
    const files = await walk(staticDirectory);
    for (const file of files) {
      const relative = path.relative(staticDirectory, file).replaceAll('\\', '/');
      const isRouteFile = relative.endsWith('.html')
        || ['robots.txt', 'sitemap.xml', 'manifest.webmanifest'].includes(relative);
      if (!isRouteFile || relative.startsWith('_next/')) continue;
      const route = publicStaticRoute(relative, configRoutes.overrides);
      if (!isFilesystemReachable(configRoutes.routes, route)) continue;
      const sourceTemplate = exactDynamicMappingForRoute(configRoutes.exactDynamicMappings, route);
      if (sourceTemplate) concreteRoutes.push({ route, sourceTemplate, origin: relative });
      else if (!concreteRoutes.some((item) => item.route === route)) templates.push(route);
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  return {
    format: 'vercel-output-v3',
    artifactDirectory: outputDirectory,
    templates: sortedUnique(templates),
    concreteRoutes: concreteRoutes.sort((left, right) => (
      compareStrings(`${left.sourceTemplate}:${left.route}`, `${right.sourceTemplate}:${right.route}`)
    )),
    prerenderDynamicTemplates: sortedUnique(templates.filter(isDynamicRoute)),
  };
}

export function artifactFingerprint(bundle) {
  const canonical = JSON.stringify({
    format: bundle.format,
    templates: sortedUnique(bundle.templates),
    concreteRoutes: [...bundle.concreteRoutes]
      .map(({ route, sourceTemplate }) => ({ route, sourceTemplate }))
      .sort((left, right) => compareStrings(`${left.sourceTemplate}:${left.route}`, `${right.sourceTemplate}:${right.route}`)),
    prerenderDynamicTemplates: sortedUnique(bundle.prerenderDynamicTemplates),
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export async function loadArtifactBundle(inputPath) {
  const absolute = path.resolve(inputPath);
  const inputStat = await stat(absolute);
  assert.ok(inputStat.isDirectory(), 'artifact must be a .next or .vercel/output directory');
  let bundle;
  try {
    bundle = await loadNextArtifact(absolute);
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
    bundle = await loadVercelArtifact(absolute);
  }
  return { ...bundle, fingerprint: artifactFingerprint(bundle) };
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function governedConcretePairs(manifest) {
  const pairs = [];
  for (const [sourceTemplate, routes] of Object.entries(manifest.governedConcreteRoutes ?? {})) {
    for (const route of routes) pairs.push(`${sourceTemplate}:${route}`);
  }
  return sortedUnique(pairs);
}

export function verifyRouteInventory({ sourceRoutes, artifact, manifest }) {
  assert.equal(manifest.schemaVersion, 2, 'unsupported expected-route manifest schema');
  const expectedSource = sortedUnique(manifest.sourceRoutes ?? []);
  const criticalRoutes = sortedUnique(manifest.criticalRoutes ?? []);
  const allowedArtifactOnly = new Set(manifest.allowedArtifactOnlyRoutes ?? []);
  const actualSource = sortedUnique(sourceRoutes);
  const expectedDynamic = expectedSource.filter(isDynamicRoute);
  const governedTemplates = sortedUnique(Object.keys(manifest.governedConcreteRoutes ?? {}));
  const unexpectedSourceRoutes = difference(actualSource, expectedSource);
  const missingSourceRoutes = difference(expectedSource, actualSource);
  const invalidCriticalRoutes = difference(criticalRoutes, expectedSource);
  const ungovernedDynamicTemplates = difference(expectedDynamic, governedTemplates);
  const staleGovernedTemplates = difference(governedTemplates, expectedDynamic);
  const artifactTemplates = sortedUnique(artifact.templates);
  const missingArtifactTemplates = difference(actualSource, artifactTemplates);
  const ghostTemplateRoutes = artifactTemplates.filter((route) => (
    !allowedArtifactOnly.has(route) && !actualSource.includes(route)
  ));
  const ghostPrerenderTemplates = sortedUnique(artifact.prerenderDynamicTemplates.filter((route) => (
    !actualSource.includes(route)
  )));
  const expectedConcretePairs = governedConcretePairs(manifest);
  const actualConcretePairs = sortedUnique(artifact.concreteRoutes.map(({ route, sourceTemplate }) => (
    `${sourceTemplate}:${route}`
  )));
  const unexpectedConcreteRoutes = difference(actualConcretePairs, expectedConcretePairs);
  const missingConcreteRoutes = difference(expectedConcretePairs, actualConcretePairs);
  const invalidConcreteSources = artifact.concreteRoutes
    .filter(({ sourceTemplate }) => !actualSource.includes(sourceTemplate) || !isDynamicRoute(sourceTemplate))
    .map(({ route, sourceTemplate }) => `${sourceTemplate}:${route}`);
  const missingCriticalRoutes = criticalRoutes.filter((route) => !artifactTemplates.includes(route));
  const errors = [];
  if (unexpectedSourceRoutes.length) errors.push(`source routes not in expected manifest: ${unexpectedSourceRoutes.join(', ')}`);
  if (missingSourceRoutes.length) errors.push(`expected source routes missing from commit: ${missingSourceRoutes.join(', ')}`);
  if (invalidCriticalRoutes.length) errors.push(`critical routes absent from source manifest: ${invalidCriticalRoutes.join(', ')}`);
  if (ungovernedDynamicTemplates.length) errors.push(`dynamic templates lack governed concrete inventory: ${ungovernedDynamicTemplates.join(', ')}`);
  if (staleGovernedTemplates.length) errors.push(`governed concrete inventory has no dynamic source: ${staleGovernedTemplates.join(', ')}`);
  if (missingArtifactTemplates.length) errors.push(`source templates missing from artifact: ${missingArtifactTemplates.join(', ')}`);
  if (ghostTemplateRoutes.length) errors.push(`artifact ghost templates without exact source: ${ghostTemplateRoutes.join(', ')}`);
  if (ghostPrerenderTemplates.length) errors.push(`prerender manifest has ghost dynamic templates: ${ghostPrerenderTemplates.join(', ')}`);
  if (invalidConcreteSources.length) errors.push(`prerenders reference invalid source templates: ${invalidConcreteSources.join(', ')}`);
  if (unexpectedConcreteRoutes.length) errors.push(`artifact has ungoverned concrete routes: ${unexpectedConcreteRoutes.join(', ')}`);
  if (missingConcreteRoutes.length) errors.push(`governed concrete routes missing from artifact: ${missingConcreteRoutes.join(', ')}`);
  if (missingCriticalRoutes.length) errors.push(`critical routes missing from artifact: ${missingCriticalRoutes.join(', ')}`);
  return {
    ok: errors.length === 0,
    sourceRoutes: actualSource,
    artifactTemplates,
    unexpectedSourceRoutes,
    missingSourceRoutes,
    missingArtifactTemplates,
    ghostTemplateRoutes,
    ghostPrerenderTemplates,
    unexpectedConcreteRoutes,
    missingConcreteRoutes,
    missingCriticalRoutes,
    errors,
  };
}

export function assertArtifactProvenance({ provenance, commit, artifact }) {
  assert.equal(provenance?.schemaVersion, 1, 'artifact provenance is missing or unsupported');
  assert.equal(provenance.commit, commit, 'artifact provenance commit does not match HEAD');
  assert.equal(provenance.artifactFingerprint, artifact.fingerprint, 'artifact changed after provenance was generated');
  assert.equal(provenance.generator, 'build-and-verify-routes.mjs', 'artifact provenance generator is not trusted');
}
