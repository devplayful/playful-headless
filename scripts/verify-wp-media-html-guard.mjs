#!/usr/bin/env node
/**
 * HTML guard: sin endpoint/i*.wp.com en rutas A/B/C; todo /wp-media existe en public/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLAYFUL_QA_UA, withQaPathname, paceLiveQa } from '../lib/qa/live-fetch.mjs';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3456').replace(/\/$/, '');
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const WP_MEDIA_DIR = path.join(ROOT, 'public', 'wp-media');

const PATHS = [
  '/blog',
  '/blog/seo/aprende-todo-sobre-el-seo',
  '/blog/otros/premios-cima-2026-soytechno-playful',
  '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
  '/blog/mas-vistos/los-5-problemas-de-e-commerce',
  '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad',
  '/podcast',
  '/nosotros',
  '/',
];

const FORBIDDEN_RE =
  /endpoint\.playfulagency\.com|crear\.endpoint\.playfulagency\.com|\/\/i[0-2]\.wp\.com\b|i[0-2]\.wp\.com\//gi;
const WP_MEDIA_REF_RE = /\/wp-media\/wp-content\/uploads\/[^\s"'<>\\)]+/gi;

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
  const ok = forbidden === 0 && missing.length === 0;
  if (!ok) fail += 1;
  results.push({ path: pathname, forbiddenMatches: forbidden, missingWpMedia: missing.slice(0, 5), missingCount: missing.length, ok });
}

const summary = { base: BASE, pass: results.length - fail, fail, results };
console.log(JSON.stringify(summary, null, 2));
process.exitCode = fail ? 1 : 0;