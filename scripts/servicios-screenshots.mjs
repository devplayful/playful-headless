#!/usr/bin/env node
/**
 * Capturas viewport 390×844 y 1440×900 de las 6 landings (referencia producción).
 * Salida: /opt/cursor/artifacts/screenshots/servicios-prod-<slug>-<w>.png
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright';

const ORIGIN = process.env.SERVICIOS_SHOT_ORIGIN || 'https://playfulagency.com';
const SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-e-commerce',
  'agencia-ux-ui',
  'agencia-shopify',
];
const VIEWPORTS = [
  { w: 390, h: 844, tag: '390' },
  { w: 1440, h: 900, tag: '1440' },
];

const outDir = '/opt/cursor/artifacts/screenshots';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ locale: 'es-ES' });

for (const slug of SLUGS) {
  for (const vp of VIEWPORTS) {
    const page = await context.newPage();
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.goto(`${ORIGIN}/${slug}`, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForTimeout(1500);
    const file = `${outDir}/servicios-prod-${slug}-${vp.tag}.png`;
    await page.screenshot({ path: file, fullPage: false });
    console.log('saved', file);
    await page.close();
  }
}

await browser.close();
