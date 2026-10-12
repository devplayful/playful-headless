import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  PRODUCTION_ANALYTICS_HOSTS,
  APOLLO_WEBSITE_TRACKER_APP_ID,
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
  assert.equal(APOLLO_WEBSITE_TRACKER_APP_ID, '6a8ffabdb6d80900200fcdf5');

  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'production',
    ...IDS,
    NEXT_PUBLIC_META_PIXEL_ID: '853899051744740',
  }), {
    gtmId: 'GTM-MXHKJ4NW',
    gaId: 'G-WH76RQWSCT',
    apolloAppId: '6a8ffabdb6d80900200fcdf5',
    metaPixelId: '853899051744740',
  });
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'preview',
    ...IDS,
  }), { gtmId: '', gaId: '', apolloAppId: '', metaPixelId: '' });
  assert.deepEqual(productionAnalyticsIds({
    VERCEL_ENV: 'development',
    ...IDS,
  }), { gtmId: '', gaId: '', apolloAppId: '', metaPixelId: '' });
  assert.deepEqual(productionAnalyticsIds({
    ...IDS,
  }), { gtmId: '', gaId: '', apolloAppId: '', metaPixelId: '' });
});

test('layout gates gtag/GTM and Apollo through productionAnalyticsIds', () => {
  const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');

  assert.match(layout, /productionAnalyticsIds/);
  assert.match(layout, /gtag-data-layer-stub/);
  assert.match(layout, /window\.gtag=gtag/);
  assert.match(layout, /\{gtmId && <GoogleTagManager gtmId=\{gtmId\} \/>\}/);
  assert.match(layout, /\{gaId && <GoogleAnalytics gaId=\{gaId\} \/>\}/);
  assert.match(layout, /\{metaPixelId && <MetaPixel pixelId=\{metaPixelId\} \/>\}/);
  assert.match(layout, /\{apolloAppId && <ApolloTracker appId=\{apolloAppId\} \/>\}/);
  assert.doesNotMatch(layout, /<Suspense/);
  assert.match(layout, /<CtaClickTracker \/>/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GTM_ID/);
  assert.doesNotMatch(layout, /process\.env\.NEXT_PUBLIC_GA_MEASUREMENT_ID/);
});

test('client tags wait for apex/www hostname before injecting gtag.js or gtm.js', () => {
  const ga = readFileSync(new URL('../components/GoogleAnalytics.tsx', import.meta.url), 'utf8');
  const gtm = readFileSync(new URL('../components/GoogleTagManager.tsx', import.meta.url), 'utf8');
  const apollo = readFileSync(new URL('../components/ApolloTracker.tsx', import.meta.url), 'utf8');
  const meta = readFileSync(new URL('../components/MetaPixel.tsx', import.meta.url), 'utf8');
  assert.match(ga, /isProductionAnalyticsHostname\(window\.location\.hostname\)/);
  assert.match(gtm, /isProductionAnalyticsHostname\(window\.location\.hostname\)/);
  assert.match(meta, /isProductionAnalyticsHostname\(window\.location\.hostname\)/);
  assert.match(ga, /if \(!gaId \|\| !allowed\) return null/);
  assert.match(gtm, /if \(!gtmId \|\| !allowed\) return null/);
  assert.match(ga, /googletagmanager\.com\/gtag\/js/);
  assert.match(ga, /strategy="afterInteractive"/);
  assert.doesNotMatch(ga, /function gtag\(\)/);
  assert.match(gtm, /googletagmanager\.com\/gtm\.js/);
  assert.match(gtm, /strategy="afterInteractive"/);
  assert.doesNotMatch(gtm, /lazyOnload/);
  assert.match(meta, /strategy="afterInteractive"/);
  assert.doesNotMatch(meta, /lazyOnload/);
  assert.match(meta, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(apollo, /id="apollo-tracker"/);
  assert.match(apollo, /strategy="afterInteractive"/);
  assert.match(apollo, /assets\.apollo\.io\/micro\/website-tracker\/tracker\.iife\.js/);
  assert.match(apollo, /window\.trackingFunctions\.onLoad\(\{appId:"\$\{appId\}"\}\)/);
});
