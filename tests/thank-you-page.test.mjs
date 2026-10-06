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
const lead = readFileSync(new URL('../app/gracias/LeadThankYou.tsx', import.meta.url), 'utf8');
const schedule = readFileSync(new URL('../app/gracias/ScheduleConfirmation.tsx', import.meta.url), 'utf8');

const BOOKING_LEAK = /reunion-playful|widget\/bookings|calendly|agendar|solicitar una reuni[oó]n|comprobar si encajamos|Cumplo estas condiciones|#condiciones/i;

test('gracias branches on conv=Schedule and stays dynamic', () => {
  assert.match(page, /export const dynamic = 'force-dynamic'/);
  assert.match(page, /conv === 'Schedule'/);
  assert.match(page, /<ScheduleConfirmation \/>/);
  assert.match(page, /<LeadThankYou fit=\{/);
  assert.match(page, /index: false/);
});

test('Schedule confirmation has no re-booking CTA, calendar URL or qualification loop', () => {
  assert.match(schedule, /data-thanks-schedule/);
  assert.match(schedule, /¡Reunión confirmada!/);
  assert.match(schedule, /ya está reservada/);
  assert.match(schedule, /correo de confirmación/);
  assert.match(schedule, /Qué conviene tener a mano/);
  assert.match(schedule, /Volver al inicio/);
  assert.match(schedule, /href="\/"/);
  assert.doesNotMatch(schedule, BOOKING_LEAK);
  assert.doesNotMatch(schedule, /BookingLink|BOOKING_HREF|SERVICE_BOOKING_HREF|target="_blank"/);
  assert.doesNotMatch(schedule, /<form|fetch\(/);
});

test('Lead thank-you gates the booking CTA with thanksBookingAllowed', () => {
  assert.match(lead, /data-thanks-v2/);
  assert.match(lead, /thanksBookingAllowed/);
  assert.match(lead, /¡Recibimos tu caso!/);
  assert.match(lead, /id="condiciones"/);
  assert.match(lead, /BOOKING_FIT_CTA_LABEL/);
  assert.match(lead, /<BookingLink/);
  assert.match(lead, /href=\{SERVICE_BOOKING_HREF\}/);
  assert.match(lead, /target="_blank"/);
  assert.match(lead, /sesión es gratuita/);
  assert.match(lead, /showBooking/);
  assert.doesNotMatch(lead, /https:\/\/playfulagency\.com\/reunion-playful/);
  assert.doesNotMatch(lead, /href="https:\/\/api\.playfulagency\.com\/widget\/bookings\/reunion-playful"/);
  assert.doesNotMatch(lead, /<form|fetch\(/);
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

test('legacy /gracias-v2 301s to /gracias and keeps the query string', () => {
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /'\/gracias-v2':\s*'\/gracias'/);
  assert.match(middleware, /'\/gracias-v2'/);
  assert.match(middleware, /'\/gracias-v2\/'/);
  assert.match(middleware, /target\.search = request\.nextUrl\.search/);
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
    assert.match(code.slice(success, navigation), /data.simulated !== true && !previewSimulation/);
    assert.match(code, /contactThanksHref/);
    assert(code.slice(pending, success).includes('await pushGenerateLead') || code.includes('await pushGenerateLead'));
    assert(!code.slice(0, success).includes('window.location.assign(thanksHref)'));
    assert(!code.includes("window.location.assign('/gracias?conv=Lead')"));
  });
}
