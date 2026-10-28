/**
 * MERGE GATE. No forma parte de `test:canonical` (el CI actual sigue verde).
 *
 * `npm run test:prerelease` debe fallar mientras el HTML visible de
 * /lp/agencia-shopify (base + cada [ang]) contenga «COPY SIN FIRMAR».
 * Hoy falla por los H1 placeholder. Nada se mergea con esos H1.
 */
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const { LP_META_STATIC_ANGLES } = await import('../app/lp/agencia-shopify/variants.ts');
const {
  LP_META_SHOPIFY_META,
  LP_META_HERO_TITLES,
  LP_META_HERO_SUBTITLES,
  LP_META_CTA_PRIMARY,
  LP_META_CTA_SECONDARY,
  LP_META_CTA_STICKY,
  LP_META_PROBLEM_HEAD,
  LP_META_STORES_HEAD,
  LP_META_SERVICES,
  LP_META_PROOF_HEAD,
  LP_META_PROCESS_HEAD,
  LP_META_PROCESS_ITEMS,
  LP_META_TEAM_HEAD,
  LP_META_TEAM_BIO,
  LP_META_VE_LOCAL_PAY,
  LP_META_FAQ_HEAD,
  LP_META_FINAL_HEAD,
  LP_META_FINAL_BODY,
  LP_META_FINAL_BUTTON,
  featuredCaseNoteForAngle,
  faqItemsForMarket,
  painsForMarket,
} = await import('../app/lp/agencia-shopify/copy.ts');
/** Same visible string as `unsignedLabel` in app/lp/_lib/unsigned-copy.tsx. */
function unsignedLabel(tag) {
  return `[COPY SIN FIRMAR — ${tag}: …]`;
}

const ROUTES = ['/lp/agencia-shopify', ...LP_META_STATIC_ANGLES.map((ang) => `/lp/agencia-shopify/${ang}`)];

function angleFromPath(path) {
  const parts = path.replace(/\/+$/, '').split('/');
  const last = parts[parts.length - 1];
  return LP_META_STATIC_ANGLES.includes(last) ? last : 'generic';
}

function nextHtmlPath(routePath) {
  const rel = routePath.replace(/^\//, '');
  const candidates = [
    join(process.cwd(), '.next/server/app', `${rel}.html`),
    join(process.cwd(), '.next/server/app', rel, 'index.html'),
  ];
  return candidates.find((file) => existsSync(file)) || null;
}

/** Same visible strings Landing + StickyCta paint via unsignedLabel / UnsignedBlock. */
function synthesizeRenderedHtml(path) {
  const ang = angleFromPath(path);
  const chunks = [
    `<title>${LP_META_SHOPIFY_META.title}</title>`,
    `<meta name="description" content="${LP_META_SHOPIFY_META.description}">`,
    `<h1>${unsignedLabel(LP_META_HERO_TITLES[ang].tag)}</h1>`,
    unsignedLabel(LP_META_HERO_SUBTITLES.es.tag),
    unsignedLabel(LP_META_HERO_SUBTITLES.latam.tag),
    unsignedLabel(LP_META_HERO_SUBTITLES.ve.tag),
    unsignedLabel(LP_META_CTA_PRIMARY.tag),
    unsignedLabel(LP_META_CTA_SECONDARY.tag),
    unsignedLabel(LP_META_CTA_STICKY.tag),
    unsignedLabel(LP_META_PROBLEM_HEAD.tag),
    ...painsForMarket('es').map((block) => unsignedLabel(block.tag)),
    ...painsForMarket('latam').map((block) => unsignedLabel(block.tag)),
    unsignedLabel(LP_META_STORES_HEAD.tag),
    ...LP_META_SERVICES.map((block) => unsignedLabel(block.tag)),
    unsignedLabel(LP_META_PROOF_HEAD.tag),
    unsignedLabel(featuredCaseNoteForAngle(ang).tag),
    unsignedLabel(LP_META_PROCESS_HEAD.tag),
    ...LP_META_PROCESS_ITEMS.map((block) => unsignedLabel(block.tag)),
    unsignedLabel(LP_META_TEAM_HEAD.tag),
    unsignedLabel(LP_META_TEAM_BIO.tag),
    unsignedLabel(LP_META_VE_LOCAL_PAY.tag),
    unsignedLabel(LP_META_FAQ_HEAD.tag),
    ...faqItemsForMarket('es').flatMap((item) => [
      unsignedLabel(item.question.tag),
      unsignedLabel(item.answer.tag),
    ]),
    ...faqItemsForMarket('latam').flatMap((item) => [
      unsignedLabel(item.question.tag),
      unsignedLabel(item.answer.tag),
    ]),
    ...faqItemsForMarket('ve').flatMap((item) => [
      unsignedLabel(item.question.tag),
      unsignedLabel(item.answer.tag),
    ]),
    unsignedLabel(LP_META_FINAL_HEAD.tag),
    unsignedLabel(LP_META_FINAL_BODY.es.tag),
    unsignedLabel(LP_META_FINAL_BODY.latam.tag),
    unsignedLabel(LP_META_FINAL_BODY.ve.tag),
    unsignedLabel(LP_META_FINAL_BUTTON.tag),
  ];
  return `<!DOCTYPE html><html><head>${chunks[0]}${chunks[1]}</head><body>${chunks.slice(2).join('\n')}</body></html>`;
}

async function loadRenderedHtml(path) {
  const built = nextHtmlPath(path);
  if (built) return readFileSync(built, 'utf8');

  const base = process.env.LP_PRERELEASE_BASE_URL;
  if (base) {
    const response = await fetch(`${base.replace(/\/+$/, '')}${path}`);
    if (!response.ok) {
      throw new Error(`prerelease fetch ${path} → ${response.status}`);
    }
    return response.text();
  }

  return synthesizeRenderedHtml(path);
}

test('HTML renderizado de /lp/agencia-shopify no contiene COPY SIN FIRMAR', async () => {
  assert.ok(ROUTES.length >= 2, 'base + ángulos estáticos');
  for (const path of ROUTES) {
    const html = await loadRenderedHtml(path);
    assert.match(html, /<title>/i);
    assert.doesNotMatch(
      html,
      /COPY SIN FIRMAR/,
      `${path} todavía pinta COPY SIN FIRMAR (H1 u otro bloque sin firmar). Bloquea el merge.`,
    );
  }
});
