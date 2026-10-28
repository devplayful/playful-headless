/**
 * Seed idempotente de la colección Casos:
 *  1) SoyTechno (tercer registro; no existe en WP) a partir del copy del código.
 *  2) url_video de Jumex y Odwalla (el import lo deja en null).
 *
 *   DATABASE_URI=postgres://... npm run cms:seed-casos
 *
 * Se puede volver a correr: busca por slug (SoyTechno) o wpId/slug (Jumex/Odwalla).
 * No pisa el ACF importado de Jumex/Odwalla; solo rellena url_video.
 */
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  CASOS_URL_VIDEO,
  CASOS_URL_VIDEO_TITULOS,
  CASOS_URL_VIDEO_WP_IDS,
} from '../cms/data/casos-url-video.ts';
import { soyTechnoPayloadData, SOYTECHNO_SLUG } from '../cms/data/soytechno-caso.ts';

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

async function upsertSoyTechno(payload: Payload): Promise<Action> {
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

async function upsertUrlVideo(
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

async function ensureAdmin(payload: Payload) {
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

async function main() {
  const payload = await getPayload({ config });
  const soytechno = await upsertSoyTechno(payload);
  const jumex = await upsertUrlVideo(payload, 'jumex-shopify-dtc-ecommerce');
  const odwalla = await upsertUrlVideo(payload, 'odwalla-shopify-dtc-ecommerce');
  const admin = await ensureAdmin(payload);
  const count = await payload.count({ collection: 'casos' });
  const result = {
    soytechno,
    jumex_url_video: { accion: jumex, url: CASOS_URL_VIDEO['jumex-shopify-dtc-ecommerce'] },
    odwalla_url_video: { accion: odwalla, url: CASOS_URL_VIDEO['odwalla-shopify-dtc-ecommerce'] },
    admin,
    casos: count.totalDocs,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
