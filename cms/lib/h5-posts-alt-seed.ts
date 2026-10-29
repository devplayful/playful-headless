import type { Payload } from 'payload';
import {
  activeH5ContentAltOverrides,
  POST_CONTENT_ALT_OVERRIDE_66684_H5,
} from '../data/posts-content-alt-h5.ts';
import { applyContentAltOverrides, contentImages, type ContentImage } from './post-content-images.ts';
import { probePost66684PublicStatus, shouldApply66684ContentAlt } from '../../lib/payload-h5-alt-check.ts';

export type PostDoc = {
  id: number | string;
  wpId?: number | null;
  slug?: string | null;
  contentHtml?: string | null;
  imagenesContenido?: ContentImage[] | null;
};

export async function findPostByWpId(payload: Payload, wpId: number): Promise<PostDoc | null> {
  const found = await payload.find({
    collection: 'posts',
    where: { wpId: { equals: wpId } },
    limit: 1,
    depth: 0,
  });
  return (found.docs[0] as PostDoc | undefined) ?? null;
}

export async function runH5PostsAltSeed(payload: Payload) {
  const probe = await probePost66684PublicStatus();
  const include66684 = shouldApply66684ContentAlt(probe);
  const overrides = activeH5ContentAltOverrides(include66684);
  const touched: { wpId: number; slug: string; images: number }[] = [];

  const wpIds = new Set(overrides.map((o) => o.wpId));
  for (const wpId of Array.from(wpIds)) {
    const doc = await findPostByWpId(payload, wpId);
    if (!doc) continue;
    const html = doc.contentHtml || '';
    const images = (doc.imagenesContenido?.length ? doc.imagenesContenido : contentImages(html)) as ContentImage[];
    const { html: nextHtml, images: nextImages } = applyContentAltOverrides(wpId, html, images, overrides);
    await payload.update({
      collection: 'posts',
      id: doc.id,
      data: { contentHtml: nextHtml, imagenesContenido: nextImages },
      depth: 0,
    });
    touched.push({ wpId, slug: doc.slug || '', images: overrides.filter((o) => o.wpId === wpId).length });
  }

  return {
    probe,
    include66684,
    override66684Alt: POST_CONTENT_ALT_OVERRIDE_66684_H5.alt,
    touched,
  };
}
