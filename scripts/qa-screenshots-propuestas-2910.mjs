import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = process.env.SEO_BASE_URL || 'http://127.0.0.1:3000';
const OUT = process.env.QA_SCREENSHOT_DIR || '/opt/cursor/artifacts/screenshots';

mkdirSync(OUT, { recursive: true });

const paths = [
  { slug: 'home', path: '/?qa=1' },
  { slug: 'gracias-schedule', path: '/gracias?conv=Schedule&qa=1' },
  { slug: 'nosotros', path: '/nosotros?qa=1' },
  { slug: 'caso-jumex', path: '/casos-de-exito/jumex-shopify-dtc-ecommerce?qa=1' },
  { slug: 'caso-odwalla', path: '/casos-de-exito/odwalla-shopify-dtc-ecommerce?qa=1' },
  {
    slug: 'blog-zelle',
    path: '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce?qa=1',
  },
];

const viewports = [
  { tag: 'desktop-1440', width: 1440, height: 900 },
  { tag: 'mobile-390', width: 390, height: 844, isMobile: true },
];

const browser = await chromium.launch({ headless: true });

for (const { slug, path } of paths) {
  for (const vp of viewports) {
    const context = await browser.newContext({
      userAgent: 'PlayfulQA/1.0',
      viewport: { width: vp.width, height: vp.height },
      isMobile: Boolean(vp.isMobile),
      deviceScaleFactor: vp.isMobile ? 2 : 1,
    });
    const page = await context.newPage();
    const url = `${BASE.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
    await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
    const bodyText = await page.locator('body').innerText();
    if (/log in to vercel/i.test(bodyText)) throw new Error(`Vercel login wall on ${url}`);
    const file = join(OUT, `${slug}-${vp.tag}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log('saved', file);
    await context.close();
  }
}

await browser.close();
