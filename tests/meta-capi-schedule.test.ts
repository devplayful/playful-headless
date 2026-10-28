import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  decideMetaCapiSchedule,
  hashedPiiFromBookingEc,
  hasAdsConsent,
  META_CAPI_EVENT_NAME,
  parseBookingEcCookie,
  sha256Hex,
} from '../lib/analytics/meta-capi-schedule.ts';
import { PLAYFUL_QA_UA } from '../lib/analytics/qa-traffic.ts';

const PIXEL = '853899051744740';
const TOKEN = 'EAAG-test-token';

function env(overrides: Record<string, string | undefined> = {}) {
  return {
    META_CAPI_ACCESS_TOKEN: TOKEN,
    NEXT_PUBLIC_META_PIXEL_ID: PIXEL,
    ...overrides,
  };
}

test('returns 503 and does not send when META_CAPI_ACCESS_TOKEN is missing', () => {
  const decision = decideMetaCapiSchedule({
    search: '?pa_booking_id=book-1',
    env: env({ META_CAPI_ACCESS_TOKEN: '' }),
  });
  assert.deepEqual(decision, {
    sent: false,
    status: 503,
    reason: 'missing_access_token',
  });
});

test('QA without test_event_code does not send, even with token', () => {
  const byQuery = decideMetaCapiSchedule({
    search: '?qa=1&pa_booking_id=book-1',
    env: env({ META_CAPI_TEST_EVENT_CODE: '' }),
  });
  assert.deepEqual(byQuery, {
    sent: false,
    status: 200,
    reason: 'qa_missing_test_event_code',
  });

  const byUa = decideMetaCapiSchedule({
    search: '?pa_booking_id=book-1',
    userAgent: PLAYFUL_QA_UA,
    env: env({ META_CAPI_TEST_EVENT_CODE: undefined }),
  });
  assert.equal(byUa.sent, false);
  if (!byUa.sent) assert.equal(byUa.reason, 'qa_missing_test_event_code');
});

test('QA with test_event_code sends Schedule and the test code', () => {
  const decision = decideMetaCapiSchedule({
    search: '?qa=1&pa_booking_id=book-99',
    cookies: { _fbp: 'fb.1.1.abc', _fbc: 'fb.1.1.xyz' },
    userAgent: 'Mozilla/5.0',
    eventTime: 1_700_000_000,
    env: env({ META_CAPI_TEST_EVENT_CODE: 'TEST12345' }),
  });
  assert.equal(decision.sent, true);
  if (!decision.sent) throw new Error('expected send');
  assert.equal(decision.payload.data[0].event_name, META_CAPI_EVENT_NAME);
  assert.equal(decision.payload.data[0].event_id, 'book-99');
  assert.equal(decision.payload.data[0].user_data.fbp, 'fb.1.1.abc');
  assert.equal(decision.payload.data[0].user_data.fbc, 'fb.1.1.xyz');
  assert.equal(decision.payload.test_event_code, 'TEST12345');
  assert.equal(decision.payload.access_token, TOKEN);
  assert.match(decision.endpoint, new RegExp(`${PIXEL}/events`));
});

test('event_id is pa_booking_id; missing id is 400 after token check', () => {
  const decision = decideMetaCapiSchedule({
    search: '',
    body: { pa_booking_id: 'ghl-abc' },
    env: env(),
  });
  assert.equal(decision.sent, true);
  if (!decision.sent) throw new Error('expected send');
  assert.equal(decision.payload.data[0].event_id, 'ghl-abc');

  const missing = decideMetaCapiSchedule({ search: '', env: env() });
  assert.deepEqual(missing, { sent: false, status: 400, reason: 'missing_event_id' });
});

test('does not send em/ph: repo has no ads consent mechanism', () => {
  assert.equal(hasAdsConsent({
    cookies: { pa_booking_ec: JSON.stringify({ email: 'Ada@Example.com', phone: '+34 611 00 00 00' }) },
  }), false);
  const hashed = hashedPiiFromBookingEc(
    JSON.stringify({ email: 'Ada@Example.com', phone: '+34 611 00 00 00' }),
    false,
  );
  assert.deepEqual(hashed, {});

  const decision = decideMetaCapiSchedule({
    search: '?pa_booking_id=book-pii',
    cookies: { pa_booking_ec: JSON.stringify({ email: 'Ada@Example.com', phone: '+34611000000' }) },
    env: env(),
  });
  assert.equal(decision.sent, true);
  if (!decision.sent) throw new Error('expected send');
  assert.equal(decision.payload.data[0].user_data.em, undefined);
  assert.equal(decision.payload.data[0].user_data.ph, undefined);
});

test('hashes email and phone from pa_booking_ec only when consent is true', () => {
  const raw = JSON.stringify({ email: 'Ada@Example.com', phone: '+34 611 00 00 00' });
  const parsed = parseBookingEcCookie(raw);
  assert.equal(parsed.email, 'Ada@Example.com');
  assert.equal(parsed.phone, '+34 611 00 00 00');
  const hashed = hashedPiiFromBookingEc(raw, true);
  assert.deepEqual(hashed.em, [sha256Hex('ada@example.com')]);
  assert.deepEqual(hashed.ph, [createHash('sha256').update('34611000000').digest('hex')]);
});

test('QA without token is still 503; token is checked first', () => {
  const decision = decideMetaCapiSchedule({
    search: '?qa=1&pa_booking_id=book-1',
    userAgent: PLAYFUL_QA_UA,
    env: env({ META_CAPI_ACCESS_TOKEN: '', META_CAPI_TEST_EVENT_CODE: 'TEST12345' }),
  });
  assert.deepEqual(decision, {
    sent: false,
    status: 503,
    reason: 'missing_access_token',
  });
});

test('route is the Vercel CAPI endpoint and does not invent a token', () => {
  const route = readFileSync(new URL('../app/api/meta/capi/schedule/route.ts', import.meta.url), 'utf8');
  assert.match(route, /decideMetaCapiSchedule/);
  assert.match(route, /postMetaCapiSchedule/);
  assert.doesNotMatch(route, /EAAG|META_CAPI_ACCESS_TOKEN\s*=/);
  const envExample = readFileSync(new URL('../.env.example', import.meta.url), 'utf8');
  assert.match(envExample, /META_CAPI_ACCESS_TOKEN=/);
  assert.match(envExample, /META_CAPI_TEST_EVENT_CODE=/);
});
