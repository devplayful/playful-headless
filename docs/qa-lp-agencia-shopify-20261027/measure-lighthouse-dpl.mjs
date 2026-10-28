#!/usr/bin/env node
/**
 * Lighthouse 12.6.0 mobile default, 5 serial passes per /lp/agencia-shopify route.
 * Usage: node docs/qa-lp-agencia-shopify-20261027/measure-lighthouse-dpl.mjs
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const BASE = 'https://playful-headless-22gxso9j3-playfuls-projects.vercel.app';
const SHARE = process.env.VERCEL_SHARE;
if (!SHARE) {
  console.error('Set VERCEL_SHARE');
  process.exit(1);
}
const PASSES = 5;
const ROUTES = [
  '/lp/agencia-shopify',
  '/lp/agencia-shopify/generic',
  '/lp/agencia-shopify/c1',
  '/lp/agencia-shopify/c2',
  '/lp/agencia-shopify/c3',
  '/lp/agencia-shopify/c4',
  '/lp/agencia-shopify/c5',
];

function median(nums) {
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

function phaseMs(items, name) {
  const row = (items || []).find((i) => i.name === name);
  return row ? Math.round(row.duration) : null;
}

function runPass(url) {
  const dir = join(tmpdir(), `lh-m4-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  const out = join(dir, 'report.json');
  const args = [
    url,
    '--quiet',
    '--chrome-flags=--headless=new --no-sandbox --disable-gpu',
    '--only-categories=performance',
    '--form-factor=mobile',
    '--screenEmulation.mobile=true',
    '--throttling-method=simulate',
    '--output=json',
    `--output-path=${out}`,
  ];
  const result = spawnSync('npx', ['--yes', 'lighthouse@12.6.0', ...args], {
    encoding: 'utf8',
    timeout: 180_000,
  });
  if (result.status !== 0) {
    rmSync(dir, { recursive: true, force: true });
    throw new Error(`lh fail ${url}: ${result.stderr || result.stdout}`);
  }
  let reportFile = out;
  try {
    readFileSync(out, 'utf8');
  } catch {
    reportFile = join(dir, 'report.report.json');
  }
  const report = JSON.parse(readFileSync(reportFile, 'utf8'));
  rmSync(dir, { recursive: true, force: true });
  const lcp = report.audits['largest-contentful-paint'];
  const phasesTable = (report.audits['lcp-phases-insight']?.details?.items || []).find(
    (i) => i.type === 'table',
  );
  const phases = Object.fromEntries(
    (phasesTable?.items || []).map((row) => [row.phase, Math.round(row.duration)]),
  );
  const lcpEl =
    (report.audits['lcp-lazy-loaded']?.details?.items || [])[0] ||
    (report.audits['largest-contentful-paint-element']?.details?.items || [])[0];
  const redirect = report.audits.redirects?.numericValue;
  return {
    lcpMs: Math.round(lcp.numericValue),
    tbtMs: Math.round(report.audits['total-blocking-time']?.numericValue || 0),
    ttfbMs: phases.timeToFirstByte ?? null,
    loadDelayMs: phases.resourceLoadDelay ?? null,
    loadTimeMs: phases.resourceLoadDuration ?? null,
    renderDelayMs: phases.elementRenderDelay ?? null,
    lcpLabel: lcpEl?.node?.snippet || lcpEl?.node?.selector || '',
    redirected: (report.runWarnings || []).some((w) => /redirect/i.test(w)),
    finalUrl: report.finalUrl,
    requestedUrl: report.requestedUrl,
    lhVersion: report.lighthouseVersion,
    redirectMs: redirect != null ? Math.round(redirect) : null,
  };
}

const started = new Date().toISOString();
const variants = [];

for (const path of ROUTES) {
  const url = `${BASE}${path}?_vercel_share=${SHARE}`;
  const passes = [];
  for (let i = 1; i <= PASSES; i += 1) {
    console.error(`→ ${path} P${i}`);
    const row = runPass(url);
    console.error(
      `  LCP ${row.lcpMs} TBT ${row.tbtMs} TTFB ${row.ttfbMs} LD ${row.loadDelayMs} LT ${row.loadTimeMs} RD ${row.renderDelayMs}`,
    );
    passes.push(row);
  }
  const lcp = passes.map((p) => p.lcpMs);
  variants.push({
    path,
    passesMs: lcp,
    medianMs: median(lcp),
    maxMs: Math.max(...lcp),
    minMs: Math.min(...lcp),
    passes,
  });
}

const out = {
  sha: 'fa2dd699be26e425d3d96cfb2037b27ca40ca3e7',
  deploymentId: 'dpl_F8pWaYZXx1EgC8cNbS2JtmYAm4ra',
  fixedHost: 'playful-headless-22gxso9j3-playfuls-projects.vercel.app',
  lighthouse: '12.6.0',
  formFactor: 'mobile',
  throttling: 'default (simulate, cpuSlowdownMultiplier=4)',
  shareParam: '_vercel_share',
  started,
  finished: new Date().toISOString(),
  variants,
};
const dest = new URL('./lighthouse-m4-fixed-dpl.json', import.meta.url);
writeFileSync(dest, JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 2));
