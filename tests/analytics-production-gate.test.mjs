import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  isProductionVercelEnv,
  productionAnalyticsIds,
} = await import('../lib/analytics/production-tags.ts');

const IDS = {
  NEXT_PUBLIC_GTM_ID: 'GTM-MXHKJ4NW',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-WH76RQWSCT',
};

test('only VERCEL_ENV=production loads the live GA4 and GTM IDs', () => {
  assert.equal(isProductionVercelEnv({ VERCEL_ENV: 'production' }), true);
  assert.equal(isProductionVercelEnv({ VERCEL_ENV: 'preview' }), false);
  assert.equal(isProductionVercelEnv({ VERCEL_ENV: 'development' }), false);
  assert.equal(isProductionVercelEnv({}), false);

  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'production',
    ...IDS,
  }), { gtmId: 'GTM-MXHKJ4NW', gaId: 'G-WH76RQWSCT' });
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'preview',
    ...IDS,
  }), { gtmId: '', gaId: '' });
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'development',
    ...IDS,
  }), { gtmId: '', gaId: '' });
  assert.deepEqual(productionAnalyticsIds({
    ...IDS,
  }), { gtmId: '', gaId: '' });
});

test('layout and tag components stay server-gated so production HTML is unchanged', () => {
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');

  assert.match(layout, /productionAnalyticsIds/);
  assert.match(layout, /\{gtmId && <GoogleTagManager gtmId=\{gtmId\} \/>\}/);
  assert.match(layout, /\{gaId && <GoogleAnalytics gaId=\{gaId\} \/>\}/);
  assert.match(layout, /<CtaClickTracker \/>/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GTM_ID/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
  assert.doesNotMatch(layout, /isProductionAnalyticsHostname|useState|window\.location/);

  assert.match(ga, /googletagmanager\.com\/gtag\/js/);
  assert.match(gtm, /googletagmanager\.com\/gtm\.js/);
  assert.doesNotMatch(ga, /isProductionAnalyticsHostname|useState/);
  assert.doesNotMatch(gtm, /isProductionAnalyticsHostname|useState/);
});
