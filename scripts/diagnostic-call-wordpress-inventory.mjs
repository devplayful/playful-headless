import assert from 'node:assert/strict';

import {
  DIAGNOSTIC_CALL_COPY,
  DIAGNOSTIC_CALL_ELEMENTOR_SERVICES,
  applyDiagnosticCallCopyToElementor,
} from '../utils/diagnostic-call-copy.mjs';

const API = 'https://endpoint.playfulagency.com/wp-json/wp/v2/pages';
const expectedChanged = Object.entries(DIAGNOSTIC_CALL_ELEMENTOR_SERVICES)
  .map(([slug, { pageId }]) => `${slug}:${pageId}`)
  .sort();

async function fetchPage(pageNumber) {
  const url = new URL(API);
  url.searchParams.set('status', 'publish');
  url.searchParams.set('per_page', '100');
  url.searchParams.set('page', String(pageNumber));
  url.searchParams.set('_fields', 'id,slug,content');

  const response = await fetch(url);
  assert.equal(response.ok, true, `WordPress inventory request failed: ${response.status}`);
  return {
    pages: await response.json(),
    totalPages: Number(response.headers.get('x-wp-totalpages') || 1),
  };
}

const first = await fetchPage(1);
const inventory = [...first.pages];
for (let pageNumber = 2; pageNumber <= first.totalPages; pageNumber += 1) {
  const next = await fetchPage(pageNumber);
  inventory.push(...next.pages);
}

const changed = [];
for (const page of inventory) {
  const original = page.content?.rendered ?? '';
  const transformed = applyDiagnosticCallCopyToElementor(original, {
    pageId: page.id,
    slug: page.slug,
  });
  if (transformed === original) continue;

  changed.push(`${page.slug}:${page.id}`);
  assert.equal(
    transformed.split(DIAGNOSTIC_CALL_COPY.cta).length - 1,
    2,
    `${page.slug}:${page.id} must update base and hover CTA layers`,
  );
  assert.ok(transformed.includes(DIAGNOSTIC_CALL_COPY.title));
  assert.ok(transformed.includes(DIAGNOSTIC_CALL_COPY.body));
}

assert.deepEqual(changed.sort(), expectedChanged);
console.log(`WordPress inventory smoke passed: ${inventory.length} pages; changed=${changed.join(',')}`);
