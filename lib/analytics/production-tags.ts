type Environment = Readonly<Record<string, string | undefined>>;

/** Official Apollo website visitor tracker appId for playfulagency.com. */
export const APOLLO_WEBSITE_TRACKER_APP_ID = '6a8ffabdb6d80900200fcdf5';

export function isProductionVercelEnv(env: Environment = process.env): boolean {
  return env.VERCEL_ENV === 'production';
}

/**
 * Server layout only. Preview and staging builds omit the IDs so gtag/GTM
 * and the Apollo website tracker never render. Production keeps the same
 * env IDs as today plus the Apollo appId.
 */
export function productionAnalyticsIds(env: Environment = process.env): {
  gtmId: string;
  gaId: string;
  apolloAppId: string;
} {
  if (!isProductionVercelEnv(env)) {
    return { gtmId: '', gaId: '', apolloAppId: '' };
  }
  return {
    gtmId: env.NEXT_PUBLIC_GTM_ID?.trim() || '',
    gaId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '',
    apolloAppId: APOLLO_WEBSITE_TRACKER_APP_ID,
  };
}
