import type { Payload } from 'payload';
import {
  H5_PREVIEW_BUILD_VERIFY,
  H5_PREVIEW_BUILD_VERIFY_COUNT,
} from '../data/posts-content-alt-h5.ts';
import { applyBlogPostContentAltH5ToHtml } from '../../lib/blog-post-content-alt-h5.ts';
import { findPostByWpId } from './h5-posts-alt-seed.ts';
import { readAltFromPostHtml } from './post-content-images.ts';

const WP = (process.env.WP_REST_URL || 'https://endpoint.playfulagency.com/wp-json').replace(/\/$/, '');
const UA = 'PlayfulQA/1.0';

function escapeLogAlt(alt: string): string {
  return alt.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

async function fetchWpPostContentHtml(wpId: number): Promise<string> {
  const res = await fetch(`${WP}/wp/v2/posts/${wpId}?_fields=id,content`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) return '';
  const data = (await res.json()) as { content?: { rendered?: string } };
  return data.content?.rendered || '';
}

/** HTML del cuerpo como lo sirve la plantilla: WP content.rendered + overrides H5. */
export async function servedBlogPostContentHtml(wpId: number): Promise<string> {
  const raw = await fetchWpPostContentHtml(wpId);
  return applyBlogPostContentAltH5ToHtml(raw, wpId);
}

export async function logH5PreviewBuildVerification(payload: Payload): Promise<{ ok: number; total: number }> {
  let ok = 0;
  const total = H5_PREVIEW_BUILD_VERIFY_COUNT;
  const wpIdsSynced = new Set<number>();

  for (const check of H5_PREVIEW_BUILD_VERIFY) {
    const servedHtml = await servedBlogPostContentHtml(check.wpId);
    const readAlt = readAltFromPostHtml(servedHtml, check.srcContains);
    const matches = readAlt === check.expectedAlt;
    if (matches) ok++;

    if (!wpIdsSynced.has(check.wpId)) {
      wpIdsSynced.add(check.wpId);
      const doc = await findPostByWpId(payload, check.wpId);
      if (doc) {
        await payload.update({
          collection: 'posts',
          id: doc.id,
          data: { contentHtml: servedHtml },
          depth: 0,
        });
      }
    }

    console.log(
      `[H5-ALT] wpId=${check.wpId} src=${check.srcContains} alt="${escapeLogAlt(readAlt)}" ok=${matches}`,
    );
  }

  console.log(`[H5-ALT] resumen ok=${ok}/${total}`);
  return { ok, total };
}
