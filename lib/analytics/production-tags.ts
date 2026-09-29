type Environment = Readonly<Record<string, string | undefined>>;

export const PRODUCTION_ANALYTICS_HOSTS = [
  'playfulagency.com',
  'www.playfulagency.com',
] as const;

export function isProductionVercelEnv(env: Environment = process.env): boolean {
  return env.VERCEL_ENV === 'production';
}

/**
 * Apex and www only. Preview hosts (playful-headless-*.vercel.app,
 * preview.playfulagency.com) and the production Vercel alias must not load tags.
 */
export function isProductionAnalyticsHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().split(':')[0].replace(/\.$/, '');
  return host === 'playfulagency.com' || host === 'www.playfulagency.com';
}

/**
 * Server layout uses VERCEL_ENV so Preview/staging builds omit the tags.
 * Client components also pass location.hostname so a production build served
 * on playful-headless.vercel.app still does not inject gtag/gtm.
 */
export function shouldLoadProductionAnalytics(input: {
  env?: Environment;
  hostname?: string | null;
} = {}): boolean {
  const env = input.env ?? process.env;
  if (!isProductionVercelEnv(env)) return false;
  if (input.hostname == null || input.hostname === '') return true;
  return isProductionAnalyticsHostname(input.hostname);
}

export function productionAnalyticsIds(env: Environment = process.env): {
  gtmId: string;
  gaId: string;
} {
  if (!shouldLoadProductionAnalytics({ env })) {
    return { gtmId: '', gaId: '' };
  }
  return {
    gtmId: env.NEXT_PUBLIC_GTM_ID?.trim() || '',
    gaId: env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || '',
  };
}
