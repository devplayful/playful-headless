/**
 * QA H6: 134 URLs — preview (?cms=1&qa=1) vs producción (?qa=1).
 *
 *   PREVIEW_BASE=https://….vercel.app \
 *   VERCEL_AUTOMATION_BYPASS_SECRET=… \
 *   node scripts/h6-qa-134-compare.mjs
 *
 * Salida: docs/payload/h6-qa-134.json, docs/payload/h6-qa-134.csv
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildH6QaPaths, cmsPreviewRewriteExpected } from './h6-qa-url-set.mjs';
import { paceLiveQa, PLAYFUL_QA_UA, withQaPathname } from '../lib/qa/live-fetch.mjs';

const PROD = 'https://playfulagency.com';
const PREVIEW_BASE = (process.env.PREVIEW_BASE || '').replace(/\/$/, '');
const root = dirname(fileURLToPath(import.meta.url));
const outDir = join(root, '..', 'docs', 'payload');

const extraHeaders = {};
if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
  extraHeaders['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  extraHeaders['x-vercel-set-bypass-cookie'] = 'true';
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractMeta(html, name) {
  const re = new RegExp(
    `<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']*)["']`,
    'i',
  );
  const m = html.match(re);
  if (m) return m[1].trim();
  const re2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+name=["']${name}["']`,
    'i',
  );
  return html.match(re2)?.[1]?.trim() || '';
}

function extractRobots(html) {
  return extractMeta(html, 'robots');
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i);
  return m ? m[1].trim() : '';
}

function extractTitle(html) {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() || '';
}

function extractH1s(html) {
  return [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) =>
    m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
  );
}

function extractImages(html) {
  const out = [];
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = /\ssrc=["']([^"']+)["']/i.exec(tag)?.[1] || '';
    const alt = /\salt=["']([^"']*)["']/i.exec(tag)?.[1] ?? '';
    if (!src || src.startsWith('data:')) continue;
    out.push({ src, alt });
  }
  return out;
}

function normalizeCanonical(url, path) {
  if (!url) return '';
  try {
    const u = new URL(url, PROD);
    if (u.hostname === 'playfulagency.com' || u.hostname === 'www.playfulagency.com') {
      return `${PROD}${path === '/' ? '/' : path}`;
    }
    return u.href;
  } catch {
    return url;
  }
}

function normalizeImgSrc(src, base) {
  try {
    const u = new URL(src, base);
    return u.pathname + (u.search || '');
  } catch {
    return src;
  }
}

function extractInternalLinks(html, baseOrigin) {
  const links = new Set();
  for (const m of html.matchAll(/\shref=["']([^"'#?]+[^"']*)["']/gi)) {
    let href = m[1].trim();
    if (!href || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    try {
      const u = new URL(href, baseOrigin);
      if (u.hostname !== 'playfulagency.com' && u.hostname !== 'www.playfulagency.com') continue;
      const path = u.pathname === '/' ? '/' : u.pathname.replace(/\/+$/, '') || '/';
      if (path.startsWith('/_next/') || path.startsWith('/api/')) continue;
      if (/\.[a-z0-9]{2,5}$/i.test(path)) continue;
      links.add(path);
    } catch {
      /* ignore */
    }
  }
  return [...links].sort();
}

function analyze(html, base, path) {
  const images = extractImages(html);
  const imgsNoAlt = images.filter((i) => !i.alt || !i.alt.trim()).length;
  return {
    title: extractTitle(html),
    description: extractMeta(html, 'description'),
    robots: extractRobots(html),
    canonical: normalizeCanonical(extractCanonical(html), path),
    h1: extractH1s(html),
    imageCount: images.length,
    imagesMissingAlt: imgsNoAlt,
    textLen: stripHtml(html).length,
    internalLinks: extractInternalLinks(html, base),
  };
}

function diffField(label, a, b) {
  if (JSON.stringify(a) === JSON.stringify(b)) return null;
  return `${label}: prod=${JSON.stringify(a)} preview=${JSON.stringify(b)}`;
}

function looksProtected(html, status) {
  return (
    status === 401
    || status === 403
    || (status >= 300 && status < 400 && /vercel\.com/i.test(html))
    || /Authentication Required|Protected by Vercel Authentication|vercel\.com\/login/i.test(html)
  );
}

async function fetchPage(base, path, { cms = false } = {}) {
  await paceLiveQa();
  const qaPath = withQaPathname(path);
  const url = new URL(qaPath, base);
  if (cms) url.searchParams.set('cms', '1');
  const res = await fetch(url.toString(), {
    redirect: 'follow',
    headers: {
      'user-agent': PLAYFUL_QA_UA,
      ...extraHeaders,
    },
  });
  const html = await res.text();
  return { status: res.status, html, finalUrl: res.url };
}

async function main() {
  mkdirSync(outDir, { recursive: true });
  const paths = buildH6QaPaths();
  const previewBlocked = { blocked: false, error: null };

  let previewProbe = null;
  if (PREVIEW_BASE) {
    previewProbe = await fetchPage(PREVIEW_BASE, '/nosotros', { cms: true });
    if (looksProtected(previewProbe.html, previewProbe.status)) {
      previewBlocked.blocked = true;
      previewBlocked.error = `HTTP ${previewProbe.status}: Protected by Vercel Authentication (sin VERCEL_AUTOMATION_BYPASS_SECRET ni MCP Vercel con acceso al equipo playful-agencys-projects)`;
    }
  }
  const rows = [];
  const allInternalLinks = new Set();

  for (const path of paths) {
    const prodRes = await fetchPage(PROD, path);
    const prod = analyze(prodRes.html, PROD, path);
    const row = {
      path,
      cmsRewrite: cmsPreviewRewriteExpected(path),
      prodStatus: prodRes.status,
      previewStatus: null,
      status: 'PENDING',
      diffs: [],
      brokenInternalLinks: [],
      prod,
    };

    if (prodRes.status !== 200 && path !== '/test-blog') {
      row.status = 'PROD_ERROR';
      row.diffs.push(`prod HTTP ${prodRes.status}`);
    }
    for (const link of prod.internalLinks) allInternalLinks.add(link);

    if (!PREVIEW_BASE) {
      row.status = row.status === 'PENDING' ? 'NO_PREVIEW_BASE' : row.status;
      row.diffs.push('PREVIEW_BASE no definido');
    } else if (previewBlocked.blocked) {
      row.status = row.status === 'PROD_ERROR' ? row.status : 'PREVIEW_BLOCKED';
      if (row.status === 'PREVIEW_BLOCKED') row.diffs.push(previewBlocked.error);
    } else {
      const prevRes = await fetchPage(PREVIEW_BASE, path, { cms: true });
      row.previewStatus = prevRes.status;
      if (looksProtected(prevRes.html, prevRes.status)) {
        row.status = 'PREVIEW_BLOCKED';
        row.diffs.push(previewBlocked.error);
      } else if (prevRes.status !== prodRes.status && !(prodRes.status === 200 && prevRes.status === 200)) {
        row.status = 'DIFF';
        row.diffs.push(`HTTP prod=${prodRes.status} preview=${prevRes.status}`);
      } else {
        const preview = analyze(prevRes.html, PREVIEW_BASE, path);
        const checks = [
          diffField('title', prod.title, preview.title),
          diffField('description', prod.description, preview.description),
          diffField('canonical', prod.canonical, preview.canonical),
          diffField('robots', prod.robots, preview.robots),
          diffField('h1', prod.h1, preview.h1),
          diffField('imageCount', prod.imageCount, preview.imageCount),
          diffField('imagesMissingAlt', prod.imagesMissingAlt, preview.imagesMissingAlt),
        ].filter(Boolean);
        row.diffs.push(...checks);
        row.status = checks.length ? 'DIFF' : 'OK';
        row.preview = preview;
      }
    }

    rows.push(row);
    process.stderr.write(`${path} → ${row.status}\n`);
  }

  const brokenInternal = new Map();
  for (const link of [...allInternalLinks].sort()) {
    if (!paths.includes(link) && !link.startsWith('/blog/') && !link.startsWith('/podcast/')) {
      continue;
    }
    const check = await fetchPage(PROD, link);
    if (check.status >= 400) brokenInternal.set(link, check.status);
  }
  for (const row of rows) {
    row.brokenInternalLinks = row.prod.internalLinks.filter((l) => brokenInternal.has(l));
  }

  const rollbackSamples = [];
  for (const sample of ['/', '/nosotros', '/politica-de-privacidad', '/agencia-seo']) {
    const plain = await fetchPage(PROD, sample);
    const cmsOnProd = await fetchPage(PROD, sample, { cms: true });
    rollbackSamples.push({
      path: sample,
      prodPlainStatus: plain.status,
      prodCms1Status: cmsOnProd.status,
      bodySame:
        plain.status === cmsOnProd.status
        && stripHtml(plain.html).slice(0, 500) === stripHtml(cmsOnProd.html).slice(0, 500),
    });
  }

  let previewRollback = null;
  if (PREVIEW_BASE && !previewBlocked.blocked) {
    const off = await fetchPage(PREVIEW_BASE, '/nosotros');
    const on = await fetchPage(PREVIEW_BASE, '/nosotros', { cms: true });
    previewRollback = {
      path: '/nosotros',
      withoutCmsStatus: off.status,
      withCmsStatus: on.status,
      withoutCmsMatchesProd:
        off.status === 200
        && stripHtml(off.html).slice(0, 800) === stripHtml(
          (await fetchPage(PROD, '/nosotros')).html,
        ).slice(0, 800),
    };
  }

  const summary = {
    urlCount: paths.length,
    ok: rows.filter((r) => r.status === 'OK').length,
    diff: rows.filter((r) => r.status === 'DIFF').length,
    previewBlocked: rows.filter((r) => r.status === 'PREVIEW_BLOCKED').length,
    prodError: rows.filter((r) => r.status === 'PROD_ERROR').length,
    noPreview: rows.filter((r) => r.status === 'NO_PREVIEW_BASE').length,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    prod: PROD,
    previewBase: PREVIEW_BASE || null,
    previewDeploymentNote:
      'PR #396 → https://playful-headless-git-cursor-pay-cbb685-playful-agencys-projects.vercel.app',
    previewAccess: previewBlocked,
    summary,
    rollback: { prodIgnoresCmsFlag: rollbackSamples, previewWithoutCms: previewRollback },
    rows,
  };

  writeFileSync(join(outDir, 'h6-qa-134.json'), `${JSON.stringify(report, null, 2)}\n`);

  const csvHeader =
    'path,cms_rewrite,prod_status,preview_status,status,diffs,broken_internal\n';
  const csvBody = rows
    .map((r) => {
      const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
      return [
        r.path,
        r.cmsRewrite || '',
        r.prodStatus,
        r.previewStatus ?? '',
        r.status,
        r.diffs.join(' | '),
        (r.brokenInternalLinks || []).join(' '),
      ]
        .map(esc)
        .join(',');
    })
    .join('\n');
  writeFileSync(join(outDir, 'h6-qa-134.csv'), csvHeader + csvBody + '\n');

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
