import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const {
  soyTechnoApprovedCopy,
  SOYTECHNO_SLUG,
  SOYTECHNO_LOCAL_WP_ID,
  soyTechnoPayloadData,
} = await import('../cms/data/soytechno-caso.ts');
const { CASOS_URL_VIDEO, CASOS_URL_VIDEO_WP_IDS } = await import(
  '../cms/data/casos-url-video.ts'
);
const {
  isCmsCasosFromPayload,
  CMS_CASOS_FROM_PAYLOAD_ENV,
  shouldRenderCasosFromPayload,
  parseCmsPreviewQuery,
} = await import('../lib/cms-casos-flag.ts');
const buildScript = readFileSync(new URL('../scripts/build-with-budget.mjs', import.meta.url), 'utf8');
const middleware = readFileSync(new URL('../middleware.ts', import.meta.url), 'utf8');
const hubPage = readFileSync(new URL('../app/(frontend)/casos-de-exito/hub-page.tsx', import.meta.url), 'utf8');

const soytechnoBody = readFileSync(
  new URL('../components/soytechno/SoyTechnoCaseStudy.tsx', import.meta.url),
  'utf8',
);
const page = readFileSync(
  new URL('../app/(frontend)/casos-de-exito/[slug]/page.tsx', import.meta.url),
  'utf8',
);
const seed = readFileSync(new URL('../scripts/seed-casos.ts', import.meta.url), 'utf8');
const importer = readFileSync(new URL('../scripts/import-wp.ts', import.meta.url), 'utf8');

test('feature flag is off by default and shared by Jumex, Odwalla and SoyTechno', () => {
  assert.equal(isCmsCasosFromPayload({}), false);
  assert.equal(isCmsCasosFromPayload({ [CMS_CASOS_FROM_PAYLOAD_ENV]: 'false' }), false);
  assert.equal(isCmsCasosFromPayload({ [CMS_CASOS_FROM_PAYLOAD_ENV]: 'true' }), true);
  assert.equal(shouldRenderCasosFromPayload(true, { VERCEL_ENV: 'production' }), false);
  assert.equal(shouldRenderCasosFromPayload(true, { VERCEL_ENV: 'preview' }), true);
  assert.equal(parseCmsPreviewQuery({ cms: '1' }), true);
  assert.match(page, /resolveRenderCasosFromPayloadServer\(\)/);
  assert.match(page, /getSuccessStoryFromPayload\(slug/);
  assert.match(page, /findCasoBySlug\(slug/);
  assert.match(page, /slug === 'soytechno-ecommerce-venezuela'/);
  assert.match(hubPage, /getAllCaseStudiesFromPayload/);
  assert.match(middleware, /cmsPreviewCasosHubPath/);
  assert.match(buildScript, /preview-h4-casos/);
  assert.match(readFileSync(new URL('../scripts/preview-h4-casos.mts', import.meta.url), 'utf8'), /\[H4-CASOS\]/);
  assert.match(
    readFileSync(new URL('../scripts/preview-h4-casos.mts', import.meta.url), 'utf8'),
    /resumen:/,
  );
});

test('seed data copies SoyTechno approvedCopy character-for-character from the component', () => {
  for (const [key, value] of Object.entries(soyTechnoApprovedCopy)) {
    assert.ok(soytechnoBody.includes(`'${value}'`) || soytechnoBody.includes(`"${value}"`), key);
  }
  assert.equal(SOYTECHNO_SLUG, 'soytechno-ecommerce-venezuela');
  assert.equal(SOYTECHNO_LOCAL_WP_ID, -71001);
  const payload = soyTechnoPayloadData();
  assert.equal(payload.slug, SOYTECHNO_SLUG);
  assert.equal(payload.acf.template, 'soytechno_case_study');
  assert.equal(payload.acf.soytechno.copy.title, soyTechnoApprovedCopy.title);
  assert.ok(payload.acf.soytechno.seccion_a);
  assert.ok(payload.acf.soytechno.seccion_f);
});

test('summarizePreviewH4CasosOutput counts slug lines and resumen', async () => {
  const { summarizePreviewH4CasosOutput } = await import('../scripts/build-with-budget.mjs');
  const sample = `
[H4-CASOS] import-wp OK (casos=2, medios=45, requests=4)
[H4-CASOS] jumex-shopify-dtc-ecommerce OK (url_video actualizado)
[H4-CASOS] odwalla-shopify-dtc-ecommerce OK (url_video actualizado)
[H4-CASOS] soytechno-ecommerce-venezuela OK (soytechno actualizado)
[H4-CASOS] resumen: 3 OK / 0 ERROR
`;
  const summary = summarizePreviewH4CasosOutput(sample);
  assert.equal(summary.ok, 3);
  assert.equal(summary.err, 0);
  assert.equal(summary.lines.length, 3);
});

test('url_video values are the mp4s that production serves today', () => {
  assert.equal(
    CASOS_URL_VIDEO['jumex-shopify-dtc-ecommerce'],
    'https://playfulagency.com/videos/casos/jumex-ux.mp4',
  );
  assert.equal(
    CASOS_URL_VIDEO['odwalla-shopify-dtc-ecommerce'],
    'https://playfulagency.com/videos/casos/odwalla.mp4',
  );
  assert.equal(CASOS_URL_VIDEO_WP_IDS['jumex-shopify-dtc-ecommerce'], 86237);
  assert.equal(CASOS_URL_VIDEO_WP_IDS['odwalla-shopify-dtc-ecommerce'], 86235);
  assert.match(seed, /url_video/);
  assert.match(importer, /existing\.docs\[0\]\?\.url_video/);
});
