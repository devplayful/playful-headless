import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir, stat } from 'node:fs/promises';
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
  route = route.replace(/^app\//, '').replace(/^pages\//, '');
  route = route.replace(/\.(?:func|html)$/, '').replace(/\/(?:page|route|index)$/, '');
  if (route === 'index' || route === '') return '/';
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

export function routesFromVercelConfig(payload, origin = 'config.json') {
  assert.equal(payload?.version, 3, `${origin} must use Vercel output version 3`);
  assert.ok(Array.isArray(payload.routes), `${origin} must contain routes`);
  const templates = [];
  const concreteRoutes = [];
  for (const item of payload.routes) {
    if (!item || item.handle || typeof item !== 'object') continue;
    const destination = destinationRoute(item.dest);
    if (!destination) continue;
    const exactSource = exactRouteFromVercelSource(item.src);
    if (isDynamicRoute(destination)) {
      templates.push(destination);
      if (exactSource) concreteRoutes.push({ route: exactSource, sourceTemplate: destination, origin });
    } else if (exactSource && exactSource === destination) {
      templates.push(destination);
    }
  }
  return { templates: sortedUnique(templates), concreteRoutes };
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

async function loadVercelArtifact(outputDirectory) {
  const configFile = path.join(outputDirectory, 'config.json');
  const configRoutes = routesFromVercelConfig(await readJson(configFile), configFile);
  const templates = [...configRoutes.templates];
  const concreteRoutes = [...configRoutes.concreteRoutes];
  const functionsDirectory = path.join(outputDirectory, 'functions');
  const staticDirectory = path.join(outputDirectory, 'static');
  try {
    const files = await walk(functionsDirectory);
    for (const file of files) {
      const relative = path.relative(functionsDirectory, file).replaceAll('\\', '/');
      const match = relative.match(/^(.+?)\.func\//);
      if (match) templates.push(normalizePublicPath(match[1]));
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
      const route = normalizePublicPath(relative);
      if (!concreteRoutes.some((item) => item.route === route)) templates.push(route);
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
    prerenderDynamicTemplates: sortedUnique(configRoutes.templates.filter(isDynamicRoute)),
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
