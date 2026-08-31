import assert from 'node:assert/strict';
import test from 'node:test';
import {
  normalizeWebsiteLead,
  SubmissionValidationError,
} from '../../lib/contact/normalize.ts';

test('normalizes identity and bounds attribution to a relative landing', () => {
  const result = normalizeWebsiteLead({
    submissionId: '00000000-0000-4000-8000-000000000000',
    name: '  Ada Lovelace  ',
    email: ' ADA@EXAMPLE.COM ',
    phone: '+34 (911) 111-111',
    business: ' Analytical Engines ',
    message: ' Necesitamos una tienda. ',
    privacyConsent: true,
    marketingConsent: false,
    originalAttribution: {
      source: 'Google Ads',
      landing: 'https://evil.example/contacto?utm_source=google',
      formId: 'attacker-controlled',
    },
    recentAttribution: { source: '', landing: '/contacto' },
  }, new Date('2026-08-30T12:00:00.000Z'));

  assert.equal(result.email, 'ada@example.com');
  assert.equal(result.phone, '+34911111111');
  assert.equal(result.originalAttribution.source, 'google-ads');
  assert.equal(result.originalAttribution.landing, '/contacto?utm_source=google');
  assert.equal(result.originalAttribution.formId, 'website-contact');
  assert.equal(result.consentCapturedAt, '2026-08-30T12:00:00.000Z');
});

test('rejects a submission without explicit privacy consent', () => {
  assert.throws(() => normalizeWebsiteLead({
    submissionId: '00000000-0000-4000-8000-000000000000',
    name: 'Ada',
    email: 'ada@example.com',
    message: 'Hola',
    privacyConsent: false,
  }), SubmissionValidationError);
});

