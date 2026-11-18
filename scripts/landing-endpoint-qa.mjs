#!/usr/bin/env node
/**
 * QA landings: 0 endpoint en HTML, recursos link/script/img 200.
 */
const BASE = (process.env.BASE_URL || 'https://playfulagency.com').replace(/\/$/, '');
const PATHS = [
  '/agencia-e-commerce',
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
  '/agencia-ux-ui',
  '/seo-vigo',
];

function extractAssetUrls(html, base) {
  const urls = new Set();
  const patterns = [
    /<link[^>]+href=["']([^"']+)["']/gi,
    /<script[^>]+src=["']([^"']+)["']/gi,
    /<img[^>]+src=["']([^"']+)["']/gi,
  ];
  for (const re of patterns) {
    for (const m of html.matchAll(re)) {
      let u = m[1].split(/[\s,]/)[0];
      if (!u || u.startsWith('data:')) continue;
      try {
        urls.add(new URL(u, base).href);
      } catch {
        /* skip */
      }
    }
  }
  return [...urls];
}

async function audit(pathname) {
  const pageUrl = `${BASE}${pathname}`;
  const res = await fetch(pageUrl, { headers: { accept: 'text/html' } });
  const html = await res.text();
  const endpointInHtml = (html.match(/endpoint\.playfulagency\.com/gi) || []).length;
  const assets = extractAssetUrls(html, pageUrl).filter(
    (u) => u.startsWith(BASE) && (u.includes('/wp-static') || u.includes('/wp-media')),
  );
  const bad = [];
  for (const u of assets) {
    const ar = await fetch(u, { method: 'HEAD' });
    if (ar.status >= 400) bad.push({ url: u, status: ar.status });
  }
  return {
    path: pathname,
    pageStatus: res.status,
    endpointInHtml,
    wpAssetsChecked: assets.length,
    badAssets: bad.slice(0, 10),
    badCount: bad.length,
    ok: res.status === 200 && endpointInHtml === 0 && bad.length === 0,
  };
}

const out = { base: BASE, landings: [] };
for (const p of PATHS) out.landings.push(await audit(p));
out.pass = out.landings.filter((x) => x.ok).length;
out.fail = out.landings.length - out.pass;
console.log(JSON.stringify(out, null, 2));
process.exitCode = out.fail ? 1 : 0;