/**
 * Shared live-QA fetch: always `?qa=1`, UA PlayfulQA/1.0, ≥1 req/s.
 * Use this for every script, smoke, Playwright, or desktop-from-Spain
 * check that hits playfulagency.com (or any apex HTML). Unit tests that
 * never fetch production do not need it.
 */
export const PLAYFUL_QA_UA = 'PlayfulQA/1.0';
export const QA_PARAM = 'qa';
export const QA_VALUE = '1';
export const LIVE_QA_MIN_INTERVAL_MS = 1000;

let lastLiveQaAt = 0;

export function withQaSearchParams(params) {
  const next = new URLSearchParams(params);
  next.set(QA_PARAM, QA_VALUE);
  return next;
}

export function withQaPathname(pathnameAndSearch) {
  const url = new URL(pathnameAndSearch, 'https://playfulagency.com');
  url.searchParams.set(QA_PARAM, QA_VALUE);
  return `${url.pathname}${url.search}${url.hash}`;
}

export function withQaUrl(href) {
  const url = new URL(href);
  url.searchParams.set(QA_PARAM, QA_VALUE);
  return url.toString();
}

export function stripQaSearch(search) {
  const params = new URLSearchParams(
    (search || '').startsWith('?') ? search.slice(1) : search || '',
  );
  params.delete(QA_PARAM);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function stripQaHref(href, base = 'https://playfulagency.com') {
  const url = new URL(href, base);
  url.searchParams.delete(QA_PARAM);
  return url.toString();
}

export function playfulQaHeaders(extra = {}) {
  return {
    'user-agent': PLAYFUL_QA_UA,
    ...extra,
  };
}

export async function paceLiveQa(now = Date.now()) {
  const wait = LIVE_QA_MIN_INTERVAL_MS - (now - lastLiveQaAt);
  if (wait > 0) {
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  lastLiveQaAt = Date.now();
}

export async function liveFetch(href, options = {}) {
  await paceLiveQa();
  const headers = playfulQaHeaders(options.headers || {});
  return fetch(withQaUrl(href), { ...options, headers });
}
