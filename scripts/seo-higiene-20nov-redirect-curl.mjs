#!/usr/bin/env node
/**
 * Validates 7 new 301s + agencia-seo via resolveSingleHopRedirect (middleware),
 * then optional HTTP check against local Next (BASE_URL).
 */
import { resolveSingleHopRedirect } from '../middleware.ts';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3011').replace(/\/$/, '');
const SKIP_HTTP = process.env.SKIP_HTTP === '1';

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

for (const [origin, dest] of SEVEN) {
  const resolved = resolveSingleHopRedirect(origin, new URLSearchParams());
  const ok = resolved.changed && resolved.pathname === dest;
  results.push({ path: origin, mode: 'resolve', expected: dest, resolved, ok });
}

const agResolved = resolveSingleHopRedirect(AGENCIA, new URLSearchParams());
results.push({
  path: AGENCIA,
  mode: 'resolve',
  expected: AGENCIA_DEST,
  resolved: agResolved,
  ok: agResolved.changed && agResolved.pathname === AGENCIA_DEST,
  note: 'existing middleware inline map',
});

if (!SKIP_HTTP) {
  async function head(path) {
    const res = await fetch(`${BASE}${path}`, { redirect: 'manual' });
    return { path, status: res.status, location: res.headers.get('location'), locationPath: locationPath(res) };
  }
  for (const [origin, dest] of SEVEN) {
    const r = await head(origin);
    const row = results.find((x) => x.path === origin);
    if (row) {
      row.http = r;
      row.httpOk = r.status === 301 && r.locationPath === dest;
    }
  }
  const ag = await head(AGENCIA);
  const agRow = results.find((x) => x.path === AGENCIA);
  if (agRow) {
    agRow.http = ag;
    agRow.httpOk = ag.status === 301 && ag.locationPath === AGENCIA_DEST;
  }
}

const failed = results.filter((r) => !r.ok || r.httpOk === false);
console.log(JSON.stringify({ base: BASE, results, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);