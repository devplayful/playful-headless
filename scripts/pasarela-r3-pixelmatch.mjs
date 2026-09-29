#!/usr/bin/env node
/**
 * PNG-first visual gate for /pasarela-de-pagos-venezuela ronda 3.
 * Crops frame@2x.png per KEEP region, captures Playwright section shots,
 * runs pixelmatch, writes artifacts/pasarela-r3/<region>/{reference,actual,diff}.png
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { chromium } from 'playwright';

const SCALE = 2407 / 1440;
const REF_WIDTH = 2407;
const FRAME_REF = join(process.cwd(), 'figma-handoff/pasarela-pagos/frame@2x.png');
const OUT_ROOT = join(process.cwd(), 'artifacts/pasarela-r3');
const PASS_THRESHOLD = 3;

const REGIONS = [
  { id: 'hero', selector: '[data-pasarela-section="hero"]', y1x: 93, h1x: 577, pad: '#9139ff' },
  { id: 'intro', selector: '[data-pasarela-section="intro"]', y1x: 670, h1x: 237, pad: '#9139ff' },
  { id: 'benefits', selector: '[data-pasarela-section="benefits"]', y1x: 907, h1x: 1082, pad: '#dcf8f5' },
  { id: 'pain', selector: '[data-pasarela-section="pain"]', y1x: 3213, h1x: 725, pad: '#e9d7ff' },
  { id: 'faq', selector: '[data-pasarela-section="faq"]', y1x: 4766, h1x: 747, pad: '#95eae2' },
  {
    id: 'banner',
    selector: '[data-pasarela-section="banner"]',
    y1x: 6590,
    h1x: 1306,
    pad: '#fff7db',
    note: 'CTA derecha vs form Figma — delta estructural esperado',
  },
];

function parseArgs(argv) {
  const baseUrl = argv[2] || process.env.PASARELA_PREVIEW_URL || 'http://127.0.0.1:3000';
  const path = argv[3] || '/pasarela-de-pagos-venezuela';
  return { baseUrl: baseUrl.replace(/\/$/, ''), path };
}

async function cropReference(region) {
  const top = Math.round(region.y1x * SCALE);
  const height = Math.round(region.h1x * SCALE);
  return sharp(FRAME_REF)
    .extract({ left: 0, top, width: REF_WIDTH, height })
    .png()
    .toBuffer();
}

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16),
    alpha: 1,
  };
}

function bufferToPng(buffer) {
  return PNG.sync.read(buffer);
}

function pngToBuffer(png) {
  return PNG.sync.write(png);
}

async function normalizeActual(actualBuf, width, height, padHex) {
  const scaled = await sharp(actualBuf)
    .resize(width, null, { fit: 'inside' })
    .png()
    .toBuffer();
  const scaledMeta = await sharp(scaled).metadata();
  if (scaledMeta.height >= height) {
    return sharp(scaled)
      .extract({ left: 0, top: 0, width, height: Math.min(height, scaledMeta.height) })
      .png()
      .toBuffer();
  }
  return sharp(scaled)
    .extend({
      top: 0,
      bottom: height - scaledMeta.height,
      left: 0,
      right: 0,
      background: hexToRgb(padHex),
    })
    .png()
    .toBuffer();
}

async function compareBuffers(referenceBuf, actualBuf, padHex) {
  const refMeta = await sharp(referenceBuf).metadata();
  const width = refMeta.width;
  const height = refMeta.height;
  const actualNorm = await normalizeActual(actualBuf, width, height, padHex);
  const img1 = bufferToPng(referenceBuf);
  const img2 = bufferToPng(actualNorm);
  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
    threshold: 0.1,
    includeAA: false,
  });
  const total = width * height;
  const mismatchPct = (diffPixels / total) * 100;
  return {
    width,
    height,
    diffPixels,
    total,
    mismatchPct,
    actualNorm,
    diffBuf: pngToBuffer(diff),
  };
}

async function captureSections(baseUrl, path) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addStyleTag({
    content: `
      header.sticky, footer.playful-site-footer, iframe,
      #chat-widget-container, .leadconnector-launcher {
        display: none !important;
        visibility: hidden !important;
      }
    `,
  });
  const url = `${baseUrl}${path}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.waitForSelector('[data-pasarela-section="hero"]', { timeout: 60_000, state: 'visible' });
  await page.evaluate(async () => {
    document.fonts?.ready && (await document.fonts.ready);
  });
  await page.waitForTimeout(1200);
  const cssReady = await page.evaluate(() => {
    const hero = document.querySelector('[data-pasarela-section="hero"]');
    const bg = hero && getComputedStyle(hero).backgroundColor;
    return Boolean(bg && bg.includes('145'));
  });
  if (!cssReady) {
    throw new Error(
      'CSS del hero no cargó (chunks stale). Ejecuta: npm run build:direct && npm run start -- -p <port>',
    );
  }

  const shots = new Map();
  for (const region of REGIONS) {
    const locator = page.locator(region.selector);
    const shot = await locator.screenshot({ type: 'png', animations: 'disabled', timeout: 60_000 });
    const upscaled = await sharp(shot)
      .resize(Math.round(1440 * SCALE), null, { fit: 'inside' })
      .png()
      .toBuffer();
    shots.set(region.id, upscaled);
  }
  await browser.close();
  return shots;
}

async function main() {
  const { baseUrl, path } = parseArgs(process.argv);
  mkdirSync(OUT_ROOT, { recursive: true });

  console.log(`Capturing ${baseUrl}${path} @ viewport 1440 → upscale ${REF_WIDTH}px`);
  const shots = await captureSections(baseUrl, path);

  const rows = [];
  for (const region of REGIONS) {
    const dir = join(OUT_ROOT, region.id);
    mkdirSync(dir, { recursive: true });
    const referenceBuf = await cropReference(region);
    const actualRaw = shots.get(region.id);
    const { mismatchPct, diffPixels, total, actualNorm, diffBuf, width, height } =
      await compareBuffers(referenceBuf, actualRaw, region.pad);

    const referencePath = join(dir, 'reference.png');
    const actualPath = join(dir, 'actual.png');
    const diffPath = join(dir, 'diff.png');
    writeFileSync(referencePath, referenceBuf);
    writeFileSync(actualPath, actualNorm);
    writeFileSync(diffPath, diffBuf);

    const pass = mismatchPct <= PASS_THRESHOLD;
    rows.push({
      region: region.id,
      pass,
      mismatchPct: Number(mismatchPct.toFixed(2)),
      diffPixels,
      total,
      size: `${width}x${height}`,
      referencePath,
      actualPath,
      diffPath,
      note: region.note || null,
    });
    console.log(
      `${pass ? 'PASS' : 'FAIL'} ${region.id}: ${mismatchPct.toFixed(2)}% (${diffPixels}/${total})`,
    );
  }

  const reportLines = [
    '# Pasarela ronda 3 — pixelmatch gate',
    '',
    `Preview: ${baseUrl}${path}`,
    `Reference: ${FRAME_REF}`,
    `Threshold: ≤ ${PASS_THRESHOLD}%`,
    '',
    '| # | sección | PASS/FAIL | mismatch % | diff/total | paths |',
    '|---:|---|---|---:|---|---|',
    ...rows.map((row, index) => {
      const status = row.pass ? 'PASS' : 'FAIL';
      return `| ${index + 1} | ${row.region} | ${status} | ${row.mismatchPct}% | ${row.diffPixels}/${row.total} | \`${row.referencePath}\` |`;
    }),
    '',
    `Overall: ${rows.every((r) => r.pass) ? 'PASS' : 'FAIL'}`,
  ];
  const reportPath = join(OUT_ROOT, 'report.md');
  writeFileSync(reportPath, `${reportLines.join('\n')}\n`);
  writeFileSync(join(OUT_ROOT, 'report.json'), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(`\nReport: ${reportPath}`);
  process.exitCode = rows.every((r) => r.pass) ? 0 : 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
