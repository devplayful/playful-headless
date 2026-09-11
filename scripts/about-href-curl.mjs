/**
 * Smoke: fetch live WP Elementor HTML for the three GO slugs with /about
 * in <main>, run the rewriter, and assert 0 leftover about hrefs.
 *
 * Usage: node --experimental-strip-types scripts/about-href-curl.mjs
 */
import {
  NOSOTROS_HREF,
  isAboutPageHref,
  rewriteAboutHrefs,
  rewriteElementorBodyHrefs,
} from '../utils/booking.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';

const SLUGS = [
  'agencia-seo',
  'agencia-sem',
  'agencia-diseno-web',
];

function listAnchors(html, hrefNeedle) {
  const re = /<a\b[^>]*>[\s\S]*?<\/a>/gi;
  const out = [];
  for (const match of html.matchAll(re)) {
    const anchor = match[0];
    if (!anchor.includes(hrefNeedle)) continue;
    const href = anchor.match(/href=(["'])([^"']*)\1/i)?.[2] ?? '';
    out.push(href);
  }
  return out;
}

function leftoverAboutHrefs(html) {
  const leftover = [];
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*(["'])([^"']*)\1[^>]*>/gi)) {
    const href = match[2];
    if (isAboutPageHref(href)) leftover.push(href);
  }
  return leftover;
}

for (const slug of SLUGS) {
  const url = `https://endpoint.playfulagency.com/wp-json/wp/v2/pages?slug=${slug}&_fields=id,slug,content`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} → ${response.status}`);
  }
  const pages = await response.json();
  const raw = pages[0]?.content?.rendered ?? '';
  const pipeline = rewriteElementorBodyHrefs(rewriteInSitePageHrefs(raw), slug);
  const rewritten = rewriteAboutHrefs(raw, slug);
  const nosotros = listAnchors(pipeline, '/nosotros');
  const leftoverRaw = leftoverAboutHrefs(rewritten);
  const leftoverPipeline = leftoverAboutHrefs(pipeline);
  console.log(`\n========== /${slug} ==========`);
  console.log(`nosotros href: ${NOSOTROS_HREF}`);
  console.log(`nosotros anchors: ${nosotros.length}`);
  console.log(`leftover /about (raw rewriter): ${leftoverRaw.length}`);
  console.log(`leftover /about (pipeline): ${leftoverPipeline.length}`);

  if (leftoverRaw.length || leftoverPipeline.length) {
    throw new Error(`/${slug} still has /about hrefs in content HTML`);
  }
  if (nosotros.length === 0) {
    throw new Error(`/${slug} has no /nosotros anchors after rewrite`);
  }
}

console.log(`\nOK — three slugs rewrite /about → ${NOSOTROS_HREF}`);
