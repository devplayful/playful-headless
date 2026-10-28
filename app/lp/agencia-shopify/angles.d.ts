export const LP_META_ANGLE_TITLES: Record<string, { tag: string; note: string }>;
export const DEFAULT_LP_META_ANGLE: string;
export const LP_META_STATIC_ANGLES: readonly string[];
export const LP_META_ANG_QUERY_REDIRECTS: ReadonlyArray<{
  source: string;
  has: ReadonlyArray<{ type: string; key: string; value: string }>;
  destination: string;
  permanent: boolean;
}>;
export function generateStaticAngleParams(): Array<{ ang: string }>;
export function angQueryValues(ang: string): string[];
