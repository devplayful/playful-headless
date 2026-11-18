#!/usr/bin/env node
/**
 * Diagnóstico prod: URLs reales de endpoint en las 6 landings Elementor.
 */
import { load } from 'cheerio';

const BASE = 'https://playfulagency.com';
const PATHS = [
  '/agencia-e-commerce',
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
  '/agencia-ux-ui',
  '/seo-vigo',
];

const ATTR_RES = [
  [/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["']/gi, 'stylesheet'],
  [/<script[^>]+src=["']([^"']+)["']/gi, 'script'],
  [/<img[^>]+src=["']([^"']+)["']/gi, 'img'],
  [/<source[^>]+srcset=["']([^"']+)["']/gi, 'srcset'],
  [/<link[^>]+href=["']([^"']+\.(?:woff2?|ttf|otf))["']/gi, 'font'],
];

function inRscOnly(html, url) {
  const idx = html.indexOf(url);
  if (idx < 0) return false;
  const before = html.slice(Math.max(0, idx - 80), idx);
  return before.includes('__next_f.push') || before.includes('self.__next_f');
}

function splitUrls(raw) {
  return raw.split(/,\s*/).map((p) => p.trim().split(/\s+/)[0]).filter(Boolean);
}

async function analyze(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers: { accept: 'text/html' } });
  const html = await res.text();
  const domUrls = new Map();
  for (const [re, kind] of ATTR_RES) {
    for (const m of html.matchAll(re)) {
      const raw = m[1];
      for (const u of splitUrls(raw)) {
        if (!u.includes('endpoint.playfulagency.com')) continue;
        const key = `${kind}:${u}`;
        const rsc = inRscOnly(html, u);
        domUrls.set(key, { url: u, kind, rscOnly: rsc });
      }
    }
  }
  const allEndpoint = [...html.matchAll(/https?:\/\/endpoint\.playfulagency\.com[^\s"'<>\\)]+/g)].map(
    (m) => m[0],
  );
  const rscEndpoint = new Set(allEndpoint.filter((u) => inRscOnly(html, u)));
  const domReal = [...domUrls.values()].filter((x) => !x.rscOnly);
  return {
    path: pathname,
    status: res.status,
    domEndpointCount: domReal.length,
    domEndpoint: domReal,
    rscEndpointMentions: rscEndpoint.size,
    sampleRsc: [...rscEndpoint].slice(0, 3),
  };
}

const uploadInDom = [];
for (const pathname of PATHS) {
  const html = await (await fetch(`${BASE}${pathname}`)).text();
  for (const m of html.matchAll(/\b(src|href)=["'](\/wp-content\/uploads\/[^"']+)["']/gi)) {
    uploadInDom.push({ path: pathname, attr: m[1], url: m[2] });
  }
}

const sampleUpload =
  '/wp-content/uploads/2022/07/E8_T2_Podcast-Bendita-Web.jpg';
const uploadProbe = await fetch(`${BASE}${sampleUpload}`, { redirect: 'manual' });

const reports = [];
for (const p of PATHS) reports.push(await analyze(p));

console.log(
  JSON.stringify(
    {
      prodBase: BASE,
      landings: reports,
      wpContentUploadsInDomAttrs: uploadInDom.slice(0, 20),
      wpContentUploadsInDomCount: uploadInDom.length,
      probe: { url: sampleUpload, status: uploadProbe.status },
      codeSources: [
        'components/ElementorPageContent.tsx — stylesheet href sin rewrite si !CMS_BLOB_IMAGES',
        'lib/elementor-stylesheet-urls.ts — URLs base endpoint',
        'lib/wp-endpoint-surface.ts — rewrite solo con blob en preview',
        'services/wordpress.ts — sanitizeWpPayload strip endpoint en RSC',
      ],
    },
    null,
    2,
  ),
);