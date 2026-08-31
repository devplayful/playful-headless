import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  lstat,
  readFile,
  readdir,
  readlink,
  realpath,
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

const REQUEST_METHODS = ['GET', 'HEAD'];
const HTTP_METHODS = new Set(['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE']);
const VERCEL_PHASES = ['rewrite', 'filesystem', 'resource', 'miss', 'hit', 'error'];
const SUPPORTED_SOURCE_PHASES = new Set(['prelude', 'filesystem']);
const SUPPORTED_SOURCE_FIELDS = new Set(['src', 'dest', 'methods']);
const CONTENT_TYPE_PATTERN = /^[A-Za-z0-9!#$%&'*+.^_`|~-]+\/[A-Za-z0-9!#$%&'*+.^_`|~-]+(?:\s*;\s*[A-Za-z0-9!#$%&'*+.^_`|~-]+\s*=\s*(?:[A-Za-z0-9!#$%&'*+.^_`|~-]+|"[^"\r\n]*"))*$/;

function compileVercelRoute(source, origin) {
  assert.equal(typeof source, 'string', `${origin} src must be a string`);
  try {
    return new RegExp(source);
  } catch (error) {
    throw new Error(`${origin} has invalid Vercel route regexp ${source}: ${error.message}`);
  }
}

function validatedMethods(rule, origin) {
  if (rule.methods === undefined) return null;
  assert.ok(Array.isArray(rule.methods) && rule.methods.length > 0, `${origin} methods must be a non-empty array`);
  const methods = rule.methods.map((method) => {
    assert.ok(typeof method === 'string' && /^[A-Za-z]+$/.test(method), `${origin} has an invalid method`);
    const normalized = method.toUpperCase();
    assert.ok(HTTP_METHODS.has(normalized), `${origin} has unsupported method ${method}`);
    return normalized;
  });
  assert.equal(new Set(methods).size, methods.length, `${origin} methods must be unique`);
  return methods;
}

function planVercelRoutes(routes, origin) {
  let phase = 'prelude';
  let previousPhaseIndex = -1;
  const sourceRoutes = [];
  for (let index = 0; index < routes.length; index += 1) {
    const item = routes[index];
    const itemOrigin = `${origin} routes[${index}]`;
    assert.ok(item && !Array.isArray(item) && typeof item === 'object', `${itemOrigin} must be an object`);
    if (item.handle !== undefined) {
      assert.ok(VERCEL_PHASES.includes(item.handle), `${itemOrigin} has unsupported handle ${item.handle}`);
      assert.deepEqual(Object.keys(item).sort(), ['handle'], `${itemOrigin} handler actions are not supported`);
      const phaseIndex = VERCEL_PHASES.indexOf(item.handle);
      assert.ok(phaseIndex >= previousPhaseIndex, `${itemOrigin} moves routing phases backwards`);
      assert.ok(item.handle !== phase, `${itemOrigin} repeats routing phase ${item.handle}`);
      previousPhaseIndex = phaseIndex;
      phase = item.handle;
      continue;
    }

    for (const field of Object.keys(item)) {
      assert.ok(SUPPORTED_SOURCE_FIELDS.has(field), `${itemOrigin} field ${field} is not proven safe by the local gate`);
    }
    assert.ok(SUPPORTED_SOURCE_PHASES.has(phase), `${itemOrigin} uses unsupported routing phase ${phase}`);
    const regexp = compileVercelRoute(item.src, itemOrigin);
    const destination = destinationRoute(item.dest);
    assert.ok(destination, `${itemOrigin} must have an internal destination`);
    sourceRoutes.push({
      ...item,
      destination,
      index,
      methods: validatedMethods(item, itemOrigin),
      origin: itemOrigin,
      phase,
      regexp,
    });
  }
  return { sourceRoutes };
}

function routeMatches(rule, route, method) {
  if (rule.methods && !rule.methods.includes(method)) return false;
  return rule.regexp.test(route);
}

function filesystemReachableForMethod(plan, route, method) {
  for (const rule of plan.sourceRoutes) {
    if (rule.phase !== 'prelude') continue;
    if (routeMatches(rule, route, method)) return false;
  }
  return true;
}

function filesystemReachableFromPlan(plan, route) {
  return REQUEST_METHODS.every((method) => filesystemReachableForMethod(plan, route, method));
}

export function isFilesystemReachable(routes, route) {
  assert.ok(Array.isArray(routes), 'Vercel routes must be an array');
  return filesystemReachableFromPlan(planVercelRoutes(routes, 'routes'), route);
}

function dynamicRouteWitnesses(route) {
  assert.ok(isDynamicRoute(route), `${route} must be dynamic`);
  const materialize = (single, catchAll) => normalizePublicPath(route
    .replace(/\[\[\.\.\.[^\]]+\]\]/g, catchAll)
    .replace(/\[\.\.\.[^\]]+\]/g, catchAll)
    .replace(/\[[^\]]+\]/g, single));
  return sortedUnique([
    materialize('route-integrity-alpha', 'route-integrity-alpha'),
    materialize('route-integrity-beta', 'route-integrity-beta/nested'),
    materialize('123', '123/456'),
  ]);
}

function sourceRuleReachable(plan, candidate, route, method) {
  for (const rule of plan.sourceRoutes) {
    if (candidate.phase === 'prelude' && rule.phase !== 'prelude') break;
    if (!routeMatches(rule, route, method)) continue;
    return rule.index === candidate.index;
  }
  return false;
}

function dynamicDestinationReachable(plan, destination) {
  const witnesses = dynamicRouteWitnesses(destination);
  return REQUEST_METHODS.every((method) => plan.sourceRoutes.some((candidate) => (
    candidate.destination === destination
    && witnesses.every((route) => sourceRuleReachable(plan, candidate, route, method))
  )));
}

export function routesFromVercelConfig(payload, origin = 'config.json') {
  assert.equal(payload?.version, 3, `${origin} must use Vercel output version 3`);
  const routes = payload.routes ?? [];
  assert.ok(Array.isArray(routes), `${origin} routes must be an array`);
  const routingPlan = planVercelRoutes(routes, origin);
  const exactDynamicMappings = [];
  for (const item of routingPlan.sourceRoutes) {
    const exactSource = exactRouteFromVercelSource(item.src);
    if (exactSource && isDynamicRoute(item.destination)) {
      exactDynamicMappings.push({
        route: exactSource,
        sourceTemplate: item.destination,
        origin,
        routeIndex: item.index,
        filesystemReachable: filesystemReachableFromPlan(routingPlan, exactSource),
      });
    }
  }
  const overrides = payload.overrides ?? {};
  assert.ok(overrides && !Array.isArray(overrides) && typeof overrides === 'object', `${origin} overrides must be an object`);
  return { routes, routingPlan, overrides, exactDynamicMappings };
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

async function lstatOrNull(file) {
  try {
    return await lstat(file);
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function pathIsInside(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

async function assertPhysicalDirectory(directory, containmentRoot, label) {
  const info = await lstatOrNull(directory);
  if (!info) return null;
  assert.ok(!info.isSymbolicLink(), `${label} must be a physical directory`);
  assert.ok(info.isDirectory(), `${label} must be a directory`);
  const realDirectory = await realpath(directory);
  assert.ok(pathIsInside(containmentRoot, realDirectory), `${label} resolves outside the artifact`);
  return realDirectory;
}

async function assertPhysicalFile(file, containmentRoot, label, missingMessage = `${label} is missing`) {
  const info = await lstatOrNull(file);
  if (!info) throw new Error(missingMessage);
  assert.ok(!info.isSymbolicLink(), `${label} must be a physical file`);
  assert.ok(info.isFile(), `${label} must be a file`);
  const realFile = await realpath(file);
  assert.ok(pathIsInside(containmentRoot, realFile), `${label} resolves outside its container`);
  return realFile;
}

async function walkPhysicalFiles(directory, containmentRoot, label, relativeDirectory = '') {
  const entries = await readdir(path.join(directory, relativeDirectory), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relative = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name);
    const absolute = path.join(directory, relative);
    const info = await lstat(absolute);
    assert.ok(!info.isSymbolicLink(), `${label}/${relative} must be physical; only .func aliases may be symlinks`);
    const realEntry = await realpath(absolute);
    assert.ok(pathIsInside(containmentRoot, realEntry), `${label}/${relative} resolves outside its container`);
    if (info.isDirectory()) files.push(...await walkPhysicalFiles(directory, containmentRoot, label, relative));
    else {
      assert.ok(info.isFile(), `${label}/${relative} must be a regular file or directory`);
      files.push(absolute);
    }
  }
  return files;
}

async function listVercelFunctionAssets(directory, realFunctionsDirectory, relativeDirectory = '') {
  const entries = await readdir(path.join(directory, relativeDirectory), { withFileTypes: true });
  const functions = [];
  const prerenderConfigs = [];
  for (const entry of entries) {
    const relative = path.posix.join(relativeDirectory.replaceAll('\\', '/'), entry.name);
    const absolute = path.join(directory, relative);
    const info = await lstat(absolute);
    if (info.isSymbolicLink() && !entry.name.endsWith('.func')) {
      assert.fail(`${relative} symlink must have a .func suffix`);
    }
    if (entry.name.endsWith('.func')) {
      assert.ok(info.isDirectory() || info.isSymbolicLink(), `${relative} must be a function directory or symlink`);
      functions.push({
        absolute,
        base: relative.slice(0, -'.func'.length),
        isSymbolicLink: info.isSymbolicLink(),
        relative,
        route: normalizePublicPath(relative.slice(0, -'.func'.length)),
      });
    } else if (info.isDirectory()) {
      const realEntry = await realpath(absolute);
      assert.ok(pathIsInside(realFunctionsDirectory, realEntry), `${relative} resolves outside functions`);
      const nested = await listVercelFunctionAssets(directory, realFunctionsDirectory, relative);
      functions.push(...nested.functions);
      prerenderConfigs.push(...nested.prerenderConfigs);
    } else if (entry.name.endsWith('.prerender-config.json')) {
      await assertPhysicalFile(absolute, realFunctionsDirectory, relative);
      prerenderConfigs.push({
        absolute,
        base: relative.slice(0, -'.prerender-config.json'.length),
        relative,
        route: normalizePublicPath(relative.replace(/\.prerender-config\.json$/, '')),
      });
    } else {
      assert.ok(info.isFile(), `${relative} must be a regular file or directory`);
      const realEntry = await realpath(absolute);
      assert.ok(pathIsInside(realFunctionsDirectory, realEntry), `${relative} resolves outside functions`);
    }
  }
  return { functions, prerenderConfigs };
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
    const targetInfo = await lstatOrNull(targetAbsolute);
    assert.ok(targetInfo, `${entry.relative} points to a missing function directory`);
    assert.ok(!targetInfo.isSymbolicLink(), `${entry.relative} must point directly to a physical .func directory`);
    assert.ok(targetInfo.isDirectory(), `${entry.relative} symlink target must be a .func directory`);
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
  await walkPhysicalFiles(realFunctionDirectory, realFunctionDirectory, entry.relative);

  const configFile = path.join(realFunctionDirectory, '.vc-config.json');
  await assertPhysicalFile(
    configFile,
    realFunctionDirectory,
    `${entry.relative}/.vc-config.json`,
    `${entry.relative} is missing .vc-config.json`,
  );
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
  await assertPhysicalFile(realEntrypoint, realFunctionDirectory, `${entry.relative} ${entrypointName}`);
  assert.equal(realEntrypoint, entrypointPath, `${entry.relative} ${entrypointName} must be physical`);
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

async function assertPrerenderConfig(config, realFunctionsDirectory) {
  await assertPhysicalFile(config.absolute, realFunctionsDirectory, config.relative);
  const payload = await readJson(config.absolute);
  const expirationIsValid = payload?.expiration === false
    || (Number.isInteger(payload?.expiration) && payload.expiration >= 0);
  assert.ok(expirationIsValid, `${config.relative} must contain a valid expiration`);
}

function validateStaticOverrides(overrides, relativeFiles) {
  const fileSet = new Set(relativeFiles);
  const validated = new Map();
  for (const [relative, override] of Object.entries(overrides)) {
    assert.ok(
      relative && !relative.startsWith('/') && !relative.includes('\\') && path.posix.normalize(relative) === relative,
      `override key ${relative} must be a normalized relative static path`,
    );
    assert.ok(fileSet.has(relative), `override for ${relative} does not reference a physical static file`);
    assert.ok(override && !Array.isArray(override) && typeof override === 'object', `override for ${relative} must be an object`);
    for (const field of Object.keys(override)) {
      assert.ok(['path', 'contentType'].includes(field), `override for ${relative} has unsupported field ${field}`);
    }
    if (override.path !== undefined) {
      assert.equal(typeof override.path, 'string', `override path for ${relative} must be a string`);
      assert.ok(!/[?#\\\0]/.test(override.path), `override path for ${relative} must be a pathname`);
      assert.ok(
        !override.path.split('/').some((segment) => segment === '.' || segment === '..'),
        `override path for ${relative} must not traverse directories`,
      );
    }
    if (override.contentType !== undefined) {
      assert.ok(
        typeof override.contentType === 'string'
          && CONTENT_TYPE_PATTERN.test(override.contentType),
        `override contentType for ${relative} must be a valid media type`,
      );
    }
    validated.set(relative, override);
  }

  const publicPaths = new Map();
  for (const relative of relativeFiles) {
    const override = validated.get(relative);
    const publicPath = normalizePublicPath(override?.path ?? relative);
    assert.ok(!publicPaths.has(publicPath), `${relative} collides with ${publicPaths.get(publicPath)} at ${publicPath}`);
    publicPaths.set(publicPath, relative);
  }
  return validated;
}

function publicStaticRoute(relative, overrides) {
  return normalizePublicPath(overrides.get(relative)?.path ?? relative);
}

async function loadVercelArtifact(outputDirectory) {
  const realOutputDirectory = await realpath(outputDirectory);
  const configFile = path.join(outputDirectory, 'config.json');
  await assertPhysicalFile(configFile, realOutputDirectory, 'config.json');
  const configRoutes = routesFromVercelConfig(await readJson(configFile), configFile);
  const templates = [];
  const concreteRoutes = [];
  const functionsDirectory = path.join(outputDirectory, 'functions');
  const staticDirectory = path.join(outputDirectory, 'static');
  const realFunctionsDirectory = await assertPhysicalDirectory(
    functionsDirectory,
    realOutputDirectory,
    'functions',
  );
  if (realFunctionsDirectory) {
    const assets = await listVercelFunctionAssets(functionsDirectory, realFunctionsDirectory);
    const validatedFunctions = [];
    for (const entry of assets.functions) {
      validatedFunctions.push(await validateVercelFunction(entry, functionsDirectory, realFunctionsDirectory));
    }
    const functionsByBase = new Map(validatedFunctions.map((entry) => [entry.base, entry]));
    const concreteFunctionBases = new Set();
    for (const prerenderConfig of assets.prerenderConfigs) {
      await assertPrerenderConfig(prerenderConfig, realFunctionsDirectory);
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
        if (filesystemReachableFromPlan(configRoutes.routingPlan, prerenderConfig.route)) {
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
      if (concreteFunctionBases.has(functionEntry.base)) continue;
      if (isDynamicRoute(functionEntry.route)) {
        if (dynamicDestinationReachable(configRoutes.routingPlan, functionEntry.route)) {
          templates.push(functionEntry.route);
        }
      } else if (filesystemReachableFromPlan(configRoutes.routingPlan, functionEntry.route)) {
        templates.push(functionEntry.route);
      }
    }
  }

  const realStaticDirectory = await assertPhysicalDirectory(staticDirectory, realOutputDirectory, 'static');
  if (realStaticDirectory) {
    const files = await walkPhysicalFiles(staticDirectory, realStaticDirectory, 'static');
    const relativeFiles = files.map((file) => path.relative(staticDirectory, file).replaceAll('\\', '/'));
    const overrides = validateStaticOverrides(configRoutes.overrides, relativeFiles);
    for (const file of files) {
      const relative = path.relative(staticDirectory, file).replaceAll('\\', '/');
      const isRouteFile = relative.endsWith('.html')
        || ['robots.txt', 'sitemap.xml', 'manifest.webmanifest'].includes(relative);
      if (!isRouteFile || relative.startsWith('_next/')) continue;
      const route = publicStaticRoute(relative, overrides);
      if (!filesystemReachableFromPlan(configRoutes.routingPlan, route)) continue;
      const sourceTemplate = exactDynamicMappingForRoute(configRoutes.exactDynamicMappings, route);
      if (sourceTemplate) concreteRoutes.push({ route, sourceTemplate, origin: relative });
      else if (!concreteRoutes.some((item) => item.route === route)) templates.push(route);
    }
  } else {
    validateStaticOverrides(configRoutes.overrides, []);
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
  const inputStat = await lstat(absolute);
  assert.ok(!inputStat.isSymbolicLink(), 'artifact directory must be physical');
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
