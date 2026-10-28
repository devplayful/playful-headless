import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const UNSIGNED_COPY_MARKERS = [
  'PENDIENTE_FIRMA_JOSE_380',
  'COPY SIN FIRMAR',
];

const SOURCE_EXTENSIONS = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.md',
  '.html',
]);

const SKIP_DIR_NAMES = new Set([
  '.git',
  '.next',
  'node_modules',
  'coverage',
  'playwright-report',
  'test-results',
  'tests',
]);

const SKIP_BASENAMES = new Set([
  'assert-no-unsigned-copy.mjs',
  'build-with-unsigned-copy-guard.mjs',
]);

export function repoRootFrom(url = import.meta.url) {
  return path.resolve(path.dirname(fileURLToPath(url)), '..');
}

export function findUnsignedCopyInText(text, relPath) {
  const hits = [];
  if (typeof text !== 'string' || !text) return hits;
  for (const marker of UNSIGNED_COPY_MARKERS) {
    let from = 0;
    while (from < text.length) {
      const index = text.indexOf(marker, from);
      if (index === -1) break;
      const line = text.slice(0, index).split('\n').length;
      hits.push({ file: relPath, line, marker });
      from = index + marker.length;
    }
  }
  return hits;
}

function shouldSkipDir(name) {
  return SKIP_DIR_NAMES.has(name);
}

function walkSourceFiles(root) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    let entries;
    try {
      entries = readdirSync(current);
    } catch {
      continue;
    }
    for (const name of entries) {
      const full = path.join(current, name);
      let stats;
      try {
        stats = statSync(full);
      } catch {
        continue;
      }
      if (stats.isDirectory()) {
        if (!shouldSkipDir(name)) stack.push(full);
        continue;
      }
      if (!stats.isFile()) continue;
      if (SKIP_BASENAMES.has(name)) continue;
      if (!SOURCE_EXTENSIONS.has(path.extname(name))) continue;
      files.push(full);
    }
  }
  return files;
}

export function findUnsignedCopyInSource(root = repoRootFrom()) {
  const hits = [];
  for (const full of walkSourceFiles(root)) {
    const rel = path.relative(root, full).split(path.sep).join('/');
    hits.push(...findUnsignedCopyInText(readFileSync(full, 'utf8'), rel));
  }
  return hits;
}

export function formatUnsignedCopyHits(hits) {
  if (!hits.length) return '';
  return hits
    .map((hit) => `${hit.file}:${hit.line} → ${hit.marker}`)
    .join('\n');
}

export function assertNoUnsignedCopy({
  root = repoRootFrom(),
  extraHtml = [],
} = {}) {
  const hits = [
    ...findUnsignedCopyInSource(root),
    ...extraHtml.flatMap((html, index) =>
      findUnsignedCopyInText(html, `rendered-html[${index}]`),
    ),
  ];
  return {
    ok: hits.length === 0,
    hits,
    message: hits.length
      ? `Copy sin firmar (PENDIENTE_FIRMA_JOSE_380 / COPY SIN FIRMAR):\n${formatUnsignedCopyHits(hits)}`
      : '',
  };
}

export function assertNoUnsignedCopyOrExit(options) {
  const result = assertNoUnsignedCopy(options);
  if (!result.ok) {
    console.error(result.message);
    process.exit(1);
  }
  return result;
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  assertNoUnsignedCopyOrExit();
}
