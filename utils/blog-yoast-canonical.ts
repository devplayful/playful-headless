import { canonicalForPath } from './canonical.ts';
import { blogPostPath } from './blog-url.ts';
import { rewriteInSiteUrlToApex } from '../services/rewrite-in-site-hrefs.mjs';

export type BlogPostYoastFields = {
  slug: string;
  categories?: Array<{ slug: string }>;
  yoast_head?: string;
  yoast_head_json?: {
    canonical?: string;
    og_url?: string;
    [key: string]: unknown;
  };
};

const SITE_ROOTS = new Set([
  'https://playfulagency.com/',
  'https://playfulagency.com',
  'https://www.playfulagency.com/',
  'https://www.playfulagency.com',
  'https://endpoint.playfulagency.com/',
  'https://endpoint.playfulagency.com',
]);

export function isSiteRootCanonical(url: string | undefined | null): boolean {
  if (!url?.trim()) return false;
  const apex = rewriteInSiteUrlToApex(url.trim());
  return SITE_ROOTS.has(apex);
}

export function extractCanonicalFromYoastHead(yoastHead: string): string | null {
  if (!yoastHead) return null;
  const match =
    yoastHead.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i)
    ?? yoastHead.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["'][^>]*>/i);
  return match?.[1]?.trim() || null;
}

export type BlogYoastCanonicalIssue =
  | { slug: string; kind: 'site-root'; canonical: string }
  | { slug: string; kind: 'missing'; ogUrl?: string };

export function auditBlogPostYoastCanonical(post: BlogPostYoastFields): BlogYoastCanonicalIssue | null {
  const fromJson = post.yoast_head_json?.canonical?.trim();
  const fromHead = extractCanonicalFromYoastHead(post.yoast_head || '');
  const canonical = fromJson || fromHead;
  if (canonical && isSiteRootCanonical(canonical)) {
    return { slug: post.slug, kind: 'site-root', canonical };
  }
  if (!canonical) {
    const ogUrl = post.yoast_head_json?.og_url?.trim();
    if (ogUrl && !isSiteRootCanonical(ogUrl)) {
      return { slug: post.slug, kind: 'missing', ogUrl };
    }
  }
  return null;
}

/**
 * Yoast sometimes omits canonical or points at the site root. Next metadata
 * already uses blogPostPath; this keeps hydrated WP payloads aligned for audits.
 */
export function repairBlogPostYoastCanonical<T extends BlogPostYoastFields>(post: T): T {
  const expected = canonicalForPath(blogPostPath(post));
  const issue = auditBlogPostYoastCanonical(post);
  if (!issue) return post;

  const next: T = { ...post };
  if (next.yoast_head_json) {
    next.yoast_head_json = {
      ...next.yoast_head_json,
      canonical: expected,
      og_url: next.yoast_head_json.og_url && !isSiteRootCanonical(next.yoast_head_json.og_url)
        ? rewriteInSiteUrlToApex(next.yoast_head_json.og_url)
        : expected,
    };
  }

  if (typeof next.yoast_head === 'string' && next.yoast_head) {
    let head = next.yoast_head;
    if (extractCanonicalFromYoastHead(head)) {
      head = head.replace(
        /<link[^>]+rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${expected}" />`,
      );
    } else {
      head = head.replace(
        /<meta name="description"/i,
        `<link rel="canonical" href="${expected}" />\n<meta name="description"`,
      );
    }
    head = head.replace(
      /<meta property="og:url" content="[^"]*"/i,
      `<meta property="og:url" content="${expected}"`,
    );
    next.yoast_head = head;
  }

  return next;
}
