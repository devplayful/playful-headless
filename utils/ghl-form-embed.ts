/** UTM query keys forwarded from the landing URL into the GHL form iframe. */
export const GHL_FORM_UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type GhlFormUtmKey = (typeof GHL_FORM_UTM_KEYS)[number];

const UTM_MAX_LENGTH = 160;

function searchParamsFromInput(search: string): URLSearchParams {
  const raw = (search || '').startsWith('?') ? search.slice(1) : search || '';
  return new URLSearchParams(raw);
}

function trimUtm(value: string | null | undefined): string {
  if (!value) return '';
  return value.trim().replace(/\u0000/g, '').slice(0, UTM_MAX_LENGTH);
}

export function utmQueryFromSearch(search: string): Record<GhlFormUtmKey, string> {
  const params = searchParamsFromInput(search);
  const out: Partial<Record<GhlFormUtmKey, string>> = {};
  GHL_FORM_UTM_KEYS.forEach((key) => {
    const value = trimUtm(params.get(key));
    if (value) out[key] = value;
  });
  return out as Record<GhlFormUtmKey, string>;
}

export function buildGhlFormIframeSrc(baseSrc: string, search: string): string {
  const utm = utmQueryFromSearch(search);
  const hasUtm = GHL_FORM_UTM_KEYS.some((key) => Boolean(utm[key]));
  if (!hasUtm) return baseSrc;

  const url = new URL(baseSrc);
  GHL_FORM_UTM_KEYS.forEach((key) => {
    const value = utm[key];
    if (value) url.searchParams.set(key, value);
  });
  return url.toString();
}
