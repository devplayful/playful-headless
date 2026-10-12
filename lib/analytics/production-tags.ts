type Environment = Readonly<Record<string, string | undefined>>;

export const PRODUCTION_ANALYTICS_HOSTS = [
  'playfulagency.com',
  'www.playfulagency.com',
] as const;

/** Official Apollo website visitor tracker appId for playfulagency.com. */
export const APOLLO_WEBSITE_TRACKER_APP_ID = '6a8ffabdb6d80900200fcdf5';

export function isProductionVercelEnv(env: Environment = process.env): boolean {
  return env.VERCEL_ENV === 'production';
}

/**
 * Apex and www only. Staging client leftovers still call this so a production
 * build served on *.vercel.app does not inject tags. The layout gate is
 * VERCEL_ENV only (main after #203).
 */
export function isProductionAnalyticsHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().split(':')[0].replace(/\.$/, '');
  return host === 'playfulagency.com' || host === 'www.playfulagency.com';
}

export function shouldLoadProductionAnalytics(input: {
  env?: Environment;
  hostname?: string | null;
} = {}): boolean {
  const env = input.env ?? process.env;
  if (!isProductionVercelEnv(env)) return false;
  if (input.hostname == null || input.hostname === '') return true;
  return isProductionAnalyticsHostname(input.hostname);
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
  metaPixelId: string;
} {
  if (!isProductionVercelEnv(env)) {
    return { gtmId: '', gaId: '', apolloAppId: '', metaPixelId: '' };
  }
  return {
    gtmId: env.NEXT_PUBLIC_GTM_ID?.trim() || '',
    gaId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '',
    apolloAppId: APOLLO_WEBSITE_TRACKER_APP_ID,
    metaPixelId: env.NEXT_PUBLIC_META_PIXEL_ID?.trim() || '',
  };
}
