#!/usr/bin/env node
/**
 * Descarga los *.bundle.min.js referenciados por webpack.runtime.min.js (y elementor-pro si existe).
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = (process.env.WP_ENDPOINT_ORIGIN || 'https://endpoint.playfulagency.com').replace(
  /\/$/,
  '',
);
const UA = 'PlayfulQA/1.0';

function bundlesFromRuntime(runtimePath, pluginSegment) {
  if (!existsSync(runtimePath)) return [];
  const text = readFileSync(runtimePath, 'utf8');
  const re = /(["'])([^"']*\.bundle\.min\.js)\1/g;
  const names = [...text.matchAll(re)].map((m) => m[2]);
  return [...new Set(names)].map((file) => ({
    file,
    remote: `${ORIGIN}/wp-content/plugins/${pluginSegment}/assets/js/${file}`,
    local: path.join(
      ROOT,
      'public/wp-static/wp-content/plugins',
      pluginSegment,
      'assets/js',
      file,
    ),
  }));
}

async function fetchToFile(url, localPath) {
  mkdirSync(path.dirname(localPath), { recursive: true });
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) return { ok: false, status: res.status };
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(localPath, buf);
  return { ok: true, status: res.status, bytes: buf.length };
}

async function mirrorPlugin(pluginSegment, runtimeFileName) {
  const runtimeLocal = path.join(
    ROOT,
    'public/wp-static/wp-content/plugins',
    pluginSegment,
    'assets/js',
    runtimeFileName,
  );
  const bundles = bundlesFromRuntime(runtimeLocal, pluginSegment);
  let failed = 0;
  for (const row of bundles) {
    const result = await fetchToFile(row.remote, row.local);
    if (!result.ok) {
      console.error(`FAIL ${row.file} HTTP ${result.status}`);
      failed += 1;
    } else {
      console.log(`OK ${pluginSegment}/${row.file} (${result.bytes} bytes)`);
    }
  }
  return { bundles: bundles.length, failed };
}

async function main() {
  const elementor = await mirrorPlugin('elementor', 'webpack.runtime.min.js');
  const proRuntimeUrl = `${ORIGIN}/wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js`;
  const proRes = await fetch(proRuntimeUrl, { headers: { 'User-Agent': UA } });
  let pro = { bundles: 0, failed: 0 };
  if (proRes.ok) {
    const proRuntimeLocal = path.join(
      ROOT,
      'public/wp-static/wp-content/plugins/elementor-pro/assets/js/webpack-pro.runtime.min.js',
    );
    mkdirSync(path.dirname(proRuntimeLocal), { recursive: true });
    writeFileSync(proRuntimeLocal, Buffer.from(await proRes.arrayBuffer()));
    pro = await mirrorPlugin('elementor-pro', 'webpack-pro.runtime.min.js');
  } else {
    console.log(`skip elementor-pro runtime (${proRes.status})`);
  }
  const failed = elementor.failed + pro.failed;
  console.log(
    JSON.stringify({ elementor, elementorPro: pro, failed }, null, 2),
  );
  process.exitCode = failed ? 1 : 0;
}

await main();