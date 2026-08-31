import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  appManifestKeyToRoute,
  discoverSourceRoutes,
  loadArtifactRoutes,
  routesFromAppPathsManifest,
  sourceRouteCovers,
  verifyRouteInventory,
} from '../scripts/route-integrity-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'config/expected-routes.json'), 'utf8'));
const validArtifactPayload = JSON.parse(
  await readFile(path.join(root, 'tests/fixtures/app-paths-valid.json'), 'utf8'),
);
const validArtifactRoutes = routesFromAppPathsManifest(validArtifactPayload);

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
});

test('normalizes Next app manifest keys and dynamic coverage', () => {
  assert.equal(appManifestKeyToRoute('/page'), '/');
  assert.equal(appManifestKeyToRoute('/api/contact/route'), '/api/contact');
  assert.equal(appManifestKeyToRoute('/(group)/blog/[...slug]/page'), '/blog/[...slug]');
  assert.equal(sourceRouteCovers('/blog/[...slug]', '/blog/tecnologia/post'), true);
  assert.equal(sourceRouteCovers('/[slug]', '/agencia-seo'), true);
  assert.equal(sourceRouteCovers('/[slug]', '/blog/post'), false);
});

test('accepts the clean baseline route inventory', () => {
  const result = verifyRouteInventory({
    sourceRoutes: manifest.sourceRoutes,
    artifactRoutes: validArtifactRoutes,
    manifest,
  });
  assert.equal(result.ok, true, result.errors.join('\n'));
  assert.deepEqual(result.ghostRoutes, []);
  assert.deepEqual(result.missingCriticalRoutes, []);
});

test('fails on a template ghost route even when a dynamic source could match its URL', () => {
  const result = verifyRouteInventory({
    sourceRoutes: manifest.sourceRoutes,
    artifactRoutes: [
      ...validArtifactRoutes,
      { route: '/agencia-ecommerce', kind: 'template', origin: 'fixture' },
    ],
    manifest,
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.ghostRoutes, ['/agencia-ecommerce']);
});

test('fails when a critical route is absent from the artifact', () => {
  const result = verifyRouteInventory({
    sourceRoutes: manifest.sourceRoutes,
    artifactRoutes: validArtifactRoutes.filter((item) => item.route !== '/api/contact'),
    manifest,
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.missingCriticalRoutes, ['/api/contact']);
});

test('fails closed when source routes drift from the reviewed manifest', () => {
  const result = verifyRouteInventory({
    sourceRoutes: [...manifest.sourceRoutes, '/new-unreviewed-route'],
    artifactRoutes: validArtifactRoutes,
    manifest,
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.unexpectedSourceRoutes, ['/new-unreviewed-route']);
});

test('allows concrete prerenders only when a tracked dynamic source covers them', () => {
  const covered = verifyRouteInventory({
    sourceRoutes: manifest.sourceRoutes,
    artifactRoutes: [
      ...validArtifactRoutes,
      { route: '/blog/tecnologia/post', kind: 'concrete', origin: 'fixture' },
    ],
    manifest,
  });
  assert.equal(covered.ok, true, covered.errors.join('\n'));

  const ghost = verifyRouteInventory({
    sourceRoutes: manifest.sourceRoutes,
    artifactRoutes: [
      ...validArtifactRoutes,
      { route: '/sin/fuente', kind: 'concrete', origin: 'fixture' },
    ],
    manifest,
  });
  assert.equal(ghost.ok, false);
  assert.deepEqual(ghost.ghostRoutes, ['/sin/fuente']);
});

test('inventories Vercel output functions, prerenders and metadata files locally', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-route-output-'));
  try {
    await mkdir(path.join(temporary, 'functions/app/blog/[...slug].func'), { recursive: true });
    await mkdir(path.join(temporary, 'static/blog/tecnologia'), { recursive: true });
    await writeFile(path.join(temporary, 'functions/app/blog/[...slug].func/.vc-config.json'), '{}');
    await writeFile(path.join(temporary, 'static/blog/tecnologia/post.html'), '<!doctype html>');
    await writeFile(path.join(temporary, 'static/robots.txt'), 'User-agent: *');
    await writeFile(path.join(temporary, 'static/sitemap.xml'), '<urlset/>');
    await writeFile(path.join(temporary, 'static/logo.png'), 'not a route');

    assert.deepEqual(await loadArtifactRoutes(temporary), [
      { route: '/blog/[...slug]', kind: 'template', origin: 'app/blog/[...slug].func/.vc-config.json' },
      { route: '/blog/tecnologia/post', kind: 'concrete', origin: 'blog/tecnologia/post.html' },
      { route: '/robots.txt', kind: 'concrete', origin: 'robots.txt' },
      { route: '/sitemap.xml', kind: 'concrete', origin: 'sitemap.xml' },
    ]);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
