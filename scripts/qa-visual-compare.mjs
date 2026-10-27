#!/usr/bin/env node
/**
 * Serial 390/1440 screenshots: prod vs after origin.
 * ?qa=1, UA PlayfulQA/1.0, ≥1 req/s. No form submit.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { PLAYFUL_QA_UA, paceLiveQa, withQaUrl } from '../lib/qa/live-fetch.mjs';

const require = createRequire(import.meta.url);
const puppeteer = require('/tmp/playful-qa-tools/node_modules/puppeteer-core');
const { PNG } = require('/tmp/playful-qa-tools/node_modules/pngjs');
const pixelmatch = require('/tmp/playful-qa-tools/node_modules/pixelmatch');

const CHROME = process.env.CHROME || '/usr/bin/google-chrome';
const AFTER = process.env.AFTER_ORIGIN || 'http://127.0.0.1:3100';
const PROD = 'https://playfulagency.com';
const OUT = process.env.VISUAL_OUT || join(dirname(fileURLToPath(import.meta.url)), '../docs/qa-sprint-20261027-compartidos/visual');

const ROUTES = [
  '/',
  '/agencia-shopify',
  '/agencia-e-commerce',
  '/reunion-playful',
  '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
];
const VIEWPORTS = [
  { name: '390', width: 390, height: 844 },
  { name: '1440', width: 1440, height: 900 },
];

const FREEZE = `
*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
[class*="chat"], [id*="chat-widget"], iframe[src*="leadconnector"], iframe[src*="highlevel"] { display: none !important; }
`;

function slug(path) {
  return path === '/' ? 'home' : path.replace(/^\//, '').replace(/\W+/g, '_');
}

async function shot(browser, origin, path, viewport, dest) {
  await paceLiveQa();
  const page = await browser.newPage();
  await page.setUserAgent(PLAYFUL_QA_UA);
  await page.setViewport({ width: viewport.width, height: viewport.height, deviceScaleFactor: 1 });
  page.setDefaultNavigationTimeout(90_000);
  await page.goto(withQaUrl(`${origin}${path}`), { waitUntil: 'networkidle2' });
  await page.addStyleTag({ content: FREEZE });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: dest, fullPage: true, type: 'png' });
  const title = await page.title();
  await page.close();
  return title;
}

function compare(beforePath, afterPath, diffPath) {
  const a = PNG.sync.read(require('node:fs').readFileSync(beforePath));
  const b = PNG.sync.read(require('node:fs').readFileSync(afterPath));
  const width = Math.min(a.width, b.width);
  const height = Math.min(a.height, b.height);
  if (a.width !== b.width || a.height !== b.height) {
    return { mismatch: true, reason: `size ${a.width}x${a.height} vs ${b.width}x${b.height}`, percent: 100, pixels: -1 };
  }
  const diff = new PNG({ width, height });
  const pixels = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.12 });
  writeFileSync(diffPath, PNG.sync.write(diff));
  const percent = (pixels / (width * height)) * 100;
  return { mismatch: percent > 0.35, reason: null, percent: Number(percent.toFixed(3)), pixels };
}

async function main() {
  mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  const rows = [];
  try {
    for (const path of ROUTES) {
      for (const vp of VIEWPORTS) {
        const base = `${slug(path)}-${vp.name}`;
        const before = join(OUT, `antes-${base}.png`);
        const after = join(OUT, `despues-${base}.png`);
        const diff = join(OUT, `diff-${base}.png`);
        console.log(`shot prod ${path} ${vp.name}`);
        const t1 = await shot(browser, PROD, path, vp, before);
        console.log(`shot after ${path} ${vp.name}`);
        const t2 = await shot(browser, AFTER, path, vp, after);
        const cmp = compare(before, after, diff);
        rows.push({ path, viewport: vp.name, titles: [t1, t2], ...cmp });
        console.log(JSON.stringify({ path, viewport: vp.name, ...cmp }));
      }
    }
  } finally {
    await browser.close();
  }
  writeFileSync(join(OUT, 'report.json'), JSON.stringify({ generatedAt: new Date().toISOString(), after: AFTER, rows }, null, 2));
  console.log(JSON.stringify({ after: AFTER, rows }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
