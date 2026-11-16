import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const notFound = readFileSync(new URL('../app/(frontend)/not-found.tsx', import.meta.url), 'utf8');
const notFoundView = readFileSync(
  new URL('../components/paginas-codigo/NotFoundView.tsx', import.meta.url),
  'utf8',
);

test('not-found.tsx export sync (evita shell __next_error__ con flag apagado)', () => {
  assert.match(notFound, /export default function NotFound/);
  assert.doesNotMatch(notFound, /export default async function NotFound/);
});

test('NotFoundView contiene copy SSR de la 404 pública', () => {
  assert.match(notFoundView, /Página no encontrada/);
  assert.match(notFoundView, /Parece que esta página se perdió/);
});
