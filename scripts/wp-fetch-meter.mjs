/**
 * Process-wide meter for WordPress REST traffic during `next build`.
 * Enable with WP_FETCH_METER=1. Summarizes request count, bytes, and the
 * largest response so we can prove Next can cache every payload (< 2 MB).
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const NEXT_CACHE_CEILING_BYTES = 2 * 1024 * 1024;
const METER_LOG = process.env.WP_FETCH_METER_LOG || '/tmp/wp-rest-slim/fetch-meter.ndjson';

const state = {
  requests: [],
};

function requestUrl(input) {
  if (typeof input === 'string') return input;
  if (input instanceof URL) return input.href;
  if (input && typeof input === 'object' && 'url' in input) return String(input.url);
  return String(input);
}

function endpointKey(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

export function isWordPressMeterEnabled(env = process.env) {
  return env.WP_FETCH_METER === '1' || env.WP_FETCH_METER === 'true';
}

export function resetWordPressFetchMeter() {
  state.requests = [];
}

export function recordWordPressFetch({ url, status, bytes }) {
  const entry = {
    url: String(url),
    endpoint: endpointKey(url),
    status: Number(status) || 0,
    bytes: Number(bytes) || 0,
    at: Date.now(),
  };
  state.requests.push(entry);
  if (isWordPressMeterEnabled()) {
    try {
      mkdirSync(dirname(METER_LOG), { recursive: true });
      appendFileSync(METER_LOG, `${JSON.stringify(entry)}\n`);
    } catch {
      // Meter must never break a build.
    }
  }
}

export function getWordPressFetchMeter() {
  const byEndpoint = new Map();
  let totalBytes = 0;
  let largest = { url: '', bytes: 0, status: 0 };
  for (const entry of state.requests) {
    totalBytes += entry.bytes;
    const current = byEndpoint.get(entry.endpoint) || { count: 0, bytes: 0, status: entry.status };
    current.count += 1;
    current.bytes += entry.bytes;
    byEndpoint.set(entry.endpoint, current);
    if (entry.bytes > largest.bytes) largest = entry;
  }
  return {
    requestCount: state.requests.length,
    totalBytes,
    largest,
    overTwoMb: state.requests.filter((entry) => entry.bytes >= NEXT_CACHE_CEILING_BYTES),
    byEndpoint: [...byEndpoint.entries()]
      .map(([endpoint, stats]) => ({ endpoint, ...stats }))
      .sort((left, right) => right.bytes - left.bytes),
    requests: state.requests,
  };
}

export function formatWordPressFetchMeter(summary = getWordPressFetchMeter()) {
  const lines = [
    `[wp-fetch-meter] requests=${summary.requestCount} totalBytes=${summary.totalBytes} largest=${summary.largest.bytes} ${summary.largest.url}`,
  ];
  for (const row of summary.byEndpoint) {
    lines.push(`[wp-fetch-meter] ${row.count}x ${row.bytes}B ${row.endpoint}`);
  }
  if (summary.overTwoMb.length > 0) {
    lines.push(`[wp-fetch-meter] OVER_2MB=${summary.overTwoMb.length}`);
  }
  return lines.join('\n');
}

export function printWordPressFetchMeter() {
  if (!isWordPressMeterEnabled() && state.requests.length === 0) return;
  // eslint-disable-next-line no-console
  console.log(formatWordPressFetchMeter());
}

export function installWordPressFetchMeterExitHook() {
  if (!isWordPressMeterEnabled()) return;
  const flush = () => printWordPressFetchMeter();
  process.once('beforeExit', flush);
}

export function wrapFetchWithWordPressMeter(fetchImpl) {
  return async (input, init) => {
    const url = requestUrl(input);
    const response = await fetchImpl(input, init);
    if (!url.includes('endpoint.playfulagency.com')) return response;
    const body = await response.arrayBuffer();
    recordWordPressFetch({ url, status: response.status, bytes: body.byteLength });
    return new Response(body.byteLength > 0 ? body : null, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
}
