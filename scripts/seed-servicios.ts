/**
 * Seed idempotente de la colección Servicios (H3):
 *  - 5 landings /agencia-* desde WordPress (REST + HTML Elementor procesado).
 *  - /agencia-shopify desde copy.ts del código.
 *
 *   DATABASE_URI=postgres://... npm run cms:seed-servicios
 */
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import {
  agenciaShopifyPayloadData,
  AGENCIA_SHOPIFY_SLUG,
} from '../cms/data/agencia-shopify-payload.ts';
import { WP_SERVICIO_SLUGS } from '../cms/data/servicios-wp-slugs.ts';
import { extractH1FromElementorHtml } from '../lib/cms-servicios.ts';
import { getPageBySlug, getPageMetadataBySlug } from '../services/wordpress.ts';
import { getServiceFaqJsonLd } from '../utils/service-faq-jsonld.ts';

type Action = 'creado' | 'actualizado';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function findOne(
  payload: Payload,
  where: Record<string, unknown>,
): Promise<{ id: number | string } | null> {
  const found = await payload.find({
    collection: 'servicios',
    where: where as never,
    limit: 1,
    depth: 0,
  });
  return found.docs[0] ? { id: found.docs[0].id } : null;
}

function faqBlockFromSlug(slug: string) {
  const jsonLd = getServiceFaqJsonLd(slug);
  if (!jsonLd || !Array.isArray(jsonLd.mainEntity)) return null;
  const items = jsonLd.mainEntity
    .map((entity) => {
      if (!entity || typeof entity !== 'object') return null;
      const record = entity as Record<string, unknown>;
      const question = typeof record.name === 'string' ? record.name : '';
      const answerRecord =
        record.acceptedAnswer && typeof record.acceptedAnswer === 'object'
          ? (record.acceptedAnswer as Record<string, unknown>)
          : null;
      const answer =
        answerRecord && typeof answerRecord.text === 'string' ? answerRecord.text : '';
      if (!question || !answer) return null;
      return { question, answer };
    })
    .filter(Boolean);
  if (!items.length) return null;
  return {
    blockType: 'faq' as const,
    h2: 'Preguntas frecuentes',
    items,
  };
}

async function buildWpServicio(slug: (typeof WP_SERVICIO_SLUGS)[number]) {
  const page = await getPageBySlug(slug);
  if (!page) {
    throw new Error(`WP page not found: ${slug}`);
  }
  const meta = await getPageMetadataBySlug(slug);
  const h1 = extractH1FromElementorHtml(page.html);
  const faq = faqBlockFromSlug(slug);
  const bloques: Record<string, unknown>[] = [
    {
      blockType: 'elementor',
      pageId: page.id,
      html: page.html,
      stylesheetIds: page.stylesheetIds.map((id) => ({ id })),
    },
  ];
  if (faq) bloques.push(faq);

  return {
    titulo: page.title,
    slug: page.slug,
    wpId: page.id,
    h1,
    estado: 'publish',
    bloques,
    yoast: {
      title: meta.yoast_wpseo_title,
      description: meta.yoast_wpseo_metadesc,
      canonical: meta.yoast_wpseo_canonical,
      ogTitle: meta.yoast_wpseo_og_title,
      ogDescription: meta.yoast_wpseo_og_description,
      ogImage: meta.yoast_wpseo_og_image,
    },
  };
}

async function upsertServicio(payload: Payload, data: Record<string, unknown>): Promise<Action> {
  const slug = String(data.slug);
  const wpId = typeof data.wpId === 'number' ? data.wpId : undefined;
  const existing =
    (await findOne(payload, { slug: { equals: slug } })) ||
    (wpId !== undefined ? await findOne(payload, { wpId: { equals: wpId } }) : null);
  if (existing) {
    await payload.update({ collection: 'servicios', id: existing.id, data, depth: 0 });
    return 'actualizado';
  }
  await payload.create({ collection: 'servicios', data, depth: 0 });
  return 'creado';
}

async function main() {
  const payload = await getPayload({ config });
  const acciones: Record<string, Action> = {};

  for (const slug of WP_SERVICIO_SLUGS) {
    const data = await buildWpServicio(slug);
    acciones[slug] = await upsertServicio(payload, data);
    await sleep(1000);
  }

  const shopifyData = agenciaShopifyPayloadData();
  acciones[AGENCIA_SHOPIFY_SLUG] = await upsertServicio(payload, shopifyData);

  const count = await payload.count({ collection: 'servicios' });
  console.log(JSON.stringify({ acciones, servicios: count.totalDocs }, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
