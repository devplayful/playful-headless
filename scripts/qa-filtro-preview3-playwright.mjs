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

const fillC = {
  name: 'QA Filtro C',
  email: () => `qa-filtro-c-${Date.now()}@example.com`,
  selling: 'vendo_online',
  platform: 'shopify',
  revenue: '50k_100k',
  businessType: 'marca_d2c',
  thirdParty: 'no',
};

function isConversionRequest(url) {
  if (/googleadservices\.com\/pagead\/conversion/i.test(url)) return true;
  if (/googleads\.g\.doubleclick\.net\/pagead\/viewthroughconversion/i.test(url)) return true;
  if (/facebook\.com\/tr/i.test(url) && /(Lead|Schedule|CompleteRegistration)/i.test(url)) return true;
  if (/google-analytics\.com\/g\/collect|analytics\.google\.com\/g\/collect/i.test(url)) {
    try {
      const en = new URL(url).searchParams.get('en') || '';
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
  await page.locator('select').nth(1).selectOption(fill.revenue);
  await page.locator(`input[name="businessType"][value="${fill.businessType}"]`).check();
  await page.locator(`input[name="thirdParty"][value="${fill.thirdParty}"]`).check();
  await page.locator('input[type="checkbox"]').check();
}

async function bootstrap(page) {
  await page.goto(shareBootstrapUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForTimeout(1200);
}

async function scrollCalendarIntoView(page) {
  await page.evaluate(() => {
    const headerOffset = 96;
    const target = document.querySelector('[data-qa-calendar-wrap]')
      || document.querySelector('[data-qa-calendar="embedded"]');
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(600);
}

async function countTimeSlots(frame) {
  return frame.evaluate(() =>
    [...document.querySelectorAll('span')].filter((el) =>
      /^\d{1,2}:\d{2}$/.test((el.textContent || '').trim()),
    ).length,
  );
}

async function pickDayAndWaitSlots(page, frame) {
  await frame.locator('td.selectable.vdpCell:not(.disabled)').first().waitFor({ timeout: 45_000 });
  const dayIds = await frame.evaluate(() =>
    [...document.querySelectorAll('td.selectable.vdpCell:not(.disabled)')]
      .map((cell) => cell.getAttribute('data-id'))
      .filter(Boolean),
  );

  const ordered = [
    ...dayIds.filter((id) => Number(id.split('-')[2]) >= 15),
    ...dayIds.filter((id) => Number(id.split('-')[2]) < 15),
  ];

  for (const dayId of ordered.slice(0, 12)) {
    await frame
      .click(`td[data-id="${dayId}"]`, { force: true, timeout: 8_000 })
      .catch(async () => {
        await frame.evaluate((id) => {
          document.querySelector(`td[data-id="${id}"]`)?.click();
        }, dayId);
      });
    await page.waitForTimeout(10_000);
    const count = await countTimeSlots(frame);
    if (count >= 3) {
      return count;
    }
  }

  return countTimeSlots(frame);
}

async function runCalendarCapture(page, viewport, shotName, logName) {
  const networkLog = [];
  page.on('request', (req) => {
    const url = req.url();
    networkLog.push({ url, method: req.method(), conversionHit: isConversionRequest(url) });
  });

  await bootstrap(page);
  await page.goto(`${base}/qa/filtro-reunion?panel=0`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await fillForm(page, fillC);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForSelector('[data-qa-outcome="qualified"]', { timeout: 45_000 });
  await page.waitForSelector('[data-qa-calendar="embedded"]', { timeout: 60_000 });

  const iframeHandle = await page.$('[data-qa-calendar="embedded"]');
  assert.ok(iframeHandle, 'calendar iframe missing');
  const frame = await iframeHandle.contentFrame();
  assert.ok(frame, 'calendar iframe frame missing');
  await page.waitForTimeout(10_000);
  const slotCount = await pickDayAndWaitSlots(page, frame);
  assert.ok(slotCount >= 3, `expected >=3 time slots, got ${slotCount}`);

  await scrollCalendarIntoView(page);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: false });

  const conversionHits = networkLog.filter((e) => e.conversionHit);
  await writeFile(
    path.join(artifactsDir, logName),
    `${JSON.stringify({ shotName, viewport, slotCount, conversionHits, networkLog }, null, 2)}\n`,
  );
  assert.equal(conversionHits.length, 0);
  return { conversionHits: conversionHits.length, slotCount };
}

async function runGraciasCapture(page, viewport, shotName, logName) {
  const networkLog = [];
  page.on('request', (req) => {
    networkLog.push({ url: req.url(), method: req.method(), conversionHit: isConversionRequest(req.url()) });
  });

  await bootstrap(page);
  await page.goto(`${base}/qa/filtro-reunion/gracias?panel=0`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForSelector('[data-qa-page="gracias"]', { timeout: 30_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: false });

  const conversionHits = networkLog.filter((e) => e.conversionHit);
  await writeFile(
    path.join(artifactsDir, logName),
    `${JSON.stringify({ shotName, viewport, conversionHits, networkLog }, null, 2)}\n`,
  );
  assert.equal(conversionHits.length, 0);
  return { conversionHits: conversionHits.length };
}

await mkdir(artifactsDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const summary = [];

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  summary.push({
    ...await runCalendarCapture(
      page,
      'movil',
      'preview3-filtro-c-calendario-movil.png',
      'preview3-red-c-calendario-movil.json',
    ),
    screenshot: 'preview3-filtro-c-calendario-movil.png',
  });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  summary.push({
    ...await runCalendarCapture(
      page,
      'escritorio',
      'preview3-filtro-c-calendario-escritorio.png',
      'preview3-red-c-calendario-escritorio.json',
    ),
    screenshot: 'preview3-filtro-c-calendario-escritorio.png',
  });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  summary.push({
    ...await runGraciasCapture(
      page,
      'movil',
      'preview3-filtro-c-gracias-movil.png',
      'preview3-red-c-gracias-movil.json',
    ),
    screenshot: 'preview3-filtro-c-gracias-movil.png',
  });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  summary.push({
    ...await runGraciasCapture(
      page,
      'escritorio',
      'preview3-filtro-c-gracias-escritorio.png',
      'preview3-red-c-gracias-escritorio.json',
    ),
    screenshot: 'preview3-filtro-c-gracias-escritorio.png',
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ ok: true, summary }, null, 2));
