#!/usr/bin/env node
/**
 * PR #418 — captura de red en build de producción local (6 landings Elementor).
 * Uso: BASE_URL=http://127.0.0.1:3460 node scripts/qa-pr418-landing-network.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3460').replace(/\/$/, '');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = join(ROOT, 'docs/qa/pr418-network.json');
const OUT_MD = join(ROOT, 'docs/qa/pr418-network.md');

const EXPECTED_HTML_ASSETS = [
  '749451b90872367a.css',
  '174-7689b7d3e9c28799.js',
  '1046-62d7694e79f5fe91.js',
];

const LANDINGS = [
  { path: '/agencia-e-commerce', name: 'agencia-e-commerce' },
  { path: '/agencia-seo', name: 'agencia-seo' },
  { path: '/agencia-sem', name: 'agencia-sem' },
  { path: '/agencia-diseno-web', name: 'agencia-diseno-web' },
  { path: '/agencia-ux-ui', name: 'agencia-ux-ui' },
  { path: '/seo-vigo', name: 'seo-vigo' },
];

function measuredCommitSha() {
  try {
    return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
  } catch {
    return process.env.MEASURED_COMMIT_SHA?.trim() || 'unknown';
  }
}

function classifyForbiddenHost(hostname) {
  if (!hostname) return null;
  const h = hostname.toLowerCase();
  if (h === 'endpoint.playfulagency.com') return 'endpoint';
  if (h === 'old.playfulagency.com') return 'old';
  if (h === 'crear.playfulagency.com' || h.endsWith('.crear.endpoint.playfulagency.com')) {
    return 'crear';
  }
  return null;
}

function hostOf(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

function isLocalhost(url) {
  const h = hostOf(url);
  return h === '127.0.0.1' || h === 'localhost';
}

function isOwnSiteRequest(url) {
  if (!isLocalhost(url)) return false;
  try {
    const { pathname } = new URL(url);
    return (
      pathname.startsWith('/_next/')
      || pathname.startsWith('/wp-static/')
      || pathname.startsWith('/wp-media/')
      || pathname === '/'
      || pathname.startsWith('/agencia-')
      || pathname.startsWith('/seo-vigo')
      || pathname.startsWith('/api/')
    );
  } catch {
    return false;
  }
}

async function interactWithWidgets(page) {
  const accordion = page.locator('.elementor-accordion .elementor-tab-title').first();
  if (await accordion.isVisible({ timeout: 2000 }).catch(() => false)) {
    await accordion.click({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(800);
  }
  const accordionItems = page.locator('.elementor-accordion .elementor-tab-title');
  const count = await accordionItems.count().catch(() => 0);
  for (let i = 1; i < Math.min(count, 4); i += 1) {
    await accordionItems.nth(i).click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
  }
  const next = page.locator('.elementor-image-carousel .swiper-button-next, .swiper-button-next').first();
  if (await next.isVisible({ timeout: 1500 }).catch(() => false)) {
    await next.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(600);
  }
}

function basenameAsset(url) {
  try {
    const { pathname } = new URL(url);
    const base = pathname.split('/').pop() || '';
    return base.split('?')[0];
  } catch {
    return '';
  }
}

async function assertHtmlPreflight() {
  const probe = `${BASE}/agencia-seo`;
  const res = await fetch(probe, { headers: { accept: 'text/html' } });
  const html = await res.text();
  const missing = EXPECTED_HTML_ASSETS.filter((needle) => !html.includes(needle));
  const nextRefs = [...html.matchAll(/\/_next\/static\/(?:css|chunks)\/([^"'?#\s]+)/g)].map(
    (m) => m[1],
  );
  return {
    probePath: '/agencia-seo',
    status: res.status,
    missingExpectedAssets: missing,
    nextStaticRefsSample: [...new Set(nextRefs)].sort().slice(0, 40),
    ok: res.status === 200 && missing.length === 0,
  };
}

async function auditLanding(browser, landing) {
  const page = await browser.newPage();
  const requests = [];
  const failures = [];
  const badResponses = [];

  page.on('request', (req) => {
    requests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
    });
  });
  page.on('requestfailed', (req) => {
    failures.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      failure: req.failure()?.errorText ?? 'unknown',
    });
  });
  page.on('response', (res) => {
    const status = res.status();
    if (status < 400) return;
    const url = res.url();
    if (!isOwnSiteRequest(url)) return;
    badResponses.push({
      url,
      status,
      statusText: res.statusText(),
      resourceType: res.request().resourceType(),
    });
  });

  const url = `${BASE}${landing.path}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await interactWithWidgets(page);
  await page.waitForTimeout(3000);

  const external = requests.filter((r) => !isLocalhost(r.url));
  const forbiddenByKind = { endpoint: 0, old: 0, crear: 0 };
  const forbiddenRequests = [];
  for (const r of external) {
    const kind = classifyForbiddenHost(hostOf(r.url));
    if (kind) {
      forbiddenByKind[kind] += 1;
      forbiddenRequests.push({ ...r, forbiddenKind: kind });
    }
  }

  const nextRequests = requests.filter((r) => {
    try {
      return new URL(r.url).pathname.startsWith('/_next/');
    } catch {
      return false;
    }
  });
  const nextFailures = failures.filter((f) => {
    try {
      return new URL(f.url).pathname.startsWith('/_next/');
    } catch {
      return false;
    }
  });
  const ownSiteFailures = failures.filter((f) => isOwnSiteRequest(f.url));
  const wpStaticBundleLoads = requests
    .filter((r) => {
      try {
        return new URL(r.url).pathname.includes('/wp-static/') && r.url.includes('.bundle.min.js');
      } catch {
        return false;
      }
    })
    .map((r) => basenameAsset(r.url));
  const nextChunksLoaded = [
    ...new Set(
      nextRequests
        .map((r) => basenameAsset(r.url))
        .filter((name) => /\.(?:js|css)$/.test(name)),
    ),
  ].sort();

  await page.close();

  return {
    path: landing.path,
    name: landing.name,
    requestCount: requests.length,
    failureCount: failures.length,
    ownSiteFailureCount: ownSiteFailures.length + badResponses.length,
    ownSiteFailures: [...ownSiteFailures, ...badResponses],
    nextFailureCount: nextFailures.length,
    nextFailures,
    badResponseCount: badResponses.length,
    wpStaticBundlesLoaded: [...new Set(wpStaticBundleLoads)].sort(),
    externalRequestCount: external.length,
    externalHosts: [...new Set(external.map((r) => hostOf(r.url)).filter(Boolean))].sort(),
    forbiddenByKind,
    forbiddenEndpointCount: forbiddenByKind.endpoint,
    forbiddenOldCount: forbiddenByKind.old,
    forbiddenCrearCount: forbiddenByKind.crear,
    forbiddenRequests,
    nextChunksLoaded,
    keyAssetsPresent: {
      css749451b90872367a: nextChunksLoaded.includes('749451b90872367a.css'),
      js174: nextChunksLoaded.some((n) => n.startsWith('174-') && n.endsWith('.js')),
      js1046: nextChunksLoaded.some((n) => n.startsWith('1046-') && n.endsWith('.js')),
    },
    failures,
  };
}

const measuredSha = measuredCommitSha();
const preflight = await assertHtmlPreflight();
if (!preflight.ok) {
  console.error('HTML preflight failed', JSON.stringify(preflight, null, 2));
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const results = [];
for (const landing of LANDINGS) {
  console.log(`Auditing ${landing.path}…`);
  results.push(await auditLanding(browser, landing));
}
await browser.close();

const summary = {
  measuredCommitSha: measuredSha,
  generatedAtUtc: new Date().toISOString(),
  baseUrl: BASE,
  htmlPreflight: preflight,
  expectedHtmlAssets: EXPECTED_HTML_ASSETS,
  landings: results,
  totals: {
    requests: results.reduce((s, r) => s + r.requestCount, 0),
    external: results.reduce((s, r) => s + r.externalRequestCount, 0),
    forbiddenEndpoint: results.reduce((s, r) => s + r.forbiddenEndpointCount, 0),
    forbiddenOld: results.reduce((s, r) => s + r.forbiddenOldCount, 0),
    forbiddenCrear: results.reduce((s, r) => s + r.forbiddenCrearCount, 0),
    nextFailures: results.reduce((s, r) => s + r.nextFailureCount, 0),
    ownSiteFailures: results.reduce((s, r) => s + r.ownSiteFailureCount, 0),
  },
};

mkdirSync(dirname(OUT_JSON), { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(summary, null, 2)}\n`);

const mdLines = [
  '# PR #418 — red en landings (build local)',
  '',
  `Commit medido: \`${summary.measuredCommitSha}\``,
  `Generado (UTC): ${summary.generatedAtUtc}`,
  `Base: ${BASE}`,
  '',
  '## Preflight HTML (`/agencia-seo`)',
  '',
  `Assets esperados en HTML: ${EXPECTED_HTML_ASSETS.map((a) => `\`${a}\``).join(', ')}.`,
  preflight.missingExpectedAssets.length
    ? `**Faltan:** ${preflight.missingExpectedAssets.join(', ')}`
    : '**OK** — los tres assets aparecen en el HTML.',
  '',
  '| Landing | Total | Externas | endpoint | old | crear | Fallos propios | `/_next` |',
  '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
];
for (const r of results) {
  mdLines.push(
    `| ${r.path} | ${r.requestCount} | ${r.externalRequestCount} | ${r.forbiddenEndpointCount} | ${r.forbiddenOldCount} | ${r.forbiddenCrearCount} | ${r.ownSiteFailureCount} | ${r.nextFailureCount} |`,
  );
}
mdLines.push(
  '',
  `**Totales:** endpoint=${summary.totals.forbiddenEndpoint}, old=${summary.totals.forbiddenOld}, crear=${summary.totals.forbiddenCrear}, fallos propios=${summary.totals.ownSiteFailures}, \`/_next\`=${summary.totals.nextFailures}`,
  '',
);
for (const r of results) {
  mdLines.push(
    `### ${r.path}`,
    '',
    `- Chunks/CSS \`/_next\` cargados (únicos): ${r.nextChunksLoaded.join(', ') || '(ninguno)'}`,
    `- 174/1046/749451: ${JSON.stringify(r.keyAssetsPresent)}`,
    `- Bundles wp-static: ${r.wpStaticBundlesLoaded.join(', ') || '(ninguno)'}`,
    '',
  );
  if (r.ownSiteFailures.length) {
    mdLines.push('**Fallos propios (abort/4xx/5xx):**');
    for (const f of r.ownSiteFailures) {
      const label = f.failure || `HTTP ${f.status}`;
      mdLines.push(`- ${label} — ${f.url}`);
    }
    mdLines.push('');
  }
  if (r.nextFailures.length) {
    mdLines.push('**Fallos `/_next`:**');
    for (const f of r.nextFailures) {
      mdLines.push(`- ${f.failure} — ${f.url}`);
    }
    mdLines.push('');
  }
}
writeFileSync(OUT_MD, `${mdLines.join('\n')}\n`);

console.log(JSON.stringify(summary.totals, null, 2));
if (
  summary.totals.forbiddenEndpoint > 0
  || summary.totals.forbiddenOld > 0
  || summary.totals.forbiddenCrear > 0
  || summary.totals.nextFailures > 0
  || summary.totals.ownSiteFailures > 0
) {
  process.exitCode = 1;
}