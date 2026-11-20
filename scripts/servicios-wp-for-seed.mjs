/**
 * Lectura WP para cms:seed-servicios sin importar services/wordpress.ts (Next cache).
 * Por defecto usa data/wp-snapshot (mismo contrato que runtime). Solo llama a
 * endpoint.playfulagency.com con WORDPRESS_LIVE_FETCH=1.
 */
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyImageAltOverrides } from '../lib/image-alt-overrides.ts';
import { rewriteAgenciaDisenoUxUiLink } from '../utils/agencia-diseno-ux-ui-link.ts';
import { rewriteElementorBodyHrefs } from '../utils/booking.ts';
import { rewriteEcommerceShopifyLink } from '../utils/ecommerce-shopify-link.ts';
import { rewriteEcommerceSoytechnoCaseLink } from '../utils/ecommerce-soytechno-case-link.ts';
import { rewriteEcommerceZelleCover } from '../utils/ecommerce-zelle-cover.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';
import { wordpressFetchCollection } from '../services/wordpress-request.mjs';

const REPO_ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function useWordPressLiveFetch(env = process.env) {
  return env.WORDPRESS_LIVE_FETCH === '1' || env.WORDPRESS_LIVE_FETCH === 'true';
}

function wordpressApiBase(env = process.env) {
  if (useWordPressLiveFetch(env)) {
    return (env.WORDPRESS_API_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
  }
  return 'https://playful-headless/wp-json';
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripScripts(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '');
}

function collectStylesheetIds(html, pageId) {
  const ids = new Set([pageId]);
  const re = /data-elementor-id=["'](\d+)["']/gi;
  let match;
  while ((match = re.exec(html))) {
    const id = Number(match[1]);
    if (!Number.isNaN(id)) ids.add(id);
  }
  return Array.from(ids);
}

function pickFields(item, fieldsParam) {
  if (!fieldsParam) return item;
  const fields = fieldsParam.split(',').map((f) => f.trim()).filter(Boolean);
  if (!fields.length) return item;
  const out = {};
  for (const field of fields) {
    if (field in item) out[field] = item[field];
  }
  if (!('id' in out) && 'id' in item) out.id = item.id;
  return out;
}

function backupPagesPaths() {
  const paths = [];
  const envPath = (process.env.WP_BACKUP_PAGES_PATH || '').trim();
  if (envPath) paths.push(envPath);
  paths.push(path.join(REPO_ROOT, 'data', 'wp-backup-2026-11-19', 'pages.json'));
  return paths;
}

function findPageInBackup(slug) {
  for (const file of backupPagesPaths()) {
    if (!existsSync(file)) continue;
    try {
      const pages = JSON.parse(readFileSync(file, 'utf8'));
      const page = Array.isArray(pages) ? pages.find((item) => item.slug === slug) : null;
      if (page) return page;
    } catch {
      /* try next */
    }
  }
  return null;
}

async function fetchPagesBySlug(slug, fields) {
  const url = `${wordpressApiBase()}/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=${encodeURIComponent(fields)}`;
  const { items } = await wordpressFetchCollection(url);
  if (items?.[0]) return items;
  const backup = findPageInBackup(slug);
  if (!backup) return [];
  return [pickFields(backup, fields)];
}

export async function fetchServicioPageBySlug(slug) {
  const pages = await fetchPagesBySlug(slug, 'id,slug,title,content');
  const page = pages?.[0];
  if (!page) return null;
  const rawHtml = page.content?.rendered || '';
  const html = applyImageAltOverrides(
    rewriteElementorBodyHrefs(
      rewriteEcommerceZelleCover(
        rewriteEcommerceSoytechnoCaseLink(
          rewriteEcommerceShopifyLink(
            rewriteAgenciaDisenoUxUiLink(
              rewriteInSitePageHrefs(stripScripts(rawHtml), `/${slug}`),
              slug,
            ),
            slug,
          ),
          slug,
        ),
        slug,
      ),
      slug,
    ),
  );
  return {
    id: page.id,
    slug: page.slug,
    title: stripHtml(page.title?.rendered || slug),
    html,
    stylesheetIds: collectStylesheetIds(html, page.id),
  };
}

function getMetaContent(html, name) {
  let regex = new RegExp(`<meta[^>]*(?:name|property)="${name}"[^>]*content="([^"]*)"`);
  let match = html.match(regex);
  if (!match) {
    regex = new RegExp(`<meta[^>]*(?:name|property)='${name}'[^>]*content='([^']*)'`);
    match = html.match(regex);
  }
  return match ? match[1] : '';
}

export async function fetchServicioPageMetadataBySlug(slug) {
  const pages = await fetchPagesBySlug(slug, 'yoast_head');
  const pageData = pages?.[0];
  if (!pageData?.yoast_head) {
    return {
      yoast_wpseo_title: `Playful Agency - ${slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
      yoast_wpseo_metadesc: 'Agencia de marketing digital y desarrollo web',
      yoast_wpseo_canonical: '',
      yoast_wpseo_og_title: '',
      yoast_wpseo_og_description: '',
      yoast_wpseo_og_image: '',
    };
  }
  const titleMatch = pageData.yoast_head.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : 'Playful Agency';
  return {
    yoast_wpseo_title: title,
    yoast_wpseo_metadesc: getMetaContent(pageData.yoast_head, 'description'),
    yoast_wpseo_canonical: getMetaContent(pageData.yoast_head, 'canonical'),
    yoast_wpseo_og_title: getMetaContent(pageData.yoast_head, 'og:title'),
    yoast_wpseo_og_description: getMetaContent(pageData.yoast_head, 'og:description'),
    yoast_wpseo_og_image: getMetaContent(pageData.yoast_head, 'og:image'),
  };
}