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
  isFilesystemReachable,
  loadArtifactBundle,
  routesFromPrerenderManifest,
  routesFromVercelConfig,
  verifyRouteInventory,
} from '../scripts/route-integrity-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(await readFile(path.join(root, 'config/expected-routes.json'), 'utf8'));

async function writeJson(file, payload) {
  await writeFile(file, JSON.stringify(payload));
}

async function writeNodeFunction(output, name, { handler = 'index.js', writeHandler = true } = {}) {
  const directory = path.join(output, 'functions', `${name}.func`);
  await mkdir(directory, { recursive: true });
  await writeJson(path.join(directory, '.vc-config.json'), { runtime: 'nodejs20.x', handler });
  if (writeHandler) await writeFile(path.join(directory, handler), 'export default function handler() {}');
  return directory;
}

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

test('treats only reachable GET and HEAD exact Vercel rewrites as provenance candidates', () => {
  const parsed = routesFromVercelConfig({
    version: 3,
    routes: [
      { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      { src: '^/agencia-seo(?:/)?$', dest: '/[slug]' },
      { src: '^/api/contact(?:/)?$', dest: '/api/contact' },
      { handle: 'filesystem' },
    ],
  });
  assert.deepEqual(parsed.exactDynamicMappings.map(({ route, sourceTemplate, provenanceMethods }) => ({
    route,
    sourceTemplate,
    provenanceMethods,
  })), [
    { route: '/agencia-seo', sourceTemplate: '/[slug]', provenanceMethods: [] },
  ]);
  assert.equal(isFilesystemReachable([
    { src: '^/agencia-seo$', methods: ['POST'], dest: '/fallback' },
  ], '/agencia-seo'), true);
  assert.equal(isFilesystemReachable([
    { src: '^/agencia-seo$', methods: ['GET'], dest: '/fallback' },
  ], '/agencia-seo'), false);
  assert.throws(() => isFilesystemReachable([
    { src: '^/agencia-seo$', check: true, dest: '/fallback' },
  ], '/agencia-seo'), /field check is not proven safe/);
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

test('counts a bracket-named function only with a reachable public GET and HEAD rewrite', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-dynamic-reachability-'));
  try {
    await writeNodeFunction(temporary, '[slug]');

    await writeJson(path.join(temporary, 'config.json'), { version: 3 });
    assert.deepEqual((await loadArtifactBundle(temporary)).templates, []);

    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/([^/]+?)(?:/)?$', methods: ['GET'], dest: '/[slug]' },
      ],
    });
    assert.deepEqual((await loadArtifactBundle(temporary)).templates, []);

    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/\\[slug\\]$', dest: '/[slug]' },
      ],
    });
    assert.deepEqual((await loadArtifactBundle(temporary)).templates, []);

    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/(route-integrity-alpha|route-integrity-beta|123)$', dest: '/[slug]' },
      ],
    });
    assert.deepEqual((await loadArtifactBundle(temporary)).templates, []);

    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/([^/]+?)(?:/)?$', methods: ['GET', 'HEAD'], dest: '/[slug]' },
      ],
    });
    assert.deepEqual((await loadArtifactBundle(temporary)).templates, ['/[slug]']);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('requires exact rewrite provenance itself to be reachable for GET and HEAD', async (t) => {
  async function writeFixture(temporary, routes) {
    await writeNodeFunction(temporary, '[slug]');
    await mkdir(path.join(temporary, 'static'), { recursive: true });
    await writeFile(path.join(temporary, 'static/agencia-seo.html'), 'agency');
    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      overrides: { 'agencia-seo.html': { path: 'agencia-seo' } },
      routes,
    });
  }

  await t.test('reachable exact GET and HEAD mapping', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-exact-reachable-'));
    try {
      await writeFixture(temporary, [
        { src: '^/agencia-seo(?:/)?$', dest: '/[slug]' },
        { handle: 'filesystem' },
        { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      ]);
      const artifact = await loadArtifactBundle(temporary);
      assert.deepEqual(artifact.templates, ['/[slug]']);
      assert.deepEqual(artifact.concreteRoutes.map(({ route, sourceTemplate }) => ({ route, sourceTemplate })), [
        { route: '/agencia-seo', sourceTemplate: '/[slug]' },
      ]);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  for (const fixture of [
    {
      name: 'POST-only exact mapping',
      routes: [
        { src: '^/agencia-seo(?:/)?$', methods: ['POST'], dest: '/[slug]' },
        { handle: 'filesystem' },
        { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      ],
    },
    {
      name: 'post-filesystem exact mapping',
      routes: [
        { handle: 'filesystem' },
        { src: '^/agencia-seo(?:/)?$', dest: '/[slug]' },
        { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      ],
    },
  ]) {
    await t.test(fixture.name, async () => {
      const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-exact-unreachable-'));
      try {
        await writeFixture(temporary, fixture.routes);
        const artifact = await loadArtifactBundle(temporary);
        assert.deepEqual(artifact.templates, ['/[slug]', '/agencia-seo']);
        assert.deepEqual(artifact.concreteRoutes, []);
      } finally {
        await rm(temporary, { recursive: true, force: true });
      }
    });
  }

  await t.test('shadowed exact mapping', () => {
    const parsed = routesFromVercelConfig({
      version: 3,
      routes: [
        { src: '^/(.+?)$', dest: '/runtime' },
        { src: '^/agencia-seo(?:/)?$', dest: '/[slug]' },
        { handle: 'filesystem' },
      ],
    });
    assert.deepEqual(parsed.exactDynamicMappings[0].provenanceMethods, []);
    assert.deepEqual(routesFromVercelConfig({
      version: 3,
      routes: [{ src: '/agencia-seo', dest: '/[slug]' }],
    }).exactDynamicMappings, []);
  });
});

test('fails closed on unproven Vercel phases, conditions, and route actions', () => {
  for (const handle of ['rewrite', 'resource', 'miss', 'hit', 'error']) {
    assert.throws(() => routesFromVercelConfig({
      version: 3,
      routes: [
        { handle },
        { src: '^/(.*)$', dest: '/[slug]' },
      ],
    }), new RegExp(`unsupported routing phase ${handle}`));
  }

  for (const condition of ['has', 'missing']) {
    assert.throws(() => routesFromVercelConfig({
      version: 3,
      routes: [{
        src: '^/(.*)$',
        dest: '/[slug]',
        [condition]: [{ type: 'header', key: 'x-preview' }],
      }],
    }), new RegExp(`field ${condition} is not proven safe`));
  }

  assert.throws(() => routesFromVercelConfig({
    version: 3,
    routes: [{ handle: 'hit' }, { handle: 'filesystem' }],
  }), /moves routing phases backwards/);
  assert.throws(() => routesFromVercelConfig({
    version: 3,
    routes: [{ handle: 'filesystem', src: '^/page$', dest: '/other' }],
  }), /handler actions are not supported/);
  assert.throws(() => routesFromVercelConfig({
    version: 3,
    routes: [{ src: '^/(.*)$', methods: ['GET', 'get'], dest: '/[slug]' }],
  }), /methods must be unique/);
  assert.throws(() => routesFromVercelConfig({
    version: 3,
    routes: [{ src: '^/(.*)$', methods: ['CUSTOM'], dest: '/[slug]' }],
  }), /unsupported method CUSTOM/);
});

test('derives Vercel ISR provenance from a concrete function symlink', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-symlink-'));
  try {
    const functions = path.join(temporary, 'functions');
    await writeNodeFunction(temporary, '[slug]');
    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      routes: [
        { handle: 'filesystem' },
        { src: '^/agencia-seo(?:/)?$', dest: '/[slug]' },
        { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      ],
    });
    await symlink('[slug].func', path.join(functions, 'agencia-seo.func'));
    await writeJson(
      path.join(functions, 'agencia-seo.prerender-config.json'),
      { expiration: 3600 },
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
    const functions = path.join(temporary, 'functions');
    await mkdir(functions, { recursive: true });
    await writeJson(path.join(temporary, 'config.json'), { version: 3 });
    await symlink('[slug].func', path.join(functions, 'agencia-seo.func'));
    await writeJson(
      path.join(functions, 'agencia-seo.prerender-config.json'),
      { expiration: 3600 },
    );
    await assert.rejects(loadArtifactBundle(temporary), /points to a missing function directory/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('preserves Output v3 public paths and applies validated static overrides', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-paths-'));
  try {
    await mkdir(path.join(temporary, 'static/app'), { recursive: true });
    await mkdir(path.join(temporary, 'static/pages'), { recursive: true });
    await writeFile(path.join(temporary, 'static/app/page.html'), 'app');
    await writeFile(path.join(temporary, 'static/pages/about.html'), 'pages');
    await writeFile(path.join(temporary, 'static/blog.html'), 'blog');
    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      overrides: { 'blog.html': { path: 'blog', contentType: 'text/html; charset=utf-8' } },
    });
    const artifact = await loadArtifactBundle(temporary);
    assert.deepEqual(artifact.templates, ['/app/page.html', '/blog', '/pages/about.html']);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('rejects unused, malformed, ambiguous, or unsupported static overrides', async (t) => {
  const cases = [
    {
      name: 'unused key',
      overrides: { 'missing.html': { path: 'missing' } },
      error: /does not reference a physical static file/,
    },
    {
      name: 'invalid contentType',
      overrides: { 'page.html': { contentType: 'not-a-media-type' } },
      error: /must be a valid media type/,
    },
    {
      name: 'unknown field',
      overrides: { 'page.html': { contentEncoding: 'gzip' } },
      error: /unsupported field contentEncoding/,
    },
    {
      name: 'traversing path',
      overrides: { 'page.html': { path: '../page' } },
      error: /must not traverse directories/,
    },
  ];
  for (const fixture of cases) {
    await t.test(fixture.name, async () => {
      const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-override-'));
      try {
        await mkdir(path.join(temporary, 'static'), { recursive: true });
        await writeFile(path.join(temporary, 'static/page.html'), 'page');
        await writeJson(path.join(temporary, 'config.json'), { version: 3, overrides: fixture.overrides });
        await assert.rejects(loadArtifactBundle(temporary), fixture.error);
      } finally {
        await rm(temporary, { recursive: true, force: true });
      }
    });
  }

  await t.test('public path collision', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-override-collision-'));
    try {
      await mkdir(path.join(temporary, 'static'), { recursive: true });
      await writeFile(path.join(temporary, 'static/page.html'), 'page');
      await writeFile(path.join(temporary, 'static/other.html'), 'other');
      await writeJson(path.join(temporary, 'config.json'), {
        version: 3,
        overrides: {
          'page.html': { path: 'same' },
          'other.html': { path: 'same' },
        },
      });
      await assert.rejects(loadArtifactBundle(temporary), /collides with/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
});

test('preserves app and pages prefixes in public function paths', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-function-paths-'));
  try {
    await writeJson(path.join(temporary, 'config.json'), { version: 3 });
    await writeNodeFunction(temporary, 'app/page');
    await writeNodeFunction(temporary, 'pages/about');
    const artifact = await loadArtifactBundle(temporary);
    assert.deepEqual(artifact.templates, ['/app/page', '/pages/about']);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('rejects empty, malformed, or incomplete Vercel functions', async (t) => {
  await t.test('regular file named .func', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-file-function-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await mkdir(path.join(temporary, 'functions'), { recursive: true });
      await writeFile(path.join(temporary, 'functions/bad.func'), 'not a directory');
      await assert.rejects(loadArtifactBundle(temporary), /must be a function directory or symlink/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  await t.test('empty .func', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-empty-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await mkdir(path.join(temporary, 'functions/empty.func'), { recursive: true });
      await assert.rejects(loadArtifactBundle(temporary), /missing \.vc-config\.json/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  await t.test('malformed .vc-config.json', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-malformed-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await mkdir(path.join(temporary, 'functions/bad.func'), { recursive: true });
      await writeFile(path.join(temporary, 'functions/bad.func/.vc-config.json'), '{');
      await assert.rejects(loadArtifactBundle(temporary));
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  await t.test('missing handler', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-handler-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await writeNodeFunction(temporary, 'missing', { writeHandler: false });
      await assert.rejects(loadArtifactBundle(temporary), /handler does not exist/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
});

test('rejects external and non-function symlink targets', async (t) => {
  await t.test('symlink name without .func', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-alias-name-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await writeNodeFunction(temporary, 'target');
      await symlink('target.func', path.join(temporary, 'functions/alias'));
      await assert.rejects(loadArtifactBundle(temporary), /symlink must have a \.func suffix/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });

  await t.test('external target', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-external-'));
    const outside = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-outside-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await mkdir(path.join(temporary, 'functions'), { recursive: true });
      await writeNodeFunction(outside, 'target');
      await symlink(path.join(outside, 'functions/target.func'), path.join(temporary, 'functions/alias.func'));
      await assert.rejects(loadArtifactBundle(temporary), /points outside functions/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  await t.test('target without .func', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-no-func-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await mkdir(path.join(temporary, 'functions/target'), { recursive: true });
      await symlink('target', path.join(temporary, 'functions/alias.func'));
      await assert.rejects(loadArtifactBundle(temporary), /target must be a \.func directory/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
});

test('rejects symlinked roots, static entries, configs, handlers, and function assets', async (t) => {
  await t.test('artifact root', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-artifact-target-'));
    const aliasParent = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-artifact-alias-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      const alias = path.join(aliasParent, 'output');
      await symlink(temporary, alias);
      await assert.rejects(loadArtifactBundle(alias), /artifact directory must be physical/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
      await rm(aliasParent, { recursive: true, force: true });
    }
  });

  for (const rootName of ['functions', 'static']) {
    await t.test(`${rootName} root`, async () => {
      const temporary = await mkdtemp(path.join(os.tmpdir(), `playful-vercel-${rootName}-root-`));
      const outside = await mkdtemp(path.join(os.tmpdir(), `playful-vercel-${rootName}-outside-`));
      try {
        await writeJson(path.join(temporary, 'config.json'), { version: 3 });
        await symlink(outside, path.join(temporary, rootName));
        await assert.rejects(loadArtifactBundle(temporary), new RegExp(`${rootName} must be a physical directory`));
      } finally {
        await rm(temporary, { recursive: true, force: true });
        await rm(outside, { recursive: true, force: true });
      }
    });
  }

  await t.test('config.json', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-config-link-'));
    const outside = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-config-source-'));
    try {
      await writeJson(path.join(outside, 'config.json'), { version: 3 });
      await symlink(path.join(outside, 'config.json'), path.join(temporary, 'config.json'));
      await assert.rejects(loadArtifactBundle(temporary), /config\.json must be a physical file/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  await t.test('static file', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-static-link-'));
    const outside = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-static-source-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await mkdir(path.join(temporary, 'static'), { recursive: true });
      await writeFile(path.join(outside, 'page.html'), 'outside');
      await symlink(path.join(outside, 'page.html'), path.join(temporary, 'static/page.html'));
      await assert.rejects(loadArtifactBundle(temporary), /only \.func aliases may be symlinks/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  for (const linkedEntry of ['.vc-config.json', 'index.js', 'asset.txt']) {
    await t.test(`function ${linkedEntry}`, async () => {
      const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-function-link-'));
      const outside = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-function-source-'));
      try {
        await writeJson(path.join(temporary, 'config.json'), { version: 3 });
        const functionDirectory = await writeNodeFunction(temporary, 'page');
        const target = path.join(functionDirectory, linkedEntry);
        await rm(target, { force: true });
        if (linkedEntry === '.vc-config.json') {
          await writeJson(path.join(outside, linkedEntry), { runtime: 'nodejs20.x', handler: 'index.js' });
        } else {
          await writeFile(path.join(outside, linkedEntry), 'outside');
        }
        await symlink(path.join(outside, linkedEntry), target);
        await assert.rejects(loadArtifactBundle(temporary), /only \.func aliases may be symlinks/);
      } finally {
        await rm(temporary, { recursive: true, force: true });
        await rm(outside, { recursive: true, force: true });
      }
    });
  }

  await t.test('prerender config', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-prerender-link-'));
    const outside = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-prerender-source-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await writeNodeFunction(temporary, 'page');
      await writeJson(path.join(outside, 'page.prerender-config.json'), { expiration: 60 });
      await symlink(
        path.join(outside, 'page.prerender-config.json'),
        path.join(temporary, 'functions/page.prerender-config.json'),
      );
      await assert.rejects(loadArtifactBundle(temporary), /symlink must have a \.func suffix/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });

  await t.test('chained .func alias', async () => {
    const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-function-chain-'));
    try {
      await writeJson(path.join(temporary, 'config.json'), { version: 3 });
      await writeNodeFunction(temporary, 'target');
      await symlink('target.func', path.join(temporary, 'functions/first.func'));
      await symlink('first.func', path.join(temporary, 'functions/second.func'));
      await assert.rejects(loadArtifactBundle(temporary), /must point directly to a physical \.func directory/);
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  });
});

test('does not count a prerender shadowed by a pre-filesystem runtime rewrite', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-shadowed-'));
  try {
    const functions = path.join(temporary, 'functions');
    await writeNodeFunction(temporary, '[slug]');
    await symlink('[slug].func', path.join(functions, 'agencia-seo.func'));
    await writeJson(path.join(functions, 'agencia-seo.prerender-config.json'), { expiration: 60 });
    await writeJson(path.join(temporary, 'config.json'), {
      version: 3,
      routes: [
        { src: '^/agencia-seo(?:/)?$', dest: '/runtime' },
        { handle: 'filesystem' },
        { src: '^/([^/]+?)(?:/)?$', dest: '/[slug]' },
      ],
    });
    const artifact = await loadArtifactBundle(temporary);
    assert.deepEqual(artifact.templates, ['/[slug]']);
    assert.deepEqual(artifact.concreteRoutes, []);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('requires prerender expiration to be a non-negative integer or false', async () => {
  const temporary = await mkdtemp(path.join(os.tmpdir(), 'playful-vercel-expiration-'));
  try {
    await writeJson(path.join(temporary, 'config.json'), { version: 3 });
    await writeNodeFunction(temporary, 'page');
    await writeJson(path.join(temporary, 'functions/page.prerender-config.json'), { expiration: 1.5 });
    await assert.rejects(loadArtifactBundle(temporary), /valid expiration/);
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
