/**
 * Paridad H4: preview (?cms=1) vs producción — texto visible, imgs+alt, vídeos, JSON-LD, canonical.
 * Uso: PREVIEW_BASE=https://....vercel.app node scripts/paridad-h4-compare.mjs
 */
import { writeFileSync } from 'node:fs';
import { liveFetch, withQaUrl } from '../lib/qa/live-fetch.mjs';

const PROD = 'https://playfulagency.com';
const PREVIEW_BASE = (process.env.PREVIEW_BASE || '').replace(/\/$/, '');

const PATHS = [
  '/casos-de-exito',
  '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
  '/casos-de-exito/soytechno-ecommerce-venezuela',
];

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
    const alt = /\salt=["']([^"']*)["']/i.exec(tag)?.[1] ?? null;
    if (!src || src.startsWith('data:')) continue;
    out.push({ src, alt: alt ?? '' });
  }
  return out.sort((a, b) => a.src.localeCompare(b.src));
}

function extractVideos(html) {
  const out = new Set();
  for (const tag of html.match(/<video\b[^>]*>[\s\S]*?<\/video>/gi) || []) {
    const src = /\ssrc=["']([^"']+)["']/i.exec(tag)?.[1];
    if (src) out.add(src);
    for (const s of tag.matchAll(/<source[^>]+src=["']([^"']+)["']/gi)) {
      out.add(s[1]);
    }
  }
  for (const s of html.matchAll(/<source[^>]+src=["']([^"']+\.mp4[^"']*)["']/gi)) {
    out.add(s[1]);
  }
  return [...out].sort();
}

function extractJsonLd(html) {
  return [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => m[1].trim())
    .map((raw) => {
      try {
        return JSON.stringify(JSON.parse(raw));
      } catch {
        return raw.replace(/\s+/g, ' ').trim();
      }
    })
    .sort();
}

function normalizePreviewCanonical(url, path) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return `${PROD}${path}`;
  } catch {
    return url;
  }
}

function normalizeImageSrc(src, base) {
  try {
    const u = new URL(src, base);
    if (u.hostname.includes('vercel.app') || u.hostname === 'playfulagency.com') {
      return u.pathname + (u.search || '');
    }
    return u.href;
  } catch {
    return src;
  }
}

function diffArrays(label, a, b) {
  const diffs = [];
  if (a.length !== b.length) {
    diffs.push(`${label}: count prod=${a.length} preview=${b.length}`);
  }
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    const left = a[i];
    const right = b[i];
    if (JSON.stringify(left) !== JSON.stringify(right)) {
      diffs.push(`${label}[${i}]: prod=${JSON.stringify(left)} preview=${JSON.stringify(right)}`);
    }
  }
  return diffs;
}

async function fetchHtml(base, path, cms) {
  const url = new URL(path, base);
  if (cms) url.searchParams.set('cms', '1');
  const res = await liveFetch(url.toString());
  const html = await res.text();
  if (!res.ok) throw new Error(`${url} HTTP ${res.status}`);
  return html;
}

function analyze(html, base, path) {
  const visible = stripHtml(html);
  return {
    title: extractTitle(html),
    metaDescription: extractMeta(html, 'description'),
    canonical: extractCanonical(html),
    h1s: extractH1s(html),
    visibleTextLength: visible.length,
    visibleTextSample: visible.slice(0, 500),
    images: extractImages(html).map((img) => ({
      src: normalizeImageSrc(img.src, base),
      alt: img.alt,
    })),
    videos: extractVideos(html),
    jsonLd: extractJsonLd(html),
  };
}

async function comparePath(path) {
  const prodHtml = await fetchHtml(PROD, path, false);
  if (!PREVIEW_BASE) {
    return { path, skipped: true, reason: 'PREVIEW_BASE no definido' };
  }
  const previewHtml = await fetchHtml(PREVIEW_BASE, path, true);
  const prod = analyze(prodHtml, PROD, path);
  const preview = analyze(previewHtml, PREVIEW_BASE, path);
  const diffs = [];

  if (prod.title !== preview.title) {
    diffs.push(`title: prod="${prod.title}" preview="${preview.title}"`);
  }
  if (prod.metaDescription !== preview.metaDescription) {
    diffs.push(
      `meta description: prod="${prod.metaDescription.slice(0, 80)}…" preview="${preview.metaDescription.slice(0, 80)}…"`,
    );
  }
  const prodCanon = prod.canonical;
  const previewCanon = normalizePreviewCanonical(preview.canonical, path);
  if (prodCanon !== previewCanon) {
    diffs.push(`canonical: prod="${prodCanon}" preview="${preview.canonical}" (norm="${previewCanon}")`);
  }
  diffs.push(...diffArrays('h1', prod.h1s, preview.h1s));

  const prodVisible = stripHtml(prodHtml);
  const prevVisible = stripHtml(previewHtml);
  if (prodVisible !== prevVisible) {
    const prodLen = prodVisible.length;
    const prevLen = prevVisible.length;
    if (Math.abs(prodLen - prevLen) > 40) {
      diffs.push(`visible text length: prod=${prodLen} preview=${prevLen}`);
    }
    for (let i = 0; i < Math.min(prodVisible.length, prevVisible.length); i += 1) {
      if (prodVisible[i] !== prevVisible[i]) {
        diffs.push(
          `visible text first diff at ${i}: prod="${prodVisible.slice(i, i + 60)}" preview="${prevVisible.slice(i, i + 60)}"`,
        );
        break;
      }
    }
  }

  diffs.push(...diffArrays('image', prod.images, preview.images));
  diffs.push(...diffArrays('video', prod.videos, preview.videos));
  diffs.push(...diffArrays('jsonLd', prod.jsonLd, preview.jsonLd));

  return { path, diffs, prod, preview };
}

async function main() {
  const results = [];
  for (const path of PATHS) {
    results.push(await comparePath(path));
  }
  const report = {
    generatedAt: new Date().toISOString(),
    prod: PROD,
    preview: PREVIEW_BASE || null,
    previewUrls: PREVIEW_BASE
      ? PATHS.map((p) => withQaUrl(new URL(p, PREVIEW_BASE).toString() + (p.includes('?') ? '&' : '?') + 'cms=1'))
      : [],
    results: results.map((r) => ({
      path: r.path,
      diffCount: r.diffs?.length ?? 0,
      diffs: r.diffs ?? [],
      skipped: r.skipped,
    })),
    totalDiffs: results.reduce((n, r) => n + (r.diffs?.length ?? 0), 0),
  };
  writeFileSync('docs/paridad-h4-compare.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ totalDiffs: report.totalDiffs, results: report.results }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
