#!/usr/bin/env node
/**
 * Extrae title, meta, canonical, H1, H2 y enlaces internos de una landing de servicio.
 * Uso: node scripts/compare-servicio-html.mjs https://playfulagency.com/agencia-seo
 */
import { load } from 'cheerio';

const url = process.argv[2];
if (!url) {
  console.error('Usage: node scripts/compare-servicio-html.mjs <url>');
  process.exit(1);
}

const res = await fetch(url, {
  headers: { 'User-Agent': 'PlayfulQA/1.0' },
});
const html = await res.text();
const $ = load(html);
const title = $('title').first().text().trim();
const description = $('meta[name="description"]').attr('content') || '';
const canonical = $('link[rel="canonical"]').attr('href') || '';
const h1 = $('h1').first().text().replace(/\s+/g, ' ').trim();
const h2 = $('h2')
  .map((_, el) => $(el).text().replace(/\s+/g, ' ').trim())
  .get()
  .filter(Boolean);
const links = $('a[href^="/"]')
  .map((_, el) => $(el).attr('href'))
  .get()
  .filter(Boolean);

console.log(
  JSON.stringify(
    {
      url,
      status: res.status,
      title,
      description,
      canonical,
      h1,
      h2Count: h2.length,
      h2Sample: h2.slice(0, 8),
      internalLinkCount: new Set(links).size,
    },
    null,
    2,
  ),
);
