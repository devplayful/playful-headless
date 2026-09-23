import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/gracias/page.tsx', import.meta.url), 'utf8');
const lead = readFileSync(new URL('../app/gracias/LeadThankYou.tsx', import.meta.url), 'utf8');
const schedule = readFileSync(new URL('../app/gracias/ScheduleConfirmation.tsx', import.meta.url), 'utf8');

const BOOKING_LEAK = /reunion-playful|widget\/bookings|calendly|agendar|solicitar una reuni[oó]n|comprobar si encajamos|Cumplo estas condiciones|#condiciones/i;

test('gracias branches on conv=Schedule and stays dynamic', () => {
  assert.match(page, /export const dynamic = 'force-dynamic'/);
  assert.match(page, /conv === 'Schedule'/);
  assert.match(page, /<ScheduleConfirmation \/>/);
  assert.match(page, /<LeadThankYou \/>/);
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

test('Lead / default thank-you keeps qualification and one booking CTA via BookingLink', () => {
  assert.match(lead, /data-thanks-v2/);
  assert.match(lead, /¡Recibimos tu caso!/);
  assert.match(lead, /id="condiciones"/);
  assert.match(lead, /BOOKING_FIT_CTA_LABEL/);
  assert.match(lead, /<BookingLink/);
  assert.match(lead, /target="_blank"/);
  assert.match(lead, /sesión es gratuita/);
  assert.doesNotMatch(lead, /https:\/\/playfulagency\.com\/reunion-playful/);
  assert.doesNotMatch(lead, /href="https:\/\/api\.playfulagency\.com\/widget\/bookings\/reunion-playful"/);
  assert.doesNotMatch(lead, /<form|fetch\(/);
});

test('legacy /gracias-v2 301s to /gracias and keeps the query string', () => {
  const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
  assert.match(middleware, /'\/gracias-v2':\s*'\/gracias'/);
  assert.match(middleware, /'\/gracias-v2'/);
  assert.match(middleware, /'\/gracias-v2\/'/);
  assert.match(middleware, /target\.search = request\.nextUrl\.search/);
});

for (const file of ['app/contactar-agencia-de-marketing-digital/ContactPageClient.tsx', 'components/ContactLeadForm.tsx']) {
  test(`${file}: navigate only within successful receipt branch, not simulator or pending`, () => {
    const code = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
    const success = code.indexOf('else if (response.ok && data.success)');
    const navigation = code.indexOf("window.location.assign('/gracias?conv=Lead')");
    assert(success > 0 && navigation > success);
    assert(code.slice(success, navigation).includes('resetConfirmedForm();'));
    assert.match(code.slice(success, navigation), /data.simulated !== true && !previewSimulation/);
    assert(!code.slice(0, success).includes("window.location.assign('/gracias?conv=Lead')"));
  });
}
