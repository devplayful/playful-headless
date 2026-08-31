import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { runBuildProducingArtifact } from '../scripts/build-and-verify-routes.mjs';
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

test('rejects a dynamic template present only in prerender-manifest', () => {
  const artifact = validArtifact();
  artifact.prerenderDynamicTemplates.push('/ghost/[slug]');
  const result = verifyRouteInventory({ sourceRoutes: manifest.sourceRoutes, artifact, manifest });
  assert.equal(result.ok, false);
  assert.deepEqual(result.ghostPrerenderTemplates, ['/ghost/[slug]']);
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

test('treats exact Vercel rewrites as candidates, not proof of ISR', () => {
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
  assert.deepEqual(parsed.exactDynamicMappings.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
    { route: '/agencia-seo', sourceTemplate: '/[slug]' },
  ]);
});

test('loads a Vercel v3 ISR backed by a function and prerender config', async () => {
  const fixture = path.join(root, 'tests/fixtures/vercel-output');
  const artifact = await loadArtifactBundle(fixture);
  assert.equal(artifact.format, 'vercel-output-v3');
  assert.deepEqual(artifact.templates, ['/', '/[slug]', '/casos-de-exito/[slug]', '/robots.txt']);
  assert.deepEqual(artifact.concreteRoutes.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
    { route: '/agencia-seo', sourceTemplate: '/[slug]' },
  ]);
});

test('does not accept an exact Vercel rewrite without a prerender or static asset', async () => {
  const fixture = path.join(root, 'tests/fixtures/vercel-output-unbacked-rewrite');
  const artifact = await loadArtifactBundle(fixture);
  assert.deepEqual(artifact.templates, ['/[slug]']);
  assert.deepEqual(artifact.concreteRoutes, []);
});

test('derives Vercel ISR provenance from a concrete function symlink', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-symlink-'));
  try {
    const functions = path.join(temporary, 'functions/app');
    await mkdir(path.join(functions, '[slug].func'), { recursive: true });
    await writeFile(path.join(temporary, 'config.json'), JSON.stringify({
      version: 3,
      routes: [
        { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
        { handle: 'filesystem' },
      ],
    }));
    await writeFile(path.join(functions, '[slug].func/.vc-config.json'), '{}');
    await symlink('[slug].func', path.join(functions, 'agencia-seo.func'));
    await writeFile(
      path.join(functions, 'agencia-seo.prerender-config.json'),
      JSON.stringify({ expiration: 3600 }),
    );
    const artifact = await loadArtifactBundle(temporary);
    assert.deepEqual(artifact.templates, ['/[slug]']);
    assert.deepEqual(artifact.concreteRoutes.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
      { route: '/agencia-seo', sourceTemplate: '/[slug]' },
    ]);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('rejects a dangling Vercel prerender function symlink', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-dangling-'));
  try {
    const functions = path.join(temporary, 'functions/app');
    await mkdir(functions, { recursive: true });
    await writeFile(path.join(temporary, 'config.json'), JSON.stringify({ version: 3 }));
    await symlink('[slug].func', path.join(functions, 'agencia-seo.func'));
    await writeFile(
      path.join(functions, 'agencia-seo.prerender-config.json'),
      JSON.stringify({ expiration: 3600 }),
    );
    await assert.rejects(loadArtifactBundle(temporary), /points to a missing source function/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('rejects a no-op build that does not recreate the artifact directory', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-noop-build-'));
  try {
    await assert.rejects(
      runBuildProducingArtifact({
        artifactPath: path.join(temporary, 'artifact'),
        buildCommand: ['/usr/bin/true'],
      }),
      /did not recreate artifact directory/,
    );
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
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
