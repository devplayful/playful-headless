import type { ContactAttribution } from './contact/types.ts';
import { emptyAttribution } from './contact/attribution.ts';
import type { HighLevelCustomFieldValue, HighLevelGateway } from './highlevel/client.ts';
import {
  HighLevelConfigurationError,
  readHighLevelConfig,
  type EnabledHighLevelConfig,
} from './highlevel/config.ts';
import {
  ESHOW_LISTA_DEFAULT_UTM,
  ESHOW_LISTA_FORM_ID,
  ESHOW_LISTA_SOURCE,
  ESHOW_MADRID_2026_CANONICAL,
} from './eshow-madrid-2026.ts';

export const ESHOW_LISTA_TAG_ENV = 'GHL_TAG_ESHOW_LISTA';

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

function field(
  config: EnabledHighLevelConfig,
  key: 'original_source' | 'original_landing' | 'recent_source' | 'recent_landing' | 'form_id' | 'privacy_consent_at' | 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content',
  value: string,
): HighLevelCustomFieldValue {
  return { id: config.customFieldIds[key], fieldValue: value };
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
  const tag = readEshowListaTag(env);
  if (!tag) return { wrote: false, reason: 'tag-unset' };

  const config = readHighLevelConfig(env);
  if (!config.enabled) {
    throw new HighLevelConfigurationError(
      `${ESHOW_LISTA_TAG_ENV} está definida, pero HighLevel no está habilitado.`,
    );
  }

  let gateway = input.gateway;
  if (!gateway) {
    const { DryRunHighLevelGateway, HighLevelApiClient } = await import('./highlevel/client.ts');
    gateway = config.testMode
      ? new DryRunHighLevelGateway()
      : new HighLevelApiClient(config.token, config.timeoutMs);
  }

  const original = withEshowListaAttribution(input.originalAttribution);
  const recent = withEshowListaAttribution(input.recentAttribution);

  const contact = await gateway.upsertContact({
    name: input.name,
    email: input.email,
    locationId: config.locationId,
    assignedTo: config.ownerId,
    source: original.source,
    customFields: [
      field(config, 'recent_source', recent.source),
      field(config, 'recent_landing', recent.landing),
      field(config, 'form_id', ESHOW_LISTA_FORM_ID),
      field(config, 'privacy_consent_at', input.consentCapturedAt),
      field(config, 'utm_source', recent.utm_source),
      field(config, 'utm_medium', recent.utm_medium),
      field(config, 'utm_campaign', recent.utm_campaign),
      field(config, 'utm_term', recent.utm_term),
      field(config, 'utm_content', recent.utm_content),
    ],
    createNewIfDuplicateAllowed: false,
  });

  const currentFields = await gateway.getContactCustomFields(contact.id);
  const values = new Map(currentFields.map((item) => [item.id, item.fieldValue]));
  const missingOriginal = [
    field(config, 'original_source', original.source),
    field(config, 'original_landing', original.landing),
  ].filter((item) => item.fieldValue.trim() !== '' && !(values.get(item.id) || '').trim());
  if (missingOriginal.length > 0) {
    await gateway.updateContactCustomFields(contact.id, missingOriginal);
  }

  await gateway.addContactTags(contact.id, [tag]);

  return { wrote: true, contactId: contact.id, isNew: contact.isNew, tag };
}
