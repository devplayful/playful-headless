import {
  DEFAULT_LP_META_ANGLE as DEFAULT_ANGLE_FROM_DATA,
  generateStaticAngleParams,
  LP_META_STATIC_ANGLES as ANGLES_FROM_DATA,
} from './angles.js';

export { generateStaticAngleParams };

export const LP_META_STATIC_ANGLES = ANGLES_FROM_DATA;
export const DEFAULT_LP_META_ANGLE = DEFAULT_ANGLE_FROM_DATA;
export const LP_META_ANGLES = LP_META_STATIC_ANGLES.filter((ang) => ang !== DEFAULT_LP_META_ANGLE);

export const LP_META_MARKETS = ['es', 'latam', 've'] as const;

export type LpMetaAngle = string;
export type LpMetaMarket = (typeof LP_META_MARKETS)[number];

export const DEFAULT_LP_META_MARKET: LpMetaMarket = 'es';

export function isLpMetaAngle(value: string): boolean {
  return LP_META_ANGLES.includes(value);
}

export function isLpMetaStaticAngle(value: string): boolean {
  return LP_META_STATIC_ANGLES.includes(value);
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

function angleFromUtmContent(utmContent: string): string | undefined {
  const fromUtm = utmContent.trim().toLowerCase();
  const prefixes = LP_META_ANGLES.slice().sort((a, b) => b.length - a.length);
  for (const slug of prefixes) {
    if (fromUtm.startsWith(`${slug}_`)) return slug;
  }
  return undefined;
}

/**
 * `ang=<slug>` from the data file. If missing/invalid, generic.
 * Fallback: `utm_content` starting with `{slug}_` (brief §3).
 */
export function parseLpMetaAngle(
  raw: string | null | undefined,
  utmContent?: string | null,
): LpMetaAngle {
  const direct = (raw || '').trim().toLowerCase();
  if (isLpMetaAngle(direct)) return direct;
  const fromUtm = angleFromUtmContent(utmContent || '');
  if (fromUtm) return fromUtm;
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
