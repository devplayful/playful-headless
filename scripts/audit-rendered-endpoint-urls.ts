/**
 * Audita referencias endpoint.* en HTML/OG/JSON-LD simulando el pipeline con CMS_BLOB_IMAGES=1.
 * Solo GET WordPress REST, 1 req/s, UA PlayfulQA/1.0.
 *
 *   CMS_BLOB_IMAGES=1 node scripts/audit-rendered-endpoint-urls.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { CASO_ACF_IMAGE_FIELDS } from '../cms/collections/casos-acf-fields.ts';
import {
  applyBlobImagesToHtml,
  applyBlobImagesToUrl,
  applyBlobImagesToJsonLd,
  countEndpointUploadImageRefs,
} from '../lib/blob-image-render.ts';
import { rewriteBookingWidgetHrefs } from '../utils/booking.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';
import { blogBodyForSlug } from '../lib/blog-body-overrides.ts';
import { optimizeBlogInlineMedia } from '../lib/blog-inline-media.ts';
import { resolveBlogOgUrl } from '../lib/blog-cover-image.ts';
import inventory from '../docs/blob-migration-inventory.json' with { type: 'json' };

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(
  /\/$/,
  '',
);
const UA = 'PlayfulQA/1.0';
const MIN_GAP_MS = 1000;
const OUT = path.join(process.cwd(), 'docs/endpoint-url-audit.json');

const AUDIT_ENV = { ...process.env, CMS_BLOB_IMAGES: '1' } as NodeJS.ProcessEnv;

let last = 0;
async function wp(pathname: string): Promise<any> {
  const wait = last + MIN_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  last = Date.now();
  const res = await fetch(`${WP}${pathname}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${pathname}`);
  return res.json();
}

async function wpAll(pathname: string): Promise<any[]> {
  const sep = pathname.includes('?') ? '&' : '?';
  const first = await fetch(`${WP}${pathname}${sep}per_page=100&page=1`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  const pages = Number(first.headers.get('x-wp-totalpages') || 1);
  const out: any[] = [...(await first.json())];
  last = Date.now();
  for (let p = 2; p <= pages; p++) {
    const wait = last + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    last = Date.now();
    const res = await fetch(`${WP}${pathname}${sep}per_page=100&page=${p}`, {
      headers: { 'User-Agent': UA, Accept: 'application/json' },
    });
    out.push(...(await res.json()));
  }
  return out;
}

function yoastOg(item: any): string {
  const y = item.yoast_head_json || {};
  return Array.isArray(y.og_image) && y.og_image[0]?.url ? y.og_image[0].url : '';
}

type Counts = Record<string, number>;

function add(counts: Counts, key: string, n: number) {
  counts[key] = (counts[key] || 0) + n;
}

function auditPostBody(slug: string, html: string, before: Counts, after: Counts) {
  const pipeline = optimizeBlogInlineMedia(
    rewriteBookingWidgetHrefs(rewriteInSitePageHrefs(blogBodyForSlug(slug) || html, '')),
    slug,
  );
  add(before, 'post-body', countEndpointUploadImageRefs(pipeline));
  add(after, 'post-body', countEndpointUploadImageRefs(applyBlobImagesToHtml(pipeline, AUDIT_ENV)));
}

function auditString(field: string, value: string, before: Counts, after: Counts) {
  add(before, field, countEndpointUploadImageRefs(value));
  add(after, field, countEndpointUploadImageRefs(applyBlobImagesToHtml(value, AUDIT_ENV)));
}

function auditUrl(field: string, value: string, before: Counts, after: Counts) {
  add(before, field, countEndpointUploadImageRefs(value));
  add(after, field, countEndpointUploadImageRefs(applyBlobImagesToUrl(value, AUDIT_ENV)));
}

function auditJson(field: string, value: unknown, before: Counts, after: Counts) {
  const raw = JSON.stringify(value);
  add(before, field, countEndpointUploadImageRefs(raw));
  add(after, field, countEndpointUploadImageRefs(JSON.stringify(applyBlobImagesToJsonLd(value, AUDIT_ENV))));
}

async function main() {
  const before: Counts = {};
  const after: Counts = {};

  const posts = await wpAll('/wp/v2/posts?_fields=slug,content,yoast_head_json');
  for (const p of posts) {
    auditPostBody(p.slug, p.content?.rendered || '', before, after);
    const og = yoastOg(p);
    if (og) auditUrl('post-og', og, before, after);
    if (p.yoast_head_json) auditJson('post-jsonld-yoast', p.yoast_head_json, before, after);
  }

  const paginas = await wpAll('/wp/v2/pages?_fields=slug,content,yoast_head_json');
  for (const pg of paginas) {
    const html = rewriteInSitePageHrefs(pg.content?.rendered || '', `/${pg.slug}`);
    auditString('page-body', html, before, after);
    const og = yoastOg(pg);
    if (og) auditUrl('page-og', og, before, after);
  }

  const casos = await wpAll('/wp/v2/casos-de-exito?_fields=slug,content,acf,yoast_head_json');
  for (const c of casos) {
    auditString('caso-body', c.content?.rendered || '', before, after);
    const og = yoastOg(c);
    if (og) auditUrl('caso-og', og, before, after);
    if (c.acf) auditJson('caso-acf', c.acf, before, after);
  }

  const broken404 = inventory.items.filter((r) => r.httpStatus === 404);
  const truncated = broken404.filter(
    (r) =>
      r.url.endsWith('Haz-Pruebas-y-') ||
      r.url.endsWith('Playful-Agencia-') ||
      r.canonicalUrl?.endsWith('Haz-Pruebas-y-') ||
      r.canonicalUrl?.endsWith('Playful-Agencia-'),
  );

  const report = {
    generado: new Date().toISOString(),
    cmsBlobImages: process.env.CMS_BLOB_IMAGES,
    antes: before,
    despues: after,
    rotas404: broken404.map((r) => ({
      url: r.canonicalUrl || r.url,
      posts: r.sources.filter((s) => s.kind.startsWith('wp-post')).map((s) => s.detail),
      paginas: r.sources.filter((s) => s.kind.startsWith('wp-page')).map((s) => s.detail),
      casos: r.sources.filter((s) => s.kind.startsWith('wp-caso')).map((s) => s.detail),
    })),
    truncadas404: truncated.map((r) => ({
      url: r.url,
      origen: r.sources,
    })),
  };

  writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ antes: before, despues: after, rotas404: broken404.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
