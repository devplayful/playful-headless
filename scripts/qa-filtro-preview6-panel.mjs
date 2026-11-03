#!/usr/bin/env node --experimental-strip-types
import assert from 'node:assert/strict';
import path from 'node:path';
import { chromium } from 'playwright';

const artifactsDir = '/opt/cursor/artifacts';
const base = 'https://playful-headless-git-cursor-qa-d25174-playful-agencys-projects.vercel.app';
const shareBootstrapUrl =
  `${base}/qa/filtro-reunion?_vercel_share=oIhxoV0IbqnrL3rk9urrFrvIaJsOtXVK`;

const fillB = {
  name: 'QA Filtro B',
  email: () => `qa-filtro-b-${Date.now()}@example.com`,
  selling: 'vendo_online',
  platform: 'shopify',
  revenueOnline: '10k_50k',
  revenueOtherChannels: 'under_10k',
  businessType: 'marca_d2c',
  thirdParty: 'si',
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
  await page.locator('label:has-text("equipo propio") input').fill(fill.team);
  await page.locator('input[type="checkbox"]').check();
}

const networkLog = [];
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.on('request', (req) => {
  networkLog.push({ url: req.url(), conversionHit: isConversionRequest(req.url()) });
});

await page.goto(shareBootstrapUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
await page.waitForTimeout(1200);
await page.goto(`${base}/qa/filtro-reunion`, { waitUntil: 'domcontentloaded', timeout: 90_000 });
await fillForm(page, fillB);
await page.getByRole('button', { name: 'Continuar' }).click();
await page.waitForSelector('[data-qa-outcome="review"]', { timeout: 45_000 });
await page.waitForSelector('[data-qa-ghl-dry-run="true"]', { timeout: 15_000 });

await page.evaluate(() => {
  const headerOffset = 112;
  const block = document.querySelector('[data-qa-filtro-content]');
  if (!block) return;
  const top = block.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
});
await page.waitForTimeout(600);

const panel = page.locator('[data-qa-ghl-dry-run="true"]');
const jsonText = await panel.locator('pre').innerText();
assert.ok(jsonText.includes('calif-limite'), 'panel should show calif-limite tag');
assert.ok(jsonText.includes('qa-interno'), 'panel should show qa-interno tag');
for (const key of CALIF_KEYS) {
  assert.ok(jsonText.includes(key), `JSON should include ${key}`);
}
assert.ok(jsonText.includes('Marca propia que vende a cliente final'), 'calif_tipo_negocio value complete');

await panel.screenshot({ path: path.join(artifactsDir, 'v6-filtro-b-movil-panel.png') });

const conversionHits = networkLog.filter((e) => e.conversionHit);
assert.equal(conversionHits.length, 0);

await browser.close();
console.log(JSON.stringify({ ok: true, conversionHits: 0, shot: 'v6-filtro-b-movil-panel.png' }, null, 2));
