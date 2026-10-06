import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const notFound = readFileSync(new URL('../app/not-found.tsx', import.meta.url), 'utf8');
const client = readFileSync(new URL('../app/not-found-client.tsx', import.meta.url), 'utf8');

test('not-found is a server component that already paints the existing H1', () => {
  assert.doesNotMatch(notFound, /^['"]use client['"]/m);
  assert.match(notFound, /<h1 className="text-center mb-12 md:mb-16"/);
  assert.match(notFound, /Página no encontrada/);
  assert.match(notFound, /Parece que esta página se perdió/);
  assert.match(notFound, /NotFoundSearchForm/);
  assert.match(notFound, /NotFoundHeaderHider/);
});

test('search and header hide stay on a small client', () => {
  assert.match(client, /^['"]use client['"]/m);
  assert.match(client, /export function NotFoundSearchForm/);
  assert.match(client, /export function NotFoundHeaderHider/);
  assert.doesNotMatch(client, /<h1[\s>]/);
  assert.doesNotMatch(client, /Página no encontrada/);
});
