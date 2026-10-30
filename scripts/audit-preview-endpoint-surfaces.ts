/**
 * Recuentos endpoint en superficies medidas en preview.
 *   CMS_BLOB_IMAGES=1 node scripts/audit-preview-endpoint-surfaces.ts
 */
import { applyBlobImagesToHtml, applyBlobImagesToUrl } from '../lib/blob-image-render.ts';
import { publicWebpIfPresent } from '../lib/public-webp-src.ts';
import { resolveBlogCoverUrl } from '../lib/blog-cover-image.ts';
import {
  elementorPageStylesheetUrls,
  elementorStylesheetLinkHtml,
} from '../lib/elementor-stylesheet-urls.ts';
import {
  rewriteEndpointAssetUrlForPreview,
  countEndpointHostRefs,
  countWtiPixelRefs,
} from '../lib/wp-endpoint-surface.ts';
import { blogBodyForSlug } from '../lib/blog-body-overrides.ts';
import { optimizeBlogInlineMedia } from '../lib/blog-inline-media.ts';
import { rewriteBookingWidgetHrefs } from '../utils/booking.ts';
import { rewriteInSitePageHrefs } from '../services/rewrite-in-site-hrefs.mjs';

const AUDIT_ENV = { ...process.env, CMS_BLOB_IMAGES: '1' } as NodeJS.ProcessEnv;
const WP = 'https://endpoint.playfulagency.com/wp-json';

function collectStylesheetIds(html: string, pageId: number): number[] {
  const ids = new Set<number>([pageId]);
  for (const match of html.matchAll(/elementor-post-(\d+)/g)) {
    const id = Number(match[1]);
    if (!Number.isNaN(id)) ids.add(id);
  }
  return Array.from(ids);
}

function prepareSemPageHtml(raw: string): string {
  return applyBlobImagesToHtml(rewriteInSitePageHrefs(raw, '/agencia-sem'), AUDIT_ENV);
}

async function wpJson(path: string): Promise<any> {
  const res = await fetch(`${WP}${path}`, {
    headers: { 'User-Agent': 'PlayfulQA/1.0', Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${path}`);
  return res.json();
}

async function main() {
  const before = {
    'home-blog-card-imageUrl': 1,
    'agencia-sem-endpoint-host': 95,
    'agencia-sem-elementor-css-href': 87,
    'agencia-sem-wti-pixel': 4,
    'sem-post-endpoint-host': 8,
    'sem-post-wti-pixel': 4,
    'sem-post-svg-endpoint': 4,
  };

  const fundUrl =
    'https://endpoint.playfulagency.com/wp-content/uploads/2024/04/Los-fundamentos-del-desarrollo-de-aplicaciones-web.png';
  const homeCard = applyBlobImagesToUrl(
    publicWebpIfPresent(resolveBlogCoverUrl('los-fundamentos-del-desarrollo-de-aplicaciones-web', fundUrl)),
    AUDIT_ENV,
  );

  const pages = await wpJson('/wp/v2/pages?slug=agencia-sem&_fields=id,content');
  const semRaw = pages[0]?.content?.rendered || '';
  const semPageId = pages[0]?.id || 0;
  const sheetIds = collectStylesheetIds(semRaw, semPageId);
  const sheetUrls = elementorPageStylesheetUrls(semPageId, sheetIds);
  const sheetHtmlAfter = elementorStylesheetLinkHtml(
    sheetUrls.map((u) => rewriteEndpointAssetUrlForPreview(u, AUDIT_ENV)),
  );
  const semBody = prepareSemPageHtml(semRaw);
  const semPayloadAfter = `${sheetHtmlAfter}\n${semBody}`;

  const posts = await wpJson('/wp/v2/posts?slug=que-es-una-agencia-de-sem&_fields=content');
  const semPostRaw = posts[0]?.content?.rendered || '';
  const semPostPipeline = optimizeBlogInlineMedia(
    rewriteBookingWidgetHrefs(rewriteInSitePageHrefs(blogBodyForSlug('que-es-una-agencia-de-sem') || semPostRaw, '')),
    'que-es-una-agencia-de-sem',
  );
  const semPostAfter = applyBlobImagesToHtml(semPostPipeline, AUDIT_ENV);

  const sheetHtmlBefore = elementorStylesheetLinkHtml(sheetUrls);
  const semPayloadBefore = `${sheetHtmlBefore}\n${semRaw}`;

  const after = {
    'home-blog-card-imageUrl': countEndpointHostRefs(homeCard),
    'agencia-sem-endpoint-host': countEndpointHostRefs(semPayloadAfter),
    'agencia-sem-elementor-css-href': countEndpointHostRefs(sheetHtmlAfter),
    'agencia-sem-wti-pixel': countWtiPixelRefs(semPayloadAfter),
    'sem-post-endpoint-host': countEndpointHostRefs(semPostAfter),
    'sem-post-wti-pixel': countWtiPixelRefs(semPostAfter),
    'sem-post-svg-endpoint': countEndpointHostRefs(
      semPostAfter.match(/2020\/10\/Conoce-todo-sobre[^"']*|2020\/10\/tapa_Descubre[^"']*/gi)?.join('\n') || '',
    ),
  };

  const measuredBefore = {
    'home-blog-card-imageUrl': countEndpointHostRefs(
      publicWebpIfPresent(resolveBlogCoverUrl('los-fundamentos-del-desarrollo-de-aplicaciones-web', fundUrl)),
    ),
    'agencia-sem-endpoint-host': countEndpointHostRefs(semPayloadBefore),
    'agencia-sem-elementor-css-href': countEndpointHostRefs(sheetHtmlBefore),
    'agencia-sem-wti-pixel': countWtiPixelRefs(semPayloadBefore),
    'sem-post-endpoint-host': countEndpointHostRefs(semPostPipeline),
    'sem-post-wti-pixel': countWtiPixelRefs(semPostPipeline),
    'sem-post-svg-endpoint': countEndpointHostRefs(
      semPostPipeline.match(/2020\/10\/Conoce-todo-sobre[^"']*|2020\/10\/tapa_Descubre[^"']*/gi)?.join('\n') || '',
    ),
  };

  console.log(JSON.stringify({ measuredBefore, after, userBaselineBefore: before }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
