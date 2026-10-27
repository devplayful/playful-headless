#!/usr/bin/env node
/**
 * Serial Lighthouse + axe-core QA.
 * Rules: ?qa=1, UA PlayfulQA/1.0 (axe/fetch), ≥1 req/s, never parallel.
 * Lighthouse keeps its own emulated UA (see tests/live-qa-fetch.test.mjs)
 * but still hits withQaUrl.
 *
 * Usage:
 *   node scripts/qa-lighthouse-a11y.mjs --origin https://playfulagency.com --out /tmp/qa-sprint/baseline
 *   node scripts/qa-lighthouse-a11y.mjs --origin https://preview --out /tmp/qa-sprint/preview --axe-only
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import {
  PLAYFUL_QA_UA,
  liveFetch,
  paceLiveQa,
  withQaUrl,
} from '../lib/qa/live-fetch.mjs';

const require = createRequire(import.meta.url);
const HERE = dirname(fileURLToPath(import.meta.url));

const SITEMAP_STATIC_PATHS = [
  '/',
  '/nosotros',
  '/contactar-agencia-de-marketing-digital',
  '/agencia-e-commerce',
  '/agencia-shopify',
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
  '/agencia-ux-ui',
  '/casos-de-exito',
  '/casos-de-exito/soytechno-ecommerce-venezuela',
  '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
  '/blog',
  '/politica-de-privacidad',
];

const SITEMAP_PODCAST_PATHS = [
  '/podcast/comenzando-de-cero-es-necesaria-una-pagina-web',
  '/podcast/costumer-relationship-managenment-que-es-por-que-lo-necesito',
  '/podcast/el-meollo-del-asunto-que-es-el-seo',
  '/podcast/el-punto-clave-las-keywords',
  '/podcast/episodio-1-trafico-organico-vs-trafico-pago',
  '/podcast/episodio-2-el-metaverso-que-es-cuales-son-sus-caracteristicas',
  '/podcast/episodio-4-accesibilidad-web-haces-un-sitio-web-para-todos',
  '/podcast/episodio-5-inteligencia-artificial-y-seo-optimizamos-a-otro-nivel',
  '/podcast/episodio-6-plan-de-contenidos-que-es-por-que-te-hace-vender-mas',
  '/podcast/episodio-7-transformacion-digital-aplicala-a-tu-empresa',
  '/podcast/episodio-8-seo-para-e-commerce',
  '/podcast/es-hora-de-revisar-es-momento-de-una-auditoria',
  '/podcast/la-respuesta-a-la-famosa-pregunta-que-funciona',
  '/podcast/llegamos-al-final-nos-toca-medir',
  '/podcast/lo-que-hacemos-impacta-diseno-ux-en-el-seo',
  '/podcast/lo-que-ven-tus-usuarios-tu-pagina-es-linda-o-funcional',
  '/podcast/sin-miedo-a-nada-nos-toca-optimizar-la-pagina-web',
  '/podcast/tocando-fibras-paginas-web-vs-redes-sociales',
];

const APP_STATIC_EXTRA = [
  '/reunion-playful',
  '/gracias',
  '/links',
  '/firma/alejandra-da-costa',
  '/podcast',
];

const SERVICE_PATHS = [
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
  '/agencia-e-commerce',
  '/agencia-shopify',
  '/agencia-ux-ui',
  '/marketing-internacional',
  '/seo-expertos',
  '/seo-vigo',
];

const BLOG_SAMPLE = [
  '/blog/otros/premios-cima-2026-soytechno-playful',
  '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/blog/tecnologia/cashea-para-comercios',
  '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
  '/blog/seo/auditoria-seo-que-es-como-se-hace',
  '/blog/seo/chat-gpt-puede-mejorar-el-seo-de-una-pagina-web',
  '/blog/mas-vistos/los-5-problemas-de-e-commerce',
  '/blog/mas-vistos/que-es-una-agencia-de-sem',
  '/blog/email-marketing/estrategia-de-email-marketing',
  '/blog/pautas-digitales/storytelling-en-el-marketing-digital',
];

const CHROME = process.env.CHROME_PATH || '/usr/bin/google-chrome';

function parseArgs(argv) {
  const out = {
    origin: 'https://playfulagency.com',
    outDir: '/tmp/qa-sprint-20261027/baseline',
    axeOnly: false,
    lighthouseOnly: false,
    skipExisting: true,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--origin') out.origin = argv[++i];
    else if (arg === '--out') out.outDir = argv[++i];
    else if (arg === '--axe-only') out.axeOnly = true;
    else if (arg === '--lighthouse-only') out.lighthouseOnly = true;
    else if (arg === '--no-resume') out.skipExisting = false;
  }
  return out;
}

function uniquePaths(paths) {
  const seen = new Set();
  const list = [];
  for (const path of paths) {
    const normalized = path === '/' ? '/' : path.replace(/\/+$/, '');
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    list.push(normalized);
  }
  return list;
}

export function inventoryPaths() {
  const casos = SITEMAP_STATIC_PATHS.filter((path) => path.startsWith('/casos-de-exito'));
  return uniquePaths([
    ...SITEMAP_STATIC_PATHS.filter((path) => !path.startsWith('/blog/') || path === '/blog'),
    ...APP_STATIC_EXTRA,
    ...SERVICE_PATHS,
    ...casos,
    ...SITEMAP_PODCAST_PATHS,
    '/blog',
    ...BLOG_SAMPLE,
  ]);
}

export function isSampledBlogPath(path) {
  return path === '/blog' || BLOG_SAMPLE.includes(path);
}

function pathFromLoc(loc) {
  try {
    const url = new URL(loc);
    return url.pathname === '/' ? '/' : url.pathname.replace(/\/+$/, '');
  } catch {
    return loc;
  }
}

async function fetchProductionSitemapPaths(origin) {
  const res = await liveFetch(`${origin}/sitemap.xml`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => pathFromLoc(m[1]));
  return { status: res.status, paths: uniquePaths(locs) };
}

function resolveTool(name, extraRoots = []) {
  const roots = [
    ...extraRoots,
    '/tmp/playful-qa-tools/node_modules',
    join(HERE, '../node_modules'),
  ];
  for (const root of roots) {
    try {
      return require.resolve(name, { paths: [root] });
    } catch {
      /* keep looking */
    }
  }
  return null;
}

function score100(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Math.round(value * 100);
}

function runLighthouse(url, formFactor, reportPath) {
  const mobile = formFactor === 'mobile';
  const args = [
    withQaUrl(url),
    '--quiet',
    `--chrome-flags=--headless=new --no-sandbox --disable-gpu --user-data-dir=/tmp/lh-chrome-${formFactor}`,
    '--only-categories=performance,accessibility,best-practices,seo',
    `--form-factor=${formFactor}`,
    `--screenEmulation.mobile=${mobile ? 'true' : 'false'}`,
    '--output=json',
    `--output-path=${reportPath}`,
    `--chrome-path=${CHROME}`,
  ];
  if (!mobile) {
    args.push('--screenEmulation.width=1350', '--screenEmulation.height=940', '--screenEmulation.deviceScaleFactor=1');
  }
  const result = spawnSync('npx', ['--yes', 'lighthouse@12', ...args], {
    encoding: 'utf8',
    timeout: 180_000,
  });
  if (result.status !== 0) {
    throw new Error(`lighthouse ${formFactor} failed for ${url}: ${result.stderr || result.stdout}`);
  }
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  return {
    performance: score100(report.categories.performance?.score),
    accessibility: score100(report.categories.accessibility?.score),
    bestPractices: score100(report.categories['best-practices']?.score),
    seo: score100(report.categories.seo?.score),
    lcp: report.audits['largest-contentful-paint']?.numericValue ?? null,
    tbt: report.audits['total-blocking-time']?.numericValue ?? null,
    cls: report.audits['cumulative-layout-shift']?.numericValue ?? null,
    failedAudits: Object.entries(report.audits)
      .filter(([, audit]) => audit.score !== null && audit.score < 1 && audit.scoreDisplayMode !== 'informative')
      .map(([id, audit]) => ({ id, title: audit.title, score: audit.score })),
  };
}

async function runAxe(url, axeSource) {
  const puppeteerPath = resolveTool('puppeteer-core', ['/tmp/playful-qa-tools/node_modules']);
  if (!puppeteerPath) throw new Error('puppeteer-core is not installed in /tmp/playful-qa-tools');
  const puppeteer = require(puppeteerPath);
  await paceLiveQa();
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setUserAgent(PLAYFUL_QA_UA);
    page.setDefaultNavigationTimeout(90_000);
    await page.goto(withQaUrl(url), { waitUntil: 'networkidle2' });
    await page.addScriptTag({ content: axeSource });
    const results = await page.evaluate(async () => {
      // eslint-disable-next-line no-undef
      const axeResults = await axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      });
      return {
        violations: axeResults.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            html: n.html.slice(0, 280),
            failureSummary: n.failureSummary,
          })),
        })),
        passes: axeResults.passes.length,
        incomplete: axeResults.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      };
    });
    return results;
  } finally {
    await browser.close();
  }
}

function summarize(rows) {
  const withLh = rows.filter((r) => r.lighthouse?.mobile && r.lighthouse?.desktop);
  const avg = (pick) => {
    if (!withLh.length) return null;
    return Math.round(withLh.reduce((sum, row) => sum + pick(row), 0) / withLh.length);
  };
  const axeCount = rows.reduce((sum, row) => (
    sum + (row.axe?.violations || []).reduce((inner, v) => inner + v.nodes.length, 0)
  ), 0);
  return {
    routes: rows.length,
    axeViolationNodes: axeCount,
    axeViolationRules: rows.reduce((sum, row) => sum + (row.axe?.violations?.length || 0), 0),
    averages: {
      mobile: {
        performance: avg((r) => r.lighthouse.mobile.performance),
        accessibility: avg((r) => r.lighthouse.mobile.accessibility),
        bestPractices: avg((r) => r.lighthouse.mobile.bestPractices),
        seo: avg((r) => r.lighthouse.mobile.seo),
      },
      desktop: {
        performance: avg((r) => r.lighthouse.desktop.performance),
        accessibility: avg((r) => r.lighthouse.desktop.accessibility),
        bestPractices: avg((r) => r.lighthouse.desktop.bestPractices),
        seo: avg((r) => r.lighthouse.desktop.seo),
      },
    },
  };
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  mkdirSync(opts.outDir, { recursive: true });
  const axePath = resolveTool('axe-core/axe.min.js', ['/tmp/playful-qa-tools/node_modules']);
  if (!opts.lighthouseOnly && !axePath) {
    throw new Error('Install axe-core in /tmp/playful-qa-tools first');
  }
  const axeSource = axePath ? readFileSync(axePath, 'utf8') : '';

  const inventory = inventoryPaths();
  let sitemap = { status: null, paths: [] };
  try {
    sitemap = await fetchProductionSitemapPaths(opts.origin);
  } catch (error) {
    sitemap = { status: 'error', error: String(error), paths: [] };
  }

  const resultPath = join(opts.outDir, 'results.json');
  const existing = opts.skipExisting && existsSync(resultPath)
    ? JSON.parse(readFileSync(resultPath, 'utf8'))
    : { rows: [] };
  const done = new Map((existing.rows || []).map((row) => [row.path, row]));

  const rows = [];
  for (const path of inventory) {
    const prev = done.get(path);
    const needAxe = !opts.lighthouseOnly && !(opts.skipExisting && prev?.axe);
    const needLh = !opts.axeOnly && !(opts.skipExisting && prev?.lighthouse?.mobile && prev?.lighthouse?.desktop);
    if (!needAxe && !needLh && prev) {
      rows.push(prev);
      console.log(`skip ${path}`);
      continue;
    }

    const url = `${opts.origin}${path === '/' ? '/' : path}`;
    const row = prev ? { ...prev } : { path, url };
    console.log(`audit ${path}`);

    if (needAxe) {
      try {
        row.axe = await runAxe(url, axeSource);
        row.axeError = null;
      } catch (error) {
        row.axeError = String(error);
        row.axe = { violations: [], passes: 0, incomplete: [] };
        console.error(`axe failed ${path}: ${error}`);
      }
    }

    if (needLh) {
      row.lighthouse = row.lighthouse || {};
      for (const form of ['mobile', 'desktop']) {
        if (opts.skipExisting && row.lighthouse[form]) continue;
        await paceLiveQa();
        const reportPath = join(opts.outDir, `lh-${path.replace(/\W+/g, '_') || 'home'}-${form}.json`);
        try {
          row.lighthouse[form] = runLighthouse(url, form, reportPath);
        } catch (error) {
          row.lighthouse[form] = { error: String(error) };
          console.error(`lighthouse ${form} failed ${path}: ${error}`);
        }
      }
    }

    rows.push(row);
    const flushed = [
      ...rows,
      ...[...done.values()].filter((saved) => !rows.some((current) => current.path === saved.path)),
    ];
    writeFileSync(resultPath, JSON.stringify({
      origin: opts.origin,
      generatedAt: new Date().toISOString(),
      inventory,
      sitemap,
      blogSample: BLOG_SAMPLE,
      rows: flushed,
      summary: summarize(flushed),
    }, null, 2));
  }

  const payload = {
    origin: opts.origin,
    generatedAt: new Date().toISOString(),
    inventory,
    sitemap,
    blogSample: BLOG_SAMPLE,
    unusedSitemapBlog: [],
    rows,
    summary: summarize(rows),
  };
  writeFileSync(resultPath, JSON.stringify(payload, null, 2));
  writeFileSync(join(opts.outDir, 'summary.json'), JSON.stringify(payload.summary, null, 2));
  console.log(JSON.stringify(payload.summary, null, 2));
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
