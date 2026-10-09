type Environment = Readonly<Record<string, string | undefined>>;

export function isProductionVercelEnv(env: Environment = process.env): boolean {
  return env.VERCEL_ENV === 'production';
}

/**
 * Server layout only. Preview and staging builds omit the IDs so gtag/GTM
 * never render. Production keeps the same env IDs as today.
 */
export function productionAnalyticsIds(env: Environment = process.env): {
  gtmId: string;
  gaId: string;
} {
  if (!isProductionVercelEnv(env)) {
    return { gtmId: '', gaId: '' };
  }
  return {
    gtmId: env.NEXT_PUBLIC_GTM_ID?.trim() || '',
    gaId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '',
  };
}
