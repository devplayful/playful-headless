/**
 * Lists live WP posts whose Yoast canonical is the site root or missing while og:url is a post URL.
 *
 *   node --experimental-strip-types scripts/audit-blog-yoast-canonicals.mjs
 */
import {
  auditBlogPostYoastCanonical,
  isSiteRootCanonical,
  extractCanonicalFromYoastHead,
} from '../utils/blog-yoast-canonical.ts';
import { liveFetch } from '../lib/qa/live-fetch.mjs';

const base = 'https://endpoint.playfulagency.com/wp-json/wp/v2/posts';
const issues = [];

for (let page = 1; page <= 20; page += 1) {
  const response = await liveFetch(
    `${base}?per_page=100&page=${page}&_fields=slug,categories,yoast_head,yoast_head_json`,
  );
  if (!response.ok) break;
  const posts = await response.json();
  if (!Array.isArray(posts) || posts.length === 0) break;
  for (const post of posts) {
    const issue = auditBlogPostYoastCanonical(post);
    if (issue) issues.push(issue);
    const headCanon = extractCanonicalFromYoastHead(post.yoast_head || '');
    if (headCanon && isSiteRootCanonical(headCanon)) {
      issues.push({ slug: post.slug, kind: 'site-root-head', canonical: headCanon });
    }
  }
}

console.log(JSON.stringify({ count: issues.length, issues }, null, 2));
