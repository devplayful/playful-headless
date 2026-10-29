/**
 * Seed idempotente: alts SEO fase H5 en posts Payload (criterio B).
 *
 *   DATABASE_URI=postgres://... npm run cms:seed-posts-alts-h5
 *
 * Aplica overrides del CSV/lista cerrada 29 oct. El post 66684 (fila 33) solo
 * si la URL pública responde HTTP 200 (curl HEAD, PlayfulQA/1.0, ?qa=1).
 */
import { writeFileSync } from 'node:fs';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  activeH5ContentAltOverrides,
  POST_CONTENT_ALT_OVERRIDE_66684_H5,
} from '../cms/data/posts-content-alt-h5.ts';
import { applyContentAltOverrides, contentImages, type ContentImage } from '../cms/lib/post-content-images.ts';
import { probePost66684PublicStatus, shouldApply66684ContentAlt } from '../lib/payload-h5-alt-check.ts';

type PostDoc = {
  id: number | string;
  wpId?: number | null;
  slug?: string | null;
  contentHtml?: string | null;
  imagenesContenido?: ContentImage[] | null;
};

async function findPostByWpId(payload: Payload, wpId: number): Promise<PostDoc | null> {
  const found = await payload.find({
    collection: 'posts',
    where: { wpId: { equals: wpId } },
    limit: 1,
    depth: 0,
  });
  return (found.docs[0] as PostDoc | undefined) ?? null;
}

async function main() {
  const probe = await probePost66684PublicStatus();
  const include66684 = shouldApply66684ContentAlt(probe);
  const overrides = activeH5ContentAltOverrides(include66684);

  const payload = await getPayload({ config });
  const touched: { wpId: number; slug: string; images: number }[] = [];
  const skipped66684 = !include66684;

  const wpIds = new Set(overrides.map((o) => o.wpId));
  for (const wpId of wpIds) {
    const doc = await findPostByWpId(payload, wpId);
    if (!doc) {
      console.warn(`posts wpId=${wpId}: no encontrado (¿falta cms:import?)`);
      continue;
    }
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

  const report = {
    fin: new Date().toISOString(),
    post66684: { ...probe, applied: include66684, override: POST_CONTENT_ALT_OVERRIDE_66684_H5.alt },
    postsActualizados: touched,
    skipped66684BecauseNot200: skipped66684,
  };
  writeFileSync('docs/seed-posts-alts-h5-resultado.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
