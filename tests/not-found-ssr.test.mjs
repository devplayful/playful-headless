import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const notFound = readFileSync(new URL('../app/(frontend)/not-found.tsx', import.meta.url), 'utf8');
const notFoundView = readFileSync(
  new URL('../components/paginas-codigo/NotFoundView.tsx', import.meta.url),
  'utf8',
);
const client = readFileSync(new URL('../app/(frontend)/not-found-client.tsx', import.meta.url), 'utf8');

test('not-found is a server component that already paints the existing H1', () => {
  assert.doesNotMatch(notFound, /^['"]use client['"]/m);
  assert.match(notFound, /NotFoundPreviewCmsAttrs|NotFoundView/);
  assert.match(notFoundView, /<h1 className="text-center mb-12 md:mb-16"/);
  assert.match(notFoundView, /Página no encontrada/);
  assert.match(notFoundView, /Parece que esta página se perdió/);
  assert.match(notFoundView, /NotFoundSearchForm/);
  assert.match(notFoundView, /NotFoundHeaderHider/);
});

test('search and header hide stay on a small client', () => {
  assert.match(client, /^['"]use client['"]/m);
  assert.match(client, /export function NotFoundSearchForm/);
  assert.match(client, /export function NotFoundHeaderHider/);
  assert.doesNotMatch(client, /<h1[\s>]/);
  assert.doesNotMatch(client, /Página no encontrada/);
});
