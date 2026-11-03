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

const CALENDAR_INTRO = 'Estás pidiendo una posible reunión; revisamos tus respuestas y te confirmamos.';

const fillC = {
  name: 'QA Filtro C',
  email: () => `qa-filtro-c-${Date.now()}@example.com`,
  selling: 'vendo_online',
  platform: 'shopify',
  revenue: '50k_100k',
  businessType: 'marca_d2c',
  thirdParty: 'no',
};

const fillA = {
  name: 'QA Filtro A',
  email: () => `qa-filtro-a-${Date.now()}@example.com`,
  selling: 'aun_no_vendo',
  platform: 'sin_tienda_online',
  revenue: 'under_10k',
  businessType: 'marca_d2c',
  thirdParty: 'no',
  team: 'Equipo QA (2)',
};

const CALIF_KEYS = [
  'calif_vende',
  'calif_plataforma',
  'calif_facturacion_mensual',
  'calif_tipo_negocio',
  'calif_otros_canales',
  'calif_equipo',
];

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
  if (fill.team) {
    await page.locator('label:has-text("equipo propio") input').fill(fill.team);
  }
  await page.locator('input[type="checkbox"]').check();
}

async function bootstrap(page) {
  await page.goto(shareBootstrapUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await page.waitForTimeout(1200);
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

async function scrollStepCForScreenshot(page) {
  await page.evaluate(() => {
    const headerOffset = 112;
    const block = document.querySelector('[data-qa-outcome="qualified"]');
    if (!block) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const top = block.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
  });
  await page.waitForTimeout(600);
}

async function assertIntroFullyVisible(page) {
  const intro = page.locator('[data-qa-outcome="qualified"] p').first();
  await intro.waitFor({ state: 'visible', timeout: 10_000 });
  const visible = await intro.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const text = (el.textContent || '').trim();
    return rect.top >= 96 && rect.top < window.innerHeight && text.length > 40;
  });
  assert.ok(visible, 'calendar intro line should sit below fixed header in viewport');
  await assert.ok(intro.innerText().then((t) => t.includes(CALENDAR_INTRO.slice(0, 20))));
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

  await scrollStepCForScreenshot(page);
  await assertIntroFullyVisible(page);

  await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: false });

  const conversionHits = networkLog.filter((e) => e.conversionHit);
  await writeFile(
    path.join(artifactsDir, logName),
    `${JSON.stringify({ shotName, viewport, slotCount, conversionHits, networkLog }, null, 2)}\n`,
  );
  assert.equal(conversionHits.length, 0);
  return { conversionHits: conversionHits.length, slotCount };
}

async function runPanelCapture(page, shotName, logName) {
  const networkLog = [];
  page.on('request', (req) => {
    networkLog.push({ url: req.url(), method: req.method(), conversionHit: isConversionRequest(req.url()) });
  });

  await bootstrap(page);
  await page.goto(`${base}/qa/filtro-reunion`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await fillForm(page, fillA);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForSelector('[data-qa-outcome="rejected"]', { timeout: 45_000 });
  await page.waitForSelector('[data-qa-ghl-dry-run="true"]', { timeout: 15_000 });

  const panel = page.locator('[data-qa-ghl-dry-run="true"]');
  await panel.locator('pre').evaluate((el) => {
    el.style.maxHeight = 'none';
    el.style.overflow = 'visible';
  });

  const jsonText = await panel.locator('pre').innerText();
  for (const key of CALIF_KEYS) {
    assert.ok(jsonText.includes(`"${key}"`), `JSON should include ${key}`);
  }

  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  const panelBox = await panel.boundingBox();
  const viewport = page.viewportSize();
  const panelTallerThanViewport = panelBox && viewport && panelBox.height > viewport.height - 24;

  if (panelTallerThanViewport) {
    await panel.screenshot({ path: path.join(artifactsDir, shotName) });
  } else {
    await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: true });
  }

  const conversionHits = networkLog.filter((e) => e.conversionHit);
  await writeFile(
    path.join(artifactsDir, logName),
    `${JSON.stringify({ shotName, califKeys: CALIF_KEYS, conversionHits, networkLog }, null, 2)}\n`,
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
      'preview4-filtro-c-calendario-movil.png',
      'preview4-red-c-calendario-movil.json',
    ),
    screenshot: 'preview4-filtro-c-calendario-movil.png',
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
      'preview4-filtro-c-calendario-escritorio.png',
      'preview4-red-c-calendario-escritorio.json',
    ),
    screenshot: 'preview4-filtro-c-calendario-escritorio.png',
  });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  summary.push({
    ...await runPanelCapture(page, 'preview4-filtro-a-movil-panel.png', 'preview4-red-a-movil-panel.json'),
    screenshot: 'preview4-filtro-a-movil-panel.png',
  });
  await context.close();
}

await browser.close();
console.log(JSON.stringify({ ok: true, summary }, null, 2));
