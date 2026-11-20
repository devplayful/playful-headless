#!/usr/bin/env node
/**
 * curl -I style check against local Next (BASE_URL) for 7 new 301s + agencia-seo unchanged.
 */
const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3011').replace(/\/$/, '');

const SEVEN = [
  ['/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce', '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce'],
  ['/cintillos-de-promocion', '/blog/tecnologia/cintillos-de-promocion'],
  ['/que-es-una-agencia-de-sem', '/blog/mas-vistos/que-es-una-agencia-de-sem'],
  ['/publicidad-digital-en-tu-negocio', '/blog/pautas-digitales/publicidad-digital-en-tu-negocio'],
  ['/premios-cima-2026-soytechno-playful', '/blog/otros/premios-cima-2026-soytechno-playful'],
  ['/los-5-problemas-de-e-commerce', '/blog/mas-vistos/los-5-problemas-de-e-commerce'],
  ['/actualizar-tu-e-commerce', '/blog/tecnologia/actualizar-tu-e-commerce'],
];

const AGENCIA = '/agencia-seo-internacional-en-el-2025-es-una-necesidad';
const AGENCIA_DEST = '/blog/tecnologia/agencia-seo-internacional-en-el-2025-es-una-necesidad';

function locationPath(res) {
  const loc = res.headers.get('location') || '';
  try {
    return new URL(loc, BASE).pathname.replace(/\/+$/, '') || '/';
  } catch {
    return loc;
  }
}

const results = [];

async function head(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
  return { path, status: res.status, location: res.headers.get('location'), locationPath: locationPath(res) };
}

for (const [origin, dest] of SEVEN) {
  const r = await head(origin);
  const ok = r.status === 301 && r.locationPath === dest;
  results.push({ ...r, expected: dest, ok });
}

const ag = await head(AGENCIA);
results.push({
  ...ag,
  expected: AGENCIA_DEST,
  ok: ag.status === 301 && ag.locationPath === AGENCIA_DEST,
  note: 'existing middleware 301 (no new map entry)',
});

const failed = results.filter((r) => !r.ok);
console.log(JSON.stringify({ base: BASE, results, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);