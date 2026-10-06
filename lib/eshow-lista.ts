import type { ContactAttribution } from './contact/types.ts';
import { emptyAttribution } from './contact/attribution.ts';
import type { HighLevelCustomFieldValue, HighLevelGateway, UpsertContactInput } from './highlevel/client.ts';
import { HighLevelConfigurationError } from './highlevel/config.ts';
import {
  ESHOW_LISTA_DEFAULT_UTM,
  ESHOW_LISTA_FORM_ID,
  ESHOW_LISTA_PRIVACY_URL,
  ESHOW_LISTA_SOURCE,
  ESHOW_MADRID_2026_CANONICAL,
} from './eshow-madrid-2026.ts';

export const ESHOW_LISTA_TAG_ENV = 'GHL_TAG_ESHOW_LISTA';
export const ESHOW_LISTA_ALLOWED_TAG = 'lista-sigue-eshow-2026';
export const ESHOW_LISTA_FORBIDDEN_TAGS = ['eshow-2026', 'website-inbound'] as const;

/**
 * IDs del contrato Email (playful-copy PR #158, PASOS-JOSE §3).
 * Consentimiento: los dos campos TEXT ya existen. No se usa nota.
 */
export const ESHOW_LISTA_FIELD_IDS = {
  fuente_original: '46rGGZIFjF6IjhFsgQkf',
  fuente_reciente: '22lwTrSD9NksHKfS05zG',
  landing_reciente: 'l4fC4ROH3LmUWOdF721y',
  id_de_formulario: 're4FCksKLMnVqJMhiYYA',
  consentimiento_privacidad: 'Fj462mI3xgCgSGRIOxYc',
  consentimiento_marketing: 'H0XhGufYmNDBO3ggoUtU',
  ft_utm_source: 'vC0iZbQSiAMpU9aaOkFB',
  ft_utm_medium: 'aGdYAMsLKSehSkvymdDk',
  ft_utm_campaign: 'rzGUFfbL10hogd0QypbJ',
  ft_utm_term: '6inc5Tp9JTlVjVIufwU2',
  ft_utm_content: 'ggVv3mETPZLobMZDSrKe',
  ft_gclid: 'UUrx9CFtgujwChypJtoj',
  lt_utm_source: 'vj5VmZZcstzQYSYl8GV6',
  lt_utm_medium: 'CQnP7a9wGzCUDoVTs1Gc',
  lt_utm_campaign: 'hBmTWQAiid25ddEk6ayn',
  lt_utm_term: 'w988J16BAs6AZg8cn9J8',
  lt_utm_content: 'k644EMzEfJSNGqCLQfAM',
  lt_gclid: 'qZpdsmmwFlbyfqsXOLMq',
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

export function readEshowListaToken(env: Record<string, string | undefined> = process.env): string {
  return env.HIGHLEVEL_PRIVATE_INTEGRATION_TOKEN?.trim()
    || env.GHL_PRIVATE_INTEGRATION_TOKEN?.trim()
    || '';
}

export function readEshowListaLocationId(env: Record<string, string | undefined> = process.env): string {
  return env.HIGHLEVEL_LOCATION_ID?.trim() || env.GHL_LOCATION_ID?.trim() || '';
}

export function eshowListaMarketingConsent(): string {
  return `Sí — ${ESHOW_LISTA_PRIVACY_URL}`;
}

export function formatMadridOffsetIso(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
    timeZoneName: 'longOffset',
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => (
    parts.find((part) => part.type === type)?.value || ''
  );
  const rawOffset = value('timeZoneName').replace(/^GMT/i, '').replace(/^UTC/i, '');
  let offset = rawOffset;
  if (/^[+-]\d$/.test(offset)) offset = `${offset[0]}0${offset.slice(1)}:00`;
  else if (/^[+-]\d{2}$/.test(offset)) offset = `${offset}:00`;
  else if (/^[+-]\d{4}$/.test(offset)) offset = `${offset.slice(0, 3)}:${offset.slice(3)}`;
  else if (!/^[+-]\d{2}:\d{2}$/.test(offset)) offset = '+02:00';
  return `${value('year')}-${value('month')}-${value('day')}T${value('hour')}:${value('minute')}:${value('second')}${offset}`;
}

export function buildEshowListaAlwaysFields(input: {
  recentAttribution: ContactAttribution;
  consentCapturedAt: string;
}): HighLevelCustomFieldValue[] {
  const fields: HighLevelCustomFieldValue[] = [
    { id: ESHOW_LISTA_FIELD_IDS.fuente_reciente, fieldValue: ESHOW_LISTA_SOURCE },
    { id: ESHOW_LISTA_FIELD_IDS.landing_reciente, fieldValue: ESHOW_MADRID_2026_CANONICAL },
    { id: ESHOW_LISTA_FIELD_IDS.id_de_formulario, fieldValue: ESHOW_LISTA_FORM_ID },
    { id: ESHOW_LISTA_FIELD_IDS.consentimiento_privacidad, fieldValue: input.consentCapturedAt },
    { id: ESHOW_LISTA_FIELD_IDS.consentimiento_marketing, fieldValue: eshowListaMarketingConsent() },
  ];
  pushUtmFields(fields, LAST_TOUCH_UTM_IDS, input.recentAttribution);
  return fields;
}

export function buildEshowListaFirstTouchFields(input: {
  originalAttribution: ContactAttribution;
  existing: Map<string, string>;
}): HighLevelCustomFieldValue[] {
  const fields: HighLevelCustomFieldValue[] = [];
  if (fieldIsEmpty(input.existing.get(ESHOW_LISTA_FIELD_IDS.fuente_original))) {
    fields.push({
      id: ESHOW_LISTA_FIELD_IDS.fuente_original,
      fieldValue: ESHOW_LISTA_SOURCE,
    });
  }
  pushUtmFields(fields, FIRST_TOUCH_UTM_IDS, input.originalAttribution, input.existing);
  return fields;
}

export function buildEshowListaUpsertInput(input: {
  name: string;
  email: string;
  locationId: string;
  customFields: HighLevelCustomFieldValue[];
  tag?: string;
}): UpsertContactInput {
  // El formulario solo pide nombre: firstName lleva el texto tal cual.
  // No enviamos `name` ni `lastName` y no partimos el nombre. Si se omite
  // lastName, GHL lo rellena con la última palabra de firstName.
  return {
    email: input.email,
    ...(input.name ? { firstName: input.name } : {}),
    locationId: input.locationId,
    createNewIfDuplicateAllowed: false,
    ...(input.customFields.length > 0 ? { customFields: input.customFields } : {}),
    ...(input.tag ? { tags: [input.tag] } : {}),
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

  const alwaysFields = buildEshowListaAlwaysFields({
    recentAttribution: input.recentAttribution,
    consentCapturedAt: input.consentCapturedAt,
  });

  const contact = await gateway.upsertContact(buildEshowListaUpsertInput({
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

  const firstTouchFields = buildEshowListaFirstTouchFields({
    originalAttribution: input.originalAttribution,
    existing: currentFields,
  });
  if (firstTouchFields.length > 0) {
    await gateway.updateContactCustomFields(contact.id, firstTouchFields);
  }

  await gateway.addContactTags(contact.id, [tag]);

  return { wrote: true, contactId: contact.id, isNew: contact.isNew, tag };
}
