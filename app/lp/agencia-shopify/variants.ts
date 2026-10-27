export const LP_META_ANGLES = ['c1', 'c2', 'c3', 'c4', 'c5'] as const;
export const LP_META_MARKETS = ['es', 'latam', 've'] as const;

export type LpMetaAngle = (typeof LP_META_ANGLES)[number] | 'generic';
export type LpMetaMarket = (typeof LP_META_MARKETS)[number];

export const DEFAULT_LP_META_ANGLE: LpMetaAngle = 'generic';
export const DEFAULT_LP_META_MARKET: LpMetaMarket = 'es';

export function isLpMetaAngle(value: string): value is Exclude<LpMetaAngle, 'generic'> {
  return (LP_META_ANGLES as readonly string[]).includes(value);
}

export function isLpMetaMarket(value: string): value is LpMetaMarket {
  return (LP_META_MARKETS as readonly string[]).includes(value);
}

/** `mkt=es|latam|ve`. Default ES. No geo-IP. */
export function firstSearchParam(
  value: string | string[] | undefined | null,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value ?? undefined;
}

export function searchStringFromParams(
  params: Record<string, string | string[] | undefined> | undefined,
): string {
  const kept = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, raw]) => {
    const value = (firstSearchParam(raw) || '').trim();
    if (value) kept.set(key, value);
  });
  return kept.toString();
}

export function parseLpMetaMarket(raw: string | null | undefined): LpMetaMarket {
  const value = (raw || '').trim().toLowerCase();
  return isLpMetaMarket(value) ? value : DEFAULT_LP_META_MARKET;
}

/**
 * `ang=c1…c5`. If missing/invalid, generic.
 * Fallback: `utm_content` starting with `{angulo}_` (brief §3).
 */
export function parseLpMetaAngle(
  raw: string | null | undefined,
  utmContent?: string | null,
): LpMetaAngle {
  const direct = (raw || '').trim().toLowerCase();
  if (isLpMetaAngle(direct)) return direct;
  const fromUtm = (utmContent || '').trim().toLowerCase();
  const match = fromUtm.match(/^(c[1-5])_/);
  if (match && isLpMetaAngle(match[1])) return match[1];
  return DEFAULT_LP_META_ANGLE;
}

export function featuredCaseSlugForMarket(mkt: LpMetaMarket): string {
  if (mkt === 've') return 'soytechno-ecommerce-venezuela';
  if (mkt === 'latam') return 'jumex-shopify-dtc-ecommerce';
  return 'odwalla-shopify-dtc-ecommerce';
}

export function caseOrderForMarket(mkt: LpMetaMarket): readonly string[] {
  if (mkt === 've') {
    return [
      'soytechno-ecommerce-venezuela',
      'jumex-shopify-dtc-ecommerce',
      'odwalla-shopify-dtc-ecommerce',
    ];
  }
  if (mkt === 'latam') {
    return [
      'jumex-shopify-dtc-ecommerce',
      'odwalla-shopify-dtc-ecommerce',
      'soytechno-ecommerce-venezuela',
    ];
  }
  return [
    'odwalla-shopify-dtc-ecommerce',
    'jumex-shopify-dtc-ecommerce',
    'soytechno-ecommerce-venezuela',
  ];
}
