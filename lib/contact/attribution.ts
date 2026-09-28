import { CONTACT_FORM_ID, type ContactAttribution } from './types.ts';

export const ATTRIBUTION_COOKIE_FIRST = 'pa_attr_ft';
export const ATTRIBUTION_COOKIE_LAST = 'pa_attr_lt';
export const ATTRIBUTION_STORAGE_FIRST = 'playful:first-touch:v2';
export const ATTRIBUTION_STORAGE_LAST = 'playful:last-touch:v2';
export const ATTRIBUTION_TTL_SECONDS = 90 * 24 * 60 * 60;

export const DIRECT_SOURCE = 'direct';
export const MISSING_SOURCE = 'sin-dato';

const OWN_HOST_SUFFIXES = [
  'playfulagency.com',
  'vercel.app',
] as const;

export const CLICK_FIELDS = ['gclid', 'fbclid'] as const;
export const UTM_FIELDS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
] as const;

export const HIGHLEVEL_CLICK_FIELD_KEYS = {
  gclid: 'contact.gclid',
  fbclid: 'contact.fbclid',
  referrer: 'contact.referrer',
} as const;

/** Live location IDs read from GHL on 2026-09-28. `contact.gclid` did not exist yet. */
export const HIGHLEVEL_KNOWN_CLICK_FIELD_IDS = {
  fbclid: 'lOU45Vo8TtnjfU5AbrIC',
  referrer: 'Hk0iFSmfIEvHei4X2ot9',
} as const;

export interface VisitInput {
  pathname: string;
  search?: string;
  referrer?: string;
  host?: string;
}

export function emptyAttribution(overrides: Partial<ContactAttribution> = {}): ContactAttribution {
  return {
    captured: false,
    source: MISSING_SOURCE,
    landing: '/',
    formId: CONTACT_FORM_ID,
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    gclid: '',
    fbclid: '',
    referrer: '',
    ...overrides,
  };
}

export function isOwnHost(hostname: string, currentHost = ''): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '');
  if (!host) return false;
  const current = currentHost.trim().toLowerCase().replace(/:\d+$/, '');
  if (current && (host === current || host.endsWith(`.${current}`))) return true;
  return OWN_HOST_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export function externalReferrer(referrer: string | undefined, currentHost = ''): string {
  const raw = (referrer || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    if (isOwnHost(parsed.hostname, currentHost)) return '';
    return parsed.toString().slice(0, 500);
  } catch {
    return '';
  }
}

export function normalizeLandingPath(pathname: string, search = ''): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const query = search.startsWith('?') || search === '' ? search : `?${search}`;
  return `${path}${query}`.slice(0, 500) || '/';
}

function queryValue(params: URLSearchParams, key: string, maxLength: number): string {
  return (params.get(key) || '').trim().slice(0, maxLength);
}

export function hasCampaignSignals(touch: Pick<ContactAttribution, 'utm_source' | 'utm_medium' | 'utm_campaign' | 'utm_term' | 'utm_content' | 'gclid' | 'fbclid'>): boolean {
  return Boolean(
    touch.utm_source
    || touch.utm_medium
    || touch.utm_campaign
    || touch.utm_term
    || touch.utm_content
    || touch.gclid
    || touch.fbclid,
  );
}

export function resolveAttributionSource(touch: Pick<ContactAttribution, 'utm_source' | 'gclid' | 'fbclid' | 'referrer' | 'captured'>): string {
  const utm = touch.utm_source.trim().toLowerCase();
  if (utm) return slugSource(utm);
  if (touch.gclid.trim()) return 'google';
  if (touch.fbclid.trim()) return 'facebook';
  if (touch.referrer.trim()) {
    try {
      return slugSource(new URL(touch.referrer).hostname);
    } catch {
      return 'referral';
    }
  }
  return touch.captured ? DIRECT_SOURCE : MISSING_SOURCE;
}

export function slugSource(value: string): string {
  const source = value.trim().toLowerCase().replace(/[^a-z0-9._/-]/g, '-').replace(/-+/g, '-').slice(0, 100);
  return source;
}

export function parseVisitAttribution(input: VisitInput): ContactAttribution {
  const params = new URLSearchParams(
    (input.search || '').startsWith('?') ? (input.search || '').slice(1) : (input.search || ''),
  );
  const referrer = externalReferrer(input.referrer, input.host);
  const touch = emptyAttribution({
    captured: true,
    landing: normalizeLandingPath(input.pathname || '/', input.search || ''),
    referrer,
    utm_source: queryValue(params, 'utm_source', 160),
    utm_medium: queryValue(params, 'utm_medium', 160),
    utm_campaign: queryValue(params, 'utm_campaign', 160),
    utm_term: queryValue(params, 'utm_term', 160),
    utm_content: queryValue(params, 'utm_content', 160),
    gclid: queryValue(params, 'gclid', 200),
    fbclid: queryValue(params, 'fbclid', 200),
  });
  touch.source = resolveAttributionSource(touch);
  return touch;
}

export function mergeFirstTouch(
  existing: ContactAttribution | null | undefined,
  incoming: ContactAttribution,
): ContactAttribution {
  if (existing?.captured) return existing;
  return incoming.captured ? incoming : emptyAttribution({ ...incoming, captured: false, source: MISSING_SOURCE });
}

export function mergeLastTouch(
  existing: ContactAttribution | null | undefined,
  incoming: ContactAttribution,
): ContactAttribution {
  if (!incoming.captured) return existing?.captured ? existing : emptyAttribution();
  if (hasCampaignSignals(incoming)) return incoming;
  if (existing?.captured) return existing;
  return incoming;
}

export function serializeAttributionCookie(touch: ContactAttribution): string {
  return encodeURIComponent(JSON.stringify({
    captured: touch.captured,
    source: touch.source,
    landing: touch.landing,
    utm_source: touch.utm_source,
    utm_medium: touch.utm_medium,
    utm_campaign: touch.utm_campaign,
    utm_term: touch.utm_term,
    utm_content: touch.utm_content,
    gclid: touch.gclid,
    fbclid: touch.fbclid,
    referrer: touch.referrer,
  }));
}

export function deserializeAttributionCookie(value: string | undefined | null): ContactAttribution | null {
  if (!value) return null;
  try {
    let parsed: Partial<ContactAttribution>;
    try {
      parsed = JSON.parse(decodeURIComponent(value)) as Partial<ContactAttribution>;
    } catch {
      parsed = JSON.parse(value) as Partial<ContactAttribution>;
    }
    if (!parsed || typeof parsed !== 'object') return null;
    const touch = emptyAttribution({
      captured: parsed.captured === true,
      landing: typeof parsed.landing === 'string' && parsed.landing ? parsed.landing.slice(0, 500) : '/',
      utm_source: textField(parsed.utm_source, 160),
      utm_medium: textField(parsed.utm_medium, 160),
      utm_campaign: textField(parsed.utm_campaign, 160),
      utm_term: textField(parsed.utm_term, 160),
      utm_content: textField(parsed.utm_content, 160),
      gclid: textField(parsed.gclid, 200),
      fbclid: textField(parsed.fbclid, 200),
      referrer: textField(parsed.referrer, 500),
    });
    if (typeof parsed.source === 'string' && parsed.source.trim()) {
      touch.source = slugSource(parsed.source) || (touch.captured ? DIRECT_SOURCE : MISSING_SOURCE);
    } else {
      touch.source = resolveAttributionSource(touch);
    }
    return touch;
  } catch {
    return null;
  }
}

function textField(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function nextAttributionFromRequest(input: {
  pathname: string;
  search?: string;
  referrer?: string;
  host?: string;
  firstCookie?: string;
  lastCookie?: string;
}): { first: ContactAttribution; last: ContactAttribution } {
  const incoming = parseVisitAttribution(input);
  const existingFirst = deserializeAttributionCookie(input.firstCookie);
  const existingLast = deserializeAttributionCookie(input.lastCookie);
  return {
    first: mergeFirstTouch(existingFirst, incoming),
    last: mergeLastTouch(existingLast, incoming),
  };
}

export function shouldCaptureAttributionPath(pathname: string): boolean {
  return !pathname.startsWith('/api/')
    && !pathname.startsWith('/_next/')
    && pathname !== '/favicon.ico';
}

export function attributionCookieOptions() {
  return {
    path: '/',
    maxAge: ATTRIBUTION_TTL_SECONDS,
    sameSite: 'lax' as const,
    secure: true,
    httpOnly: false,
  };
}

export function toNativeAttributionSource(touch: ContactAttribution): {
  url: string;
  campaign?: string;
  utmSource?: string;
  utmMedium?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  medium?: string;
  gclid?: string;
  fbclid?: string;
} {
  const landing = touch.landing.startsWith('http')
    ? touch.landing
    : `https://playfulagency.com${touch.landing.startsWith('/') ? '' : '/'}${touch.landing}`;
  return {
    url: landing.slice(0, 500),
    ...(touch.utm_campaign ? { campaign: touch.utm_campaign } : {}),
    ...(touch.utm_source ? { utmSource: touch.utm_source } : {}),
    ...(touch.utm_medium ? { utmMedium: touch.utm_medium, medium: touch.utm_medium } : {}),
    ...(touch.utm_content ? { utmContent: touch.utm_content } : {}),
    ...(touch.utm_term ? { utmTerm: touch.utm_term } : {}),
    ...(touch.referrer ? { referrer: touch.referrer } : {}),
    ...(touch.gclid ? { gclid: touch.gclid } : {}),
    ...(touch.fbclid ? { fbclid: touch.fbclid } : {}),
  };
}

export function preferStoredAttribution(
  stored: ContactAttribution | null | undefined,
  submitted: ContactAttribution,
): ContactAttribution {
  if (stored?.captured) return stored;
  return submitted;
}
