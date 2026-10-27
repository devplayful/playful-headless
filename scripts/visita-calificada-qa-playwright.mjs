#!/usr/bin/env node
/**
 * QA preview: /lp/calentamiento?qa=1 + UA PlayfulQA/1.0.
 * Checks HTTP 200 and dataLayer visita_calificada (scroll+time and CTA click).
 * Serial, max 1 req/s. Does not call Meta (QA path).
 *
 * Usage:
 *   SEO_BASE_URL=https://<preview> node scripts/visita-calificada-qa-playwright.mjs
 */
import { chromium } from 'playwright';

const base = (process.env.SEO_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('SEO_BASE_URL is required');
  process.exit(1);
}

const QA_UA = 'PlayfulQA/1.0';
const share = process.env.VERCEL_SHARE || '';
const PATH = '/lp/calentamiento?qa=1';
const url = (() => {
  const next = new URL(`${base}${PATH}`);
  if (share) next.searchParams.set('_vercel_share', share);
  return next.toString();
})();

function visitaEvents(dataLayer) {
  return (dataLayer || []).filter((item) => item && item.event === 'visita_calificada');
}

async function readDataLayer(page) {
  return page.evaluate(() => (window.dataLayer || []).slice());
}

async function blockAssign(page) {
  await page.addInitScript(() => {
    window.dataLayer = window.dataLayer || [];
  });
}

const browser = await chromium.launch();
const results = { url, ua: QA_UA, load: null, scrollTime: null, ctaClick: null };

try {
  const context = await browser.newContext({ userAgent: QA_UA });
  const page = await context.newPage();
  await blockAssign(page);
  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const status = response?.status() ?? 0;
  await page.waitForSelector('[data-ads-warm-landing]', { timeout: 20_000 });
  await page.waitForSelector('a[href*="/reunion-playful"]', { timeout: 20_000 });
  await page.waitForTimeout(800);
  results.load = { status, ok: status === 200 };

  await page.evaluate(() => {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight || 0,
    );
    window.scrollTo(0, Math.ceil(height * 0.6));
  });
  await page.waitForTimeout(16_000);
  const afterScroll = visitaEvents(await readDataLayer(page));
  results.scrollTime = {
    count: afterScroll.length,
    event: afterScroll[0] || null,
    ok:
      afterScroll.length === 1 &&
      afterScroll[0].trigger === 'scroll_time' &&
      afterScroll[0].lp_slug === 'calentamiento' &&
      afterScroll[0].qa === true &&
      typeof afterScroll[0].event_id === 'string' &&
      String(afterScroll[0].event_id).startsWith('vc-'),
  };
  await context.close();

  await new Promise((resolve) => setTimeout(resolve, 1_100));

  const context2 = await browser.newContext({ userAgent: QA_UA });
  const page2 = await context2.newPage();
  await blockAssign(page2);
  const response2 = await page2.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  results.ctaClick = { loadStatus: response2?.status() ?? 0 };
  await page2.waitForSelector('a[href*="/reunion-playful"]', { timeout: 20_000 });
  await page2.waitForTimeout(800);
  const afterClick = visitaEvents(
    await page2.evaluate(() => {
      window.location.assign = () => {};
      window.location.replace = () => {};
      const anchor = document.querySelector('a[href*="/reunion-playful"]');
      if (!anchor) return window.dataLayer || [];
      anchor.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, view: window, button: 0 }),
      );
      return (window.dataLayer || []).slice();
    }),
  );
  results.ctaClick = {
    ...results.ctaClick,
    count: afterClick.length,
    event: afterClick[0] || null,
    ok:
      afterClick.length === 1 &&
      afterClick[0].trigger === 'cta_click' &&
      afterClick[0].lp_slug === 'calentamiento' &&
      afterClick[0].qa === true &&
      typeof afterClick[0].event_id === 'string' &&
      String(afterClick[0].event_id).startsWith('vc-'),
  };
  await context2.close();
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));

const ok = results.load?.ok && results.scrollTime?.ok && results.ctaClick?.ok;
if (!ok) process.exit(1);
