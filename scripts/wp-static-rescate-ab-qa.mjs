#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';

const MAIN = (process.env.MAIN_BASE || 'http://127.0.0.1:3010').replace(/\/$/, '');
const PR = (process.env.PR_BASE || 'http://127.0.0.1:3011').replace(/\/$/, '');
const OUT = '/cursor/stores/self/wp-static-rescate/ab-qa';
const TH = 0.12;
const ROUTES = [
  '/',
  '/blog',
  '/podcast',
  '/podcast/episodio-8-seo-para-e-commerce',
  '/blog/seo/auditoria-seo-que-es-como-se-hace',
  '/premios-cima-2026-soytechno-playful',
  '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
];

const rescatePaths = JSON.parse(
  readFileSync(join(process.cwd(), 'docs/wp-static-rescate-paths.json'), 'utf8'),
).paths;

function madridNow() {
  return (
    new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) +
    ' Europe/Madrid'
  );
}

function diffShot(a, b) {
  const pa = PNG.sync.read(readFileSync(a));
  const pb = PNG.sync.read(readFileSync(b));
  if (pa.width !== pb.width || pa.height !== pb.height) return 100;
  const out = new PNG({ width: pa.width, height: pb.height });
  const n = pixelmatch(pa.data, pb.data, out.data, pa.width, pa.height, { threshold: TH });
  return (n / (pa.width * pa.height)) * 100;
}

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = { startedAtMadrid: madridNow(), routes: [], imageDiffs: [] };

for (const path of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mUrl = `${MAIN}${path}`;
  const pUrl = `${PR}${path}`;
  await page.goto(mUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  const mShot = join(OUT, `main${path.replace(/\//g, '_') || '_home'}.png`);
  await page.screenshot({ path: mShot, fullPage: false });
  await page.goto(pUrl, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  const pShot = join(OUT, `pr${path.replace(/\//g, '_') || '_home'}.png`);
  await page.screenshot({ path: pShot, fullPage: false });
  const diffPct = diffShot(mShot, pShot);
  report.routes.push({ path, diffPct, visualMatch: diffPct < 0.5 });
  await page.close();
}

await browser.close();
report.finishedAtMadrid = madridNow();
report.rescatePaths = rescatePaths;
writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
const fail = report.routes.some((r) => !r.visualMatch);
console.log(JSON.stringify({ ok: !fail, report }, null, 2));
process.exit(fail ? 1 : 0);