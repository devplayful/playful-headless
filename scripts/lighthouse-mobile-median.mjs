#!/usr/bin/env node
/**
 * Mobile Lighthouse: 3 runs per URL, median performance score + LCP + TBT.
 * Usage: node scripts/lighthouse-mobile-median.mjs https://host/path ...
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const PASSES = 3;

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function runLh(url, outDir) {
  const jsonBase = join(outDir, 'report');
  const args = [
    url,
    '--quiet',
    '--chrome-flags=--headless --no-sandbox --disable-gpu',
    '--only-categories=performance,seo',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--throttling.cpuSlowdownMultiplier=4',
    '--output=json',
    `--output-path=${jsonBase}`,
  ];
  const result = spawnSync('npx', ['--yes', 'lighthouse@12', ...args], { encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(`lighthouse failed for ${url}: ${result.stderr || result.stdout}`);
  }
  const report = JSON.parse(readFileSync(jsonBase, 'utf8'));
  const perf = report.categories.performance.score * 100;
  const seo = report.categories.seo.score * 100;
  const lcp = report.audits['largest-contentful-paint'].numericValue;
  const tbt = report.audits['total-blocking-time'].numericValue;
  const loader = JSON.stringify(report.audits['network-requests']?.details?.items ?? []).includes('loader.js');
  return { perf, seo, lcp, tbt, loader };
}

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error('Usage: node scripts/lighthouse-mobile-median.mjs <url> [...]');
  process.exit(1);
}

const rows = [];
for (const url of urls) {
  const perf = [];
  const seo = [];
  const lcp = [];
  const tbt = [];
  let loaderSeen = false;
  for (let i = 0; i < PASSES; i += 1) {
    const passDir = join(tmpdir(), `lh-${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`);
    mkdirSync(passDir, { recursive: true });
    const row = runLh(url, passDir);
    rmSync(passDir, { recursive: true, force: true });
    perf.push(row.perf);
    seo.push(row.seo);
    lcp.push(row.lcp);
    tbt.push(row.tbt);
    loaderSeen = loaderSeen || row.loader;
  }
  rows.push({
    url,
    perf: median(perf),
    seo: median(seo),
    lcp: median(lcp),
    tbt: median(tbt),
    loaderInTrace: loaderSeen,
  });
}

console.log('| URL | Perf | SEO | LCP ms | TBT ms | loader.js |');
console.log('|-----|------|-----|--------|--------|-----------|');
for (const r of rows) {
  const path = r.url.replace(/^https?:\/\/[^/]+/, '') || '/';
  console.log(
    `| ${path} | ${Math.round(r.perf)} | ${Math.round(r.seo)} | ${Math.round(r.lcp)} | ${Math.round(r.tbt)} | ${r.loaderInTrace ? 'yes' : 'no'} |`,
  );
}
