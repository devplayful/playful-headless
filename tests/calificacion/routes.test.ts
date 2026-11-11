import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CALIFICACION_PUBLIC_ROUTE } from '../../lib/calificacion/constants.ts';
import { qaFiltroRouteEnabled } from '../../lib/qa-filtro/constants.ts';

test('/reunion page exists with noindex metadata', () => {
  const page = readFileSync(
    new URL('../../app/(frontend)/reunion/page.tsx', import.meta.url),
    'utf8',
  );
  assert.match(page, /index: false/);
  assert.match(page, /follow: true/);
  assert.match(page, /canonicalForPath\(CALIFICACION_PUBLIC_ROUTE\)/);
  assert.match(page, /ReunionCalificacionClient/);
});

import { PROD_FILTRO_CALENDAR_ID } from '../../lib/calificacion/constants.ts';

test('production calendar id is configured', () => {
  assert.equal(PROD_FILTRO_CALENDAR_ID, 'NiVJSc7uIWJpcbq3Ppmf');
});

test('QA filtro route stays disabled on production', () => {
  assert.equal(qaFiltroRouteEnabled({ VERCEL_ENV: 'production' }), false);
  assert.equal(qaFiltroRouteEnabled({ VERCEL_ENV: 'preview' }), true);
});

test('public calificación route is /reunion', () => {
  assert.equal(CALIFICACION_PUBLIC_ROUTE, '/reunion');
});
