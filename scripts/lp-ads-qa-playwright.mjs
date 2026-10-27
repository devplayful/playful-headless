#!/usr/bin/env node
/**
 * QA: LP ads landings — noindex, UTM on /reunion-playful href, screenshots.
 * Usage: SEO_BASE_URL=http://127.0.0.1:3000 node scripts/lp-ads-qa-playwright.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const base = (process.env.SEO_BASE_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const query =
  '?utm_source=google&utm_medium=cpc&utm_campaign=test&gclid=TEST&qa=1';
const routes = [
  { slug: 'calentamiento', path: '/lp/calentamiento' },
  { slug: 'integraciones-pasarela-erp', path: '/lp/integraciones-pasarela-erp' },
  { slug: 'propuesta-ecommerce', path: '/lp/propuesta-ecommerce' },
];

const artifactDir =
  process.env.LP_ADS_ARTIFACT_DIR ||
  '/opt/cursor/artifacts/lp-ads';
await mkdir(artifactDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const route of routes) {
  const url = `${base}${route.path}${query}`;
  const context = await browser.newContext();
  const page = await context.newPage();

  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
  const status = response?.status() ?? 0;

  const robotsMeta = await page
    .locator('meta[name="robots"]')
    .getAttribute('content')
    .catch(() => '');
  const noindexMeta = /noindex/i.test(robotsMeta || '');
  const nofollowMeta = /nofollow/i.test(robotsMeta || '');

  await page.waitForTimeout(500);
  const bookingLink = page.locator('a[href*="/reunion-playful"]').first();
  await bookingLink.waitFor({ state: 'attached', timeout: 15_000 });
  const href = await bookingLink.getAttribute('href');

  const utmOk =
    href &&
    href.includes('utm_source=google') &&
    href.includes('utm_medium=cpc') &&
    href.includes('utm_campaign=test') &&
    href.includes('gclid=TEST');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: path.join(artifactDir, `${route.slug}-mobile-390.png`), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: path.join(artifactDir, `${route.slug}-desktop-1280.png`), fullPage: true });

  results.push({
    path: route.path,
    url,
    status,
    robotsMeta,
    noindexMeta,
    nofollowMeta,
    bookingHref: href,
    utmOk,
  });
  await context.close();
}

await browser.close();
await writeFile(path.join(artifactDir, 'qa-results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));

const failed = results.filter((r) => r.status !== 200 || !r.noindexMeta || !r.nofollowMeta || !r.utmOk);
if (failed.length) process.exit(1);
