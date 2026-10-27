#!/usr/bin/env node
/**
 * QA: /lp/agencia-shopify — 200, noindex, mkt/ang, query on CTA, screenshots.
 * Serial, max 1 req/s. UA PlayfulQA/1.0 + ?qa=1.
 *
 * Usage:
 *   SEO_BASE_URL=http://127.0.0.1:3010 node scripts/lp-meta-agencia-shopify-qa-playwright.mjs
 */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3010').replace(/\/$/, '');
const QA_UA = 'PlayfulQA/1.0';
const artifactDir =
  process.env.LP_META_ARTIFACT_DIR ||
  path.resolve('docs/qa-lp-agencia-shopify-20261027');
await mkdir(artifactDir, { recursive: true });

const CASES = [
  {
    id: 'default',
    path: '/lp/agencia-shopify?qa=1',
    expectAng: 'generic',
    expectMkt: 'es',
    expectTitle: 'titular genérico',
    shot: true,
  },
  {
    id: 'c3-latam',
    path: '/lp/agencia-shopify?ang=c3&mkt=latam&utm_source=facebook&fbclid=test&qa=1',
    expectAng: 'c3',
    expectMkt: 'latam',
    expectTitle: 'titular C3',
    expectQuery: ['ang=c3', 'mkt=latam', 'utm_source=facebook', 'fbclid=test', 'qa=1'],
    shot: true,
  },
  {
    id: 'invalid-ang',
    path: '/lp/agencia-shopify?ang=nope&mkt=xx&qa=1',
    expectAng: 'generic',
    expectMkt: 'es',
    expectTitle: 'titular genérico',
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const browser = await chromium.launch();
const results = [];

try {
  for (const item of CASES) {
    await sleep(1100);
    const context = await browser.newContext({ userAgent: QA_UA });
    const page = await context.newPage();
    const url = `${base}${item.path}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const status = response?.status() ?? 0;
    const robots =
      (await page.locator('meta[name="robots"]').getAttribute('content').catch(() => '')) || '';
    await page.waitForSelector('[data-lp-meta-shopify]', { timeout: 20_000 });
    await page.waitForTimeout(800);
    const mkt = await page.locator('[data-lp-meta-shopify]').getAttribute('data-lp-mkt');
    const ang = await page.locator('[data-lp-meta-shopify]').getAttribute('data-lp-ang');
    const h1 = (await page.locator('h1').first().innerText()) || '';
    const booking = page.locator('a[href*="/reunion-playful"]').first();
    await booking.waitFor({ state: 'attached', timeout: 15_000 });
    const href = (await booking.getAttribute('href')) || '';
    const queryOk = (item.expectQuery || []).every((part) => href.includes(part));

    if (item.shot) {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.screenshot({
        path: path.join(artifactDir, `${item.id}-390.png`),
        fullPage: true,
      });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.screenshot({
        path: path.join(artifactDir, `${item.id}-1440.png`),
        fullPage: true,
      });
    }

    results.push({
      id: item.id,
      url,
      status,
      robots,
      mkt,
      ang,
      h1,
      bookingHref: href,
      ok:
        status === 200 &&
        /noindex/i.test(robots) &&
        /nofollow/i.test(robots) &&
        mkt === item.expectMkt &&
        ang === item.expectAng &&
        h1.includes(item.expectTitle) &&
        href.includes('/reunion-playful') &&
        (item.expectQuery ? queryOk : true),
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((item) => !item.ok)) process.exit(1);
