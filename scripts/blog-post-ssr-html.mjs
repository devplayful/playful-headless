/**
 * Smoke: assert blog posts ship H1 + article body in the initial HTML
 * (not only in the RSC payload, and not behind «Cargando artículo…»).
 *
 * Usage:
 *   SEO_BASE_URL=https://preview.vercel.app node scripts/blog-post-ssr-html.mjs
 *   SEO_BASE_URL=http://127.0.0.1:3000 node scripts/blog-post-ssr-html.mjs
 *
 * Optional: SEO_BLOG_LIMIT=N to cap the sitemap crawl (required posts still run).
 */
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

export const REQUIRED_BLOG_PATHS = [
  '/blog/tecnologia/actualizar-tu-e-commerce',
  '/blog/tecnologia/zelle-en-venezuela-un-metodo-de-pago-para-tu-ecommerce',
];

export const CONTROL_CASE_STUDY_PATH =
  '/casos-de-exito/soytechno-ecommerce-venezuela';

export function stripScripts(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/>/gi, '');
}

function decodeEntities(text) {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function innerText(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

function firstHeadingText(html, tag) {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? innerText(match[1]) : '';
}

export function analyzeBlogPostHtml(html) {
  const visible = stripScripts(html);
  const hasLoader = /Cargando artículo\.\.\./.test(visible);
  const hasBailout = /BAILOUT_TO_CLIENT_SIDE_RENDERING/.test(visible);
  const h1Text = firstHeadingText(visible, 'h1');
  const h2Text = firstHeadingText(visible, 'h2');
  const articleMatch = visible.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i);
  const articleHtml = articleMatch?.[1] ?? '';
  const articleParagraphs = (articleHtml.match(/<p\b/gi) || []).length;
  const articleTextLength = innerText(articleHtml).length;
  const ok =
    !hasLoader &&
    !hasBailout &&
    h1Text.length > 0 &&
    articleParagraphs >= 2 &&
    articleTextLength >= 200;

  return {
    ok,
    hasLoader,
    hasBailout,
    h1Text,
    h2Text,
    articleParagraphs,
    articleTextLength,
  };
}

export function analyzeCaseStudyHtml(html) {
  const visible = stripScripts(html);
  const h1Text = firstHeadingText(visible, 'h1');
  const paragraphCount = (visible.match(/<p\b/gi) || []).length;
  const hasLoader = /Cargando artículo\.\.\./.test(visible);
  const hasBailout = /BAILOUT_TO_CLIENT_SIDE_RENDERING/.test(visible);
  const ok =
    !hasLoader &&
    !hasBailout &&
    h1Text.length > 0 &&
    paragraphCount >= 10;

  return { ok, h1Text, paragraphCount, hasLoader, hasBailout };
}

export function blogPathsFromSitemap(xml) {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const paths = [];
  for (const loc of locs) {
    let pathname;
    try {
      pathname = new URL(loc).pathname.replace(/\/$/, '') || '/';
    } catch {
      continue;
    }
    if (/^\/blog\/[^/]+\/[^/]+$/.test(pathname)) {
      paths.push(pathname);
    }
  }
  return [...new Set(paths)];
}

export function summarizeCheck(path, analysis) {
  if (analysis.ok) {
    return `${path} OK h1="${analysis.h1Text}" p=${analysis.articleParagraphs ?? analysis.paragraphCount}`;
  }
  const reasons = [];
  if (analysis.hasLoader) reasons.push('loader');
  if (analysis.hasBailout) reasons.push('bailout');
  if (!analysis.h1Text) reasons.push('missing-h1');
  if ((analysis.articleParagraphs ?? 0) < 2 && analysis.paragraphCount == null) {
    reasons.push(`article-p=${analysis.articleParagraphs}`);
  }
  if (analysis.paragraphCount != null && analysis.paragraphCount < 10) {
    reasons.push(`p=${analysis.paragraphCount}`);
  }
  return `${path} FAIL ${reasons.join(',')}`;
}

async function fetchText(origin, pathname, headers = {}) {
  const response = await fetch(new URL(pathname, origin), {
    redirect: 'follow',
    headers,
  });
  const html = await response.text();
  return { status: response.status, html, url: response.url };
}

function looksProtected(html) {
  return /Authentication Required|vercel\.com\/login|deployment protection/i.test(html);
}

async function main() {
  const baseUrl = process.env.SEO_BASE_URL || process.argv[2];
  if (!baseUrl) {
    throw new Error(
      'SEO_BASE_URL is required, for example https://branch.vercel.app or http://127.0.0.1:3000',
    );
  }
  const origin = new URL(baseUrl).origin;
  const extraHeaders = {};
  if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
    extraHeaders['x-vercel-protection-bypass'] = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
  }

  const sitemap = await fetchText(origin, '/sitemap.xml', extraHeaders);
  if (sitemap.status !== 200) {
    throw new Error(`/sitemap.xml → ${sitemap.status}`);
  }
  if (looksProtected(sitemap.html)) {
    throw new Error(
      'Preview looks protected. Set VERCEL_AUTOMATION_BYPASS_SECRET or use vercel curl.',
    );
  }

  const sitemapPaths = blogPathsFromSitemap(sitemap.html);
  const limit = Number(process.env.SEO_BLOG_LIMIT || 0);
  const crawlPaths = [
    ...REQUIRED_BLOG_PATHS,
    ...sitemapPaths.filter((path) => !REQUIRED_BLOG_PATHS.includes(path)),
  ];
  const targets = limit > 0 ? crawlPaths.slice(0, limit) : crawlPaths;

  let okCount = 0;
  const failures = [];
  for (const path of targets) {
    const page = await fetchText(origin, path, extraHeaders);
    if (page.status !== 200) {
      failures.push(`${path} HTTP ${page.status}`);
      console.log(`${path} FAIL HTTP ${page.status}`);
      continue;
    }
    if (looksProtected(page.html)) {
      failures.push(`${path} protected`);
      console.log(`${path} FAIL protected`);
      continue;
    }
    const analysis = analyzeBlogPostHtml(page.html);
    console.log(summarizeCheck(path, analysis));
    if (analysis.ok) okCount += 1;
    else failures.push(summarizeCheck(path, analysis));
  }

  const control = await fetchText(origin, CONTROL_CASE_STUDY_PATH, extraHeaders);
  if (control.status !== 200) {
    throw new Error(`${CONTROL_CASE_STUDY_PATH} → ${control.status}`);
  }
  const controlAnalysis = analyzeCaseStudyHtml(control.html);
  console.log(summarizeCheck(CONTROL_CASE_STUDY_PATH, controlAnalysis));
  if (!controlAnalysis.ok) {
    failures.push(summarizeCheck(CONTROL_CASE_STUDY_PATH, controlAnalysis));
  }

  console.log(
    `Blog SSR HTML: ${okCount}/${targets.length} posts OK; control ${
      controlAnalysis.ok ? 'OK' : 'FAIL'
    }`,
  );
  if (failures.length) {
    throw new Error(`SSR HTML checks failed:\n${failures.join('\n')}`);
  }
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectRun) {
  await main();
}
