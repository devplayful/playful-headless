#!/usr/bin/env node
/**
 * Live prod audit: network + HTML/RSC string scan (no secrets).
 * Usage: node --import tsx scripts/sin-wp-live-audit.mjs [baseUrl] [outJson]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { chromium } from 'playwright';
import { getSitemapPaths } from '../utils/apex-sitemap.ts';

const BASE = (process.argv[2] || 'https://playfulagency.com').replace(/\/$/, '');
const OUT = process.argv[3] || '/opt/cursor/artifacts/sin-wp-live-audit.json';
const CONCURRENCY = Number(process.env.AUDIT_CONCURRENCY || '2');

const VIEWPORTS = [
  { tag: '390', width: 390, height: 844 },
  { tag: '1440', width: 1440, height: 900 },
];

function madridNow() {
  return new Date().toLocaleString('sv-SE', { timeZone: 'Europe/Madrid', hour12: false }) + ' Europe/Madrid';
}

function classifyUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase();
  const path = u.pathname;
  const reasons = [];

  if (host === 'endpoint.playfulagency.com') reasons.push('endpoint');
  if (host === 'old.playfulagency.com') reasons.push('old');
  if (/^crear\.(endpoint\.)?playfulagency\.com$/i.test(host)) reasons.push('crear');
  if (/^i[0-2]\.wp\.com$/i.test(host)) reasons.push('wpcom-cdn');
  if (/wordpress\.com|wp\.com/i.test(host) && !host.endsWith('playfulagency.com')) reasons.push('wp-host');
  if (host.includes('playfulagency.com') && (path.startsWith('/wp-content/') || path.startsWith('/wp-includes/'))) {
    reasons.push('apex-wp-path');
  }
  if (/\/wp-json\b/.test(path)) reasons.push('wp-json');

  return reasons.length ? { url: u.href, host, path, reasons } : null;
}

function extractPayloadSignals(html) {
  const signals = {
    endpointStr: [],
    wpContentStr: [],
    wpComStr: [],
  };
  const pushUnique = (arr, match) => {
    const s = match.slice(0, 500);
    if (!arr.includes(s)) arr.push(s);
  };
  for (const m of html.matchAll(/https?:\/\/endpoint\.playfulagency\.com[^\s"'\\)\\]\\}]*/gi)) {
    pushUnique(signals.endpointStr, m[0]);
  }
  for (const m of html.matchAll(/(?:https?:\/\/(?:www\.)?playfulagency\.com)?\/wp-content\/[^\s"'\\)\\]\\}]*/gi)) {
    pushUnique(signals.wpContentStr, m[0]);
  }
  for (const m of html.matchAll(/https?:\/\/i[0-2]\.wp\.com[^\s"'\\)\\]\\}]*/gi)) {
    pushUnique(signals.wpComStr, m[0]);
  }
  for (const m of html.matchAll(/[^a-z]wp\.com[^\s"'\\)\\]\\}]*/gi)) {
    if (m[0].length < 80) pushUnique(signals.wpComStr, m[0]);
  }
  return signals;
}

async function auditPage(browser, path, viewport) {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const requests = [];
  const failures = [];

  page.on('request', (req) => {
    const c = classifyUrl(req.url());
    if (c) requests.push({ ...c, method: req.method(), resourceType: req.resourceType() });
  });
  page.on('requestfailed', (req) => {
    const c = classifyUrl(req.url());
    if (c) failures.push({ ...c, failure: req.failure()?.errorText || 'failed' });
  });
  page.on('response', async (res) => {
    const c = classifyUrl(res.url());
    if (c) {
      const hit = requests.find((r) => r.url === c.url);
      if (hit) hit.status = res.status();
      else requests.push({ ...c, status: res.status(), method: res.request().method(), resourceType: res.request().resourceType() });
    }
  });

  const url = path === '/' ? `${BASE}/` : `${BASE}${path}`;
  const t0 = Date.now();
  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90_000 });
  const mainStatus = res?.status() ?? 0;

  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.85));
    const max = Math.min(document.body.scrollHeight, 40_000);
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);

  const html = await page.content();
  const payload = extractPayloadSignals(html);
  const brokenWpImgs = await page.evaluate(() => {
    const out = [];
    for (const img of document.querySelectorAll('img')) {
      const src = img.currentSrc || img.src || '';
      if (!src.includes('/wp-content/') && !src.includes('endpoint.playfulagency.com') && !/i[0-2]\.wp\.com/.test(src)) {
        continue;
      }
      if (img.naturalWidth === 0 && img.complete) {
        out.push({ src, alt: img.alt?.slice(0, 80) || '' });
      }
    }
    return out;
  });

  await page.close();

  const dedupReq = new Map();
  for (const r of requests) dedupReq.set(r.url, r);

  return {
    path,
    viewport: viewport.tag,
    mainStatus,
    ms: Date.now() - t0,
    networkHits: [...dedupReq.values()],
    networkFailures: failures,
    payloadSignals: payload,
    brokenWpImgs,
    payloadOnly: {
      wpContent: payload.wpContentStr.filter(
        (s) => ![...dedupReq.keys()].some((u) => u.includes(s.replace(/^https?:\/\/[^/]+/, '')) || s.includes(u)),
      ),
    },
  };
}

async function pool(items, limit, fn) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

const paths = getSitemapPaths();
const jobs = [];
for (const path of paths) {
  for (const vp of VIEWPORTS) jobs.push({ path, viewport: vp });
}

const browser = await chromium.launch({ headless: true });
const startedAtMadrid = madridNow();
const rows = await pool(jobs, CONCURRENCY, ({ path, viewport }) => auditPage(browser, path, viewport));
await browser.close();

const byPath = new Map();
for (const row of rows) {
  const prev = byPath.get(row.path) || { path: row.path, viewports: {} };
  prev.viewports[row.viewport] = row;
  byPath.set(row.path, prev);
}

const pagesWithNetwork = rows.filter((r) => r.networkHits.length > 0 || r.networkFailures.length > 0);
const pagesWithBroken = rows.filter((r) => r.brokenWpImgs.length > 0);
const casosPaths = paths.filter((p) => p.includes('casos-de-exito'));

const report = {
  startedAtMadrid,
  finishedAtMadrid: madridNow(),
  base: BASE,
  pathCount: paths.length,
  jobCount: jobs.length,
  pagesWithNetwork: pagesWithNetwork.map((r) => ({
    path: r.path,
    viewport: r.viewport,
    hits: r.networkHits,
    failures: r.networkFailures,
  })),
  pagesWithBrokenWpImgs: pagesWithBroken.map((r) => ({
    path: r.path,
    viewport: r.viewport,
    broken: r.brokenWpImgs,
  })),
  casosDetail: [...casosPaths, '/'].map((p) => byPath.get(p)).filter(Boolean),
  homePayloadSample: byPath.get('/')?.viewports?.['390']?.payloadSignals,
  rows: [...byPath.values()],
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
console.log(
  JSON.stringify(
    {
      startedAtMadrid: report.startedAtMadrid,
      finishedAtMadrid: report.finishedAtMadrid,
      pathCount: report.pathCount,
      pagesWithNetwork: report.pagesWithNetwork.length,
      pagesWithBroken: report.pagesWithBrokenWpImgs.length,
      out: OUT,
    },
    null,
    2,
  ),
);