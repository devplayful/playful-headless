import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  appManifestKeyToRoute,
  artifactFingerprint,
  assertArtifactProvenance,
  discoverSourceRoutes,
  loadArtifactBundle,
  routesFromPrerenderManifest,
  routesFromVercelConfig,
  verifyRouteInventory,
} from '../scripts/route-integrity-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'config/expected-routes.json'), 'utf8'));

function governedConcreteRoutes(inputManifest = manifest) {
  return Object.entries(inputManifest.governedConcreteRoutes).flatMap(([sourceTemplate, routes]) => (
    routes.map((route) => ({ route, sourceTemplate, origin: 'fixture' }))
  ));
}

function validArtifact() {
  const bundle = {
    format: 'next',
    templates: [...manifest.sourceRoutes, '/_not-found'],
    concreteRoutes: governedConcreteRoutes(),
    prerenderDynamicTemplates: ['/[slug]', '/blog/[...slug]'],
  };
  return { ...bundle, fingerprint: artifactFingerprint(bundle) };
}

test('discovers baseline App Router sources including metadata routes', () => {
  const files = [
    'app/page.tsx',
    'app/(marketing)/nosotros/page.tsx',
    'app/api/contact/route.ts',
    'app/blog/[...slug]/page.tsx',
    'app/robots.ts',
    'app/sitemap.xml/route.ts',
    'app/layout.tsx',
  ];
  assert.deepEqual(discoverSourceRoutes(files), [
    '/',
    '/api/contact',
    '/blog/[...slug]',
    '/nosotros',
    '/robots.txt',
    '/sitemap.xml',
  ]);
  assert.equal(appManifestKeyToRoute('/page'), '/');
  assert.equal(appManifestKeyToRoute('/(group)/blog/[...slug]/page'), '/blog/[...slug]');
});

test('reads concrete route provenance from Next prerender-manifest', () => {
  const parsed = routesFromPrerenderManifest({
    version: 4,
    routes: {
      '/agencia-seo': { srcRoute: '/[slug]' },
      '/blog/seo/post': { srcRoute: '/blog/[...slug]' },
      '/nosotros': { srcRoute: '/nosotros' },
    },
    dynamicRoutes: {
      '/[slug]': {},
      '/blog/[...slug]': {},
    },
  });
  assert.deepEqual(parsed.dynamicTemplates, ['/[slug]', '/blog/[...slug]']);
  assert.deepEqual(parsed.concreteRoutes.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
    { route: '/agencia-seo', sourceTemplate: '/[slug]' },
    { route: '/blog/seo/post', sourceTemplate: '/blog/[...slug]' },
  ]);
});

test('accepts the exact governed template and concrete inventory', () => {
  const result = verifyRouteInventory({
    sourceRoutes: manifest.sourceRoutes,
    artifact: validArtifact(),
    manifest,
  });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.equal(validArtifact().concreteRoutes.length, 108);
});

test('requires each of the four dynamic source templates in the artifact', async (t) => {
  for (const route of ['/[slug]', '/blog/[...slug]', '/casos-de-exito/[slug]', '/podcast/[slug]']) {
    await t.test(route, () => {
      const artifact = validArtifact();
      artifact.templates = artifact.templates.filter((candidate) => candidate !== route);
      const result = verifyRouteInventory({ sourceRoutes: manifest.sourceRoutes, artifact, manifest });
      assert.equal(result.ok, false);
      assert.deepEqual(result.missingArtifactTemplates, [route]);
    });
  }
});

test('rejects an exact ghost template even when root dynamic routing exists', () => {
  const artifact = validArtifact();
  artifact.templates.push('/agencia-ecommerce');
  const result = verifyRouteInventory({ sourceRoutes: manifest.sourceRoutes, artifact, manifest });
  assert.equal(result.ok, false);
  assert.deepEqual(result.ghostTemplateRoutes, ['/agencia-ecommerce']);
});

test('rejects an ungoverned root concrete instead of allowing /[slug] to cover it', () => {
  const artifact = validArtifact();
  artifact.concreteRoutes.push({
    route: '/pagos',
    sourceTemplate: '/[slug]',
    origin: 'prerender-manifest.json',
  });
  const result = verifyRouteInventory({ sourceRoutes: manifest.sourceRoutes, artifact, manifest });
  assert.equal(result.ok, false);
  assert.deepEqual(result.unexpectedConcreteRoutes, ['/[slug]:/pagos']);
});

test('rejects a missing governed concrete and a wrong source-template mapping', () => {
  const missingArtifact = validArtifact();
  missingArtifact.concreteRoutes = missingArtifact.concreteRoutes.filter((item) => item.route !== '/agencia-seo');
  const missing = verifyRouteInventory({ sourceRoutes: manifest.sourceRoutes, artifact: missingArtifact, manifest });
  assert.equal(missing.ok, false);
  assert.deepEqual(missing.missingConcreteRoutes, ['/[slug]:/agencia-seo']);

  const wrongArtifact = validArtifact();
  const target = wrongArtifact.concreteRoutes.find((item) => item.route === '/agencia-seo');
  target.sourceTemplate = '/blog/[...slug]';
  const wrong = verifyRouteInventory({ sourceRoutes: manifest.sourceRoutes, artifact: wrongArtifact, manifest });
  assert.equal(wrong.ok, false);
  assert.deepEqual(wrong.unexpectedConcreteRoutes, ['/blog/[...slug]:/agencia-seo']);
  assert.deepEqual(wrong.missingConcreteRoutes, ['/[slug]:/agencia-seo']);
});

test('models Vercel config routes as templates or exact ISR concretes', () => {
  const parsed = routesFromVercelConfig({
    version: 3,
    routes: [
      { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      { src: '^/agencia-seo(?:/)?$', dest: '/[slug]' },
      { src: '^/api/contact(?:/)?$', dest: '/api/contact' },
      { handle: 'filesystem' },
    ],
  });
  assert.deepEqual(parsed.templates, ['/[slug]', '/api/contact']);
  assert.deepEqual(parsed.concreteRoutes.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
    { route: '/agencia-seo', sourceTemplate: '/[slug]' },
  ]);
});

test('loads a realistic Vercel output v3 fixture using config routes and files', async () => {
  const fixture = path.join(root, 'tests/fixtures/vercel-output');
  const artifact = await loadArtifactBundle(fixture);
  assert.equal(artifact.format, 'vercel-output-v3');
  assert.deepEqual(artifact.templates, ['/', '/[slug]', '/casos-de-exito/[slug]', '/robots.txt']);
  assert.deepEqual(artifact.concreteRoutes.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
    { route: '/agencia-seo', sourceTemplate: '/[slug]' },
  ]);
});

test('provenance rejects a different HEAD or artifact fingerprint', () => {
  const artifact = validArtifact();
  const provenance = {
    schemaVersion: 1,
    commit: 'a'.repeat(40),
    artifactFingerprint: artifact.fingerprint,
    generator: 'build-and-verify-routes.mjs',
  };
  assert.doesNotThrow(() => assertArtifactProvenance({ provenance, commit: 'a'.repeat(40), artifact }));
  assert.throws(
    () => assertArtifactProvenance({ provenance, commit: 'b'.repeat(40), artifact }),
    /commit does not match HEAD/,
  );
  assert.throws(
    () => assertArtifactProvenance({
      provenance,
      commit: 'a'.repeat(40),
      artifact: { ...artifact, fingerprint: 'changed' },
    }),
    /changed after provenance/,
  );
});
