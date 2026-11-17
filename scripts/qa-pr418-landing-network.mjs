#!/usr/bin/env node
/**
 * PR #418 — captura de red en build de producción local (6 landings Elementor).
 * Uso: BASE_URL=http://127.0.0.1:3456 node scripts/qa-pr418-landing-network.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3456').replace(/\/$/, '');
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_JSON = join(ROOT, 'docs/qa/pr418-network.json');
const OUT_MD = join(ROOT, 'docs/qa/pr418-network.md');

const LANDINGS = [
  { path: '/agencia-e-commerce', name: 'agencia-e-commerce' },
  { path: '/agencia-seo', name: 'agencia-seo' },
  { path: '/agencia-sem', name: 'agencia-sem' },
  { path: '/agencia-diseno-web', name: 'agencia-diseno-web' },
  { path: '/agencia-ux-ui', name: 'agencia-ux-ui' },
  { path: '/seo-vigo', name: 'seo-vigo' },
];

const FORBIDDEN_HOST_RE =
  /^(?:endpoint|old|.*\.crear\.endpoint)\.playfulagency\.com$/i;

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

async function auditLanding(browser, landing) {
  const page = await browser.newPage();
  const requests = [];
  const failures = [];

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

  const url = `${BASE}${landing.path}`;
  await page.goto(url, { waitUntil: 'networkidle', timeout: 120_000 });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(3000);

  const external = requests.filter((r) => !isLocalhost(r.url));
  const forbidden = external.filter((r) => FORBIDDEN_HOST_RE.test(hostOf(r.url)));

  await page.close();

  return {
    path: landing.path,
    name: landing.name,
    requestCount: requests.length,
    failureCount: failures.length,
    externalRequestCount: external.length,
    externalHosts: [...new Set(external.map((r) => hostOf(r.url)).filter(Boolean))].sort(),
    externalRequests: external,
    forbiddenEndpointRequests: forbidden,
    forbiddenEndpointCount: forbidden.length,
    failures,
  };
}

const browser = await chromium.launch({ headless: true });
const results = [];
for (const landing of LANDINGS) {
  // eslint-disable-next-line no-console
  console.log(`Auditing ${landing.path}…`);
  results.push(await auditLanding(browser, landing));
}
await browser.close();

const summary = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  landings: results,
  totals: {
    requests: results.reduce((s, r) => s + r.requestCount, 0),
    external: results.reduce((s, r) => s + r.externalRequestCount, 0),
    forbiddenEndpoint: results.reduce((s, r) => s + r.forbiddenEndpointCount, 0),
  },
};

mkdirSync(dirname(OUT_JSON), { recursive: true });
writeFileSync(OUT_JSON, `${JSON.stringify(summary, null, 2)}\n`);

const mdLines = [
  '# PR #418 — red en landings (build local)',
  '',
  `Generado: ${summary.generatedAt}`,
  `Base: ${BASE}`,
  '',
  '| Landing | Total requests | Externas (≠ localhost) | endpoint/old/crear.endpoint |',
  '| --- | ---: | ---: | ---: |',
];
for (const r of results) {
  mdLines.push(
    `| ${r.path} | ${r.requestCount} | ${r.externalRequestCount} | ${r.forbiddenEndpointCount} |`,
  );
}
mdLines.push('', `**Total endpoint/old/crear.endpoint:** ${summary.totals.forbiddenEndpoint}`);
mdLines.push('');
for (const r of results) {
  if (r.externalHosts.length) {
    mdLines.push(`### ${r.path} — hosts externos`, '', r.externalHosts.map((h) => `- \`${h}\``).join('\n'), '');
  }
  if (r.forbiddenEndpointRequests.length) {
    mdLines.push(`### ${r.path} — peticiones prohibidas`, '');
    for (const req of r.forbiddenEndpointRequests) {
      mdLines.push(`- ${req.method} ${req.url}`);
    }
    mdLines.push('');
  }
}
writeFileSync(OUT_MD, `${mdLines.join('\n')}\n`);

// eslint-disable-next-line no-console
console.log(JSON.stringify(summary.totals, null, 2));
if (summary.totals.forbiddenEndpoint > 0) {
  process.exitCode = 1;
}