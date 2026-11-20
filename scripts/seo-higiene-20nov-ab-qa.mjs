#!/usr/bin/env node
/**
 * QA SEO higiene 20 nov: A/B local (MAIN_BASE vs PR_BASE), href lists + screenshots.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const MAIN = (process.env.MAIN_BASE || 'http://127.0.0.1:3010').replace(/\/$/, '');
const PR = (process.env.PR_BASE || 'http://127.0.0.1:3011').replace(/\/$/, '');
const OUT = process.env.OUT || '/cursor/stores/self/seo-higiene-20nov/qa';

const ROUTES = [
  { slug: 'seo-vigo', path: '/seo-vigo' },
  { slug: 'cashea', path: '/blog/tecnologia/cashea-para-comercios' },
];

const VIEWPORTS = [
  { tag: '390', width: 390, height: 844 },
  { tag: '1440', width: 1440, height: 900 },
];

function madridNow() {
  return (
    new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) +
    ' Europe/Madrid'
  );
}

async function allHrefs(page) {
  return page.evaluate(() =>
    [...document.querySelectorAll('a[href]')]
      .map((a) => a.getAttribute('href') || '')
      .filter(Boolean)
      .sort(),
  );
}

function diffPng(aPath, bPath, outPath) {
  const a = PNG.sync.read(readFileSync(aPath));
  const b = PNG.sync.read(readFileSync(bPath));
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const out = new PNG({ width: w, height: h });
  const n = pixelmatch(a.data, b.data, out.data, w, h, { threshold: 0.08, includeAA: true });
  writeFileSync(outPath, PNG.sync.write(out));
  return { diffPixels: n, totalPixels: w * h, diffPct: (n / (w * h)) * 100 };
}

async function shot(page, url, file) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: file, fullPage: true });
}

mkdirSync(OUT, { recursive: true });
const report = {
  at: madridNow(),
  main: MAIN,
  pr: PR,
  routes: [],
};

const browser = await chromium.launch({ headless: true });

for (const route of ROUTES) {
  const row = { slug: route.slug, path: route.path, viewports: [], hrefs: {} };
  for (const vp of VIEWPORTS) {
    const ctxMain = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const ctxPr = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const mainPage = await ctxMain.newPage();
    const prPage = await ctxPr.newPage();
    const base = `${route.slug}-${vp.tag}`;
    const mainPng = join(OUT, `${base}-main.png`);
    const prPng = join(OUT, `${base}-pr.png`);
    const diffPngPath = join(OUT, `${base}-diff.png`);
    await shot(mainPage, `${MAIN}${route.path}`, mainPng);
    await shot(prPage, `${PR}${route.path}`, prPng);
    const diff = diffPng(mainPng, prPng, diffPngPath);
    row.viewports.push({
      tag: vp.tag,
      main: mainPng,
      pr: prPng,
      diff: diffPngPath,
      ...diff,
    });
    if (vp.tag === '1440') {
      row.hrefs.main = await allHrefs(mainPage);
      row.hrefs.pr = await allHrefs(prPage);
    }
    await ctxMain.close();
    await ctxPr.close();
  }
  const m = new Set(row.hrefs.main || []);
  const p = new Set(row.hrefs.pr || []);
  row.hrefOnlyInMain = [...m].filter((h) => !p.has(h));
  row.hrefOnlyInPr = [...p].filter((h) => !m.has(h));
  report.routes.push(row);
}

await browser.close();

writeFileSync(join(OUT, 'report.json'), JSON.stringify(report, null, 2));
writeFileSync(
  join(OUT, 'href-diff.md'),
  report.routes
    .map(
      (r) =>
        `## ${r.path}\n\nSolo main:\n${(r.hrefOnlyInMain || []).map((h) => `- ${h}`).join('\n') || '(ninguno)'}\n\nSolo PR:\n${(r.hrefOnlyInPr || []).map((h) => `- ${h}`).join('\n') || '(ninguno)'}\n`,
    )
    .join('\n'),
);
console.log(JSON.stringify({ out: OUT, at: report.at, routes: report.routes.length }, null, 2));