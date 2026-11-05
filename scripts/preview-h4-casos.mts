/**
 * Preview build (H4): import WP casos + seed idempotente + log [H4-CASOS] por slug.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload, type Payload } from 'payload';
import config from '../payload.config.ts';
import { importCasosFromWordPress } from './import-casos-wp.ts';
import {
  upsertSoyTechno,
  upsertUrlVideoForSlug,
  H4_CASO_SLUGS,
  SOYTECHNO_SLUG,
} from './seed-casos-h4-lib.mts';
import { CASOS_URL_VIDEO } from '../cms/data/casos-url-video.ts';

const LOG_PREFIX = '[H4-CASOS]';

function logLine(slug: string, ok: boolean, detail?: string) {
  const suffix = detail ? ` (${detail})` : '';
  const line = `${LOG_PREFIX} ${slug} ${ok ? 'OK' : 'ERROR'}${suffix}`;
  console.log(line);
  return line;
}

async function verifyCaso(
  payload: Payload,
  slug: (typeof H4_CASO_SLUGS)[number],
): Promise<{ ok: boolean; detail: string }> {
  const found = await payload.find({
    collection: 'casos',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  });
  const doc = found.docs[0];
  if (!doc) return { ok: false, detail: 'documento no encontrado' };
  if (slug in CASOS_URL_VIDEO) {
    const expected = CASOS_URL_VIDEO[slug as keyof typeof CASOS_URL_VIDEO];
    if (doc.url_video !== expected) {
      return { ok: false, detail: `url_video=${String(doc.url_video)} esperado ${expected}` };
    }
  }
  if (slug === SOYTECHNO_SLUG && doc.wpId !== -71001) {
    return { ok: false, detail: `wpId=${String(doc.wpId)}` };
  }
  return { ok: true, detail: 'verificado' };
}

async function main() {
  let exitCode = 0;
  let okCount = 0;
  let errCount = 0;

  try {
    const imported = await importCasosFromWordPress();
    console.log(
      `${LOG_PREFIX} import-wp OK (casos=${imported.casos}, medios=${imported.medios}, requests=${imported.requests})`,
    );
  } catch (err) {
    console.error(`${LOG_PREFIX} import-wp ERROR:`, err);
    exitCode = 1;
  }

  const payload = await getPayload({ config });

  const seedSteps: Array<{
    slug: (typeof H4_CASO_SLUGS)[number];
    run: () => Promise<string>;
  }> = [
    {
      slug: 'jumex-shopify-dtc-ecommerce',
      run: async () => {
        const action = await upsertUrlVideoForSlug(payload, 'jumex-shopify-dtc-ecommerce');
        return `url_video ${action}`;
      },
    },
    {
      slug: 'odwalla-shopify-dtc-ecommerce',
      run: async () => {
        const action = await upsertUrlVideoForSlug(payload, 'odwalla-shopify-dtc-ecommerce');
        return `url_video ${action}`;
      },
    },
    {
      slug: SOYTECHNO_SLUG,
      run: async () => {
        const action = await upsertSoyTechno(payload);
        return `soytechno ${action}`;
      },
    },
  ];

  for (const step of seedSteps) {
    try {
      const seedDetail = await step.run();
      const check = await verifyCaso(payload, step.slug);
      if (check.ok) {
        logLine(step.slug, true, seedDetail);
        okCount += 1;
      } else {
        logLine(step.slug, false, `${seedDetail}; ${check.detail}`);
        errCount += 1;
        exitCode = 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logLine(step.slug, false, message);
      errCount += 1;
      exitCode = 1;
    }
  }

  console.log(`${LOG_PREFIX} resumen: ${okCount} OK / ${errCount} ERROR`);

  const count = await payload.count({ collection: 'casos' });
  console.log(
    JSON.stringify({ h4: 'casos', casos: count.totalDocs, slugs: H4_CASO_SLUGS }, null, 2),
  );
  process.exit(exitCode);
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
if (fileURLToPath(import.meta.url) === invokedPath) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
