#!/usr/bin/env node
/**
 * Pruebas A/B/C reutilizables (requiere servidor local en BASE_URL).
 *
 * A) Sin WordPress: WORDPRESS_LIVE_FETCH no definido (snapshot).
 * B) Payload caído: DATABASE_URL inválida + flags CMS apagados (debe servir snapshot).
 * C) Flags apagados: igual que B para rutas públicas.
 */
import { PLAYFUL_QA_UA, withQaPathname, paceLiveQa } from '../lib/qa/live-fetch.mjs';

const BASE = (process.env.BASE_URL || 'http://127.0.0.1:3456').replace(/\/$/, '');
const PATHS = [
  '/blog',
  '/blog/seo/aprende-todo-sobre-el-seo',
  '/podcast',
  '/nosotros',
  '/casos-de-exito',
  '/casos-de-exito/jumex-shopify-dtc-ecommerce',
  '/sitemap.xml',
  '/robots.txt',
  '/contactar-agencia-de-marketing-digital',
];

async function status(path) {
  await paceLiveQa();
  const res = await fetch(new URL(withQaPathname(path), BASE), {
    redirect: 'manual',
    headers: { 'user-agent': PLAYFUL_QA_UA },
  });
  return res.status;
}

const results = [];
for (const path of PATHS) {
  const code = await status(path);
  results.push({ path, status: code, ok: code < 500 });
}

const failures = results.filter((r) => !r.ok);
console.log(JSON.stringify({ base: BASE, pass: results.length - failures.length, fail: failures.length, results }, null, 2));
process.exitCode = failures.length ? 1 : 0;