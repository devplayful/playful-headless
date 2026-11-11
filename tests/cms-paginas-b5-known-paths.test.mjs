import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { isKnownPublicAppPath } from '../lib/cms-paginas-b5-known-paths.ts';

const expectedRoutes = JSON.parse(
  readFileSync(new URL('../config/expected-routes.json', import.meta.url), 'utf8'),
);

/** Rutas públicas del manifest que no deben caer en B5 404 con ?cms=1 (ni en prod con B5). */
function publicRoutesFromExpectedRoutesManifest() {
  const routes = new Set();

  for (const route of expectedRoutes.criticalRoutes ?? []) {
    routes.add(route);
  }

  for (const concrete of Object.values(expectedRoutes.governedConcreteRoutes ?? {})) {
    for (const route of concrete) {
      routes.add(route);
    }
  }

  for (const route of expectedRoutes.sourceRoutes ?? []) {
    if (route.includes('[') || route.includes('(')) continue;
    if (route.startsWith('/cms-')) continue;
    routes.add(route);
  }

  return [...routes].sort();
}

test('expected-routes.json public paths are known to B5 allowlist', () => {
  const unknown = [];
  for (const route of publicRoutesFromExpectedRoutesManifest()) {
    if (!isKnownPublicAppPath(route)) {
      unknown.push(route);
    }
  }
  assert.deepEqual(
    unknown,
    [],
    `Add to lib/cms-paginas-b5-known-paths.ts: ${unknown.join(', ')}`,
  );
});

test('merge landing routes stay known with trailing slash variants', () => {
  for (const route of ['/reunion/', '/eshow/', '/jose/', '/eshow/gracias/']) {
    assert.equal(isKnownPublicAppPath(route), true, route);
  }
});
