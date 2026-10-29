import { chromium, devices } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE =
  process.env.SEO_BASE_URL || 'http://127.0.0.1:3000';
const OUT = process.env.QA_SCREENSHOT_DIR || '/opt/cursor/artifacts/screenshots';

const pages = [
  { name: 'home', path: '/?qa=1' },
  { name: 'gracias', path: '/gracias?conv=Schedule&qa=1' },
  { name: 'jumex', path: '/casos-de-exito/jumex-shopify-dtc-ecommerce?qa=1' },
  { name: 'odwalla', path: '/casos-de-exito/odwalla-shopify-dtc-ecommerce?qa=1' },
];

const viewports = [
  { tag: 'desktop-1440', width: 1440, height: 900 },
  { tag: 'mobile-390', width: 390, height: 844, isMobile: true },
];

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

for (const vp of viewports) {
  const context = await browser.newContext({
    userAgent: 'PlayfulQA/1.0',
    viewport: { width: vp.width, height: vp.height },
    isMobile: Boolean(vp.isMobile),
    deviceScaleFactor: vp.isMobile ? 2 : 1,
  });
  const page = await context.newPage();
  for (const item of pages) {
    const url = `${BASE.replace(/\/$/, '')}${item.path}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
    const title = await page.title();
    const bodyText = await page.locator('body').innerText();
    if (/log in to vercel/i.test(bodyText) || /log in to vercel/i.test(title)) {
      throw new Error(`Vercel login wall at ${url}`);
    }
    if (/application error|internal server error/i.test(bodyText)) {
      throw new Error(`Error page at ${url}`);
    }
    await page.waitForTimeout(500);
    const file = join(OUT, `${item.name}-${vp.tag}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);
    await page.waitForTimeout(1000);
  }
  await context.close();
}

await browser.close();
