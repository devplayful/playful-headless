import type { Payload } from 'payload';
import {
  H5_PREVIEW_BUILD_VERIFY,
  H5_PREVIEW_BUILD_VERIFY_COUNT,
} from '../data/posts-content-alt-h5.ts';
import { findPostByWpId } from './h5-posts-alt-seed.ts';
import { srcMatchesFragment, type ContentImage } from './post-content-images.ts';

function escapeLogAlt(alt: string): string {
  return alt.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function readAltFromImages(images: ContentImage[] | null | undefined, srcContains: string): string {
  for (const img of images || []) {
    if (srcMatchesFragment(img.src, srcContains)) return img.alt ?? '';
  }
  return '';
}

export async function logH5PreviewBuildVerification(payload: Payload): Promise<{ ok: number; total: number }> {
  let ok = 0;
  const total = H5_PREVIEW_BUILD_VERIFY_COUNT;

  for (const check of H5_PREVIEW_BUILD_VERIFY) {
    const doc = await findPostByWpId(payload, check.wpId);
    const readAlt = readAltFromImages(doc?.imagenesContenido, check.srcContains);
    const matches = readAlt === check.expectedAlt;
    if (matches) ok++;
    console.log(
      `[H5-ALT] wpId=${check.wpId} src=${check.srcContains} alt="${escapeLogAlt(readAlt)}" ok=${matches}`,
    );
  }

  console.log(`[H5-ALT] resumen ok=${ok}/${total}`);
  return { ok, total };
}
