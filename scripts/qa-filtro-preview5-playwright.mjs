#!/usr/bin/env node --experimental-strip-types
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { buildQaFiltroGhlContactPayload } from '../lib/qa-filtro/ghl-payload.ts';
import { evaluateQaFiltro } from '../lib/qa-filtro/qualify.ts';

const artifactsDir = '/opt/cursor/artifacts';
const panelQuery = 'panel=0';

const base = 'https://playful-headless-git-cursor-qa-d25174-playful-agencys-projects.vercel.app';
const shareBootstrapUrl =
  `${base}/qa/filtro-reunion?_vercel_share=oIhxoV0IbqnrL3rk9urrFrvIaJsOtXVK`;

const CALENDAR_INTRO =
  'Esto es una solicitud, no una reunión confirmada. Revisamos tus respuestas y te confirmamos solo si de verdad podemos ayudarte.';

const GRACIAS_SNIPPET = 'te escribe en 1 día laborable';

const scenarios = [
  {
    id: 'a',
    fill: {
      name: 'QA Filtro A',
      email: () => `qa-filtro-a-${Date.now()}@example.com`,
      selling: 'aun_no_vendo',
      platform: 'sin_tienda_online',
      revenueOnline: 'under_10k',
      revenueOtherChannels: 'under_10k',
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
      revenueOnline: '10k_50k',
      revenueOtherChannels: 'under_10k',
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
      revenueOnline: '50k_100k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
    },
    expectSelector: '[data-qa-outcome="qualified"]',
  },
];

const panelFill = {
  ...scenarios[0].fill,
  team: 'Equipo QA (2)',
};

const CALIF_KEYS = [
  'calif_vende',
  'calif_plataforma',
  'contact.calif_facturacion_online',
  'contact.calif_facturacion_otros_canales',
  'calif_tipo_negocio',
  'calif_otros_canales',
  'calif_equipo',
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
  await page.locator('select[name="revenueOnline"]').selectOption(fill.revenueOnline);
  await page.locator('select[name="revenueOtherChannels"]').selectOption(fill.revenueOtherChannels);
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

async function scrollQaContentBelowHeader(page) {
  await page.evaluate(() => {
    const headerOffset = 112;
    const block =
      document.querySelector('[data-qa-outcome="qualified"]')
      || document.querySelector('[data-qa-page="gracias"]')
      || document.querySelector('[data-qa-filtro-content]');
    if (!block) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    const top = block.getBoundingClientRect().top + window.scrollY - headerOffset;
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
    if (count >= 3) return count;
  }
  return countTimeSlots(frame);
}

async function assertCalendarIntro(page) {
  const intro = page.locator('[data-qa-outcome="qualified"] p').first();
  const text = await intro.innerText();
  assert.ok(text.includes(CALENDAR_INTRO.slice(0, 30)), 'calendar intro copy');
  const visible = await intro.evaluate((el) => el.getBoundingClientRect().top >= 96);
  assert.ok(visible, 'intro below header');
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
      networkLog.push({ url: req.url(), method: req.method(), conversionHit: isConversionRequest(req.url()) });
    });

    await bootstrap(page);
    await page.goto(`${base}/qa/filtro-reunion?${panelQuery}`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
    await fillForm(page, scenario.fill);
    await page.getByRole('button', { name: 'Continuar' }).click();
    await page.waitForSelector(scenario.expectSelector, { timeout: 45_000 });

    if (scenario.id === 'c') {
      await page.waitForSelector('[data-qa-calendar="embedded"]', { timeout: 60_000 });
      const iframeHandle = await page.$('[data-qa-calendar="embedded"]');
      const frame = await iframeHandle.contentFrame();
      assert.ok(frame);
      await page.waitForTimeout(10_000);
      const slotCount = await pickDayAndWaitSlots(page, frame);
      assert.ok(slotCount >= 3, `expected >=3 slots, got ${slotCount}`);

      await scrollQaContentBelowHeader(page);
      await assertCalendarIntro(page);
      if (viewport.suffix === 'movil') {
        await page.evaluate(() => window.scrollBy({ top: 100, behavior: 'instant' }));
        await page.waitForTimeout(400);
        assert.ok((await countTimeSlots(frame)) >= 3, 'mobile should show time slots');
      }

      const calShot = `v5-filtro-c-calendario-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, calShot), fullPage: false });
      summary.push({ shot: calShot, conversionHits: networkLog.filter((e) => e.conversionHit).length, slotCount });

      await page.goto(`${base}/qa/filtro-reunion/gracias?${panelQuery}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-qa-page="gracias"]', { timeout: 30_000 });
      await scrollQaContentBelowHeader(page);
      const graciasText = await page.locator('[data-qa-page="gracias"]').innerText();
      assert.ok(graciasText.includes(GRACIAS_SNIPPET), 'gracias copy');
      const graciasShot = `v5-filtro-c-gracias-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, graciasShot), fullPage: false });
      summary.push({ shot: graciasShot, conversionHits: networkLog.filter((e) => e.conversionHit).length });
    } else {
      await scrollQaContentBelowHeader(page);
      const shotName = `v5-filtro-${scenario.id}-${viewport.suffix}.png`;
      await page.screenshot({ path: path.join(artifactsDir, shotName), fullPage: false });
      const conversionHits = networkLog.filter((e) => e.conversionHit).length;
      assert.equal(conversionHits, 0);
      summary.push({ shot: shotName, conversionHits });
    }

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
  await bootstrap(page);
  await page.goto(`${base}/qa/filtro-reunion`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  await fillForm(page, panelFill);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForSelector('[data-qa-outcome="rejected"]', { timeout: 45_000 });
  await page.waitForSelector('[data-qa-ghl-dry-run="true"]', { timeout: 15_000 });
  await scrollQaContentBelowHeader(page);
  const panel = page.locator('[data-qa-ghl-dry-run="true"]');
  const jsonText = await panel.locator('pre').innerText();
  for (const key of CALIF_KEYS) {
    assert.ok(jsonText.includes(`"${key}"`) || jsonText.includes(key), `JSON missing ${key}`);
  }
  assert.ok(jsonText.includes('Marca propia que vende a cliente final'), 'calif_tipo_negocio value not truncated');
  const panelShot = 'v5-filtro-a-movil-panel.png';
  await panel.screenshot({ path: path.join(artifactsDir, panelShot) });
  const conversionHits = networkLog.filter((e) => e.conversionHit).length;
  assert.equal(conversionHits, 0);
  summary.push({ shot: panelShot, conversionHits });
  await context.close();
}

await browser.close();

const dryRunSamples = {
  pendiente: buildQaFiltroGhlContactPayload(
    {
      name: 'QA Pendiente',
      email: 'pendiente@example.com',
      selling: 'vendo_online',
      platform: 'shopify',
      revenueOnline: '50k_100k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
      team: '',
    },
    evaluateQaFiltro({
      name: 'QA Pendiente',
      email: 'pendiente@example.com',
      selling: 'vendo_online',
      platform: 'shopify',
      revenueOnline: '50k_100k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
      team: '',
    }).califTag,
  ).upsertContact,
  limite: buildQaFiltroGhlContactPayload(
    {
      name: 'QA Límite',
      email: 'limite@example.com',
      selling: 'vendo_online',
      platform: 'shopify',
      revenueOnline: '10k_50k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'si',
      team: '',
    },
    evaluateQaFiltro({
      name: 'QA Límite',
      email: 'limite@example.com',
      selling: 'vendo_online',
      platform: 'shopify',
      revenueOnline: '10k_50k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'si',
      team: '',
    }).califTag,
  ).upsertContact,
  noPasa: buildQaFiltroGhlContactPayload(
    {
      name: 'QA No pasa',
      email: 'nopasa@example.com',
      selling: 'vendo_online',
      platform: 'shopify',
      revenueOnline: 'under_10k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
      team: '',
    },
    evaluateQaFiltro({
      name: 'QA No pasa',
      email: 'nopasa@example.com',
      selling: 'vendo_online',
      platform: 'shopify',
      revenueOnline: 'under_10k',
      revenueOtherChannels: 'under_10k',
      businessType: 'marca_d2c',
      thirdParty: 'no',
      team: '',
    }).califTag,
  ).upsertContact,
};

await writeFile(
  path.join(artifactsDir, 'v5-dry-run-samples.json'),
  `${JSON.stringify({ summary, dryRunSamples }, null, 2)}\n`,
);

console.log(JSON.stringify({ ok: true, summary, dryRunSamples }, null, 2));
