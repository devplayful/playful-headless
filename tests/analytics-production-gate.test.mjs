import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  PRODUCTION_ANALYTICS_HOSTS,
  isProductionVercelEnv,
  isProductionAnalyticsHostname,
  shouldLoadProductionAnalytics,
  productionAnalyticsIds,
} = await import('../lib/analytics/production-tags.ts');

const IDS = {
  NEXT_PUBLIC_GTM_ID: 'GTM-MXHKJ4NW',
  NEXT_PUBLIC_GA_MEASUREMENT_ID: 'G-WH76RQWSCT',
};

test('production hosts are only apex and www', () => {
  assert.deepEqual([...PRODUCTION_ANALYTICS_HOSTS], [
    'playfulagency.com',
    'www.playfulagency.com',
  ]);
  assert.equal(isProductionAnalyticsHostname('playfulagency.com'), true);
  assert.equal(isProductionAnalyticsHostname('www.playfulagency.com'), true);
  assert.equal(isProductionAnalyticsHostname('PLAYFULAGENCY.COM:443'), true);
});

test('preview, staging alias and Vercel hosts never count as production', () => {
  for (const host of [
    'playful-headless.vercel.app',
    'playful-headless-abc123.vercel.app',
    'preview.playfulagency.com',
    'staging.playfulagency.com',
    'localhost',
    '127.0.0.1',
  ]) {
    assert.equal(isProductionAnalyticsHostname(host), false, host);
  }
});

test('VERCEL_ENV production plus hostname is required to load tags', () => {
  assert.equal(isProductionVercelEnv({ VERCEL_ENV: 'production' }), true);
  assert.equal(isProductionVercelEnv({ VERCEL_ENV: 'preview' }), false);
  assert.equal(isProductionVercelEnv({ VERCEL_ENV: 'development' }), false);

  assert.equal(shouldLoadProductionAnalytics({
    env: { VERCEL_ENV: 'production', ...IDS },
  }), true);
  assert.equal(shouldLoadProductionAnalytics({
    env: { VERCEL_ENV: 'production', ...IDS },
    hostname: 'playfulagency.com',
  }), true);
  assert.equal(shouldLoadProductionAnalytics({
    env: { VERCEL_ENV: 'production', ...IDS },
    hostname: 'playful-headless.vercel.app',
  }), false);
  assert.equal(shouldLoadProductionAnalytics({
    env: { VERCEL_ENV: 'preview', ...IDS },
    hostname: 'playfulagency.com',
  }), false);
  assert.equal(shouldLoadProductionAnalytics({
    env: { VERCEL_ENV: 'preview', ...IDS },
    hostname: 'preview.playfulagency.com',
  }), false);
});

test('layout IDs are empty outside a production Vercel build', () => {
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'preview',
    ...IDS,
  }), { gtmId: '', gaId: '' });
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'development',
    ...IDS,
  }), { gtmId: '', gaId: '' });
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'production',
    ...IDS,
  }), { gtmId: 'GTM-MXHKJ4NW', gaId: 'G-WH76RQWSCT' });
});

test('layout gates gtag/GTM through productionAnalyticsIds', () => {
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
  assert.match(layout, /productionAnalyticsIds/);
  assert.match(layout, /\{gtmId && <GoogleTagManager gtmId=\{gtmId\} \/>\}/);
  assert.match(layout, /\{gaId && <GoogleAnalytics gaId=\{gaId\} \/>\}/);
  assert.match(layout, /<CtaClickTracker \/>/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GTM_ID/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
});

test('client tags wait for apex/www hostname before injecting gtag.js or gtm.js', () => {
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
  assert.match(ga, /isProductionAnalyticsHostname\(window\.location\.hostname\)/);
  assert.match(gtm, /isProductionAnalyticsHostname\(window\.location\.hostname\)/);
  assert.match(ga, /if \(!gaId \|\| !allowed\) return null/);
  assert.match(gtm, /if \(!gtmId \|\| !allowed\) return null/);
  assert.match(ga, /googletagmanager\.com\/gtag\/js/);
  assert.match(gtm, /googletagmanager\.com\/gtm\.js/);
});
