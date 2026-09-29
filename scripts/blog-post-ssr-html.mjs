/**
 * Smoke: assert blog posts ship H1 + article body, exactly one BlogPosting
 * JSON-LD, server-rendered related links, and unchanged title/meta/OG vs
 * production (not only in the RSC payload, and not behind loaders).
 *
 * Usage:
 *   SEO_BASE_URL=https://preview.vercel.app node scripts/blog-post-ssr-html.mjs
 *   SEO_BASE_URL=http://127.0.0.1:3000 node scripts/blog-post-ssr-html.mjs
 *
 * Optional: SEO_BLOG_LIMIT=N to cap the sitemap crawl (required posts still run).
 * Optional: SEO_COMPARE_ORIGIN=https://playfulagency.com (default).
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
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
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
  // Root layout AnalyticsSpaPageView uses useSearchParams inside Suspense.
  // Statically generated pages (home, services, blog posts) keep a tiny
  // BAILOUT template next to the header. That is not the article CSR hole
  // SEO measured — fail only when the body itself is missing.
  const articleMissing = !h1Text || articleParagraphs < 2 || articleTextLength < 200;
  const ok = !hasLoader && !articleMissing;

  return {
    ok,
    hasLoader,
    hasBailout,
    articleMissing,
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

export function extractLdJsonBlocks(html) {
  return [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1].trim(),
  );
}

function jsonLdTypes(item) {
  const type = item?.['@type'];
  return (Array.isArray(type) ? type : [type]).filter(Boolean);
}

function isArticleType(item) {
  return jsonLdTypes(item).some((type) => type === 'Article' || type === 'BlogPosting');
}

export function imageUrlFromJsonLd(image) {
  if (!image) return '';
  if (typeof image === 'string') return image;
  if (Array.isArray(image)) return imageUrlFromJsonLd(image[0]);
  if (typeof image === 'object') return image.url || image.contentUrl || '';
  return '';
}

function mainEntityUrl(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value['@id'] || value.id || value.url || '';
  return '';
}

function publisherLogoUrl(publisher) {
  if (!publisher) return '';
  return imageUrlFromJsonLd(publisher.logo);
}

function authorNameFromJsonLd(author) {
  if (!author) return '';
  if (Array.isArray(author)) return authorNameFromJsonLd(author[0]);
  if (typeof author === 'string') return author;
  return author.name || '';
}

function isAbsoluteHttpUrl(url) {
  return /^https?:\/\//i.test(url || '');
}

function isIso8601(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value);
}

function normalizeCompareUrl(url) {
  if (!url) return '';
  try {
    return new URL(url, 'https://playfulagency.com').href;
  } catch {
    return url;
  }
}

function attrFromTag(tag, attr) {
  if (!tag) return '';
  return tag.match(new RegExp(`${attr}=["']([^"']*)["']`, 'i'))?.[1] ?? '';
}

export function extractSeoHead(html) {
  const title = decodeEntities(
    (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/<[^>]+>/g, ''),
  ).trim();
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const metaContent = (key, value) => {
    const tag = metas.find((item) => new RegExp(`${key}=["']${value}["']`, 'i').test(item));
    return decodeEntities(attrFromTag(tag, 'content'));
  };
  const canonicalTag =
    html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i)?.[0] ||
    html.match(/<link\b[^>]*href=["'][^"']+["'][^>]*rel=["']canonical["'][^>]*>/i)?.[0] ||
    '';
  return {
    title,
    description: metaContent('name', 'description'),
    canonical: decodeEntities(attrFromTag(canonicalTag, 'href')),
    ogTitle: metaContent('property', 'og:title'),
    ogDescription: metaContent('property', 'og:description'),
    ogUrl: metaContent('property', 'og:url'),
    ogImage: metaContent('property', 'og:image'),
  };
}

export function compareSeoHead(local, production) {
  const fields = [
    ['title', local.title, production.title],
    ['description', local.description, production.description],
    ['canonical', normalizeCompareUrl(local.canonical), normalizeCompareUrl(production.canonical)],
    ['og:title', local.ogTitle, production.ogTitle],
    ['og:description', local.ogDescription, production.ogDescription],
    ['og:url', normalizeCompareUrl(local.ogUrl), normalizeCompareUrl(production.ogUrl)],
    ['og:image', normalizeCompareUrl(local.ogImage), normalizeCompareUrl(production.ogImage)],
  ];
  const mismatches = fields
    .filter(([, left, right]) => left !== right)
    .map(([name, left, right]) => `${name}: local=${JSON.stringify(left)} prod=${JSON.stringify(right)}`);
  return { ok: mismatches.length === 0, mismatches };
}

export function analyzeBlogRelatedPosts(html) {
  const visible = stripScripts(html);
  const hasRelatedLoader =
    /Cargando artículos…/.test(visible) || /Cargando artículos\.\.\./.test(visible);
  const hrefs = [...visible.matchAll(/href=["']((?:https:\/\/playfulagency\.com)?\/blog\/[^"'#?\s]+)["']/gi)]
    .map((match) => {
      try {
        return new URL(match[1], 'https://playfulagency.com').pathname.replace(/\/$/, '');
      } catch {
        return match[1];
      }
    })
    .filter((href) => /^\/blog\/[^/]+\/[^/]+$/.test(href));
  const unique = [...new Set(hrefs)];
  return {
    ok: !hasRelatedLoader && unique.length >= 1,
    hasRelatedLoader,
    relatedHrefs: unique,
  };
}

export function analyzeBlogPostJsonLd(html, expected = {}) {
  const reasons = [];
  const blocks = extractLdJsonBlocks(html);
  const parsed = [];
  for (const raw of blocks) {
    try {
      parsed.push(JSON.parse(raw));
    } catch {
      reasons.push('jsonld-invalid');
    }
  }
  const articles = parsed.flatMap((item) => {
    const nodes = Array.isArray(item) ? item : [item];
    return nodes.filter(isArticleType);
  });
  if (articles.length !== 1) {
    reasons.push(`jsonld-count=${articles.length}`);
  }
  const article = articles[0] || {};
  const headline = typeof article.headline === 'string' ? article.headline : '';
  const description = typeof article.description === 'string' ? article.description : '';
  const image = imageUrlFromJsonLd(article.image);
  const canonical = expected.canonical || '';
  const mainEntity = mainEntityUrl(article.mainEntityOfPage);
  const url = typeof article.url === 'string' ? article.url : '';
  const authorName = authorNameFromJsonLd(article.author);
  const logo = publisherLogoUrl(article.publisher);

  if (expected.h1Text && headline !== expected.h1Text) reasons.push('headline!=h1');
  if (expected.description != null && description !== expected.description) {
    reasons.push('description!=meta');
  }
  if (!isAbsoluteHttpUrl(image)) reasons.push('image-not-absolute');
  if (expected.ogImage && normalizeCompareUrl(image) !== normalizeCompareUrl(expected.ogImage)) {
    reasons.push('image!=og');
  }
  if (!isIso8601(article.datePublished)) reasons.push('datePublished');
  if (!isIso8601(article.dateModified)) reasons.push('dateModified');
  if (!authorName) reasons.push('author');
  if (!isAbsoluteHttpUrl(logo)) reasons.push('publisher.logo');
  if (canonical && mainEntity !== canonical) reasons.push('mainEntityOfPage!=canonical');
  if (canonical && url !== canonical) reasons.push('url!=canonical');

  return {
    ok: reasons.length === 0,
    reasons,
    article,
    count: articles.length,
    headline,
    description,
    image,
  };
}

export function summarizeCheck(path, analysis) {
  if (analysis.ok) {
    const extra = analysis.relatedCount != null ? ` related=${analysis.relatedCount}` : '';
    return `${path} OK h1="${analysis.h1Text}" p=${analysis.articleParagraphs ?? analysis.paragraphCount}${extra}`;
  }
  const reasons = [...(analysis.failReasons || [])];
  if (analysis.hasLoader) reasons.push('loader');
  if (analysis.articleMissing) reasons.push('article-missing');
  if (!analysis.h1Text) reasons.push('missing-h1');
  if ((analysis.articleParagraphs ?? 0) < 2 && analysis.paragraphCount == null) {
    reasons.push(`article-p=${analysis.articleParagraphs}`);
  }
  if (analysis.paragraphCount != null && analysis.paragraphCount < 10) {
    reasons.push(`p=${analysis.paragraphCount}`);
  }
  if (analysis.hasRelatedLoader) reasons.push('related-loader');
  if (analysis.jsonLdReasons?.length) reasons.push(...analysis.jsonLdReasons);
  if (analysis.headMismatches?.length) reasons.push(...analysis.headMismatches);
  return `${path} FAIL ${[...new Set(reasons)].join(',')}`;
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
  const compareOrigin = process.env.SEO_COMPARE_ORIGIN || 'https://playfulagency.com';
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
    const head = extractSeoHead(page.html);
    const jsonLd = analyzeBlogPostJsonLd(page.html, {
      h1Text: analysis.h1Text,
      description: head.description,
      canonical: head.canonical,
      ogImage: head.ogImage,
    });
    const related = analyzeBlogRelatedPosts(page.html);
    const prod = await fetchText(compareOrigin, path);
    const headCompare =
      prod.status === 200
        ? compareSeoHead(head, extractSeoHead(prod.html))
        : { ok: false, mismatches: [`prod-http-${prod.status}`] };
    const combined = {
      ...analysis,
      ok: analysis.ok && jsonLd.ok && related.ok && headCompare.ok,
      hasRelatedLoader: related.hasRelatedLoader,
      relatedCount: related.relatedHrefs.length,
      jsonLdReasons: jsonLd.reasons,
      headMismatches: headCompare.mismatches,
    };
    console.log(summarizeCheck(path, combined));
    if (combined.ok) okCount += 1;
    else failures.push(summarizeCheck(path, combined));
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

  const readAt = new Date().toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    dateStyle: 'short',
    timeStyle: 'medium',
  });
  console.log(
    `Blog SSR HTML+JSON-LD: ${okCount}/${targets.length} posts OK; control ${
      controlAnalysis.ok ? 'OK' : 'FAIL'
    }; leído ${readAt} Europe/Madrid vs ${compareOrigin}`,
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
