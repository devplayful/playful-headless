#!/usr/bin/env node
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const root = '/agent/repos/playful-headless';
const artifactsDir = path.join(root, 'artifacts');

const base = 'https://playful-headless-git-cursor-qa-d25174-playful-agencys-projects.vercel.app';
const shareBootstrapUrl =
  `${base}/qa/filtro-reunion?_vercel_share=oIhxoV0IbqnrL3rk9urrFrvIaJsOtXVK`;

const panelQuery = 'panel=0';

const scenarios = [
  {
    id: 'a',
    fill: {
      name: 'QA Filtro A',
      email: () => `qa-filtro-a-${Date.now()}@example.com`,
      selling: 'aun_no_vendo',
      platform: 'sin_tienda_online',
      revenue: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
    },
    expectSelector: '[data-qa-outcome="rejected"]',
  },
  {
    id: 'b',
    fill: {
      name: 'QA Filtro B',
      email: () => `qa-filtro-b-${Date.now()}@example.com`,
      selling: 'vendo_online',
      platform: 'shopify',
      revenue: '10k_50k',
      businessType: 'marca_d2c',
      thirdParty: 'si',
    },
    expectSelector: '[data-qa-outcome="review"]',
  },
  {
    id: 'c',
    fill: {
      name: 'QA Filtro C',
      email: () => `qa-filtro-c-${Date.now()}@example.com`,
      selling: 'vendo_online',
      platform: 'shopify',
      revenue: '50k_100k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
    },
    expectSelector: '[data-qa-outcome="qualified"]',
  },
];

const viewports = [
  { suffix: 'movil', width: 390, height: 844 },
  { suffix: 'escritorio', width: 1440, height: 900 },
];

function isConversionRequest(url) {
  if (/googleadservices\.com\/pagead\/conversion/i.test(url)) return true;
  if (/googleads\.g\.doubleclick\.net\/pagead\/viewthroughconversion/i.test(url)) return true;
  if (/facebook\.com\/tr/i.test(url) && /(Lead|Schedule|CompleteRegistration)/i.test(url)) return true;
  if (/google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/i.test(url)) {
    try {
      const parsed = new URL(url);
      const en = parsed.searchParams.get('en') || '';
      if (/^(generate_lead|Schedule|book_appointment|chat_lead)$/i.test(en)) return true;
    } catch {
      return false;
    }
  }
  return false;
}

async function fillForm(page, fill) {
  await page.fill('input[type="email"]', typeof fill.email === 'function' ? fill.email() : fill.email);
  await page.locator('label:has-text("Nombre") input').fill(fill.name);
  await page.locator(`input[name="selling"][value="${fill.selling}"]`).check();
  await page.locator('select').first().selectOption(fill.platform);
  if (fill.revenue) {
    await page.locator('select').nth(1).selectOption(fill.revenue);
  }
  await page.locator(`input[name="businessType"][value="${fill.businessType}"]`).check();
  await page.locator(`input[name="thirdParty"][value="${fill.thirdParty}"]`).check();
  await page.locator('input[type="checkbox"]').check();
}

async function bootstrapContext(page) {
  await page.goto(shareBootstrapUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForTimeout(1200);
}

async function openFiltro(page, query = panelQuery) {
  const q = query ? `?${query}` : '';
  await page.goto(`${base}/qa/filtro-reunion${q}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
}

async function selectCalendarDayMobile(page) {
  const frame = page.frameLocator('[data-qa-calendar="embedded"]');
  await page.waitForTimeout(6_000);
  const dayButton = frame.locator('button:not([disabled])').filter({ hasText: /^[0-9]{1,2}$/ }).first();
  if (await dayButton.count()) {
    await dayButton.click({ timeout: 15_000 });
    await page.waitForTimeout(4_000);
    await frame.locator('button').filter({ hasText: /:\d{2}/ }).first().waitFor({ timeout: 20_000 }).catch(() => {});
    return true;
  }
  const alt = frame.locator('[role="button"], .calendar-day, .day').filter({ hasText: /^[0-9]{1,2}$/ }).first();
  if (await alt.count()) {
    await alt.click({ timeout: 15_000 });
    await page.waitForTimeout(4_000);
    await frame.locator('button').filter({ hasText: /:\d{2}/ }).first().waitFor({ timeout: 20_000 }).catch(() => {});
    return true;
  }
  return false;
}

async function selectCalendarDayDesktop(page) {
  const frame = page.frameLocator('[data-qa-calendar="embedded"]');
  await page.waitForTimeout(5_000);
  const day = frame.locator('button:not([disabled])').filter({ hasText: /\d/ }).nth(3);
  if (await day.count()) {
    await day.click({ timeout: 15_000 });
    await page.waitForTimeout(3_000);
  }
}

await mkdir(artifactsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const summary = [];

for (const scenario of scenarios) {
  for (const viewport of viewports) {
    const networkLog = [];
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();
    page.on('request', (req) => {
      const url = req.url();
      networkLog.push({ url, method: req.method(), conversionHit: isConversionRequest(url) });
    });

    await bootstrapContext(page);
    await openFiltro(page, panelQuery);
    await fillForm(page, scenario.fill);
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.waitForSelector(scenario.expectSelector, { timeout: 45_000 });

    const shots = [];

    if (scenario.id === 'c') {
      await page.waitForSelector('[data-qa-calendar="embedded"]', { timeout: 60_000 });
      if (viewport.suffix === 'movil') {
        await selectCalendarDayMobile(page);
      } else {
        await selectCalendarDayDesktop(page);
      }
      const calShot = `preview2-filtro-c-calendario-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, calShot), fullPage: true });
      shots.push(calShot);

      await page.goto(`${base}/qa/filtro-reunion/gracias?${panelQuery}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-qa-page="gracias"]', { timeout: 30_000 });
      const graciasShot = `preview2-filtro-c-gracias-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, graciasShot), fullPage: true });
      shots.push(graciasShot);
    } else {
      const shotName = `preview2-filtro-${scenario.id}-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: true });
      shots.push(shotName);
    }

    const conversionHits = networkLog.filter((entry) => entry.conversionHit);
    const logName = `preview2-red-${scenario.id}-${viewport.suffix}.json`;
    await writeFile(
      path.join(artifactsDir, logName),
      `${JSON.stringify({ scenario: scenario.id, viewport: viewport.suffix, conversionHits, networkLog }, null, 2)}\n`,
    );

    assert.equal(conversionHits.length, 0);

    summary.push({ scenario: scenario.id, viewport: viewport.suffix, screenshots: shots, conversionHits: conversionHits.length });
    await context.close();
  }
}

{
  const networkLog = [];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.on('request', (req) => {
    networkLog.push({ url: req.url(), method: req.method(), conversionHit: isConversionRequest(req.url()) });
  });
  await bootstrapContext(page);
  await openFiltro(page, '');
  await fillForm(page, scenarios[0].fill);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForSelector('[data-qa-outcome="rejected"]', { timeout: 45_000 });
  await page.locator('[data-qa-ghl-dry-run="true"]').scrollIntoViewIfNeeded();
  const panelShot = 'preview2-filtro-a-movil-panel.png';
  await page.screenshot({ path: path.join(artifactsDir, panelShot), fullPage: true });
  const conversionHits = networkLog.filter((e) => e.conversionHit);
  assert.equal(conversionHits.length, 0);
  summary.push({ scenario: 'a-panel', viewport: 'movil', screenshots: [panelShot], conversionHits: conversionHits.length });
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ ok: true, summary }, null, 2));
