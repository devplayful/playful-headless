import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
const lead = readFileSync(new URL('../app/gracias/LeadThankYou.tsx', import.meta.url), 'utf8');
const schedule = readFileSync(new URL('../app/gracias/ScheduleConfirmation.tsx', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const bookingAttribution = readFileSync(new URL('../utils/booking-attribution.ts', import.meta.url), 'utf8');
const booking = readFileSync(new URL('../utils/booking.ts', import.meta.url), 'utf8');
const tracker = readFileSync(new URL('../components/BookAppointmentTracker.tsx', import.meta.url), 'utf8');

const BOOKING_LEAK =
  /reunion-playful|widget\/bookings|calendly|agendar|solicitar una reuni[oó]n|comprobar si encajamos|Cumplo estas condiciones|#condiciones/i;

test('gracias branches on conv=Schedule and stays dynamic', () => {
  assert.match(page, /export const dynamic = 'force-dynamic'/);
  assert.match(page, /conv === 'Schedule'/);
  assert.match(page, /<ScheduleConfirmation \/>/);
  assert.match(page, /<LeadThankYou \/>/);
  assert.match(page, /BookAppointmentTracker/);
  assert.match(page, /index: false/);
  assert.doesNotMatch(page, /display: none|<form|fetch\(/);
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

test('Lead / default thank-you stays the current main copy and one /reunion-playful CTA', () => {
  assert.match(lead, /data-thanks-v2/);
  assert.match(lead, /¡Recibimos tu caso!/);
  assert.match(lead, /id="condiciones"/);
  assert.match(lead, /data-cta-section="gracias"/);
  assert.match(lead, /href="\/reunion-playful"/);
  assert.equal(lead.split('href="/reunion-playful"').length - 1, 1);
  assert.match(lead, /Cumplo estas condiciones: agendar sesión/);
  assert.match(lead, /puedes reservar una sesión/);
  assert.match(lead, /Agendar no implica ningún compromiso/);
  assert.match(lead, /sesión es gratuita/);
  assert(lead.indexOf('href="/reunion-playful"') < lead.indexOf('Una conversación para evaluar'));
  assert.doesNotMatch(lead, /api\.playfulagency\.com\/widget\/bookings/);
  assert.doesNotMatch(lead, /https:\/\/playfulagency\.com\/reunion-playful/);
  assert.doesNotMatch(lead, /BookingLink|BOOKING_FIT_CTA_LABEL|Comprobar si encajamos|Solicitar una reunión/);
  assert.doesNotMatch(lead, /<form|fetch\(/);
});

test('booking attribution, tracker and middleware 301 map stay the current main contracts', () => {
  assert.match(bookingAttribution, /export const SERVICE_BOOKING_HREF = '\/reunion-playful'/);
  assert.match(bookingAttribution, /status: 302/);
  assert.match(bookingAttribution, /gclid/);
  assert.match(bookingAttribution, /utm_source/);
  assert.match(booking, /from '\.\/booking-attribution\.ts'/);
  assert.match(tracker, /pushBookAppointmentOnce/);
  assert.match(tracker, /clearBookingIntent/);
  assert.doesNotMatch(middleware, /gracias-v2/);
  assert.match(middleware, /'\/reunion-playful'/);
  assert.match(middleware, /'\/reunion-playful\/'/);
  assert.doesNotMatch(page, /gracias-v2/);
});

for (const file of ['app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', 'components/ContactLeadForm.tsx']) {
  test(`${file}: navigate only within successful receipt branch, after generate_lead flush`, () => {
    const code = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const success = code.indexOf('else if (response.ok && data.success)');
    const navigation = code.indexOf("window.location.assign('/gracias?conv=Lead')");
    const pending = code.indexOf('if (response.status === 202 && data.pendingConfirmation === true)');
    assert(success > 0 && navigation > success);
    assert(pending >= 0 && pending < success);
    assert(code.slice(success, navigation).includes('resetConfirmedForm();'));
    assert(code.slice(success, navigation).includes('await pushGenerateLead'));
    assert(!code.slice(pending, success).includes("window.location.assign('/gracias?conv=Lead')"));
    assert(!code.slice(0, pending).includes("window.location.assign('/gracias?conv=Lead')"));
  });
}
