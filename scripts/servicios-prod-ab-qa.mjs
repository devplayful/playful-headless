#!/usr/bin/env node
/**
 * A/B texto visible: prod (deployment #425) vs build local. Sin escribir en Payload/Neon.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { WP_SERVICIO_SLUGS } from '../cms/data/servicios-wp-slugs.ts';

const PROD = (process.env.PROD_BASE || 'https://playfulagency.com').replace(/\/$/, '');
const LOCAL = (process.env.LOCAL_BASE || 'http://127.0.0.1:3011').replace(/\/$/, '');
const OUT = process.env.OUT || '/cursor/stores/self/seed-servicios-sin-wp/qa';

function madridNow() {
  return (
    new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) +
    ' Europe/Madrid'
  );
}

function normalizeText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/Playful QA/gi, '')
    .trim();
}

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

async function pageMainText(page) {
  return page.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    return main.innerText || '';
  });
}

mkdirSync(OUT, { recursive: true });
const report = {
  at: madridNow(),
  prod: PROD,
  local: LOCAL,
  prodDeploymentRef: '9h4CVRTpHpeGp8TEraHPmNBmM6v8',
  routes: [],
};

const browser = await chromium.launch();
for (const slug of WP_SERVICIO_SLUGS) {
  const path = `/${slug}`;
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const row = { slug, path };
  for (const [label, base] of [
    ['prod', PROD],
    ['local', LOCAL],
  ]) {
    const url = `${base}${path}`;
    const res = await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
    row[`${label}Status`] = res?.status() ?? 0;
    const text = normalizeText(await pageMainText(page));
    row[`${label}TextLen`] = text.length;
    row[`${label}TextSha256`] = sha256(text);
    const shot = join(OUT, `${slug}-1440-${label}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    row[`${label}Shot`] = shot;
  }
  row.textMatch = row.prodTextSha256 === row.localTextSha256;
  report.routes.push(row);
  await page.close();
}
await browser.close();

report.allTextMatch = report.routes.every((r) => r.textMatch);
report.allHttp200 = report.routes.every((r) => r.prodStatus === 200 && r.localStatus === 200);
writeFileSync(join(OUT, 'servicios-ab-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ out: OUT, allTextMatch: report.allTextMatch, allHttp200: report.allHttp200 }, null, 2));
process.exit(report.allTextMatch && report.allHttp200 ? 0 : 1);