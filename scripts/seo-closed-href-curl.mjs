/**
 * Count internal hrefs on the 103 sitemap posts + 4 landings that 404, 410,
 * fail, or hop a redirect. Usage:
 *   node scripts/seo-closed-href-curl.mjs https://playfulagency.com
 */
import { SITEMAP_BLOG_PATHS } from '../utils/apex-sitemap.ts';
import { isClosedBlogPath } from '../utils/blog-closed-paths.ts';
import { isCanibalizacionOriginPath } from '../utils/blog-canibalizacion-redirects.ts';

const BASE = (process.argv[2] || 'https://playfulagency.com').replace(/\/+$/, '');
const SHARE_TOKEN = process.env.VERCEL_SHARE || '';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) PlayfulAgency/1.0';
const REQUEST_GAP_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
let shareCookie = '';

async function bootstrapShareCookie() {
  if (!SHARE_TOKEN) return;
  const response = await fetch(`${BASE}/?_vercel_share=${SHARE_TOKEN}`, {
    headers: { 'user-agent': UA, accept: 'text/html' },
    redirect: 'manual',
  });
  const cookies = typeof response.headers.getSetCookie === 'function'
    ? response.headers.getSetCookie()
    : String(response.headers.get('set-cookie') || '').split(/,(?=\s*[^;=]+=)/);
  shareCookie = cookies.map((cookie) => cookie.split(';')[0]).filter(Boolean).join('; ');
  if (!shareCookie) {
    console.error(`share bootstrap ${response.status}; no cookie`);
  }
}

function requestHeaders() {
  const headers = { 'user-agent': UA, accept: 'text/html' };
  if (shareCookie) headers.cookie = shareCookie;
  return headers;
}
const LANDINGS = [
  '/agencia-e-commerce',
  '/agencia-seo',
  '/agencia-sem',
  '/agencia-diseno-web',
];

const IN_SITE = /playfulagency\.com$/i;
const SKIP_PREFIXES = ['/wp-content', '/wp-includes', '/wp-json', '/wp-admin'];

function extractHrefs(html) {
  return [...html.matchAll(/href=(["'])([^"']+)\1/gi)].map((match) => match[2]);
}

function pathnameOf(href) {
  try {
    const absolute = href.startsWith('//') ? `https:${href}` : href;
    const url = absolute.startsWith('/')
      ? new URL(absolute, 'https://playfulagency.com')
      : new URL(absolute);
    return url.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return '';
  }
}

function isInternal(href) {
  const trimmed = href.trim();
  if (!trimmed || trimmed.startsWith('#') || /^(mailto|tel|javascript):/i.test(trimmed)) {
    return false;
  }
  try {
    const absolute = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed;
    const url = absolute.startsWith('/')
      ? new URL(absolute, 'https://playfulagency.com')
      : new URL(absolute);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;
    if (SKIP_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
      return false;
    }
    return host.endsWith('playfulagency.com') || host.endsWith('.crear.endpoint.playfulagency.com');
  } catch {
    return false;
  }
}

function probeUrl(href) {
  try {
    const absolute = href.startsWith('//') ? `https:${href}` : href;
    if (absolute.startsWith('/')) return `${BASE}${absolute}`;
    const url = new URL(absolute);
    if (url.hostname.endsWith('.crear.endpoint.playfulagency.com')) return absolute;
    url.protocol = 'https:';
    url.hostname = new URL(BASE).hostname;
    return url.href;
  } catch {
    return href;
  }
}

async function fetchText(path) {
  const response = await fetch(`${BASE}${path}`, {
    headers: requestHeaders(),
    redirect: 'follow',
  });
  return { status: response.status, html: await response.text() };
}

async function probe(href) {
  const target = probeUrl(href);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(target, {
      method: 'GET',
      headers: requestHeaders(),
      redirect: 'manual',
      signal: controller.signal,
    });
    return response.status;
  } catch {
    return 0;
  } finally {
    clearTimeout(timer);
  }
}

function isBrokenStatus(status) {
  return status === 0 || status === 404 || status === 410 || (status >= 300 && status < 400);
}

await bootstrapShareCookie();

const postPaths = SITEMAP_BLOG_PATHS.filter(
  (path) => !isClosedBlogPath(path) && !isCanibalizacionOriginPath(path),
);
const pages = [...postPaths, ...LANDINGS];

const pageHrefs = new Map();
for (const path of pages) {
  await sleep(REQUEST_GAP_MS);
  try {
    const { html } = await fetchText(path);
    const hrefs = extractHrefs(html).filter(isInternal);
    pageHrefs.set(path, hrefs);
  } catch {
    pageHrefs.set(path, []);
  }
}

const unique = [...new Set([...pageHrefs.values()].flat())];
const statusByHref = new Map();
for (const href of unique) {
  await sleep(REQUEST_GAP_MS);
  statusByHref.set(href, await probe(href));
}

function tally(paths) {
  let links = 0;
  const pagesWith = [];
  for (const path of paths) {
    const broken = (pageHrefs.get(path) || []).filter((href) => isBrokenStatus(statusByHref.get(href)));
    links += broken.length;
    if (broken.length) pagesWith.push({ path, count: broken.length, hrefs: broken });
  }
  return { pages: pagesWith.length, links, detail: pagesWith };
}

const posts = tally(postPaths);
const landings = tally(LANDINGS);
const byStatus = { 0: 0, 301: 0, 302: 0, 308: 0, 404: 0, 410: 0 };
for (const href of unique) {
  const status = statusByHref.get(href);
  if (isBrokenStatus(status)) {
    const key = status === 0 ? 0 : status;
    byStatus[key] = (byStatus[key] || 0) + 1;
  }
}

const leftovers = [...statusByHref.entries()]
  .filter(([, status]) => isBrokenStatus(status))
  .map(([href, status]) => ({ href, status }));

const report = {
  base: BASE,
  posts: { scanned: postPaths.length, pagesWithBroken: posts.pages, brokenLinks: posts.links },
  landings: { scanned: LANDINGS.length, pagesWithBroken: landings.pages, brokenLinks: landings.links },
  uniqueInternal: unique.length,
  uniqueBrokenByStatus: byStatus,
  leftovers,
};

console.log(JSON.stringify(report, null, 2));
