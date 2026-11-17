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

const EXTRA_PATHS = ['/blog', '/podcast'];
const PATHS = [...new Set([...getSitemapPaths(), ...EXTRA_PATHS])].sort((a, b) =>
  a.localeCompare(b),
);

const FORBIDDEN_RE =
  /endpoint\.playfulagency\.com|crear\.endpoint\.playfulagency\.com|\/\/i[0-2]\.wp\.com\b|i[0-2]\.wp\.com\//gi;
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
  const encodedRe = /%2Fimages%2F|%2Fcasos%2F/gi;
  if (encodedRe.test(html)) {
    for (const m of html.matchAll(/_next\/image\?url=([^&"'\\s]+)/gi)) {
      try {
        const decoded = decodeURIComponent(decodeHtmlAttr(m[1]));
        if (decoded.startsWith('/') && !pathMatchesNextImageLocalPattern(decoded)) {
          bad.push(decoded);
        }
      } catch {
        /* skip */
      }
    }
  }
  return [...new Set(bad)];
}

async function fetchHtml(pathname) {
  await paceLiveQa();
  const res = await fetch(new URL(withQaPathname(pathname), BASE), {
    redirect: 'manual',
    headers: { 'user-agent': PLAYFUL_QA_UA, accept: 'text/html' },
  });
  if (res.status >= 500) throw new Error(`${pathname} returned ${res.status}`);
  const html = await res.text();
  if (res.status >= 400) throw new Error(`${pathname} returned ${res.status}`);
  return html;
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

const results = [];
let fail = 0;
for (const pathname of PATHS) {
  const html = await fetchHtml(pathname);
  const forbidden = [...html.matchAll(FORBIDDEN_RE)].length;
  const missing = missingWpMediaFiles(html);
  const rawWp = forbiddenRawWpContentAttrs(html);
  const badNextImage = invalidNextImageLocalUrls(html);
  const wtiPixel = WTI_PIXEL_RE.test(html);
  const optin = OPTIN_RE.test(html);
  const ok =
    forbidden === 0 &&
    missing.length === 0 &&
    rawWp.length === 0 &&
    badNextImage.length === 0 &&
    !wtiPixel &&
    !optin;
  if (!ok) fail += 1;
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

const summary = {
  base: BASE,
  sitemapPathCount: PATHS.length,
  sitemapXmlLocs: (buildSitemapXml().match(/<loc>/g) || []).length,
  pass: results.length - fail,
  fail,
  results,
};
console.log(JSON.stringify(summary, null, 2));
process.exitCode = fail ? 1 : 0;