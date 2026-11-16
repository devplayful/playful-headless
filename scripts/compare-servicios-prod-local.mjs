#!/usr/bin/env node
import { load } from 'cheerio';

const SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
  'agencia-e-commerce',
  'agencia-ux-ui',
  'agencia-shopify',
];

async function snapshot(origin) {
  const out = {};
  for (const slug of SLUGS) {
    const res = await fetch(`${origin}/${slug}`, { headers: { 'User-Agent': 'PlayfulQA/1.0' } });
    const html = await res.text();
    const $ = load(html);
    out[slug] = {
      status: res.status,
      title: $('title').first().text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      canonical: $('link[rel="canonical"]').attr('href') || '',
      h1: $('h1').first().text().replace(/\s+/g, ' ').trim(),
      h2Count: $('h2').length,
    };
  }
  return out;
}

const prod = await snapshot('https://playfulagency.com');
const local = await snapshot('http://127.0.0.1:3000');

const diffs = [];
for (const slug of SLUGS) {
  const p = prod[slug];
  const l = local[slug];
  for (const key of ['title', 'description', 'canonical', 'h1', 'h2Count']) {
    if (String(p[key]) !== String(l[key])) {
      diffs.push({ slug, field: key, prod: p[key], local: l[key] });
    }
  }
}

console.log(JSON.stringify({ diffs, note: 'local CMS_SERVICIOS_FROM_PAYLOAD=true sin DATABASE_URL: Payload no conecta y el HTML coincide con flag OFF' }, null, 2));
