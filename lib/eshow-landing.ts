import type { ContactAttribution } from './contact/types.ts';
import { emptyAttribution } from './contact/attribution.ts';
import type { HighLevelCustomFieldValue, HighLevelGateway, UpsertContactInput } from './highlevel/client.ts';
import { HighLevelConfigurationError, readHighLevelConfig } from './highlevel/config.ts';
import { ESHOW_LANDING_FORM, ESHOW_LANDING_PRIVACY_URL } from './eshow-landing-copy.ts';
import {
  ESHOW_LISTA_FIELD_IDS,
  formatMadridOffsetIso,
  readEshowListaLocationId,
  readEshowListaToken,
  resolveEshowListaHighLevelAuth,
} from './eshow-lista.ts';

export const ESHOW_LANDING_PATH = '/eshow';
export const ESHOW_LANDING_CANONICAL = 'https://playfulagency.com/eshow';
export const ESHOW_LANDING_FORM_ID = 'eshow';
export const ESHOW_LANDING_SOURCE = 'eShow 2026 · suscripción';
export const ESHOW_LANDING_TAG_ENV = 'GHL_TAG_ESHOW';
export const ESHOW_LANDING_ALLOWED_TAG = 'eshow-quiere-noticias';
export const ESHOW_LANDING_FORBIDDEN_TAGS = [
  'eshow-2026',
  'website-inbound',
  'lista-sigue-eshow-2026',
] as const;

export const ESHOW_LANDING_DEFAULT_UTM = {
  utm_source: 'bio',
  utm_medium: 'landing',
  utm_campaign: 'eshow-2026',
} as const;

const FIRST_TOUCH_UTM_IDS = {
  utm_source: ESHOW_LISTA_FIELD_IDS.ft_utm_source,
  utm_medium: ESHOW_LISTA_FIELD_IDS.ft_utm_medium,
  utm_campaign: ESHOW_LISTA_FIELD_IDS.ft_utm_campaign,
  utm_term: ESHOW_LISTA_FIELD_IDS.ft_utm_term,
  utm_content: ESHOW_LISTA_FIELD_IDS.ft_utm_content,
  gclid: ESHOW_LISTA_FIELD_IDS.ft_gclid,
} as const;

const LAST_TOUCH_UTM_IDS = {
  utm_source: ESHOW_LISTA_FIELD_IDS.lt_utm_source,
  utm_medium: ESHOW_LISTA_FIELD_IDS.lt_utm_medium,
  utm_campaign: ESHOW_LISTA_FIELD_IDS.lt_utm_campaign,
  utm_term: ESHOW_LISTA_FIELD_IDS.lt_utm_term,
  utm_content: ESHOW_LISTA_FIELD_IDS.lt_utm_content,
  gclid: ESHOW_LISTA_FIELD_IDS.lt_gclid,
} as const;

const REQUIRED_UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'] as const;
const OPTIONAL_UTM_KEYS = ['utm_term', 'utm_content', 'gclid'] as const;

export type EshowLandingField = 'name' | 'email' | 'consent';

export type EshowLandingValidation =
  | { ok: true; name: string; email: string; consent: true }
  | { ok: false; errors: Partial<Record<EshowLandingField, string>> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\u0000/g, '').slice(0, maxLength);
}

function fieldIsEmpty(value: string | undefined): boolean {
  return !value || !value.trim();
}

function attributionValue(
  attribution: ContactAttribution,
  key: keyof typeof FIRST_TOUCH_UTM_IDS,
): string {
  return attribution[key]?.trim() || '';
}

function pushUtmFields(
  fields: HighLevelCustomFieldValue[],
  ids: typeof FIRST_TOUCH_UTM_IDS | typeof LAST_TOUCH_UTM_IDS,
  attribution: ContactAttribution,
  existing?: Map<string, string>,
): void {
  for (const key of REQUIRED_UTM_KEYS) {
    const id = ids[key];
    const value = attributionValue(attribution, key);
    if (!value) continue;
    if (existing && !fieldIsEmpty(existing.get(id))) continue;
    fields.push({ id, fieldValue: value });
  }
  for (const key of OPTIONAL_UTM_KEYS) {
    const id = ids[key];
    const value = attributionValue(attribution, key);
    if (!value) continue;
    if (existing && !fieldIsEmpty(existing.get(id))) continue;
    fields.push({ id, fieldValue: value });
  }
}

export function readEshowLandingTag(env: Record<string, string | undefined> = process.env): string {
  return env[ESHOW_LANDING_TAG_ENV]?.trim() || '';
}

export function assertEshowLandingTag(tag: string): string {
  const normalized = tag.trim();
  if (!normalized) return '';
  const lower = normalized.toLowerCase();
  if (
    ESHOW_LANDING_FORBIDDEN_TAGS.some((forbidden) => lower === forbidden)
    || lower.includes('website-inbound')
    || lower === 'eshow-2026'
  ) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LANDING_TAG_ENV} no puede ser «${normalized}»: dispara el pipeline de la feria o el inbound web.`,
    );
  }
  return normalized;
}

export { formatMadridOffsetIso, readEshowListaLocationId, readEshowListaToken, resolveEshowListaHighLevelAuth };

export function buildEshowLandingAlwaysFields(input: {
  recentAttribution: ContactAttribution;
  consentCapturedAt: string;
}): HighLevelCustomFieldValue[] {
  const fields: HighLevelCustomFieldValue[] = [
    { id: ESHOW_LISTA_FIELD_IDS.fuente_reciente, fieldValue: ESHOW_LANDING_SOURCE },
    { id: ESHOW_LISTA_FIELD_IDS.landing_reciente, fieldValue: ESHOW_LANDING_CANONICAL },
    { id: ESHOW_LISTA_FIELD_IDS.id_de_formulario, fieldValue: ESHOW_LANDING_FORM_ID },
    { id: ESHOW_LISTA_FIELD_IDS.consentimiento_privacidad, fieldValue: input.consentCapturedAt },
    {
      id: ESHOW_LISTA_FIELD_IDS.consentimiento_marketing,
      fieldValue: `Sí — ${ESHOW_LANDING_PRIVACY_URL}`,
    },
  ];
  pushUtmFields(fields, LAST_TOUCH_UTM_IDS, input.recentAttribution);
  return fields;
}

export function buildEshowLandingFirstTouchFields(input: {
  originalAttribution: ContactAttribution;
  existing: Map<string, string>;
}): HighLevelCustomFieldValue[] {
  const fields: HighLevelCustomFieldValue[] = [];
  if (fieldIsEmpty(input.existing.get(ESHOW_LISTA_FIELD_IDS.fuente_original))) {
    fields.push({
      id: ESHOW_LISTA_FIELD_IDS.fuente_original,
      fieldValue: ESHOW_LANDING_SOURCE,
    });
  }
  pushUtmFields(fields, FIRST_TOUCH_UTM_IDS, input.originalAttribution, input.existing);
  return fields;
}

export function buildEshowLandingUpsertInput(input: {
  name: string;
  email: string;
  locationId: string;
  customFields: HighLevelCustomFieldValue[];
  tag?: string;
}): UpsertContactInput {
  return {
    email: input.email,
    ...(input.name ? { firstName: input.name } : {}),
    locationId: input.locationId,
    createNewIfDuplicateAllowed: false,
    ...(input.customFields.length > 0 ? { customFields: input.customFields } : {}),
    ...(input.tag ? { tags: [input.tag] } : {}),
  };
}

export function validateEshowLanding(input: {
  name?: unknown;
  email?: unknown;
  consent?: unknown;
}): EshowLandingValidation {
  const name = text(input.name, 120);
  const email = text(input.email, 254).toLowerCase();
  const consent = input.consent === true || input.consent === 'true' || input.consent === 'on';
  const errors: Partial<Record<EshowLandingField, string>> = {};
  const nameMissing = !name;
  const consentMissing = !consent;
  const emailInvalid = !email || !EMAIL_RE.test(email);
  if (emailInvalid) {
    errors.email = ESHOW_LANDING_FORM.emailValidationError;
  }
  if (nameMissing || consentMissing || emailInvalid) {
    return { ok: false, errors };
  }
  return { ok: true, name, email, consent: true };
}

export function withEshowLandingAttribution(
  incoming?: Partial<ContactAttribution> | null,
): ContactAttribution {
  const base = emptyAttribution({
    ...incoming,
    captured: incoming?.captured !== false,
    formId: ESHOW_LANDING_FORM_ID,
  });
  const hasUtm = Boolean(base.utm_source || base.utm_medium || base.utm_campaign);
  return {
    ...base,
    source: ESHOW_LANDING_SOURCE,
    landing: ESHOW_LANDING_CANONICAL,
    formId: ESHOW_LANDING_FORM_ID,
    utm_source: hasUtm && base.utm_source ? base.utm_source : ESHOW_LANDING_DEFAULT_UTM.utm_source,
    utm_medium: hasUtm && base.utm_medium ? base.utm_medium : ESHOW_LANDING_DEFAULT_UTM.utm_medium,
    utm_campaign: hasUtm && base.utm_campaign ? base.utm_campaign : ESHOW_LANDING_DEFAULT_UTM.utm_campaign,
  };
}

export type EshowLandingSyncResult =
  | { wrote: false; reason: 'tag-unset' }
  | { wrote: true; contactId: string; isNew: boolean; tag: string };

export async function syncEshowLandingToHighLevel(input: {
  name: string;
  email: string;
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
  consentCapturedAt: string;
  env?: Record<string, string | undefined>;
  gateway?: HighLevelGateway;
}): Promise<EshowLandingSyncResult> {
  const env = input.env || process.env;
  const tag = assertEshowLandingTag(readEshowLandingTag(env));
  if (!tag) return { wrote: false, reason: 'tag-unset' };

  const { token, locationId, testMode, timeoutMs } = resolveEshowListaHighLevelAuth(env);
  if (!locationId) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LANDING_TAG_ENV} está definida, pero falta HIGHLEVEL_LOCATION_ID o GHL_LOCATION_ID.`,
    );
  }

  if (!testMode && !token && !input.gateway) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LANDING_TAG_ENV} está definida, pero falta HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN o GHL_PRIVATE_INTEGRATION_TOKEN.`,
    );
  }

  let gateway = input.gateway;
  if (!gateway) {
    const { DryRunHighLevelGateway, HighLevelApiClient } = await import('./highlevel/client.ts');
    gateway = testMode
      ? new DryRunHighLevelGateway()
      : new HighLevelApiClient(token, timeoutMs);
  }

  const alwaysFields = buildEshowLandingAlwaysFields({
    recentAttribution: input.recentAttribution,
    consentCapturedAt: input.consentCapturedAt,
  });

  const contact = await gateway.upsertContact(buildEshowLandingUpsertInput({
    name: input.name,
    email: input.email,
    locationId,
    customFields: alwaysFields,
  }));

  if (gateway.updateContactLastName) {
    await gateway.updateContactLastName(contact.id, null);
  }

  const currentFields = new Map<string, string>();
  for (const item of await gateway.getContactCustomFields(contact.id)) {
    if (item.id) currentFields.set(item.id, item.fieldValue);
  }

  const firstTouchFields = buildEshowLandingFirstTouchFields({
    originalAttribution: input.originalAttribution,
    existing: currentFields,
  });
  if (firstTouchFields.length > 0) {
    await gateway.updateContactCustomFields(contact.id, firstTouchFields);
  }

  await gateway.addContactTags(contact.id, [tag]);

  return { wrote: true, contactId: contact.id, isNew: contact.isNew, tag };
}
