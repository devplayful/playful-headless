/**
 * Seed idempotente de la colección Casos:
 *  1) SoyTechno (tercer registro; no existe en WP) a partir del copy del código.
 *  2) url_video de Jumex y Odwalla (el import lo deja en null).
 *
 *   DATABASE_URI=postgres://... npm run cms:seed-casos
 */
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import {
  CASOS_URL_VIDEO,
} from '../cms/data/casos-url-video.ts';
import {
  ensureAdmin,
  upsertSoyTechno,
  upsertUrlVideoForSlug,
} from './seed-casos-h4-lib.mts';

async function main() {
  const payload = await getPayload({ config });
  const soytechno = await upsertSoyTechno(payload);
  const jumex = await upsertUrlVideoForSlug(payload, 'jumex-shopify-dtc-ecommerce');
  const odwalla = await upsertUrlVideoForSlug(payload, 'odwalla-shopify-dtc-ecommerce');
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
