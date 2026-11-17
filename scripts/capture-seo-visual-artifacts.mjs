#!/usr/bin/env node
/**
 * Capturas prod vs fix: home, 6 landings, 2 casos (desktop 1440, móvil 390).
 * Uso: PROD_BASE=... FIX_BASE=... node scripts/capture-seo-visual-artifacts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const OUT = process.env.OUT_DIR || '/opt/cursor/artifacts/visual-qa';
const PROD = (process.env.PROD_BASE || 'https://playfulagency.com').replace(/\/$/, '');
const FIX = (process.env.FIX_BASE || 'http://127.0.0.1:3456').replace(/\/$/, '');

const ROUTES = [
  { slug: 'home', path: '/' },
  { slug: 'agencia-e-commerce', path: '/agencia-e-commerce' },
  { slug: 'agencia-seo', path: '/agencia-seo' },
  { slug: 'agencia-sem', path: '/agencia-sem' },
  { slug: 'agencia-diseno-web', path: '/agencia-diseno-web' },
  { slug: 'agencia-ux-ui', path: '/agencia-ux-ui' },
  { slug: 'seo-vigo', path: '/seo-vigo' },
  {
    slug: 'casos-de-exito-jumex-shopify-dtc-ecommerce',
    path: '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  },
  {
    slug: 'casos-de-exito-odwalla-shopify-dtc-ecommerce',
    path: '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
  },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
for (const env of [
  { label: 'prod', base: PROD },
  { label: 'fix', base: FIX },
]) {
  const page = await browser.newPage();
  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const route of ROUTES) {
      const url = `${env.base}${route.path}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
      const file = path.join(OUT, `${route.slug}-${vp.name}-${env.label}.png`);
      await page.screenshot({ path: file, fullPage: true });
      console.log('saved', file);
    }
  }
  await page.close();
}
await browser.close();
console.log(JSON.stringify({ outDir: OUT, count: ROUTES.length * VIEWPORTS.length * 2 }));