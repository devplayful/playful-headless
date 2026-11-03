#!/usr/bin/env node
/**
 * Capturas prod-*.png contra preview Vercel (no localhost).
 *
 * BASE_URL=https://playful-headless-git-….vercel.app
 * VERCEL_SHARE=m3E1GgpcLn0QdeRjbHBv71kCXLzCga3J  (opcional; primera visita fija cookie)
 */
import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';

const base = (process.env.BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Set BASE_URL to the Vercel preview origin (no trailing slash).');
  process.exit(1);
}

const share = (process.env.VERCEL_SHARE || 'm3E1GgpcLn0QdeRjbHBv71kCXLzCga3J').trim();
const outDir = '/opt/cursor/artifacts';
mkdirSync(outDir, { recursive: true });

function previewUrl(pathname, { withShare = false } = {}) {
  const url = new URL(pathname, `${base}/`);
  if (withShare && share) url.searchParams.set('_vercel_share', share);
  return url.toString();
}

const qualifiedAnswers = {
  name: 'Preview QA',
  email: 'preview-calif@example.com',
  selling: 'vendo_online',
  platform: 'shopify',
  revenueOnline: '50k_100k',
  revenueOtherChannels: 'under_10k',
  businessType: 'marca_d2c',
  thirdParty: 'no',
  team: '',
  privacyConsent: true,
  submissionId: `${'a'.repeat(24)}_${Date.now().toString(36)}`,
};

const reviewAnswers = {
  ...qualifiedAnswers,
  submissionId: `${'b'.repeat(24)}_${Date.now().toString(36)}`,
  revenueOnline: '10k_50k',
  revenueOtherChannels: '10k_50k',
};

const rejectedAnswers = {
  ...qualifiedAnswers,
  submissionId: `${'c'.repeat(24)}_${Date.now().toString(36)}`,
  selling: 'aun_no_vendo',
};

async function bootstrapShareCookie(context) {
  const page = await context.newPage();
  await page.goto(previewUrl('/reunion', { withShare: true }), {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  await page.close();
}

async function fillForm(page, answers) {
  await page.waitForSelector('button:has-text("Continuar")', { timeout: 90_000 });
  const textInputs = page.locator(
    'form input:not([type="email"]):not([type="radio"]):not([type="checkbox"])',
  );
  await textInputs.first().fill(answers.name);
  await page.locator('input[type="email"]').fill(answers.email);

  if (answers.selling === 'aun_no_vendo') {
    await page.getByRole('radio', { name: /Aún no vendo/i }).check();
  } else {
    await page.getByRole('radio', { name: /Vendo online/i }).check();
  }

  await page.locator('select').nth(0).selectOption(answers.platform);
  await page.locator('select[name="revenueOnline"]').selectOption(answers.revenueOnline);
  await page.locator('select[name="revenueOtherChannels"]').selectOption(answers.revenueOtherChannels);

  if (answers.selling !== 'aun_no_vendo') {
    await page.getByRole('radio', { name: /Marca propia/i }).check();
    await page.locator(`input[name="thirdParty"][value="${answers.thirdParty}"]`).check();
  }

  await page.locator('input[type="checkbox"]').check();
}

async function waitForBookingWidget(page) {
  const iframeHandle = page.locator('iframe[data-reunion-calendar="embedded"]');
  await iframeHandle.waitFor({ state: 'attached', timeout: 60_000 });
  await iframeHandle.scrollIntoViewIfNeeded();

  await Promise.race([
    page.waitForResponse(
      (resp) => resp.url().includes('free-slots') && resp.status() === 200,
      { timeout: 120_000 },
    ),
    page.waitForResponse(
      (resp) => resp.url().includes('leadconnectorhq.com/widget/booking') && resp.status() === 200,
      { timeout: 120_000 },
    ),
  ]).catch(() => {});

  const frame = page.frameLocator('iframe[data-reunion-calendar="embedded"]');
  await frame.locator('button, [role="button"], .calendar-slot, td').first().waitFor({
    state: 'visible',
    timeout: 120_000,
  }).catch(async () => {
    await page.waitForTimeout(8000);
  });
}

async function submitAndScreenshot(context, { answers, outcome, filename, waitWidget = false }) {
  const iphone = devices['iPhone 13'];
  const page = await context.newPage({ ...iphone });
  await page.goto(previewUrl('/reunion'), { waitUntil: 'networkidle', timeout: 120_000 });
  await fillForm(page, answers);
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.waitForSelector(`[data-reunion-outcome="${outcome}"]`, { timeout: 90_000 });
  if (waitWidget) await waitForBookingWidget(page);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${outDir}/${filename}`, fullPage: true });
  await page.close();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  await bootstrapShareCookie(context);

  {
    const page = await context.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(previewUrl('/reunion'), { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/prod-reunion-escritorio-inicial.png`, fullPage: true });
    await page.close();
  }

  {
    const iphone = devices['iPhone 13'];
    const page = await context.newPage({ ...iphone });
    await page.goto(previewUrl('/reunion'), { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/prod-reunion-movil-inicial.png`, fullPage: true });
    await page.close();
  }

  await submitAndScreenshot(context, {
    answers: qualifiedAnswers,
    outcome: 'qualified',
    filename: 'prod-reunion-movil-pendiente-widget.png',
    waitWidget: true,
  });

  await submitAndScreenshot(context, {
    answers: reviewAnswers,
    outcome: 'review',
    filename: 'prod-reunion-movil-limite.png',
  });

  await submitAndScreenshot(context, {
    answers: rejectedAnswers,
    outcome: 'rejected',
    filename: 'prod-reunion-movil-no.png',
  });

  {
    const iphone = devices['iPhone 13'];
    const page = await context.newPage({ ...iphone });
    await page.goto(previewUrl('/gracias?conv=Schedule'), { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${outDir}/prod-gracias-schedule-movil.png`, fullPage: true });
    await page.close();
  }

  await browser.close();
  console.log('Saved prod-*.png in', outDir);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
