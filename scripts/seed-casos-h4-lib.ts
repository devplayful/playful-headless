/**
 * Lógica compartida de seed Casos (H4) para cms:seed-casos y preview-h4-casos.
 */
import type { Payload } from 'payload';
import {
  CASOS_URL_VIDEO,
  CASOS_URL_VIDEO_TITULOS,
  CASOS_URL_VIDEO_WP_IDS,
} from '../cms/data/casos-url-video.ts';
import { soyTechnoPayloadData, SOYTECHNO_SLUG } from '../cms/data/soytechno-caso.ts';

export const H4_CASO_SLUGS = [
  'jumex-shopify-dtc-ecommerce',
  'odwalla-shopify-dtc-ecommerce',
  SOYTECHNO_SLUG,
] as const;

export type H4CasoSlug = (typeof H4_CASO_SLUGS)[number];

type Action = 'creado' | 'actualizado';

async function findOne(
  payload: Payload,
  where: Record<string, unknown>,
): Promise<{ id: number | string } | null> {
  const found = await payload.find({
    collection: 'casos',
    where: where as never,
    limit: 1,
    depth: 0,
  });
  return found.docs[0] ? { id: found.docs[0].id } : null;
}

export async function upsertSoyTechno(payload: Payload): Promise<Action> {
  const data = soyTechnoPayloadData();
  const existing =
    (await findOne(payload, { slug: { equals: SOYTECHNO_SLUG } })) ||
    (await findOne(payload, { wpId: { equals: data.wpId } }));
  const body = {
    titulo: data.titulo,
    slug: data.slug,
    wpId: data.wpId,
    estado: data.estado,
    contentHtml: data.contentHtml,
    url_video: data.url_video,
    acf: data.acf,
    yoast: data.yoast,
  };
  if (existing) {
    await payload.update({ collection: 'casos', id: existing.id, data: body, depth: 0 });
    return 'actualizado';
  }
  await payload.create({ collection: 'casos', data: body, depth: 0 });
  return 'creado';
}

export async function upsertUrlVideoForSlug(
  payload: Payload,
  slug: keyof typeof CASOS_URL_VIDEO,
): Promise<Action> {
  const wpId = CASOS_URL_VIDEO_WP_IDS[slug];
  const url_video = CASOS_URL_VIDEO[slug];
  const existing =
    (await findOne(payload, { wpId: { equals: wpId } })) ||
    (await findOne(payload, { slug: { equals: slug } }));
  if (existing) {
    await payload.update({
      collection: 'casos',
      id: existing.id,
      data: { url_video },
      depth: 0,
    });
    return 'actualizado';
  }
  await payload.create({
    collection: 'casos',
    data: {
      titulo: CASOS_URL_VIDEO_TITULOS[slug],
      slug,
      wpId,
      estado: 'publish',
      url_video,
      contentHtml: '',
    },
    depth: 0,
  });
  return 'creado';
}

export async function ensureAdmin(payload: Payload) {
  const email = process.env.CMS_ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.CMS_ADMIN_PASSWORD || 'playful-local';
  const found = await payload.find({
    collection: 'usuarios',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  });
  if (found.docs[0]) return { email, created: false };
  await payload.create({
    collection: 'usuarios',
    data: { email, password, nombre: 'Admin local' },
    depth: 0,
  });
  return { email, created: true };
}
