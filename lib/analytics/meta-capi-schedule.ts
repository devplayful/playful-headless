import { createHash } from 'node:crypto';
import { isQaTraffic } from './qa-traffic.ts';

export const META_CAPI_TOKEN_ENV = 'META_CAPI_ACCESS_TOKEN';
export const META_CAPI_TEST_EVENT_ENV = 'META_CAPI_TEST_EVENT_CODE';
export const META_PIXEL_ENV = 'META_PIXEL_ID';
export const META_PIXEL_PUBLIC_ENV = 'NEXT_PUBLIC_META_PIXEL_ID';
export const PA_BOOKING_EC_COOKIE = 'pa_booking_ec';
export const PA_BOOKING_ID_PARAM = 'pa_booking_id';
export const META_CAPI_GRAPH_VERSION = 'v21.0';
export const META_CAPI_EVENT_NAME = 'Schedule';
export const META_CAPI_DEFAULT_SOURCE_URL = 'https://playfulagency.com/gracias?conv=Schedule';

export type MetaCapiSkipReason =
  | 'missing_access_token'
  | 'missing_pixel_id'
  | 'missing_event_id'
  | 'qa_missing_test_event_code';

export type MetaCapiUserData = {
  fbp?: string;
  fbc?: string;
  em?: string[];
  ph?: string[];
  client_ip_address?: string;
  client_user_agent?: string;
};

export type MetaCapiEvent = {
  event_name: typeof META_CAPI_EVENT_NAME;
  event_time: number;
  event_id: string;
  action_source: 'website';
  event_source_url: string;
  user_data: MetaCapiUserData;
};

export type MetaCapiPayload = {
  data: MetaCapiEvent[];
  access_token: string;
  test_event_code?: string;
};

export type MetaCapiScheduleInput = {
  search?: string;
  body?: Record<string, unknown> | null;
  cookies?: Record<string, string | undefined>;
  userAgent?: string;
  clientIp?: string;
  eventSourceUrl?: string;
  eventTime?: number;
  env?: Readonly<Record<string, string | undefined>>;
};

export type MetaCapiScheduleDecision =
  | { sent: false; status: 503; reason: 'missing_access_token' | 'missing_pixel_id' }
  | { sent: false; status: 400; reason: 'missing_event_id' }
  | { sent: false; status: 200; reason: 'qa_missing_test_event_code' }
  | {
    sent: true;
    status: 200;
    reason: 'ready';
    pixelId: string;
    endpoint: string;
    payload: MetaCapiPayload;
  };

function trimText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const trimmed = trimText(value);
    if (trimmed) return trimmed;
  }
  return '';
}

function searchParams(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

function envValue(env: Readonly<Record<string, string | undefined>>, key: string): string {
  return env[key]?.trim() || '';
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export function normalizeEmailForHash(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizePhoneForHash(value: string): string {
  const digits = value.replace(/\D+/g, '');
  return digits;
}

/**
 * No CMP, Cookiebot, consent-mode or ads-storage gate exists in this repo.
 * Form-level privacy checkboxes are not a site-wide ads consent signal.
 * Until one exists, CAPI must not send em/ph.
 */
export function hasAdsConsent(_input?: {
  cookies?: Record<string, string | undefined>;
  body?: Record<string, unknown> | null;
}): boolean {
  return false;
}

export function parseBookingEcCookie(raw: string | undefined): { email: string; phone: string } {
  if (!raw) return { email: '', phone: '' };
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }
  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    if (parsed && typeof parsed === 'object') {
      return {
        email: firstText(parsed.email, parsed.em, parsed.e),
        phone: firstText(parsed.phone, parsed.ph, parsed.p, parsed.tel),
      };
    }
  } catch {
    // Fall through to query-string style.
  }
  const params = new URLSearchParams(decoded);
  return {
    email: firstText(params.get('email'), params.get('em')),
    phone: firstText(params.get('phone'), params.get('ph')),
  };
}

export function hashedPiiFromBookingEc(
  raw: string | undefined,
  consent: boolean,
): Pick<MetaCapiUserData, 'em' | 'ph'> {
  if (!consent) return {};
  const { email, phone } = parseBookingEcCookie(raw);
  const out: Pick<MetaCapiUserData, 'em' | 'ph'> = {};
  const normalizedEmail = normalizeEmailForHash(email);
  const normalizedPhone = normalizePhoneForHash(phone);
  if (normalizedEmail && normalizedEmail.includes('@')) {
    out.em = [sha256Hex(normalizedEmail)];
  }
  if (normalizedPhone) {
    out.ph = [sha256Hex(normalizedPhone)];
  }
  return out;
}

export function readMetaCapiToken(env: Readonly<Record<string, string | undefined>> = process.env): string {
  return envValue(env, META_CAPI_TOKEN_ENV);
}

export function readMetaPixelId(env: Readonly<Record<string, string | undefined>> = process.env): string {
  return envValue(env, META_PIXEL_ENV) || envValue(env, META_PIXEL_PUBLIC_ENV);
}

export function readMetaCapiTestEventCode(
  env: Readonly<Record<string, string | undefined>> = process.env,
): string {
  return envValue(env, META_CAPI_TEST_EVENT_ENV);
}

export function metaCapiEventsUrl(pixelId: string): string {
  return `https://graph.facebook.com/${META_CAPI_GRAPH_VERSION}/${encodeURIComponent(pixelId)}/events`;
}

export function resolveScheduleEventId(input: {
  search?: string;
  body?: Record<string, unknown> | null;
  cookies?: Record<string, string | undefined>;
}): string {
  const params = searchParams(input.search || '');
  const body = input.body && typeof input.body === 'object' ? input.body : {};
  const appointment = body.appointment && typeof body.appointment === 'object'
    ? body.appointment as Record<string, unknown>
    : {};
  return firstText(
    params.get(PA_BOOKING_ID_PARAM),
    body[PA_BOOKING_ID_PARAM],
    body.event_id,
    body.eventId,
    appointment.id,
    body.appointmentId,
    input.cookies?.[PA_BOOKING_ID_PARAM],
  );
}

export function resolveMetaClickIds(input: {
  search?: string;
  body?: Record<string, unknown> | null;
  cookies?: Record<string, string | undefined>;
}): { fbp: string; fbc: string } {
  const params = searchParams(input.search || '');
  const body = input.body && typeof input.body === 'object' ? input.body : {};
  const fbp = firstText(body.fbp, input.cookies?._fbp, params.get('fbp'));
  const fbc = firstText(body.fbc, input.cookies?._fbc, params.get('fbc'));
  return { fbp, fbc };
}

export function decideMetaCapiSchedule(input: MetaCapiScheduleInput): MetaCapiScheduleDecision {
  const env = input.env ?? process.env;
  const token = readMetaCapiToken(env);
  if (!token) {
    return { sent: false, status: 503, reason: 'missing_access_token' };
  }

  const pixelId = readMetaPixelId(env);
  if (!pixelId) {
    return { sent: false, status: 503, reason: 'missing_pixel_id' };
  }

  const qa = isQaTraffic({
    search: input.search || '',
    userAgent: input.userAgent || '',
  });
  const testEventCode = readMetaCapiTestEventCode(env);
  if (qa && !testEventCode) {
    return { sent: false, status: 200, reason: 'qa_missing_test_event_code' };
  }

  const eventId = resolveScheduleEventId(input);
  if (!eventId) {
    return { sent: false, status: 400, reason: 'missing_event_id' };
  }

  const { fbp, fbc } = resolveMetaClickIds(input);
  const consent = hasAdsConsent({ cookies: input.cookies, body: input.body });
  const pii = hashedPiiFromBookingEc(input.cookies?.[PA_BOOKING_EC_COOKIE], consent);
  const userData: MetaCapiUserData = {
    ...pii,
    ...(fbp ? { fbp } : {}),
    ...(fbc ? { fbc } : {}),
    ...(trimText(input.clientIp) ? { client_ip_address: trimText(input.clientIp) } : {}),
    ...(trimText(input.userAgent) ? { client_user_agent: trimText(input.userAgent) } : {}),
  };

  const payload: MetaCapiPayload = {
    data: [{
      event_name: META_CAPI_EVENT_NAME,
      event_time: input.eventTime ?? Math.floor(Date.now() / 1000),
      event_id: eventId,
      action_source: 'website',
      event_source_url: firstText(input.eventSourceUrl, input.body?.event_source_url) || META_CAPI_DEFAULT_SOURCE_URL,
      user_data: userData,
    }],
    access_token: token,
  };
  if (qa && testEventCode) {
    payload.test_event_code = testEventCode;
  }

  return {
    sent: true,
    status: 200,
    reason: 'ready',
    pixelId,
    endpoint: metaCapiEventsUrl(pixelId),
    payload,
  };
}

export async function postMetaCapiSchedule(
  decision: Extract<MetaCapiScheduleDecision, { sent: true }>,
  fetchFn: typeof fetch = fetch,
): Promise<{ ok: boolean; status: number; eventsReceived?: number }> {
  const response = await fetchFn(decision.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(decision.payload),
  });
  let eventsReceived: number | undefined;
  try {
    const json = await response.json() as { events_received?: number };
    if (typeof json.events_received === 'number') eventsReceived = json.events_received;
  } catch {
    // Meta error bodies are not forwarded to the client.
  }
  return { ok: response.ok, status: response.status, eventsReceived };
}
