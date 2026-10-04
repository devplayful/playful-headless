import type { ContactAttribution } from './contact/types.ts';
import { emptyAttribution } from './contact/attribution.ts';
import type { HighLevelCustomFieldValue, HighLevelGateway, UpsertContactInput } from './highlevel/client.ts';
import { HighLevelConfigurationError } from './highlevel/config.ts';
import {
  ESHOW_LISTA_DEFAULT_UTM,
  ESHOW_LISTA_FORM_ID,
  ESHOW_LISTA_SOURCE,
  ESHOW_MADRID_2026_CANONICAL,
} from './eshow-madrid-2026.ts';

export const ESHOW_LISTA_TAG_ENV = 'GHL_TAG_ESHOW_LISTA';
export const ESHOW_LISTA_ALLOWED_TAG = 'lista-sigue-eshow-2026';
export const ESHOW_LISTA_FORBIDDEN_TAGS = ['eshow-2026', 'website-inbound'] as const;

export const ESHOW_LISTA_ERRORS = {
  name: 'Escribe tu nombre para saber a quién escribimos.',
  email: 'Revisa el correo, parece que le falta algo.',
  consent: 'Marca la casilla para poder enviarte los resúmenes.',
} as const;

export type EshowListaField = keyof typeof ESHOW_LISTA_ERRORS;

export type EshowListaValidation =
  | { ok: true; name: string; email: string; consent: true }
  | { ok: false; errors: Partial<Record<EshowListaField, string>> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function text(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\u0000/g, '').slice(0, maxLength);
}

export function readEshowListaTag(env: Record<string, string | undefined> = process.env): string {
  return env[ESHOW_LISTA_TAG_ENV]?.trim() || '';
}

export function assertEshowListaTag(tag: string): string {
  const normalized = tag.trim();
  if (!normalized) return '';
  const lower = normalized.toLowerCase();
  if (
    ESHOW_LISTA_FORBIDDEN_TAGS.some((forbidden) => lower === forbidden)
    || lower.includes('website-inbound')
    || lower === 'eshow-2026'
  ) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LISTA_TAG_ENV} no puede ser «${normalized}»: dispara el pipeline de la feria o el inbound web.`,
    );
  }
  return normalized;
}

function readEshowListaToken(env: Record<string, string | undefined>): string {
  return env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN?.trim()
    || env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim()
    || '';
}

function readEshowListaLocationId(env: Record<string, string | undefined>): string {
  return env.HIGHLEVEL_LOCATION_ID?.trim() || env.GHL_LOCATION_ID?.trim() || '';
}

function readConsentFieldId(env: Record<string, string | undefined>): string {
  const raw = env.HIGHLEVEL_CUSTOM_FIELD_IDS_JSON?.trim();
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw) as { privacy_consent_at?: unknown };
    return typeof parsed.privacy_consent_at === 'string' ? parsed.privacy_consent_at.trim() : '';
  } catch {
    return '';
  }
}

export function buildEshowListaUpsertInput(input: {
  name: string;
  email: string;
  locationId: string;
  consentCapturedAt: string;
  consentFieldId?: string;
}): UpsertContactInput {
  const customFields: HighLevelCustomFieldValue[] = [];
  if (input.consentFieldId) {
    customFields.push({ id: input.consentFieldId, fieldValue: input.consentCapturedAt });
  }
  return {
    email: input.email,
    ...(input.name ? { name: input.name } : {}),
    locationId: input.locationId,
    createNewIfDuplicateAllowed: false,
    ...(customFields.length > 0 ? { customFields } : {}),
  };
}

export function validateEshowLista(input: {
  name?: unknown;
  email?: unknown;
  consent?: unknown;
}): EshowListaValidation {
  const name = text(input.name, 120);
  const email = text(input.email, 254).toLowerCase();
  const consent = input.consent === true || input.consent === 'true' || input.consent === 'on';
  const errors: Partial<Record<EshowListaField, string>> = {};
  if (!name) errors.name = ESHOW_LISTA_ERRORS.name;
  if (!email || !EMAIL_RE.test(email)) errors.email = ESHOW_LISTA_ERRORS.email;
  if (!consent) errors.consent = ESHOW_LISTA_ERRORS.consent;
  if (errors.name || errors.email || errors.consent) {
    return { ok: false, errors };
  }
  return { ok: true, name, email, consent: true };
}

export function eshowListaConfirmation(name: string): string {
  return `Ya estás en la lista, ${name}. Te acabamos de enviar un correo de bienvenida, y si no lo ves en unos minutos, mira en la carpeta de promociones o de spam. El 4 y el 5 de noviembre te llega el resumen de cada día.`;
}

export function withEshowListaAttribution(
  incoming?: Partial<ContactAttribution> | null,
): ContactAttribution {
  const base = emptyAttribution({
    ...incoming,
    captured: incoming?.captured !== false,
    formId: ESHOW_LISTA_FORM_ID,
  });
  const hasUtm = Boolean(base.utm_source || base.utm_medium || base.utm_campaign);
  return {
    ...base,
    source: ESHOW_LISTA_SOURCE,
    landing: ESHOW_MADRID_2026_CANONICAL,
    formId: ESHOW_LISTA_FORM_ID,
    utm_source: hasUtm && base.utm_source ? base.utm_source : ESHOW_LISTA_DEFAULT_UTM.utm_source,
    utm_medium: hasUtm && base.utm_medium ? base.utm_medium : ESHOW_LISTA_DEFAULT_UTM.utm_medium,
    utm_campaign: hasUtm && base.utm_campaign ? base.utm_campaign : ESHOW_LISTA_DEFAULT_UTM.utm_campaign,
  };
}

export type EshowListaSyncResult =
  | { wrote: false; reason: 'tag-unset' }
  | { wrote: true; contactId: string; isNew: boolean; tag: string };

export async function syncEshowListaToHighLevel(input: {
  name: string;
  email: string;
  originalAttribution: ContactAttribution;
  recentAttribution: ContactAttribution;
  consentCapturedAt: string;
  env?: Record<string, string | undefined>;
  gateway?: HighLevelGateway;
}): Promise<EshowListaSyncResult> {
  const env = input.env || process.env;
  const tag = assertEshowListaTag(readEshowListaTag(env));
  if (!tag) return { wrote: false, reason: 'tag-unset' };

  const locationId = readEshowListaLocationId(env);
  if (!locationId) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LISTA_TAG_ENV} está definida, pero falta HIGHLEVEL_LOCATION_ID o GHL_LOCATION_ID.`,
    );
  }

  const testMode = env.HIGHLEVEL_TEST_MODE === 'true';
  const token = readEshowListaToken(env);
  if (!testMode && !token && !input.gateway) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LISTA_TAG_ENV} está definida, pero falta HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN o GHL_PRIVATE_INTEGRATION_TOKEN.`,
    );
  }

  let gateway = input.gateway;
  if (!gateway) {
    const { DryRunHighLevelGateway, HighLevelApiClient } = await import('./highlevel/client.ts');
    gateway = testMode
      ? new DryRunHighLevelGateway()
      : new HighLevelApiClient(token, 8000);
  }

  const contact = await gateway.upsertContact(buildEshowListaUpsertInput({
    name: input.name,
    email: input.email,
    locationId,
    consentCapturedAt: input.consentCapturedAt,
    consentFieldId: readConsentFieldId(env),
  }));

  await gateway.addContactTags(contact.id, [tag]);

  return { wrote: true, contactId: contact.id, isNew: contact.isNew, tag };
}
