import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
const copy = readFileSync(new URL('../lib/gracias-copy.ts', import.meta.url), 'utf8');

test('thank-you page branches on conv=Schedule vs Lead', () => {
  assert.match(page, /isScheduleThanksConv\(conv\)/);
  assert.match(page, /GRACIAS_SCHEDULE_H1/);
  assert.match(page, /GRACIAS_LEAD_H1/);
  assert.match(page, /GRACIAS_SCHEDULE_CTA_HREF/);
  assert.match(page, /GRACIAS_LEAD_CTA_HREF/);
  assert.match(copy, /conv === 'Schedule'/);
  assert.match(copy, /Tu reunión ya está confirmada/);
  assert.match(copy, /GRACIAS_SCHEDULE_BODY/);
});

test('thank-you page has noindex and no widget API hrefs', () => {
  assert.doesNotMatch(page, /api\.playfulagency\.com\/widget\/bookings/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /display: none|<form|fetch\(/);
  assert.match(page, /sesión es gratuita/);
});

test('contact form on staging keeps inline success (no redirect to /gracias)', () => {
  const code = readFileSync(
    new URL('../app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', import.meta.url),
    'utf8',
  );
  assert.doesNotMatch(code, /window\.location\.assign\('\/gracias\?conv=Lead'\)/);
  assert.match(code, /else if \(response\.ok && data\.success\)/);
  assert.match(code, /success: true/);
});
