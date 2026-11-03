#!/usr/bin/env node
/**
 * QA Playwright: tres recorridos del filtro /qa/filtro-reunion (móvil + escritorio).
 * Captura pantallas y registra peticiones de red para comprobar ausencia de conversiones.
 *
 *   PLAYWRIGHT_BASE_URL=https://….vercel.app node scripts/qa-filtro-playwright.mjs
 */
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifactsDir = path.join(root, 'artifacts');
const base = (process.env.PLAYWRIGHT_BASE_URL || process.env.SEO_BASE_URL || '').replace(/\/$/, '');

if (!base) {
  throw new Error('Set PLAYWRIGHT_BASE_URL or SEO_BASE_URL to the Vercel preview URL');
}

const scenarios = [
  {
    id: 'a',
    label: 'no-califica',
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
    label: 'limite',
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
    label: 'califica',
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
    openGracias: true,
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
      networkLog.push({
        url,
        method: req.method(),
        conversionHit: isConversionRequest(url),
      });
    });

    await page.goto(`${base}/qa/filtro-reunion`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    await fillForm(page, scenario.fill);
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.waitForSelector(scenario.expectSelector, { timeout: 30_000 });

    const shots = [];

    if (scenario.id === 'c') {
      await page.waitForSelector('[data-qa-calendar="embedded"]', { timeout: 45_000 });
      await page.waitForTimeout(8_000);
      const calShot = `filtro-${scenario.id}-${viewport.suffix}-calendario.png`;
      await page.screenshot({ path: path.join(artifactsDir, calShot), fullPage: true });
      shots.push(calShot);
      await page.goto(`${base}/qa/filtro-reunion/gracias`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-qa-page="gracias"]');
      const graciasShot = `filtro-${scenario.id}-${viewport.suffix}-gracias.png`;
      await page.screenshot({ path: path.join(artifactsDir, graciasShot), fullPage: true });
      shots.push(graciasShot);
    } else {
      const shotName = `filtro-${scenario.id}-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: true });
      shots.push(shotName);
    }

    if (scenario.openGracias && scenario.id !== 'c') {
      await page.goto(`${base}/qa/filtro-reunion/gracias`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-qa-page="gracias"]');
    }

    const shotName = shots[shots.length - 1];

    const conversionHits = networkLog.filter((entry) => entry.conversionHit);
    const logName = `red-filtro-${scenario.id}-${viewport.suffix}.json`;
    await writeFile(
      path.join(artifactsDir, logName),
      `${JSON.stringify({ scenario: scenario.id, viewport: viewport.suffix, networkLog, conversionHits }, null, 2)}\n`,
    );

    assert.equal(
      conversionHits.length,
      0,
      `conversion hits in ${scenario.id}/${viewport.suffix}: ${JSON.stringify(conversionHits)}`,
    );

    summary.push({
      scenario: scenario.id,
      viewport: viewport.suffix,
      screenshots: shots,
      networkLog: logName,
    });
    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify({ ok: true, base, summary }, null, 2));
