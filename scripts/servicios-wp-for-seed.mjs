/**
 * Lectura WP para cms:seed-servicios sin importar services/wordpress.ts (Next cache).
 */
import { applyImageAltOverrides } from '../lib/image-alt-overrides.ts';
import { rewriteAgenciaDisenoUxUiLink } from '../utils/agencia-diseno-ux-ui-link.ts';
import { rewriteElementorBodyHrefs } from '../utils/booking.ts';
import { rewriteEcommerceShopifyLink } from '../utils/ecommerce-shopify-link.ts';
import { rewriteEcommerceSoytechnoCaseLink } from '../utils/ecommerce-soytechno-case-link.ts';
import { rewriteEcommerceZelleCover } from '../utils/ecommerce-zelle-cover.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';

const WP =
  (process.env.WORDPRESS_API_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const UA = 'PlayfulQA/1.0';

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

async function wpFetch(path) {
  const res = await fetch(`${WP}${path}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${path}`);
  return res.json();
}

export async function fetchServicioPageBySlug(slug) {
  const pages = await wpFetch(
    `/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=id,slug,title,content`,
  );
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
  const pages = await wpFetch(
    `/wp/v2/pages?slug=${encodeURIComponent(slug)}&_fields=yoast_head`,
  );
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
