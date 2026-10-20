#!/usr/bin/env node
/**
 * Playwright check: /reunion-playful emits GA4 collect page_view (G-WH76RQWSCT)
 * and no collect hit uses a URL as event name (en=).
 *
 * Usage (production analytics on a local/preview server):
 *   VERCEL_ENV=production NEXT_PUBLIC_GA_MEASUREMENT_ID=G-WH76RQWSCT \
 *     SEO_BASE_URL=http://127.0.0.1:3000 node scripts/reunion-playful-ga-playwright.mjs
 */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const GA_TID = 'G-WH76RQWSCT';
const base = (process.env.SEO_BASE_URL || process.env.PLAYWRIGHT_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  throw new Error('Set SEO_BASE_URL or PLAYWRIGHT_BASE_URL (e.g. https://your-preview.vercel.app)');
}

const collects = [];

function isCollectUrl(url) {
  return /google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/.test(url);
}

function isUrlLikeEventName(en) {
  if (!en) return false;
  if (/^https?:\/\//i.test(en)) return true;
  return en.includes('playfulagency.com') || en.includes('vercel.app');
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 (compatible; PlayfulGA/1.0)',
});
const page = await context.newPage();

page.on('request', (req) => {
  const url = req.url();
  if (!isCollectUrl(url)) return;
  const parsed = new URL(url);
  if (parsed.searchParams.get('tid') !== GA_TID) return;
  collects.push({
    url,
    en: parsed.searchParams.get('en') || '',
    at: new Date().toISOString(),
  });
});

await page.goto(`${base}/reunion-playful`, { waitUntil: 'networkidle', timeout: 45_000 });
await page.waitForTimeout(2_500);

await browser.close();

const pageViews = collects.filter((hit) => hit.en === 'page_view');
const urlEvents = collects.filter((hit) => isUrlLikeEventName(hit.en));

assert.ok(pageViews.length >= 1, `expected at least one page_view collect for tid=${GA_TID}; got: ${JSON.stringify(collects)}`);
assert.equal(urlEvents.length, 0, `URL-like event names: ${JSON.stringify(urlEvents)}`);

console.log(JSON.stringify({ ok: true, pageViewCollects: pageViews, totalCollects: collects.length }, null, 2));
