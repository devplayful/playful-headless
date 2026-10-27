#!/usr/bin/env node
/**
 * QA: /lp/agencia-shopify — 200, noindex, mkt/ang, query on sticky CTA, screenshots.
 * Also checks BookingQueryPropagator on / and /reunion-playful.
 * Serial, max 1 req/s. UA PlayfulQA/1.0 + ?qa=1.
 *
 * Usage:
 *   SEO_BASE_URL=http://127.0.0.1:3010 node scripts/lp-meta-agencia-shopify-qa-playwright.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
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
    expectQuery: ['qa=1'],
    shot: true,
  },
  {
    id: 'c3-latam',
    path: '/lp/agencia-shopify?ang=c3&mkt=latam&utm_source=facebook&fbclid=test&qa=1',
    expectAng: 'c3',
    expectMkt: 'latam',
    expectTitle: 'titular genérico',
    expectAngleCopy: 'titular C3',
    expectQuery: ['ang=c3', 'mkt=latam', 'utm_source=facebook', 'fbclid=test', 'qa=1'],
    shot: true,
  },
  {
    id: 'invalid-ang',
    path: '/lp/agencia-shopify?ang=nope&mkt=xx&qa=1',
    expectAng: 'generic',
    expectMkt: 'es',
    expectTitle: 'titular genérico',
    expectQuery: ['ang=nope', 'mkt=xx', 'qa=1'],
  },
];

const PROPAGATOR_CASES = [
  {
    id: 'home-propagator',
    path: '/?utm_source=facebook&fbclid=test&mkt=latam&ang=c3&qa=1',
  },
  {
    id: 'reunion-propagator',
    path: '/reunion-playful?utm_source=facebook&fbclid=test&mkt=latam&ang=c3&qa=1',
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
    await page.waitForSelector('[data-lp-meta-shopify][data-lp-ang][data-lp-mkt]', {
      timeout: 20_000,
    });
    await page.waitForFunction(
      (expected) => document.querySelector('[data-lp-meta-shopify]')?.getAttribute('data-lp-ang') === expected,
      item.expectAng,
      { timeout: 10_000 },
    );
    const mkt = await page.locator('[data-lp-meta-shopify]').getAttribute('data-lp-mkt');
    const ang = await page.locator('[data-lp-meta-shopify]').getAttribute('data-lp-ang');
    const h1 = (await page.locator('h1').first().innerText().catch(() => '')) || '';
    const angleCopyOk =
      !item.expectAngleCopy ||
      (await page.locator(`[data-copy-unsigned="${item.expectAngleCopy}"]`).count()) > 0;

    await page.locator('#problema').scrollIntoViewIfNeeded();
    await page.waitForSelector('[data-lp-meta-sticky] a[data-cta="lp-meta-sticky"]', {
      timeout: 15_000,
    });
    const href =
      (await page.locator('[data-lp-meta-sticky] a[data-cta="lp-meta-sticky"]').getAttribute('href')) ||
      '';
    const queryOk = (item.expectQuery || []).every((part) => href.includes(part));
    const hopOk = href.startsWith('/reunion-playful/ir');

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
        angleCopyOk &&
        hopOk &&
        queryOk,
    });
    await context.close();
  }

  for (const item of PROPAGATOR_CASES) {
    await sleep(1100);
    const context = await browser.newContext({ userAgent: QA_UA });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const inject = () => {
        if (!document.body || document.getElementById('qa-prop-probe')) return;
        const a = document.createElement('a');
        a.id = 'qa-prop-probe';
        a.setAttribute('href', '/reunion-playful');
        a.textContent = 'probe';
        document.body.appendChild(a);
      };
      if (document.body) inject();
      else document.addEventListener('DOMContentLoaded', inject);
    });
    const url = `${base}${item.path}`;
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    const status = response?.status() ?? 0;
    await page.waitForFunction(
      () => {
        const probe = document.getElementById('qa-prop-probe');
        const href = probe?.getAttribute('href') || '';
        return href.includes('utm_source=facebook') && href.includes('fbclid=test');
      },
      null,
      { timeout: 8_000 },
    ).catch(() => null);
    const sample =
      (await page.locator('#qa-prop-probe').getAttribute('href').catch(() => '')) || '';
    let stripped = false;
    if (sample) {
      const parsed = new URL(sample, 'https://playfulagency.com');
      stripped =
        parsed.pathname.replace(/\/+$/, '') === '/reunion-playful' &&
        parsed.searchParams.get('utm_source') === 'facebook' &&
        parsed.searchParams.get('fbclid') === 'test' &&
        !parsed.searchParams.has('mkt') &&
        !parsed.searchParams.has('ang') &&
        !parsed.searchParams.has('qa');
    }
    results.push({
      id: item.id,
      url,
      status,
      bookingHref: sample,
      ok: status === 200 && stripped,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(path.join(artifactDir, 'qa-results.json'), JSON.stringify({ results }, null, 2));
console.log(JSON.stringify(results, null, 2));
if (results.some((item) => !item.ok)) process.exit(1);
