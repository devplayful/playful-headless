import type { WebsiteLead } from '../../lib/contact/types.ts';
import type { EnabledHighLevelConfig, HighLevelCustomFieldIds } from '../../lib/highlevel/config.ts';

export const customFieldIds: HighLevelCustomFieldIds = {
  original_source: 'field-original-source',
  original_landing: 'field-original-landing',
  recent_source: 'field-recent-source',
  recent_landing: 'field-recent-landing',
  utm_source: 'field-utm-source',
  utm_medium: 'field-utm-medium',
  utm_campaign: 'field-utm-campaign',
  utm_term: 'field-utm-term',
  utm_content: 'field-utm-content',
  form_id: 'field-form-id',
  privacy_consent_at: 'field-privacy-consent-at',
  marketing_consent: 'field-marketing-consent',
};

export const config: EnabledHighLevelConfig = {
  enabled: true,
  testMode: true,
  token: '',
  locationId: 'location-test',
  pipelineId: 'pipeline-test',
  consultaStageId: 'stage-consulta-test',
  ownerId: 'owner-test',
  contactTag: 'website-inbound',
  slaHours: 24,
  timeoutMs: 8000,
  idempotencyTtlSeconds: 604800,
  redisRestUrl: 'https://redis.invalid',
  redisRestToken: 'redis-test-token',
  customFieldIds,
};

export const lead: WebsiteLead = {
  submissionId: '00000000-0000-4000-8000-000000000000',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '+34911111111',
  business: 'Analytical Engines',
  message: 'Necesitamos una tienda.',
  privacyConsent: true,
  marketingConsent: false,
  consentCapturedAt: '2026-08-30T12:00:00.000Z',
  originalAttribution: {
    source: 'google',
    landing: '/servicios?utm_source=google',
    formId: 'website-contact',
    utm_source: 'google',
    utm_medium: 'organic',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
  },
  recentAttribution: {
    source: 'linkedin',
    landing: '/contactar-agencia-de-marketing-digital?utm_source=linkedin',
    formId: 'website-contact',
    utm_source: 'linkedin',
    utm_medium: 'social',
    utm_campaign: 'agency',
    utm_term: '',
    utm_content: 'cta',
  },
};

