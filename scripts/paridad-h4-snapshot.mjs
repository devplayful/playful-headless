/**
 * Captura metadatos visibles de producción para paridad-h4.md (1 req/s, ?qa=1).
 */
import { writeFileSync } from 'node:fs';
import { liveFetch } from '../lib/qa/live-fetch.mjs';

const PATHS = [
  '/casos-de-exito',
  '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  '/casos-de-exito/odwalla-shopify-dtc-ecommerce',
  '/casos-de-exito/soytechno-ecommerce-venezuela',
];

function extract(html, pattern) {
  const m = html.match(pattern);
  return m ? m[1].trim() : '';
}

function analyze(html, path) {
  const title = extract(html, /<title[^>]*>([^<]*)<\/title>/i);
  const metaDesc = extract(
    html,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
  );
  const canonical = extract(
    html,
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i,
  );
  const h1 = extract(html, /<h1[^>]*>([\s\S]*?)<\/h1>/i).replace(/<[^>]+>/g, '').trim();
  const ldJsonBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (m) => m[1].trim(),
  );
  return { path, title, metaDesc, canonical, h1, ldJsonCount: ldJsonBlocks.length };
}

async function main() {
  const rows = [];
  for (const path of PATHS) {
    const res = await liveFetch(`https://playfulagency.com${path}`);
    const html = await res.text();
    if (!res.ok) {
      rows.push({ path, error: `HTTP ${res.status}` });
      continue;
    }
    rows.push(analyze(html, path));
  }
  writeFileSync('docs/paridad-h4-prod-snapshot.json', `${JSON.stringify(rows, null, 2)}\n`);
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
