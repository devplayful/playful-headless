import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.SEO_BASE_URL || 'http://127.0.0.1:3000';
const OUT = process.env.QA_SCREENSHOT_DIR || '/opt/cursor/artifacts/screenshots';

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

{
  const context = await browser.newContext({
    userAgent: 'PlayfulQA/1.0',
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(`${BASE.replace(/\/$/, '')}/?qa=1`, { waitUntil: 'networkidle', timeout: 120_000 });
  const bodyText = await page.locator('body').innerText();
  if (/log in to vercel/i.test(bodyText)) throw new Error('Vercel login wall');
  await page.locator('nav .relative.group').filter({ hasText: 'SERVICIOS' }).hover({ force: true });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: join(OUT, 'header-servicios-desktop-1440.png'),
    clip: { x: 480, y: 0, width: 560, height: 320 },
  });
  console.log('saved', join(OUT, 'header-servicios-desktop-1440.png'));
  await context.close();
}

{
  const context = await browser.newContext({
    userAgent: 'PlayfulQA/1.0',
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto(`${BASE.replace(/\/$/, '')}/?qa=1`, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.getByRole('button', { name: /Abrir menú/i }).click();
  await page.waitForTimeout(400);
  await page.getByRole('button', { name: /Servicios/i }).click();
  await page.waitForTimeout(400);
  await page.getByRole('link', { name: 'Agencia Shopify' }).waitFor({ state: 'visible' });
  await page.screenshot({
    path: join(OUT, 'header-servicios-mobile-390.png'),
    fullPage: false,
  });
  console.log('saved', join(OUT, 'header-servicios-mobile-390.png'));
  await context.close();
}

await browser.close();
