export const CONTACT_FORM_ID = 'website-contact';

export const ATTRIBUTION_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export type UtmField = (typeof ATTRIBUTION_FIELDS)[number];

export interface ContactAttribution {
  source: string;
  landing: string;
  formId: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
}

export interface WebsiteLead {
  submissionId: string;
  name: string;
  email: string;
  phone: string;
  business: string;
  message: string;
  privacyConsent: true;
  marketingConsent: boolean;
  consentCapturedAt: string;
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
}

export interface LeadProcessingResult {
  delivered: true;
  crmSynced: boolean;
  dryRun: boolean;
  replayed: boolean;
}

