/**
 * Inventario endpoint no-imagen (CSS/JS/fuentes) en landings Elementor — antes/después preview H2.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import {
  ELEMENTOR_PAGE_SCRIPTS,
  ELEMENTOR_SERVICE_PAGE_SLUGS,
  WP_ENDPOINT_ORIGIN,
} from '../lib/elementor-static-asset-urls.ts';
import {
  collectElementorStylesheetIds,
  elementorPageStylesheetUrls,
  elementorStylesheetLinkHtml,
} from '../lib/elementor-stylesheet-urls.ts';
import {
  countEndpointHostRefs,
  countNonImageEndpointStaticRefs,
  rewriteEndpointAssetUrlForPreview,
  rewriteElementorScriptUrlForPreview,
} from '../lib/wp-endpoint-surface.ts';
import { loadWpStaticAssetsMap } from '../lib/wp-static-assets-map.ts';
import inventory from '../docs/wp-static-assets-inventory.json' with { type: 'json' };

const AUDIT_ENV = { ...process.env, CMS_BLOB_IMAGES: '1' } as NodeJS.ProcessEnv;
const WP_JSON = `${WP_ENDPOINT_ORIGIN}/wp-json`;
const OUT = path.join(process.cwd(), 'docs/wp-static-endpoint-audit.json');

async function wpPage(slug: string) {
  const res = await fetch(`${WP_JSON}/wp/v2/pages?slug=${slug}&_fields=id,content`, {
    headers: { 'User-Agent': 'PlayfulQA/1.0', Accept: 'application/json' },
  });
  const rows = await res.json();
  return rows[0] as { id: number; content: { rendered: string } } | undefined;
}

function scriptTags(urls: string[]): string {
  return urls.map((src) => `<script src="${src}"></script>`).join('\n');
}

async function main() {
  const before: Record<string, number> = {
    'css-link-href': 0,
    'script-src': 0,
    'font-face-header-fix': 5,
    'total-non-image-static': 0,
  };
  const after: Record<string, number> = { ...before, 'font-face-header-fix': 0 };

  const allCssBefore: string[] = [];
  const allCssAfter: string[] = [];
  const allScriptsBefore = [...ELEMENTOR_PAGE_SCRIPTS];
  const allScriptsAfter = ELEMENTOR_PAGE_SCRIPTS.map((u) => rewriteElementorScriptUrlForPreview(u, AUDIT_ENV));

  for (const slug of ELEMENTOR_SERVICE_PAGE_SLUGS) {
    const page = await wpPage(slug);
    if (!page) continue;
    const sheets = elementorPageStylesheetUrls(
      page.id,
      collectElementorStylesheetIds(page.content.rendered, page.id),
    );
    allCssBefore.push(...sheets);
    allCssAfter.push(...sheets.map((u) => rewriteEndpointAssetUrlForPreview(u, AUDIT_ENV)));
  }

  const cssHtmlBefore = elementorStylesheetLinkHtml(Array.from(new Set(allCssBefore)));
  const cssHtmlAfter = elementorStylesheetLinkHtml(Array.from(new Set(allCssAfter)));
  const scriptsHtmlBefore = scriptTags(allScriptsBefore);
  const scriptsHtmlAfter = scriptTags(allScriptsAfter);

  before['css-link-href'] = countNonImageEndpointStaticRefs(cssHtmlBefore);
  before['script-src'] = countNonImageEndpointStaticRefs(scriptsHtmlBefore);
  before['total-non-image-static'] =
    before['css-link-href'] + before['script-src'] + before['font-face-header-fix'];

  after['css-link-href'] = countNonImageEndpointStaticRefs(cssHtmlAfter);
  after['script-src'] = countNonImageEndpointStaticRefs(scriptsHtmlAfter);
  after['font-face-header-fix'] = 0;
  after['total-non-image-static'] =
    after['css-link-href'] + after['script-src'] + after['font-face-header-fix'];

  const mapKeys = Object.keys(loadWpStaticAssetsMap()).length;
  const report = {
    generated: new Date().toISOString(),
    mappedAssets: mapKeys,
    inventory404: inventory.http404,
    items404: inventory.items.filter((i) => i.httpStatus === 404),
    before,
    after,
  };
  writeFileSync(OUT, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
