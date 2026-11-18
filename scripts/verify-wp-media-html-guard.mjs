#!/usr/bin/env node
/**
 * HTML guard: sin endpoint, sin /wp-content/ crudo en src|href, next/image localPatterns,
 * y todo /wp-media referenciado existe en public/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLAYFUL_QA_UA, withQaPathname, paceLiveQa } from '../lib/qa/live-fetch.mjs';
import { buildSitemapXml, getSitemapPaths } from '../utils/apex-sitemap.ts';
import { pathMatchesNextImageLocalPattern } from '../lib/ci/next-image-local-patterns.mjs';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3456').replace(/\/$/, '');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WP_MEDIA_DIR = path.join(ROOT, 'public', 'wp-media');

const FETCH_TIMEOUT_MS = Number(process.env.WP_MEDIA_GUARD_FETCH_MS || 12_000);
const ASSET_FETCH_CONCURRENCY = Number(process.env.WP_MEDIA_GUARD_ASSET_CONCURRENCY || 4);

const EXTRA_PATHS = [
  '/',
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
  '/agencia-e-commerce',
  '/marketing-internacional',
  '/agencia-ux-ui',
  '/casos-de-exito',
  '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  '/blog',
  '/podcast',
];
const PATHS = [...new Set([...getSitemapPaths(), ...EXTRA_PATHS])].sort((a, b) =>
  a.localeCompare(b),
);

const FORBIDDEN_RE =
  /endpoint\.playfulagency\.com|old\.playfulagency\.com|crear\.endpoint\.playfulagency\.com|\/\/i[0-2]\.wp\.com\b|i[0-2]\.wp\.com\//gi;
const EXTERNAL_WP_RUNTIME_RE =
  /https?:\/\/[^"'\s)]+(?:\/wp-json|\/wp-includes)\b|https?:\/\/[^"'\s)]*(?:endpoint|old)\.playfulagency\.com/gi;
const WP_MEDIA_REF_RE = /\/wp-media\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;
const WTI_PIXEL_RE = /<img\b[^>]*(?:\bwti-pixel\b|wti-like-post\/images\/pixel\.gif)[^>]*>/i;

const ATTR_VALUE_RE = /(?:src|href)\s*=\s*(["'])([^"']+)\1/gi;
const RAW_WP_CONTENT_VALUE_RE =
  /^(?:https?:\/\/(?:www\.)?playfulagency\.com)?\/wp-content\//;

const OPTIN_RE = /(?:href|src)\s*=\s*(["'])(?:https?:\/\/(?:www\.)?playfulagency\.com)?\/optin1631114756459\/?\1/i;

function decodeHtmlAttr(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&#0*38;/g, '&')
    .replace(/&quot;/g, '"');
}

function forbiddenRawWpContentAttrs(html) {
  const hits = [];
  for (const m of html.matchAll(ATTR_VALUE_RE)) {
    const value = decodeHtmlAttr(m[2]);
    if (value.includes('/wp-static/')) continue;
    if (RAW_WP_CONTENT_VALUE_RE.test(value)) hits.push(value);
  }
  return hits;
}

function invalidNextImageLocalUrls(html) {
  const bad = [];
  const re = /(?:src|srcSet)\s*=\s*(["'])(\/_next\/image\?[^"']+)\1/gi;
  for (const m of html.matchAll(re)) {
    const raw = decodeHtmlAttr(m[2]);
    try {
      const u = new URL(raw, BASE);
      const target = u.searchParams.get('url');
      if (!target) continue;
      const decoded = decodeURIComponent(target);
      if (!decoded.startsWith('/')) continue;
      if (!pathMatchesNextImageLocalPattern(decoded)) {
        bad.push(decoded);
      }
    } catch {
      /* skip malformed */
    }
  }
  return [...new Set(bad)];
}

async function fetchWithTimeout(url, init = {}) {
  await paceLiveQa();
  const res = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: {
      'user-agent': PLAYFUL_QA_UA,
      ...(init.headers || {}),
    },
  });
  return res;
}

async function fetchHtml(pathname) {
  const res = await fetchWithTimeout(new URL(withQaPathname(pathname), BASE), {
    redirect: 'manual',
    headers: { accept: 'text/html' },
  });
  if (res.status >= 500) throw new Error(`${pathname} returned ${res.status}`);
  const html = await res.text();
  if (res.status >= 400) throw new Error(`${pathname} returned ${res.status}`);
  return html;
}

async function fetchText(url) {
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`${url} returned ${res.status}`);
  return res.text();
}

/** Mismas reglas que el guard original, sin bundles `/_next/` (falsos positivos en minificado). */
function linkedAssetUrls(html) {
  const out = [];
  const re = /(?:href|src)\s*=\s*(["'])([^"']+)\1/gi;
  for (const m of html.matchAll(re)) {
    const value = decodeHtmlAttr(m[2]);
    if (value.includes('/_next/')) continue;
    if (
      /\.(?:css|js)(?:\?|$)/i.test(value) ||
      value.includes('/wp-static/') ||
      value.includes('/wp-media/')
    ) {
      out.push(value);
    }
  }
  return out;
}

function resolveSameOriginAsset(href) {
  try {
    const abs = new URL(href, BASE);
    if (abs.origin !== new URL(BASE).origin) return null;
    return abs.href;
  } catch {
    return null;
  }
}

function forbiddenRuntimeRefs(text) {
  return [...text.matchAll(EXTERNAL_WP_RUNTIME_RE)].length;
}

function missingWpMediaFiles(html) {
  const missing = [];
  const seen = new Set();
  for (const match of html.matchAll(WP_MEDIA_REF_RE)) {
    const rel = match[0].split('?')[0];
    const decoded = decodeURIComponent(rel.replace(/^\/wp-media/, ''));
    if (seen.has(decoded)) continue;
    seen.add(decoded);
    const disk = path.join(WP_MEDIA_DIR, decoded.replace(/^\//, ''));
    if (!fs.existsSync(disk)) missing.push(rel);
  }
  return missing;
}

async function mapConcurrent(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function runner() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, () => runner());
  await Promise.all(runners);
  return results;
}

const results = [];
const globalAssetUrls = new Set();

for (const pathname of PATHS) {
  const html = await fetchHtml(pathname);
  const forbidden = [...html.matchAll(FORBIDDEN_RE)].length;
  const missing = missingWpMediaFiles(html);
  const rawWp = forbiddenRawWpContentAttrs(html);
  const badNextImage = invalidNextImageLocalUrls(html);
  const wtiPixel = WTI_PIXEL_RE.test(html);
  const optin = OPTIN_RE.test(html);

  for (const href of linkedAssetUrls(html)) {
    const abs = resolveSameOriginAsset(href);
    if (abs) globalAssetUrls.add(abs);
  }

  const ok =
    forbidden === 0 &&
    missing.length === 0 &&
    rawWp.length === 0 &&
    badNextImage.length === 0 &&
    !wtiPixel &&
    !optin;
  results.push({
    path: pathname,
    forbiddenMatches: forbidden,
    rawWpContentAttrs: rawWp.slice(0, 3),
    rawWpContentCount: rawWp.length,
    invalidNextImageLocal: badNextImage.slice(0, 3),
    invalidNextImageCount: badNextImage.length,
    wtiPixelInHtml: wtiPixel,
    optinHref: optin,
    missingWpMedia: missing.slice(0, 5),
    missingCount: missing.length,
    ok,
  });
}

const assetList = [...globalAssetUrls].sort();
const assetScanResults = await mapConcurrent(assetList, ASSET_FETCH_CONCURRENCY, async (url) => {
  try {
    const body = await fetchText(url);
    const hits = forbiddenRuntimeRefs(body);
    return { url, hits, error: null };
  } catch (error) {
    return {
      url,
      hits: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
});

const badAssets = assetScanResults.filter((row) => row.hits > 0);
const servedAssetForbidden = badAssets.reduce((sum, row) => sum + row.hits, 0);
const pageFailures = results.filter((row) => !row.ok).length;
const assetFailures = servedAssetForbidden > 0 ? 1 : 0;
const fail = pageFailures + assetFailures;

const summary = {
  base: BASE,
  sitemapPathCount: PATHS.length,
  servedAssetsScanned: assetList.length,
  servedAssetConcurrency: ASSET_FETCH_CONCURRENCY,
  fetchTimeoutMs: FETCH_TIMEOUT_MS,
  servedAssetForbiddenMatches: servedAssetForbidden,
  badServedAssets: badAssets.slice(0, 5),
  assetFetchErrors: assetScanResults.filter((row) => row.error).length,
  sitemapXmlLocs: (buildSitemapXml().match(/<loc>/g) || []).length,
  pass: results.length - pageFailures,
  fail,
  pageFailures,
  assetFailures,
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exitCode = fail ? 1 : 0;