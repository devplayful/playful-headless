import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  THANKS_LEAD_PATH,
  THANKS_PRIORITY_PATH,
  contactThanksHref,
  thanksBookingAllowed,
} from '../utils/thanks-booking.ts';

const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');

test('thank-you page gates the booking CTA to fit=priority and stays noindex', () => {
  assert.match(page, /thanksBookingAllowed/);
  assert.equal(page.split('href="/reunion-playful"').length - 1, 1);
  assert.doesNotMatch(page, /api\.playfulagency\.com\/widget\/bookings/);
  assert.match(page, /index: false/);
  assert.match(page, /force-dynamic/);
  assert.doesNotMatch(page, /playfulagency\.com\/reunion-playful/);
  assert.doesNotMatch(page, /widget\/bookings\/reunion-playful/);
  assert.doesNotMatch(page, /display: none|<form|fetch\(/);
  assert(page.indexOf('href="/reunion-playful"') < page.indexOf('Una conversación para evaluar'));
  assert.match(page, /sesión es gratuita/);
});

test('thanks booking lock only opens for priority', () => {
  assert.equal(thanksBookingAllowed({}), false);
  assert.equal(thanksBookingAllowed({ fit: 'Lead' }), false);
  assert.equal(thanksBookingAllowed({ fit: 'review' }), false);
  assert.equal(thanksBookingAllowed({ fit: 'transition' }), false);
  assert.equal(thanksBookingAllowed({ fit: 'priority' }), true);
  assert.equal(contactThanksHref('review'), THANKS_LEAD_PATH);
  assert.equal(contactThanksHref('transition'), THANKS_LEAD_PATH);
  assert.equal(contactThanksHref('priority'), THANKS_PRIORITY_PATH);
});

for (const file of ['app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', 'components/ContactLeadForm.tsx']) {
  test(`${file}: navigate only within successful receipt branch, after generate_lead flush`, () => {
    const code = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const success = code.indexOf('else if (response.ok && data.success)');
    const navigation = code.indexOf('window.location.assign(thanksHref)');
    const pending = code.indexOf('if (response.status === 202 && data.pendingConfirmation === true)');
    assert(success > 0 && navigation > success);
    assert(pending >= 0 && pending < success);
    assert(code.slice(success, navigation).includes('resetConfirmedForm();'));
    assert(code.slice(success, navigation).includes('await pushGenerateLead'));
    assert.match(code.slice(success, navigation), /data.simulated !== true && !previewSimulation/);
    assert.match(code, /contactThanksHref/);
    assert(!code.slice(pending, success).includes('window.location.assign(thanksHref)'));
    assert(!code.slice(0, success).includes('window.location.assign(thanksHref)'));
    assert(!code.includes("window.location.assign('/gracias?conv=Lead')"));
  });
}
