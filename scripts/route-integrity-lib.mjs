import assert from 'node:assert/strict';
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
  return segments.filter((segment) => (
    segment
    && !segment.startsWith('(')
    && !segment.startsWith('@')
  ));
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

export function appManifestKeyToRoute(key) {
  let normalized = String(key).replaceAll('\\', '/').replace(/\/(?:page|route)$/, '');
  const segments = publicSegments(normalized.split('/'));
  normalized = `/${segments.join('/')}`.replace(/\/{2,}/g, '/');
  return normalized === '' || normalized === '/page' ? '/' : normalized;
}

function routePatternToRegExp(route) {
  if (route === '/') return /^\/$/;
  const segments = route.slice(1).split('/');
  const expressions = segments.map((segment) => {
    if (/^\[\[\.\.\.[^\]]+\]\]$/.test(segment)) return '(?:.+)?';
    if (/^\[\.\.\.[^\]]+\]$/.test(segment)) return '.+';
    if (/^\[[^\]]+\]$/.test(segment)) return '[^/]+';
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  });
  return new RegExp(`^/${expressions.join('/')}$`);
}

export function sourceRouteCovers(sourceRoute, artifactRoute) {
  return routePatternToRegExp(sourceRoute).test(artifactRoute);
}

function record(route, kind, origin) {
  return { route, kind, origin };
}

export function routesFromAppPathsManifest(payload, origin = 'app-paths-manifest.json') {
  assert.ok(payload && !Array.isArray(payload) && typeof payload === 'object', `${origin} must be an object`);
  return sortedUnique(Object.keys(payload).map(appManifestKeyToRoute)).map((route) => (
    record(route, 'template', origin)
  ));
}

function normalizePublicPath(value) {
  let route = String(value).replaceAll('\\', '/');
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

async function routesFromVercelOutput(outputDirectory) {
  const records = [];
  const functionsDirectory = path.join(outputDirectory, 'functions');
  const staticDirectory = path.join(outputDirectory, 'static');

  try {
    const files = await walk(functionsDirectory);
    for (const file of files) {
      const relative = path.relative(functionsDirectory, file).replaceAll('\\', '/');
      const match = relative.match(/^(.+?)\.func\//);
      if (!match) continue;
      records.push(record(normalizePublicPath(match[1]), 'template', relative));
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
      records.push(record(normalizePublicPath(relative), 'concrete', relative));
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const unique = new Map(records.map((item) => [`${item.kind}:${item.route}`, item]));
  return [...unique.values()].sort((left, right) => compareStrings(left.route, right.route));
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

export async function loadArtifactRoutes(inputPath) {
  const absolute = path.resolve(inputPath);
  const inputStat = await stat(absolute);
  if (inputStat.isFile()) {
    const payload = await readJson(absolute);
    if (Array.isArray(payload)) {
      return sortedUnique(payload).map((route) => record(route, 'template', absolute));
    }
    if (Array.isArray(payload.routes) && payload.routes.every((route) => typeof route === 'string')) {
      return sortedUnique(payload.routes).map((route) => record(route, 'template', absolute));
    }
    return routesFromAppPathsManifest(payload, absolute);
  }

  for (const candidate of [
    path.join(absolute, 'server/app-paths-manifest.json'),
    path.join(absolute, '.next/server/app-paths-manifest.json'),
  ]) {
    try {
      return routesFromAppPathsManifest(await readJson(candidate), candidate);
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    }
  }

  const records = await routesFromVercelOutput(absolute);
  assert.ok(records.length > 0, `no route inventory found in ${absolute}`);
  return records;
}

function difference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function artifactHasCritical(records, criticalRoute) {
  return records.some((item) => item.route === criticalRoute);
}

export function verifyRouteInventory({ sourceRoutes, artifactRoutes, manifest }) {
  assert.equal(manifest.schemaVersion, 1, 'unsupported expected-route manifest schema');
  const expectedSource = sortedUnique(manifest.sourceRoutes ?? []);
  const criticalRoutes = sortedUnique(manifest.criticalRoutes ?? []);
  const allowedArtifactOnly = new Set(manifest.allowedArtifactOnlyRoutes ?? []);
  const actualSource = sortedUnique(sourceRoutes);

  const unexpectedSourceRoutes = difference(actualSource, expectedSource);
  const missingSourceRoutes = difference(expectedSource, actualSource);
  const invalidCriticalRoutes = difference(criticalRoutes, expectedSource);

  const ghostRoutes = sortedUnique(artifactRoutes
    .filter((item) => {
      if (allowedArtifactOnly.has(item.route)) return false;
      if (item.kind === 'template') return !actualSource.includes(item.route);
      return !actualSource.some((sourceRoute) => sourceRouteCovers(sourceRoute, item.route));
    })
    .map((item) => item.route));

  const missingCriticalRoutes = criticalRoutes.filter((route) => (
    !artifactHasCritical(artifactRoutes, route)
  ));

  const errors = [];
  if (unexpectedSourceRoutes.length) errors.push(`source routes not in expected manifest: ${unexpectedSourceRoutes.join(', ')}`);
  if (missingSourceRoutes.length) errors.push(`expected source routes missing from commit: ${missingSourceRoutes.join(', ')}`);
  if (invalidCriticalRoutes.length) errors.push(`critical routes absent from source manifest: ${invalidCriticalRoutes.join(', ')}`);
  if (ghostRoutes.length) errors.push(`artifact ghost routes without source: ${ghostRoutes.join(', ')}`);
  if (missingCriticalRoutes.length) errors.push(`critical routes missing from artifact: ${missingCriticalRoutes.join(', ')}`);

  return {
    ok: errors.length === 0,
    sourceRoutes: actualSource,
    artifactRoutes: sortedUnique(artifactRoutes.map((item) => item.route)),
    unexpectedSourceRoutes,
    missingSourceRoutes,
    ghostRoutes,
    missingCriticalRoutes,
    errors,
  };
}
