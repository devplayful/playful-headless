import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.SEO_BASE_URL || 'http://127.0.0.1:3000';
const OUT = process.env.QA_SCREENSHOT_DIR || '/opt/cursor/artifacts/screenshots';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const vp of [
  { tag: 'desktop-1440', width: 1440, height: 900 },
  { tag: 'mobile-390', width: 390, height: 844, isMobile: true },
]) {
  const context = await browser.newContext({
    userAgent: 'PlayfulQA/1.0',
    viewport: { width: vp.width, height: vp.height },
    isMobile: Boolean(vp.isMobile),
    deviceScaleFactor: vp.isMobile ? 2 : 1,
  });
  const page = await context.newPage();
  const url = `${BASE.replace(/\/$/, '')}/?qa=1`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  const bodyText = await page.locator('body').innerText();
  if (/log in to vercel/i.test(bodyText)) throw new Error('Vercel login wall');
  await page.screenshot({ path: join(OUT, `home-${vp.tag}.png`) });
  console.log('saved', join(OUT, `home-${vp.tag}.png`));
  await context.close();
}

{
  const context = await browser.newContext({
    userAgent: 'PlayfulQA/1.0',
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(`${BASE.replace(/\/$/, '')}/?qa=1`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Abrir menú/i }).click();
  await page.waitForTimeout(400);
  const link = page.locator('a[href="/agencia-shopify"]').filter({ hasText: 'Shopify' }).first();
  await link.screenshot({ path: join(OUT, 'home-shopify-link-header-crop.png') });
  console.log('saved', join(OUT, 'home-shopify-link-header-crop.png'));
  await context.close();
}

await browser.close();
