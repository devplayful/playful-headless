/**
 * Seed idempotente: alts SEO fase H5 en posts Payload (criterio B).
 *
 *   DATABASE_URI=postgres://... npm run cms:seed-posts-alts-h5
 */
import { writeFileSync } from 'node:fs';
import { getPayload } from 'payload';
import config from '../payload.config.ts';
import { runH5PostsAltSeed } from '../cms/lib/h5-posts-alt-seed.ts';

async function main() {
  const payload = await getPayload({ config });
  const result = await runH5PostsAltSeed(payload);
  const report = {
    fin: new Date().toISOString(),
    post66684: {
      ...result.probe,
      applied: result.include66684,
      override: result.override66684Alt,
    },
    postsActualizados: result.touched,
    skipped66684BecauseNot200: !result.include66684,
  };
  writeFileSync('docs/seed-posts-alts-h5-resultado.json', `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
